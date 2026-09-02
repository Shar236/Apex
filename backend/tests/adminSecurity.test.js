/**
 * Admin Security & Account Settings suite.
 *
 * Covers the admin email verification + password-update flows exposed under
 * /api/admin/security/*:
 *   getAdminSecurityInfo  — current admin email + verification state (no secrets)
 *   sendAdminEmailOtp     — validates email, rate-limits, stores a HASHED OTP
 *   verifyAdminEmailOtp   — single-use, expiring OTP; only then swaps the email
 *   adminChangePassword   — current-password check, strength, confirm match,
 *                           no-same-password, bcrypt hashing, login re-validation
 *
 * The email transporter is STUBBED via the services/email.js test seam so the
 * full send → verify round-trip runs without a real SMTP server (the OTP is
 * captured from the outbound message and used to complete the flow).
 *
 *   node backend/tests/adminSecurity.test.js
 */
import dotenv from 'dotenv';
dotenv.config();

process.env.SMTP_HOST = '';
process.env.SMTP_USER = '';
process.env.SMTP_PASSWORD = '';
process.env.SMTP_FROM = '';

const mongoose = (await import('mongoose')).default;
const { connectDB } = await import('../config/db.js');
const { User } = await import('../models/User.js');
const { hashPassword } = await import('../middleware/auth.js');
const { __setTransportForTests } = await import('../services/email.js');
const {
  getAdminSecurityInfo,
  sendAdminEmailOtp,
  verifyAdminEmailOtp,
  adminChangePassword,
} = await import('../controllers/adminSecurityController.js');
const { login } = await import('../controllers/authController.js');
const { OTP_EXPIRY_MS, OTP_MAX_VERIFY_ATTEMPTS } = await import('../utils/otp.js');

const TAG = 'test-adminsec';
const FIXTURE_PW = 'Fixture#Admin$2026xYz';

let pass = 0;
let fail = 0;
const ok = (cond, name, extra = '') => {
  if (cond) { pass += 1; console.log(`  ✅ ${name}`); }
  else { fail += 1; console.log(`  ❌ ${name}${extra ? ` — ${extra}` : ''}`); }
};

