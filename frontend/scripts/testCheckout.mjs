/**
 * Checkout / Razorpay UPI-flow guard (source scan — no browser).
 *   node frontend/scripts/testCheckout.mjs
 *
 * Ensures the "enter a UPI ID / VPA" (UPI Collect) flow is not offered and that
 * Cards / Netbanking / Wallets stay enabled.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '../src');

let pass = 0;
let fail = 0;
const ok = (cond, name, extra = '') => {
  if (cond) { pass += 1; console.log(`  ok   ${name}`); }
  else { fail += 1; console.log(`  FAIL ${name}${extra ? ` — ${extra}` : ''}`); }
};

const read = (rel) => fs.readFileSync(path.join(SRC, rel), 'utf8');
const checkout = read('components/CheckoutModal.jsx');

// Whole-tree scan for any UPI-ID / VPA collect artifacts.
const walk = (dir, acc = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { walk(full, acc); continue; }
    if (/\.(jsx?|tsx?)$/.test(e.name)) acc.push(full);
  }
  return acc;
};
// Strip comments so our own explanatory prose ("verify UPI ID") isn't flagged.
const stripComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const offenders = walk(SRC).filter((f) => {
  const t = stripComments(fs.readFileSync(f, 'utf8'));
  return /payments\/validate\/vpa|['"`]vpa['"`]\s*[:,)]|\bupiId\b|\bupi_id\b|flows:\s*\[[^\]]*['"]collect['"]/i.test(t);
});
ok(offenders.length === 0, 'no VPA / UPI-ID / validate-vpa / collect-flow code anywhere in the frontend', offenders.map((f) => path.relative(SRC, f)).join(', '));

// Razorpay Checkout config in CheckoutModal.
ok(/flows:\s*\[\s*['"]qr['"]\s*,\s*['"]intent['"]\s*\]/.test(checkout), 'UPI is configured for qr + intent flows only');
ok(!/flows:\s*\[[^\]]*['"]collect['"]/.test(checkout), 'UPI "collect" (enter UPI ID) flow is NOT enabled');
ok(/show_default_blocks:\s*true/.test(checkout), 'other methods kept (show_default_blocks: true) — Cards / Netbanking / Wallets');
ok(/method:\s*['"]card['"]/.test(checkout), 'Cards block present');
ok(!/success@razorpay|failure@razorpay/i.test(checkout), 'no success@razorpay / failure@razorpay test handles');
ok(/config:\s*displayConfig/.test(checkout), 'displayConfig is passed to new Razorpay({...})');
ok(/paymentApi\.verify\(/.test(checkout) && !/setIsCompleted\(true\)[\s\S]{0,120}resp\.razorpay_payment_id/.test(checkout),
  'success is rendered from the server verify response, not the Razorpay handler payload');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
