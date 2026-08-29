/**
 * Registration email-OTP suite.
 *
 * Core regression: the registration endpoint must NOT report success when the
 * mail provider did not accept the verification email (the bug behind "OTP
 * screen shows but no email arrives"). Also covers OTP generation, hashed
 * storage, expiry, attempt limiting, resend invalidation, and that the OTP is
 * never returned in an API response.
 *
 * NO real email is sent — SMTP is forced OFF before the app modules load, so
 * services/email.js `sendEmail()` returns { sent:false }.
 *
 *   node backend/tests/authOtp.test.js
 */
import dotenv from 'dotenv';
dotenv.config();

// Disable transactional email for this suite BEFORE any app module reads config.
// (dotenv does not override an already-set key, and config/index.js loads next.)
process.env.SMTP_HOST = '';
process.env.SMTP_USER = '';
process.env.SMTP_PASSWORD = '';
process.env.SMTP_FROM = '';

const mongoose = (await import('mongoose')).default;
const { connectDB } = await import('../config/db.js');
const { config } = await import('../config/index.js');
const { User } = await import('../models/User.js');
const { register, verifyRegistrationOtp, resendRegistrationOtp } = await import('../controllers/authController.js');
const { generateOtp, hashOtp, verifyOtpHash, OTP_EXPIRY_MS, OTP_EXPIRY_MINUTES } = await import('../utils/otp.js');

const TAG = 'test-otp';
const email = `${TAG}-${Date.now()}@apex-test.local`;
const uniquePhone = `9${String(Date.now()).slice(-9)}`;

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
const run = async (handler, body = {}) => {
  const res = mockRes();
  let err = null;
  await handler({ body, headers: {}, ip: '127.0.0.1' }, res, (e) => { err = e || new Error('next()'); });
  return { res, err, status: err?.statusCode || res.statusCode, code: err?.code || res.body?.code };
};

const cleanup = () => User.deleteMany({ email: new RegExp(`^${TAG}`, 'i') });

