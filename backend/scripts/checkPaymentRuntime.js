/**
 * Payment runtime diagnostic — SAFE to run anywhere.
 *
 * Prints only: key prefix (rzp_live_ / rzp_test_), NODE_ENV, payment provider,
 * webhook secret configured (yes/no), and where each value was resolved from.
 * NEVER prints the key secret or webhook secret value.
 *
 *   node backend/scripts/checkPaymentRuntime.js
 *
 * Run it with the SAME environment your server runs under (same shell / PM2
 * ecosystem / container / platform), otherwise it tells you about the wrong env.
 */
import { config } from '../config/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dotenvPath = path.resolve(__dirname, '../.env');

const rawKeyId = process.env.RAZORPAY_KEY_ID || '';
const prefix = rawKeyId.startsWith('rzp_live_') ? 'rzp_live_'
  : rawKeyId.startsWith('rzp_test_') ? 'rzp_test_'
  : '(none / unrecognised)';

const fromShell = (name) => {
  // Heuristic: if the value differs from what's in backend/.env, it came from
  // the real environment (platform / PM2 / container / export), not the file.
  try {
    const fileVal = (fs.readFileSync(dotenvPath, 'utf8').match(new RegExp(`^\\s*${name}\\s*=\\s*(.*)$`, 'm')) || [])[1];
    if (fileVal === undefined) return 'runtime env (not in backend/.env)';
    const clean = fileVal.replace(/\s*#.*$/, '').replace(/^["']|["']$/g, '').trim();
    return clean === (process.env[name] || '') ? 'backend/.env' : 'runtime env (overrides backend/.env)';
  } catch {
    return 'runtime env (backend/.env not found)';
  }
};

console.log('\n──────────── PAYMENT RUNTIME ────────────');
console.log(`  backend/.env present      : ${fs.existsSync(dotenvPath) ? 'yes' : 'NO'}`);
console.log(`  NODE_ENV                  : ${config.nodeEnv}                 [from ${fromShell('NODE_ENV')}]`);
console.log(`  payment provider          : ${config.paymentProvider}`);
console.log(`  RAZORPAY_KEY_ID prefix    : ${prefix}${rawKeyId ? ` (…${rawKeyId.length} chars)` : ''}   [from ${fromShell('RAZORPAY_KEY_ID')}]`);
console.log(`  runtime Razorpay mode     : ${config.razorpay.isLive ? 'LIVE' : config.razorpay.isTest ? 'TEST' : 'UNKNOWN'}`);
console.log(`  RAZORPAY_KEY_SECRET       : ${config.razorpay.keySecret ? 'set' : 'NOT SET'}   [from ${fromShell('RAZORPAY_KEY_SECRET')}]`);
console.log(`  RAZORPAY_WEBHOOK_SECRET   : ${config.razorpay.webhookSecretExplicit ? 'set (explicit)' : 'NOT SET (would fall back to key secret)'}   [from ${fromShell('RAZORPAY_WEBHOOK_SECRET')}]`);
console.log(`  webhook configured        : ${config.razorpay.webhookSecretExplicit ? 'yes' : 'no'}`);
console.log(`  SERVER_URL                : ${config.serverUrl}`);
console.log('────────────────────────────────────────');

const problems = [];
if (config.isProduction && !config.razorpay.isLive) {
  problems.push('NODE_ENV=production but the key is NOT rzp_live_ → production payments are BLOCKED by the guard.');
}
if (!config.isProduction && config.razorpay.isTest) {
  problems.push('Running in TEST mode. For real money set the live key AND NODE_ENV=production in the ACTUAL runtime environment (not just .env.example).');
}
if (config.isProduction && !config.razorpay.webhookSecretExplicit) {
  problems.push('NODE_ENV=production but RAZORPAY_WEBHOOK_SECRET is not set → the server will refuse to start.');
}

if (problems.length) {
  console.log('\n⚠  ACTION REQUIRED:');
  for (const p of problems) console.log(`   • ${p}`);
  process.exit(1);
}
console.log(`\n✓ Razorpay is in ${config.razorpay.isLive ? 'LIVE' : 'TEST'} mode with a consistent config.\n`);
process.exit(0);
