import dotenv from 'dotenv';
dotenv.config();

import crypto from 'crypto';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { VoucherCode } from '../models/VoucherCode.js';
import { AuditLog } from '../models/AuditLog.js';
import { hashPassword, comparePassword } from '../middleware/auth.js';
import { login } from '../controllers/authController.js';
import { validatePasswordStrength } from '../utils/password.js';

const NEW_ADMIN_EMAIL = (process.env.NEW_ADMIN_EMAIL || 'admin@apexvouchers.in').toLowerCase();
const NEW_ADMIN_NAME = process.env.NEW_ADMIN_NAME || 'Apex Administrator';
const APPLY = process.argv.includes('--apply');

const maskEmail = (email = '') => {
  const [local, domain] = String(email).split('@');
  if (!domain) return '[invalid]';
  const head = local.length <= 2 ? local[0] || '' : local.slice(0, 2);
  return `${head}${'*'.repeat(Math.max(1, local.length - head.length))}@${domain}`;
};

const fmtUser = (u) =>
  `  - id=${u._id} email=${maskEmail(u.email)} name="${u.name}" role=${u.role} status=${u.status} ` +
  `emailVerified=${u.emailVerified} lastLoginAt=${u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : 'never'}`;

// Strong random password: 20 chars, every required class guaranteed, crypto-shuffled.
// Ambiguous glyphs (0 O 1 l I) are excluded for safe manual copy.
const generatePassword = (len = 20) => {
  const LOWER = 'abcdefghijkmnopqrstuvwxyz';
  const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const DIGITS = '23456789';
  const SPECIAL = '!@#$%^&*()-_=+';
  const ALL = LOWER + UPPER + DIGITS + SPECIAL;
  const pick = (set) => set[crypto.randomInt(set.length)];
  // Guarantee a healthy mix: >=3 lower, >=2 upper, >=2 digits, >=2 special.
  const chars = [
    pick(LOWER), pick(LOWER), pick(LOWER),
    pick(UPPER), pick(UPPER),
    pick(DIGITS), pick(DIGITS),
    pick(SPECIAL), pick(SPECIAL),
  ];
  while (chars.length < len) chars.push(pick(ALL));
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
};

const assertPolicy = (pw) => {
  const strengthErr = validatePasswordStrength(pw);
  if (strengthErr) throw new Error(`Password policy: ${strengthErr}`);
  if (pw.length < 16) throw new Error('Password policy: must be at least 16 characters');
  if (/apex|voucher/i.test(pw)) throw new Error('Password policy: must not be based on the website name');
};