const runTests = async () => {
  console.log('================================================================');
  console.log('🧪 REGISTRATION EMAIL OTP');
  console.log('================================================================\n');
  await connectDB();
  await cleanup();

  ok(!config.smtp.host, 'guard: SMTP is disabled for this suite (no real mail sent)', `host="${config.smtp.host}"`);

  // ── 1. generation + hashing ──────────────────────────────────────────────
  console.log('\n— OTP generation & hashing —');
  {
    const samples = Array.from({ length: 200 }, generateOtp);
    ok(samples.every((s) => /^\d{6}$/.test(s)), 'generateOtp always returns exactly 6 digits');
    ok(new Set(samples).size > 150, 'generateOtp is random', `${new Set(samples).size} distinct of 200`);
    const h = hashOtp('123456');
    ok(/^[0-9a-f]{64}$/.test(h), 'hashOtp returns a 64-hex HMAC (not plaintext)');
    ok(hashOtp('123456') === h, 'hashOtp is deterministic');
    ok(verifyOtpHash('123456', h) === true && verifyOtpHash('000000', h) === false, 'verifyOtpHash matches only the right code');
    ok(OTP_EXPIRY_MINUTES === 10 && OTP_EXPIRY_MS === 600000, 'OTP expiry is 10 minutes');
  }

  // ── 2. THE BUG: send failure must NOT be reported as success ──────────────
  console.log('\n— email send failure gating —');
  {
    const r = await run(register, { name: 'OTP Tester', email, password: 'Str0ng!Passw0rd', phone: uniquePhone, phoneCountry: 'IN' });
    ok(r.status === 502 && r.code === 'EMAIL_SEND_FAILED', 'register → 502 EMAIL_SEND_FAILED when the provider does not accept the email', `got ${r.status}/${r.code}`);
    ok(!(r.res.body && r.res.body.success === true), 'register does NOT return success:true on a failed send');

    const user = await User.findOne({ email }).select('+emailVerifyOtpHash +emailVerifyOtpExpires +emailVerifyRequestedAt +emailVerifySendCount');
    ok(!!user && user.emailVerified === false, 'a pending (unverified) user row still exists so the user can retry');
    ok(/^[0-9a-f]{64}$/.test(user.emailVerifyOtpHash || ''), 'OTP is stored HASHED, never as 6 plaintext digits');
    ok(user.emailVerifyOtpExpires && user.emailVerifyOtpExpires > new Date(), 'OTP has a future expiry');
    ok(!user.emailVerifyRequestedAt && (user.emailVerifySendCount || 0) === 0, 'failed send ROLLED BACK the resend rate-limit counters');

    const bodyStr = JSON.stringify(r.res.body || {}).replace(/\d{4}-\d{2}-\d{2}/g, '');
    ok(!/\b\d{6}\b/.test(bodyStr), 'the 6-digit OTP does NOT appear in the API response');

    const r2 = await run(resendRegistrationOtp, { email });
    ok(r2.status === 502 && r2.code === 'EMAIL_SEND_FAILED', 'resend → 502 EMAIL_SEND_FAILED (not a false success)');
  }

  // ── 3. verification logic ───────────────────────────────────────────────
  console.log('\n— OTP verification —');
  {
    const KNOWN = '424242';
    await User.updateOne(
      { email },
      { $set: { emailVerifyOtpHash: hashOtp(KNOWN), emailVerifyOtpExpires: new Date(Date.now() + OTP_EXPIRY_MS), emailVerifyOtpAttempts: 0 } },
    );

    const wrong = await run(verifyRegistrationOtp, { email, otp: '000000' });
    ok(wrong.status === 400 && wrong.code === 'OTP_INVALID', 'wrong code → OTP_INVALID');
    ok((await User.findOne({ email }).select('+emailVerifyOtpAttempts')).emailVerifyOtpAttempts === 1, 'wrong code increments the attempt counter');

    const good = await run(verifyRegistrationOtp, { email, otp: KNOWN });
    ok(good.res.body?.success === true && good.res.body?.token, 'correct code → verified + returns a session token');
    const verified = await User.findOne({ email }).select('+emailVerifyOtpHash');
    ok(verified.emailVerified === true && !verified.emailVerifyOtpHash, 'emailVerified=true and the stored OTP hash is cleared');

    const email2 = `${TAG}-exp-${Date.now()}@apex-test.local`;
    await User.create({ name: 'Exp', email: email2, passwordHash: 'x', phone: `${uniquePhone}1`, role: 'user', emailVerified: false,
      emailVerifyOtpHash: hashOtp('111111'), emailVerifyOtpExpires: new Date(Date.now() - 1000) });
    const exp = await run(verifyRegistrationOtp, { email: email2, otp: '111111' });
    ok(exp.status === 400 && exp.code === 'OTP_EXPIRED', 'expired code → OTP_EXPIRED');

    const email3 = `${TAG}-lim-${Date.now()}@apex-test.local`;
    await User.create({ name: 'Lim', email: email3, passwordHash: 'x', phone: `${uniquePhone}2`, role: 'user', emailVerified: false,
      emailVerifyOtpHash: hashOtp('222222'), emailVerifyOtpExpires: new Date(Date.now() + OTP_EXPIRY_MS), emailVerifyOtpAttempts: 5 });
    const lim = await run(verifyRegistrationOtp, { email: email3, otp: '222222' });
    ok(lim.status === 429 && lim.code === 'OTP_MAX_ATTEMPTS', 'too many attempts → OTP_MAX_ATTEMPTS (even with the right code)');
  }

  // ── 4. resend invalidates the previous OTP ──────────────────────────────
  console.log('\n— resend invalidates the old code —');
  {
    const email4 = `${TAG}-resend-${Date.now()}@apex-test.local`;
    await User.create({ name: 'Re', email: email4, passwordHash: 'x', phone: `${uniquePhone}3`, role: 'user', emailVerified: false,
      emailVerifyOtpHash: hashOtp('333333'), emailVerifyOtpExpires: new Date(Date.now() + OTP_EXPIRY_MS) });
    await run(resendRegistrationOtp, { email: email4 }); // 502 (SMTP off) but rotates the hash first
    const after = await User.findOne({ email: email4 }).select('+emailVerifyOtpHash');
    ok(after.emailVerifyOtpHash && after.emailVerifyOtpHash !== hashOtp('333333'),
      'resend rotates the stored OTP hash → the old code no longer verifies');
  }

  await cleanup();
  await mongoose.disconnect();
  console.log(`\n================================================================`);
  console.log(`${pass} passed, ${fail} failed`);
  console.log('================================================================');
  process.exit(fail ? 1 : 0);
};

runTests().catch(async (e) => {
  console.error(e);
  try { await cleanup(); await mongoose.disconnect(); } catch {}
  process.exit(1);
});
