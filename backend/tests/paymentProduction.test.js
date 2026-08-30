/**
 * Production / LIVE Razorpay readiness suite.
 *
 * Asserts the guards that stop the server from running a real payment flow in a
 * half-configured state:
 *   - test vs live is derived from the KEY ID prefix, never a stale env var
 *   - NODE_ENV=production refuses to start on a test key or without a webhook secret
 *   - createPaymentOrder is blocked when the gateway isn't LIVE-ready in production
 *   - no rzp_test_/rzp_live_ key literal is committed in backend source
 *
 * No network, no DB. Spawns short node snippets with controlled env so the
 * module-level config can be re-evaluated per case. Never prints a secret.
 *
 *   node backend/tests/paymentProduction.test.js
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND = path.resolve(__dirname, '..');

let pass = 0;
let fail = 0;
const ok = (cond, name, extra = '') => {
  if (cond) { pass += 1; console.log(`  ✅ ${name}`); }
  else { fail += 1; console.log(`  ❌ ${name}${extra ? ` — ${extra}` : ''}`); }
};

// Run a snippet with a clean, explicit env (no inherited RAZORPAY_* / NODE_ENV).
const runWith = (env, snippet) => {
  const res = spawnSync(process.execPath, ['--input-type=module', '-e', snippet], {
    cwd: BACKEND,
    env: {
      PATH: process.env.PATH,
      // minimum needed so config/index.js doesn't crash on unrelated things
      MONGODB_URI: 'mongodb://localhost/x',
      JWT_SECRET: 'x',
      ...env,
    },
    encoding: 'utf8',
  });
  return { code: res.status, out: `${res.stdout || ''}${res.stderr || ''}` };
};

console.log('================================================================');
console.log('🧪 RAZORPAY PRODUCTION / LIVE READINESS');
console.log('================================================================\n');

// ── 1. env derived from key prefix ─────────────────────────────────────────
console.log('— test/live derived from the key id —');
{
  const live = runWith(
    { RAZORPAY_KEY_ID: 'rzp_live_ABCDEF123456', RAZORPAY_KEY_SECRET: 'sekret', RAZORPAY_ENV: 'test' },
    `import { config } from './config/index.js';
     console.log(JSON.stringify({ env: config.razorpay.env, isLive: config.razorpay.isLive }));`,
  );
  ok(/"env":"live"/.test(live.out) && /"isLive":true/.test(live.out),
    'rzp_live_ key → env "live" even when RAZORPAY_ENV=test', live.out.trim());

  const test = runWith(
    { RAZORPAY_KEY_ID: 'rzp_test_ABCDEF123456', RAZORPAY_KEY_SECRET: 'sekret', RAZORPAY_ENV: 'live' },
    `import { config } from './config/index.js';
     console.log(JSON.stringify({ env: config.razorpay.env, isLive: config.razorpay.isLive }));`,
  );
  ok(/"env":"test"/.test(test.out) && /"isLive":false/.test(test.out),
    'rzp_test_ key → env "test" even when RAZORPAY_ENV=live', test.out.trim());
}

// ── 2. startup guard ──────────────────────────────────────────────────────
console.log('\n— assertPaymentConfig (startup) —');
{
  const snippet = `import { assertPaymentConfig } from './config/validateConfig.js';
    try { assertPaymentConfig(); console.log('STARTED'); } catch { console.log('REFUSED'); }`;

  const prodTest = runWith(
    { NODE_ENV: 'production', RAZORPAY_KEY_ID: 'rzp_test_ABCDEF123456', RAZORPAY_KEY_SECRET: 'sekret', RAZORPAY_WEBHOOK_SECRET: 'whsec' },
    snippet,
  );
  ok(/REFUSED/.test(prodTest.out), 'production + rzp_test_ key → server refuses to start');
  ok(!/sekret|whsec/.test(prodTest.out), 'startup output contains no secret values');

  const prodNoWebhook = runWith(
    { NODE_ENV: 'production', RAZORPAY_KEY_ID: 'rzp_live_ABCDEF123456', RAZORPAY_KEY_SECRET: 'sekret' },
    snippet,
  );
  ok(/REFUSED/.test(prodNoWebhook.out), 'production + live key but no RAZORPAY_WEBHOOK_SECRET → refuses to start');

  const prodOk = runWith(
    { NODE_ENV: 'production', RAZORPAY_KEY_ID: 'rzp_live_ABCDEF123456', RAZORPAY_KEY_SECRET: 'sekret', RAZORPAY_WEBHOOK_SECRET: 'whsec', SERVER_URL: 'https://api.apexvouchers.com' },
    snippet,
  );
  ok(/STARTED/.test(prodOk.out), 'production + live key + webhook secret + https SERVER_URL → starts');

  const devTest = runWith(
    { NODE_ENV: 'development', RAZORPAY_KEY_ID: 'rzp_test_ABCDEF123456', RAZORPAY_KEY_SECRET: 'sekret' },
    snippet,
  );
  ok(/STARTED/.test(devTest.out), 'development + test key → starts (no webhook secret required)');

  const devLiveWarn = runWith(
    { NODE_ENV: 'development', RAZORPAY_KEY_ID: 'rzp_live_ABCDEF123456', RAZORPAY_KEY_SECRET: 'sekret' },
    snippet,
  );
  ok(/STARTED/.test(devLiveWarn.out) && /real money/i.test(devLiveWarn.out),
    'development + LIVE key → starts but warns about real money');
}

// ── 3. per-order runtime guard ────────────────────────────────────────────
console.log('\n— assertPaymentOrderAllowed (per request) —');
{
  const snippet = `import { assertPaymentOrderAllowed } from './config/validateConfig.js';
    console.log(JSON.stringify(assertPaymentOrderAllowed()));`;

  const prodTest = runWith(
    { NODE_ENV: 'production', RAZORPAY_KEY_ID: 'rzp_test_ABCDEF123456', RAZORPAY_KEY_SECRET: 'sekret' },
    snippet,
  );
  ok(/"ok":false/.test(prodTest.out) && /PAYMENT_TEST_KEY_IN_PRODUCTION/.test(prodTest.out),
    'production + test key → createPaymentOrder is blocked');

  const unconfigured = runWith({ NODE_ENV: 'production', RAZORPAY_KEY_ID: '', RAZORPAY_KEY_SECRET: '' }, snippet);
  ok(/"ok":false/.test(unconfigured.out) && /PAYMENT_GATEWAY_UNCONFIGURED/.test(unconfigured.out),
    'no keys → createPaymentOrder is blocked');

  const liveOk = runWith(
    { NODE_ENV: 'production', RAZORPAY_KEY_ID: 'rzp_live_ABCDEF123456', RAZORPAY_KEY_SECRET: 'sekret' },
    snippet,
  );
  ok(/"ok":true/.test(liveOk.out), 'production + live key → createPaymentOrder allowed');
}

// ── 4. no key literal committed ───────────────────────────────────────────
console.log('\n— no rzp_ key literal in backend source —');
{
  const offenders = [];
  const scan = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (['node_modules', '.git', 'public'].includes(entry.name)) continue;
        scan(full);
        continue;
      }
      if (!/\.(js|mjs|cjs|json)$/.test(entry.name)) continue;
      // .env.example placeholders and this test's own fixtures are allowed.
      if (entry.name.endsWith('.env.example')) continue;
      const rel = path.relative(BACKEND, full);
      if (rel.startsWith('tests' + path.sep)) continue;
      const txt = fs.readFileSync(full, 'utf8');
      // a real key is rzp_(test|live)_ + >=10 alphanumerics
      const m = txt.match(/rzp_(test|live)_[A-Za-z0-9]{10,}/);
      if (m) offenders.push(`${rel}: ${m[0].slice(0, 12)}…`);
    }
  };
  scan(BACKEND);
  ok(offenders.length === 0, 'no hardcoded rzp_test_/rzp_live_ key in backend/', offenders.join(', '));
}

console.log(`\n================================================================`);
console.log(`${pass} passed, ${fail} failed`);
console.log('================================================================');
process.exit(fail ? 1 : 0);