const run = async () => {
  console.log('\n================ ADMIN CREDENTIAL ROTATION ================');
  console.log(`mode: ${APPLY ? 'APPLY (writes to the database)' : 'DRY RUN (no changes)'}`);
  console.log(`admin email: ${NEW_ADMIN_EMAIL}`);

  await connectDB();

  // ── 1. Inspect current admin-role accounts ────────────────────────────────
  const currentAdmins = await User.find({ role: 'admin' })
    .select('_id email name role status emailVerified createdAt lastLoginAt')
    .sort({ createdAt: 1 })
    .lean();

  console.log(`\nCurrent admin-role accounts (${currentAdmins.length}):`);
  if (!currentAdmins.length) console.log('  (none)');
  currentAdmins.forEach((u) => console.log(fmtUser(u)));

  const target = currentAdmins.find((u) => u.email?.toLowerCase() === NEW_ADMIN_EMAIL)
    || await User.findOne({ email: NEW_ADMIN_EMAIL }).select('_id email name role status').lean();
  const otherAdmins = currentAdmins.filter((u) => u.email?.toLowerCase() !== NEW_ADMIN_EMAIL);

  // Show the data that stays attached to the target _id (must NOT be orphaned).
  let attached = null;
  if (target?._id) {
    const oid = new mongoose.Types.ObjectId(target._id);
    attached = {
      orders: await Order.countDocuments({ userId: oid }),
      vouchers: await VoucherCode.countDocuments({ userId: oid }),
      auditLogs: await AuditLog.countDocuments({ adminId: oid }),
    };
    console.log(`\nData attached to ${maskEmail(target.email)} (id=${target._id}) — preserved, never modified:`);
    console.log(`  orders=${attached.orders}  vouchers=${attached.vouchers}  auditLogs=${attached.auditLogs}`);
  }

  console.log('\nPlan:');
  if (target) {
    console.log(`  • ROTATE credentials on ${maskEmail(NEW_ADMIN_EMAIL)} (id=${target._id}), same record:`);
    console.log(`      passwordHash -> bcrypt(new random password)`);
    console.log(`      name -> "${NEW_ADMIN_NAME}"   role -> admin   status -> active   emailVerified -> true`);
    console.log(`      resetToken / resetExpires -> cleared`);
  } else {
    console.log(`  • CREATE admin ${maskEmail(NEW_ADMIN_EMAIL)} (no existing account with this email).`);
  }
  if (otherAdmins.length) {
    console.log(`  • DISABLE ${otherAdmins.length} other admin account(s) (status -> 'disabled'):`);
    otherAdmins.forEach((u) => console.log(`      - ${maskEmail(u.email)} (id=${u._id}, currently ${u.status})`));
  } else {
    console.log('  • No other admin accounts exist.');
  }
  console.log('  • Customers, orders, payments, vouchers, fulfilment requests and existing audit logs: NOT touched.');

  if (!APPLY) {
    console.log('\nDRY RUN complete. Re-run with --apply to execute.\n');
    await mongoose.disconnect();
    process.exit(0);
  }

  // ── 2. Resolve the new password (never logged here) ───────────────────────
  const supplied = process.env.NEW_ADMIN_PASSWORD;
  const password = supplied && supplied.trim() ? supplied.trim() : generatePassword();
  assertPolicy(password);
  const passwordWasGenerated = !(supplied && supplied.trim());
  const newHash = await hashPassword(password);

  // ── 3. Rotate / create the admin ─────────────────────────────────────────
  let admin = await User.findOne({ email: NEW_ADMIN_EMAIL }).select('+passwordHash +resetToken +resetExpires');
  let oldHash = null;
  let created = false;
  if (admin) {
    oldHash = admin.passwordHash || null;
    admin.passwordHash = newHash;
    admin.name = NEW_ADMIN_NAME;
    admin.role = 'admin';
    admin.status = 'active';
    admin.emailVerified = true;
    admin.resetToken = undefined;
    admin.resetExpires = undefined;
    await admin.save();
    console.log(`\n[apply] rotated credentials on admin ${maskEmail(admin.email)} (id=${admin._id})`);
  } else {
    admin = await User.create({
      name: NEW_ADMIN_NAME,
      email: NEW_ADMIN_EMAIL,
      passwordHash: newHash,
      role: 'admin',
      status: 'active',
      emailVerified: true,
    });
    created = true;
    console.log(`\n[apply] created admin ${maskEmail(admin.email)} (id=${admin._id})`);
  }

  // ── 4. Disable any other admin accounts ──────────────────────────────────
  const disabled = [];
  for (const other of otherAdmins) {
    const res = await User.updateOne({ _id: other._id, role: 'admin' }, { $set: { status: 'disabled' } });
    if (res.matchedCount) {
      disabled.push(other);
      console.log(`[apply] disabled other admin: ${maskEmail(other.email)} (id=${other._id})`);
    }
  }

  // ── 5. Verify against the app's own primitives ───────────────────────────
  const reloaded = await User.findById(admin._id).select('+passwordHash');
  const isBcrypt = /^\$2[aby]\$\d\d\$/.test(reloaded.passwordHash || '');
  const rightPwWorks = await comparePassword(password, reloaded.passwordHash);
  const wrongPwFails = !(await comparePassword('not-the-password-000', reloaded.passwordHash));
  const plaintextNotStored = reloaded.passwordHash !== password;
  const hashChanged = oldHash ? reloaded.passwordHash !== oldHash : true;
  const activeAdminCount = await User.countDocuments({ role: 'admin', status: 'active' });
  const jsonLeak = JSON.stringify(reloaded.toJSON()).includes('passwordHash');

  // Confirm the attached history is still linked to the same _id.
  let historyIntact = true;
  if (attached) {
    const oid = new mongoose.Types.ObjectId(admin._id);
    const now = {
      orders: await Order.countDocuments({ userId: oid }),
      vouchers: await VoucherCode.countDocuments({ userId: oid }),
      auditLogs: await AuditLog.countDocuments({ adminId: oid }),
    };
    historyIntact = now.orders === attached.orders && now.vouchers === attached.vouchers && now.auditLogs === attached.auditLogs;
    console.log(`\n[verify] attached history unchanged: orders ${attached.orders}->${now.orders}, vouchers ${attached.vouchers}->${now.vouchers}, auditLogs ${attached.auditLogs}->${now.auditLogs}`);
  }

  // Exercise the REAL production login() controller: findOne -> status ->
  // comparePassword -> emailVerified -> signToken.
  const loginRes = { statusCode: 200, body: null };
  loginRes.status = (c) => { loginRes.statusCode = c; return loginRes; };
  loginRes.json = (b) => { loginRes.body = b; return loginRes; };
  let loginErr = null;
  await login({ body: { email: admin.email, password }, headers: {}, ip: '127.0.0.1' }, loginRes, (e) => { loginErr = e; });
  const loginOk = !loginErr && loginRes.body?.success === true && !!loginRes.body?.token && loginRes.body?.user?.role === 'admin';
  const loginNoHash = !JSON.stringify(loginRes.body || {}).includes('passwordHash');

  let wrongLoginErr = null;
  await login({ body: { email: admin.email, password: 'definitely-not-it-123' }, headers: {}, ip: '127.0.0.1' }, loginRes, (e) => { wrongLoginErr = e; });
  const wrongLoginRejected = wrongLoginErr?.statusCode === 401;

  console.log(`[verify] stored hash is bcrypt .............. ${isBcrypt}`);
  console.log(`[verify] new password authenticates ........ ${rightPwWorks}`);
  console.log(`[verify] a wrong password is rejected ...... ${wrongPwFails}`);
  console.log(`[verify] previous password hash replaced ... ${hashChanged}`);
  console.log(`[verify] plaintext NOT stored in DB ........ ${plaintextNotStored}`);
  console.log(`[verify] toJSON() does not expose hash ..... ${!jsonLeak}`);
  console.log(`[verify] exactly one ACTIVE admin ......... ${activeAdminCount === 1} (count=${activeAdminCount})`);
  console.log(`[verify] real login() → token + role admin . ${loginOk}`);
  console.log(`[verify] login() response has no hash ...... ${loginNoHash}`);
  console.log(`[verify] real login() rejects wrong pw ..... ${wrongLoginRejected}`);

  const allGood = isBcrypt && rightPwWorks && wrongPwFails && hashChanged && plaintextNotStored && !jsonLeak
    && activeAdminCount === 1 && historyIntact && loginOk && loginNoHash && wrongLoginRejected;
  if (!allGood) throw new Error('post-rotation verification FAILED — see checks above');

  // ── 6. Append an audit-log row (does not modify existing logs) ───────────
  await AuditLog.create({
    adminId: admin._id,
    adminEmail: admin.email,
    action: 'ADMIN_ACCESS_ROTATED',
    resourceType: 'User',
    resourceId: String(admin._id),
    details: {
      email: admin.email,
      created,
      nameSetTo: NEW_ADMIN_NAME,
      passwordRotated: true,
      disabledOtherAdmins: disabled.map((u) => ({ id: String(u._id), email: maskEmail(u.email) })),
    },
  });

  // ── 7. Final state ──────────────────────────────────────────────────────
  const finalAdmins = await User.find({ role: 'admin' })
    .select('_id email name role status emailVerified lastLoginAt')
    .lean();
  console.log(`\nFinal admin accounts (${finalAdmins.length}):`);
  finalAdmins.forEach((u) => console.log(fmtUser(u)));

  await mongoose.disconnect();

  console.log('\n=========================================================');
  console.log(`NEW ADMIN EMAIL: ${NEW_ADMIN_EMAIL}`);
  if (passwordWasGenerated) {
    console.log('NEW ADMIN PASSWORD (shown once — copy it now, it is not stored anywhere):');
    console.log('');
    console.log(`    ${password}`);
    console.log('');
  } else {
    console.log('NEW ADMIN PASSWORD: supplied via NEW_ADMIN_PASSWORD (not shown).');
  }
  console.log('=========================================================\n');
  process.exit(0);
};

run().catch(async (err) => {
  console.error('\n[replaceAdmin] FAILED:', err.message);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