const mockRes = () => {
  const res = { statusCode: 200, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
};
const run = async (handler, body = {}, user = null) => {
  const res = mockRes();
  let err = null;
  const req = { body, headers: {}, ip: '127.0.0.1' };
  if (user) req.user = user;
  await handler(req, res, (e) => { err = e || new Error('next()'); });
  return { res, err, status: err?.statusCode || res.statusCode, code: err?.code || res.body?.code };
};

const extractOtpFromMail = (mail) => {
  const text = String(mail?.text || mail?.html || '');
  const m = text.match(/\b(\d{6})\b/);
  return m ? m[1] : null;
};

const cleanup = () => User.deleteMany({ email: new RegExp(`^${TAG}`, 'i') });

const runTests = async () => {
  console.log('\n================================================================');
  console.log('🧪 ADMIN SECURITY & ACCOUNT SETTINGS');
  console.log('================================================================\n');
  await connectDB();
  await cleanup();

  // Stub the email transporter so the full OTP round-trip is testable offline.
  let lastMail = null;
  __setTransportForTests({
    sendMail: async (mail) => {
      lastMail = mail;
      return { accepted: [mail.to], messageId: 'test-msg-id', response: '250 OK' };
    },
  });

  const passwordHash = await hashPassword(FIXTURE_PW);
  const admin = await User.create({
    name: 'Fixture Admin', email: `${TAG}-admin@apex-test.local`, phone: `9${String(Date.now()).slice(-9)}`,
    passwordHash, role: 'admin', status: 'active', emailVerified: true,
  });

  // ── 1. getAdminSecurityInfo ─────────────────────────────────────────────
  console.log('\n— getAdminSecurityInfo —');
  {
    const r = await run(getAdminSecurityInfo, {}, admin);
    ok(r.res.body?.success === true, 'returns success');
    ok(r.res.body?.data?.email === admin.email, 'returns the admin email');
    ok(r.res.body?.data?.emailVerified === true, 'returns emailVerified state');
    ok(!JSON.stringify(r.res.body || {}).includes('passwordHash'), 'never exposes passwordHash');
    ok(!JSON.stringify(r.res.body || {}).includes('OtpHash'), 'never exposes OTP hashes');
  }

  // ── 2. sendAdminEmailOtp ────────────────────────────────────────────────
  console.log('\n— sendAdminEmailOtp —');
  let newEmail = `${TAG}-new-${Date.now()}@apex-test.local`;
  {
    const invalid = await run(sendAdminEmailOtp, { newEmail: 'not-an-email' }, admin);
    ok(invalid.status === 400 && invalid.code === 'INVALID_EMAIL', 'invalid email → 400 INVALID_EMAIL', `got ${invalid.status}/${invalid.code}`);

    const missing = await run(sendAdminEmailOtp, {}, admin);
    ok(missing.status === 400, 'missing email → 400');

    const same = await run(sendAdminEmailOtp, { newEmail: admin.email }, admin);
    ok(same.status === 400 && same.code === 'SAME_EMAIL', 'same email as current → 400 SAME_EMAIL', `got ${same.status}/${same.code}`);

    const taken = await User.create({
      name: 'Taker', email: `${TAG}-taken-${Date.now()}@apex-test.local`, phone: `8${String(Date.now()).slice(-9)}`,
      passwordHash, role: 'user', status: 'active', emailVerified: true,
    });
    const clash = await run(sendAdminEmailOtp, { newEmail: taken.email }, admin);
    ok(clash.status === 409 && clash.code === 'EMAIL_IN_USE', 'email already in use → 409 EMAIL_IN_USE', `got ${clash.status}/${clash.code}`);

    const good = await run(sendAdminEmailOtp, { newEmail }, admin);
    ok(good.status === 200 && good.res.body?.success === true, 'valid new email → OTP dispatched');
    ok(!!lastMail && String(lastMail.to).toLowerCase() === newEmail.toLowerCase(), 'OTP email is sent to the NEW address');
    ok(!!extractOtpFromMail(lastMail), 'email body contains a 6-digit code');
    ok(!/\b\d{6}\b/.test(JSON.stringify(good.res.body)), 'OTP is NOT returned in the API response');

    const pending = await User.findById(admin._id).select('+pendingEmail +pendingEmailOtpHash +pendingEmailOtpExpires');
    ok(pending.pendingEmail === newEmail.toLowerCase(), 'pendingEmail is stored on the admin');
    ok(/^[0-9a-f]{64}$/.test(pending.pendingEmailOtpHash || ''), 'OTP stored HASHED (HMAC), never plaintext');
    ok(pending.pendingEmailOtpExpires && pending.pendingEmailOtpExpires > new Date(), 'OTP has a future expiry');

    // Rate limit: further sends in the 15-min window must be blocked (either by
    // the 30s resend cooldown or the per-window cap — both surface as HTTP 429).
    for (let i = 0; i < 4; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await run(sendAdminEmailOtp, { newEmail: `${TAG}-rl-${i}-${Date.now()}@apex-test.local` }, admin);
    }
    const limited = await run(sendAdminEmailOtp, { newEmail: `${TAG}-rl-5-${Date.now()}@apex-test.local` }, admin);
    ok(limited.status === 429, 'rapid repeat sends within the window → 429 (rate limited / cooldown)', `got ${limited.status}/${limited.code}`);
  }

  // ── 3. verifyAdminEmailOtp ──────────────────────────────────────────────
  console.log('\n— verifyAdminEmailOtp —');
  {
    // Clear any pending state left by the send section (it was never verified).
    await User.updateOne(
      { _id: admin._id },
      { $unset: { pendingEmail: 1, pendingEmailOtpHash: 1, pendingEmailOtpExpires: 1, pendingEmailOtpAttempts: 1, pendingEmailRequestedAt: 1, pendingEmailSendCount: 1, pendingEmailWindowStart: 1 } },
    );
    const noPending = await run(verifyAdminEmailOtp, { otp: '123456' }, admin);
    ok(noPending.status === 400 && noPending.code === 'NO_PENDING_CHANGE', 'no pending change → 400 NO_PENDING_CHANGE', `got ${noPending.status}/${noPending.code}`);

    // Stage a fresh pending change with a KNOWN code to test verify behavior.
    const KNOWN = '424242';
    await User.updateOne(
      { _id: admin._id },
      { $set: { pendingEmail: newEmail.toLowerCase(), pendingEmailOtpExpires: new Date(Date.now() + OTP_EXPIRY_MS), pendingEmailOtpAttempts: 0 } },
    );
    // hashOtp is deterministic via the same secret; import to stage the hash.
    const { hashOtp } = await import('../utils/otp.js');
    await User.updateOne({ _id: admin._id }, { $set: { pendingEmailOtpHash: hashOtp(KNOWN) } });

    const wrong = await run(verifyAdminEmailOtp, { otp: '000000' }, admin);
    ok(wrong.status === 400 && wrong.code === 'OTP_INVALID', 'wrong code → 400 OTP_INVALID', `got ${wrong.status}/${wrong.code}`);
    const afterWrong = await User.findById(admin._id).select('+pendingEmailOtpAttempts');
    ok(afterWrong.pendingEmailOtpAttempts === 1, 'wrong code increments the attempt counter');

    const good = await run(verifyAdminEmailOtp, { otp: KNOWN }, admin);
    ok(good.res.body?.success === true, 'correct code → success');
    const afterGood = await User.findById(admin._id).select('+pendingEmail +pendingEmailOtpHash');
    ok(afterGood.email === newEmail.toLowerCase(), 'admin email is now the NEW address');
    ok(afterGood.emailVerified === true, 'emailVerified is true after successful verification');
    ok(!afterGood.pendingEmail && !afterGood.pendingEmailOtpHash, 'pending change + OTP hash are cleared (single-use)');

    // Reuse of the consumed OTP must fail (no pending change remains).
    const reused = await run(verifyAdminEmailOtp, { otp: KNOWN }, admin);
    ok(reused.status === 400 && reused.code === 'NO_PENDING_CHANGE', 'reused OTP (after success) → NO_PENDING_CHANGE', `got ${reused.status}/${reused.code}`);
  }

  // ── 4. expired + attempt-limited OTP ────────────────────────────────────
  console.log('\n— expired / max-attempt OTP —');
  {
    const { hashOtp } = await import('../utils/otp.js');
    await User.updateOne(
      { _id: admin._id },
      { $set: {
        pendingEmail: `${TAG}-exp@apex-test.local`,
        pendingEmailOtpHash: hashOtp('111111'),
        pendingEmailOtpExpires: new Date(Date.now() - 1000),
        pendingEmailOtpAttempts: 0,
      } },
    );
    const expired = await run(verifyAdminEmailOtp, { otp: '111111' }, admin);
    ok(expired.status === 400 && expired.code === 'OTP_EXPIRED', 'expired code → 400 OTP_EXPIRED', `got ${expired.status}/${expired.code}`);

    await User.updateOne(
      { _id: admin._id },
      { $set: { pendingEmail: `${TAG}-lim@apex-test.local`, pendingEmailOtpHash: hashOtp('222222'), pendingEmailOtpExpires: new Date(Date.now() + OTP_EXPIRY_MS), pendingEmailOtpAttempts: OTP_MAX_VERIFY_ATTEMPTS } },
    );
    const limited = await run(verifyAdminEmailOtp, { otp: '222222' }, admin);
    ok(limited.status === 429 && limited.code === 'OTP_MAX_ATTEMPTS', 'attempt cap reached → 429 OTP_MAX_ATTEMPTS even with the right code', `got ${limited.status}/${limited.code}`);

    // Clean the staged pending state before password tests.
    await User.updateOne(
      { _id: admin._id },
      { $unset: { pendingEmail: 1, pendingEmailOtpHash: 1, pendingEmailOtpExpires: 1, pendingEmailOtpAttempts: 1 } },
    );
  }

  // ── 5. adminChangePassword ──────────────────────────────────────────────
  console.log('\n— adminChangePassword —');
  const NEW_PW = 'N3w!Admin#2026Xy';
  {
    const missing = await run(adminChangePassword, {}, admin);
    ok(missing.status === 400 && missing.code === 'MISSING_FIELDS', 'missing fields → 400 MISSING_FIELDS', `got ${missing.status}/${missing.code}`);

    const wrongCurrent = await run(adminChangePassword, { currentPassword: 'wrong-password', newPassword: NEW_PW, confirmNewPassword: NEW_PW }, admin);
    ok(wrongCurrent.status === 401 && wrongCurrent.code === 'WRONG_PASSWORD', 'wrong current password → 401 WRONG_PASSWORD', `got ${wrongCurrent.status}/${wrongCurrent.code}`);

    const weak = await run(adminChangePassword, { currentPassword: FIXTURE_PW, newPassword: 'short', confirmNewPassword: 'short' }, admin);
    ok(weak.status === 400 && weak.code === 'WEAK_PASSWORD', 'weak new password → 400 WEAK_PASSWORD', `got ${weak.status}/${weak.code}`);

    const mismatch = await run(adminChangePassword, { currentPassword: FIXTURE_PW, newPassword: NEW_PW, confirmNewPassword: 'different-1' }, admin);
    ok(mismatch.status === 400 && mismatch.code === 'PASSWORD_MISMATCH', 'mismatched confirmation → 400 PASSWORD_MISMATCH', `got ${mismatch.status}/${mismatch.code}`);

    const sameAsOld = await run(adminChangePassword, { currentPassword: FIXTURE_PW, newPassword: FIXTURE_PW, confirmNewPassword: FIXTURE_PW }, admin);
    ok(sameAsOld.status === 400 && sameAsOld.code === 'SAME_PASSWORD', 'new password identical to current → 400 SAME_PASSWORD', `got ${sameAsOld.status}/${sameAsOld.code}`);

    const success = await run(adminChangePassword, { currentPassword: FIXTURE_PW, newPassword: NEW_PW, confirmNewPassword: NEW_PW }, admin);
    ok(success.status === 200 && success.res.body?.success === true, 'valid update → success');
    ok(!JSON.stringify(success.res.body || {}).includes('passwordHash'), 'response never contains the hash');

    const stored = await User.findById(admin._id).select('+passwordHash');
    ok(/^\$2[aby]\$\d\d\$/.test(stored.passwordHash || ''), 'new password is stored as a bcrypt hash');
    ok(stored.passwordHash !== passwordHash, 'hash differs from the old password hash');
  }

  // ── 6. login re-validation after password change ────────────────────────
  console.log('\n— login with old vs new password —');
  {
    // The admin's email was changed during the OTP section — use the new one.
    const oldLogin = await run(login, { email: newEmail, password: FIXTURE_PW });
    ok(oldLogin.status === 401 && oldLogin.code === 'INVALID_CREDENTIALS', 'old password no longer logs in → 401', `got ${oldLogin.status}/${oldLogin.code}`);

    const newLogin = await run(login, { email: newEmail, password: NEW_PW });
    ok(newLogin.res.body?.success === true && !!newLogin.res.body?.token, 'new password logs in → token issued');
    ok(newLogin.res.body?.user?.role === 'admin', 'login still reports role=admin after password change');
  }

  // ── 7. resend rotates the previous OTP ──────────────────────────────────
  console.log('\n— resend rotates the previous OTP —');
  {
    const { hashOtp } = await import('../utils/otp.js');
    const target = `${TAG}-rot-${Date.now()}@apex-test.local`;
    // Reset the send-window state so both sends start from a clean slate
    // (the 30s cooldown between the two sends would otherwise block the second).
    await User.updateOne(
      { _id: admin._id },
      { $unset: { pendingEmailRequestedAt: 1, pendingEmailSendCount: 1, pendingEmailWindowStart: 1 } },
    );
    const first = await run(sendAdminEmailOtp, { newEmail: target }, admin);
    ok(first.status === 200, 'first send OK');
    const firstCode = extractOtpFromMail(lastMail);
    await User.updateOne(
      { _id: admin._id },
      { $unset: { pendingEmailRequestedAt: 1, pendingEmailSendCount: 1, pendingEmailWindowStart: 1 } },
    );
    await run(sendAdminEmailOtp, { newEmail: target }, admin);
    const secondCode = extractOtpFromMail(lastMail);
    ok(!!firstCode && !!secondCode && firstCode !== secondCode, 'resend produces a different OTP (previous one invalidated)');
    const bad = await run(verifyAdminEmailOtp, { otp: firstCode }, admin);
    ok(bad.status === 400 && bad.code === 'OTP_INVALID', 'the OLD code no longer verifies after a resend', `got ${bad.status}/${bad.code}`);
  }

  await cleanup();
  __setTransportForTests(null);
  await mongoose.disconnect();
  console.log(`\n================================================================`);
  console.log(`${pass} passed, ${fail} failed`);
  console.log('================================================================');
  process.exit(fail ? 1 : 0);
};

runTests().catch(async (e) => {
  console.error(e);
  try { await cleanup(); __setTransportForTests(null); await mongoose.disconnect(); } catch {}
  process.exit(1);
});