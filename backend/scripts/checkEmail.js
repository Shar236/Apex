import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

/**
 * Email delivery diagnostic — SAFE. Prints provider/sender config (never the
 * password or an API key), verifies the SMTP connection + auth, and can send
 * one real test message so you see exactly what the provider says.
 *
 *   node scripts/checkEmail.js                       # config + connection/auth check
 *   node scripts/checkEmail.js you@example.com       # + send a real test email there
 *
 * Never prints an OTP (this sends a plain diagnostic message, no OTP).
 */

const to = process.argv[2] || null;
const mask = (v) => {
  const s = String(v || '');
  const at = s.indexOf('@');
  return at > 1 ? `${s[0]}***${s.slice(at - 1)}` : (s ? '[redacted]' : '[missing]');
};

console.log('\n──────────── EMAIL CONFIGURATION ────────────');
console.log(`  provider              : SMTP (nodemailer)`);
console.log(`  SMTP_HOST             : ${config.smtp.host || '[MISSING]'}`);
console.log(`  SMTP_PORT             : ${config.smtp.port}`);
console.log(`  SMTP_SECURE           : ${config.smtp.secure || +config.smtp.port === 465}`);
console.log(`  SMTP_USER             : ${config.smtp.user ? mask(config.smtp.user) + ` (${config.smtp.user.length} chars)` : '[MISSING]'}`);
console.log(`  SMTP_PASSWORD         : ${config.smtp.password ? `set (${config.smtp.password.length} chars)` : '[MISSING]'}`);
console.log(`  SMTP_FROM             : ${config.smtp.from || '[MISSING]'}`);
console.log(`  business.email        : ${config.business.email}`);
console.log(`  admin notification to : ${config.business.adminNotificationEmail}`);
const provider = /gmail/i.test(config.smtp.host || '') ? 'Gmail SMTP' : (config.smtp.host || 'unknown');
console.log(`  detected provider     : ${provider}`);

const problems = [];
if (!config.smtp.host || !config.smtp.user || !config.smtp.password || !config.smtp.from) {
  problems.push('One or more of SMTP_HOST / SMTP_USER / SMTP_PASSWORD / SMTP_FROM is missing — email is disabled.');
}
// Gmail rewrites / rejects mail whose From doesn't match the authed account or a verified alias.
const fromAddr = (config.smtp.from || '').match(/<([^>]+)>/)?.[1] || config.smtp.from || '';
if (/gmail/i.test(config.smtp.host || '') && fromAddr && config.smtp.user && fromAddr.toLowerCase() !== config.smtp.user.toLowerCase()) {
  problems.push(`SMTP_FROM address (${mask(fromAddr)}) does not match SMTP_USER (${mask(config.smtp.user)}). Gmail will rewrite or reject this. Use the same address, or a Gmail "Send mail as" verified alias.`);
}

const run = async () => {
  if (problems.length) {
    console.log('\n⚠  CONFIG ISSUES:');
    for (const p of problems) console.log(`   • ${p}`);
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: +config.smtp.port,
    secure: config.smtp.secure || +config.smtp.port === 465,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.password } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  console.log('\n──────────── CONNECTION + AUTH ────────────');
  try {
    await transporter.verify();
    console.log('  ✓ SMTP connection + authentication OK');
  } catch (err) {
    console.log(`  ✖ FAILED: ${err.message}`);
    if (/invalid login|username and password not accepted|BadCredentials/i.test(err.message)) {
      console.log('    → For Gmail: SMTP_PASSWORD must be a 16-char App Password (not the account password),');
      console.log('      2-Step Verification must be ON, and SMTP_USER must be the full gmail address.');
    }
    process.exit(1);
  }

  if (!to) {
    console.log('\nPass a recipient to send a real test message:  node scripts/checkEmail.js you@example.com\n');
    process.exit(0);
  }

  console.log('\n──────────── TEST SEND ────────────');
  console.log(`  to: ${mask(to)}`);
  try {
    const info = await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject: `Apex Vouchers — email delivery test (${new Date().toISOString()})`,
      text: 'This is a diagnostic test from Apex Vouchers. If you received it, transactional email delivery is working. No action needed.',
      html: '<p>This is a diagnostic test from <b>Apex Vouchers</b>. If you received it, transactional email delivery is working. No action needed.</p>',
    });
    console.log(`  ✓ provider ACCEPTED the message`);
    console.log(`    messageId : ${info.messageId}`);
    console.log(`    response  : ${info.response}`);
    console.log(`    accepted  : ${JSON.stringify((info.accepted || []).map(mask))}`);
    console.log(`    rejected  : ${JSON.stringify((info.rejected || []).map(mask))}`);
    console.log('\n  NOTE: "accepted by the provider" ≠ "delivered to the inbox". Check the');
    console.log('  recipient inbox AND spam folder, and (for Gmail) https://postmaster.google.com');
    process.exit((info.rejected || []).length ? 1 : 0);
  } catch (err) {
    console.log(`  ✖ SEND FAILED: ${err.message}`);
    if (err.response) console.log(`    provider response: ${err.response}`);
    if (err.responseCode) console.log(`    provider code    : ${err.responseCode}`);
    process.exit(1);
  }
};

run().catch((e) => { console.error(e); process.exit(1); });
