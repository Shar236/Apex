import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

let transporter = null;

const maskEmail = (email) => {
  const value = String(email || '');
  const at = value.indexOf('@');
  if (at <= 1) return value ? '[redacted]' : '[missing]';
  return `${value[0]}***${value.slice(at - 1)}`;
};

/**
 * Mask a voucher code for logs / admin notifications: keep first 4 + last 4.
 * The FULL code only ever goes to the customer who owns it.
 */
export const maskVoucherCode = (code) => {
  const c = String(code || '');
  if (c.length <= 8) return c ? `${c[0]}••••` : '••••';
  return `${c.slice(0, 4)}••••${c.slice(-4)}`;
};

/**
 * Test seam — lets the regression suite exercise the "email accepted" branch
 * without a live SMTP server. Pass an object with an async `sendMail`, or `null`
 * to restore normal behaviour. No effect in production paths.
 */
export const __setTransportForTests = (t) => { transporter = t; };

const getTransport = () => {
  if (transporter) return transporter;
  if (!config.smtp.host || !config.smtp.user || !config.smtp.password || !config.smtp.from) {
    console.error('[email:config] SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM are required');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: +config.smtp.port,
    secure: config.smtp.secure || +config.smtp.port === 465,
    auth: config.smtp.user
      ? { user: config.smtp.user, pass: config.smtp.password }
      : undefined,
    // Hard caps so a hung SMTP server can never stall a payment-verification
    // request. sendEmail() is always awaited off the critical path, but these
    // guarantee it resolves.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
};

/** Plain-text fallback from HTML — improves spam scoring + accessibility. */
const htmlToText = (html) =>
  String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8599;/g, '')
    .replace(/&copy;/g, '(c)')
    .replace(/&bull;/g, '-')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/**
 * Send one email. NEVER throws — returns { sent:boolean, error?, info?, tag? }
 * so callers can decide what to tell the user. `tag` is a short label used only
 * for log correlation (e.g. 'otp', 'voucher').
 */
export const sendEmail = async ({ to, subject, html, text = '', from = config.smtp.from, tag = 'generic' }) => {
  if (!to) {
    console.error(`[email:failed] tag=${tag} reason=recipient-missing`);
    return { sent: false, error: 'Email recipient is missing' };
  }

  const transport = getTransport();
  const mail = {
    from: from || `"${config.business.name}" <${config.business.email}>`,
    to,
    subject,
    html,
    text: text || htmlToText(html),
  };
  if (!transport) {
    const error = 'SMTP configuration is incomplete';
    console.error(`[email:failed] tag=${tag} recipient=${maskEmail(to)} reason=${error}`);
    return { sent: false, error };
  }
  try {
    const info = await transport.sendMail(mail);
    const rejected = (info.rejected || []).length > 0;
    if (rejected) {
      console.error(`[email:rejected] tag=${tag} recipient=${maskEmail(to)} response=${info.response || 'rejected'}`);
      return { sent: false, error: `Recipient rejected by mail server: ${info.response || 'rejected'}`, info };
    }
    console.log(
      `[email:sent] tag=${tag} recipient=${maskEmail(to)} messageId=${info.messageId || 'unknown'} response=${info.response || 'accepted'}`
    );
    return { sent: true, info, messageId: info.messageId };
  } catch (err) {
    // e.g. EAUTH (bad app password), ECONNECTION, ETIMEDOUT, 550 mailbox unavailable
    console.error(`[email:failed] tag=${tag} recipient=${maskEmail(to)} code=${err.code || err.responseCode || 'ERR'} reason=${err.message}`);
    return { sent: false, error: err.message, code: err.code || err.responseCode };
  }
};

/** Safe startup diagnostic — printed by the server on boot. Never logs secrets. */
export const emailConfigStatus = () => {
  const providerReady = Boolean(config.smtp.host && config.smtp.user && config.smtp.password);
  const senderReady = Boolean(config.smtp.from);
  const fromAddr = (config.smtp.from || '').match(/<([^>]+)>/)?.[1] || config.smtp.from || '';
  const gmailMismatch =
    /gmail/i.test(config.smtp.host || '') && fromAddr && config.smtp.user &&
    fromAddr.toLowerCase() !== config.smtp.user.toLowerCase();
  console.log(`[email] provider configured: ${providerReady ? 'yes' : 'NO'}  (${config.smtp.host || 'no host'})`);
  console.log(`[email] sender configured:   ${senderReady ? 'yes' : 'NO'}  (${maskEmail(fromAddr) || 'no from'})`);
  if (gmailMismatch) {
    console.warn('[email] ⚠ SMTP_FROM address does not match SMTP_USER — Gmail will rewrite/reject. Use the same address or a verified "Send mail as" alias.');
  }
  if (!providerReady) {
    console.warn('[email] ⚠ transactional email is DISABLED — OTP + voucher emails will not send. Set SMTP_HOST / SMTP_USER / SMTP_PASSWORD / SMTP_FROM.');
  }
  return { providerReady, senderReady, gmailMismatch };
};

/* ══════════════════════════════════════════════════════════════════════════
 * APEX VOUCHERS EMAIL DESIGN SYSTEM  —  light white + Apex-pink
 * ══════════════════════════════════════════════════════════════════════════
 * One shared, email-safe (table + inline CSS, no JS, no web fonts) component
 * set so every customer AND admin email renders identically in Gmail, Outlook,
 * Apple Mail and mobile clients. Light-first: explicit light backgrounds +
 * dark charcoal text everywhere, so Gmail/Outlook dark-mode transforms cannot
 * make anything unreadable. No black backgrounds, no dark cards, no dark footer.
 *
 * Components: emailShell · apexHeader · supportFooter · card · statusBadge
 *             summary (OrderSummary) · voucherCard · primaryButton · calloutNote
 * ────────────────────────────────────────────────────────────────────────── */

const BRAND = {
  page: '#F4F5F7',       // outer canvas
  card: '#FFFFFF',       // every card / surface
  pinkSoft: '#FFF1F6',   // very light pink section
  pink: '#FF005C',       // Apex pink
  pinkDark: '#C4004A',   // pink text on light-pink (better contrast)
  text: '#1A1A2E',       // charcoal / near-black
  muted: '#55607A',      // labels — ~6:1 on white, still comfortably readable
  border: '#EFE1E7',     // light pink-grey
  borderSoft: '#ECECF1', // neutral hairline
};

const TONES = {
  success: { bg: '#E7F7EF', fg: '#0A7A43', border: '#B7E7CE' },
  pink: { bg: '#FFF1F6', fg: '#C4004A', border: '#FBD0E0' },
  warn: { bg: '#FFF6E5', fg: '#8A5A00', border: '#F3DFAE' },
  danger: { bg: '#FDECEC', fg: '#B42318', border: '#F3C7C7' },
  neutral: { bg: '#F1F2F5', fg: '#3F4657', border: '#E2E4EA' },
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "'Courier New',Courier,monospace";

/** Escape user-controlled strings before interpolating into email HTML. */
const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const clientUrl = () => config.clientUrl || 'http://localhost:3000';

// ── Header: white, wordmark (or hosted logo), thin Apex-pink divider ─────────
const apexHeader = () => {
  const logo = config.business.logoUrl
    ? `<img src="${esc(config.business.logoUrl)}" alt="${esc(config.business.name)}" height="34" style="display:block;height:34px;width:auto;border:0;outline:none;text-decoration:none;">`
    : `<span style="font-family:${FONT};font-size:20px;font-weight:800;letter-spacing:0.4px;color:${BRAND.text};">APEX<span style="color:${BRAND.pink};">&#8599;</span>&nbsp;<span style="color:${BRAND.pink};">VOUCHERS</span></span>`;
  return `
    <tr><td align="left" bgcolor="${BRAND.card}" style="background:${BRAND.card};padding:24px 32px;">${logo}</td></tr>
    <tr><td style="padding:0;line-height:3px;font-size:3px;"><div style="height:3px;line-height:3px;font-size:3px;background:${BRAND.pink};">&nbsp;</div></td></tr>`;
};

// ── Footer: white, security notice + support contact + copyright ────────────
const supportFooter = () => `
    <tr><td style="padding:20px 32px 6px;"><div style="border-top:1px solid ${BRAND.borderSoft};font-size:0;line-height:0;">&nbsp;</div></td></tr>
    <tr><td style="padding:14px 32px 30px;font-family:${FONT};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.pinkSoft};border:1px solid ${TONES.pink.border};border-radius:12px;">
        <tr><td style="padding:13px 16px;font-family:${FONT};font-size:12px;line-height:1.6;color:${BRAND.text};">
          🔒 <strong>Security Notice:</strong> Never share your voucher code, OTP or account password with anyone. ${esc(config.business.name)} staff will never ask for them.
        </td></tr>
      </table>
      <p style="margin:18px 0 4px;font-family:${FONT};font-size:13px;font-weight:700;color:${BRAND.text};">Need help?</p>
      <p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.7;color:${BRAND.muted};">
        ${esc(config.business.name)} Support<br>
        <a href="mailto:${esc(config.business.supportEmail)}" style="color:${BRAND.pink};text-decoration:none;font-weight:600;">${esc(config.business.supportEmail)}</a>
        &nbsp;&bull;&nbsp;
        <a href="tel:${esc(String(config.business.supportPhone).replace(/\s+/g, ''))}" style="color:${BRAND.pink};text-decoration:none;font-weight:600;">${esc(config.business.supportPhone)}</a>
      </p>
      <p style="margin:16px 0 0;font-family:${FONT};font-size:11px;color:${BRAND.muted};">
        &copy; ${new Date().getFullYear()} ${esc(config.business.name)}. All rights reserved.
      </p>
    </td></tr>`;

/**
 * Full page shell — 600px white card on a light canvas, ApexHeader + body +
 * SupportFooter. `preheader` is the hidden inbox-preview snippet.
 */
const emailShell = ({ title, preheader = '', body }) => `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.page};font-family:${FONT};color:${BRAND.text};-webkit-font-smoothing:antialiased;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;">${esc(preheader)}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.page}" style="background:${BRAND.page};">
  <tr><td align="center" style="padding:28px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:${BRAND.card};border:1px solid ${BRAND.borderSoft};border-radius:16px;overflow:hidden;">
      ${apexHeader()}
      <tr><td style="padding:30px 32px 6px;background:${BRAND.card};" bgcolor="${BRAND.card}">
        ${body}
      </td></tr>
      ${supportFooter()}
    </table>
  </td></tr>
</table>
</body></html>`;

// ── Content atoms ──────────────────────────────────────────────────────────
const h1 = (text, emoji = '') =>
  `<h1 style="margin:0 0 12px;font-family:${FONT};font-size:23px;line-height:1.3;font-weight:800;color:${BRAND.text};">${emoji ? `${emoji} ` : ''}${esc(text)}</h1>`;

const para = (html) =>
  `<p style="margin:0 0 16px;font-family:${FONT};font-size:14px;line-height:1.7;color:${BRAND.text};">${html}</p>`;

const paraMuted = (html) =>
  `<p style="margin:0 0 16px;font-family:${FONT};font-size:13px;line-height:1.7;color:${BRAND.muted};">${html}</p>`;

const sectionLabel = (text) =>
  `<p style="margin:26px 0 10px;font-family:${FONT};font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${BRAND.muted};">${esc(text)}</p>`;

const statusBadge = (text, tone = 'success') => {
  const t = TONES[tone] || TONES.success;
  return `<span style="display:inline-block;font-family:${FONT};font-size:12px;font-weight:800;letter-spacing:.3px;background:${t.bg};color:${t.fg};border:1px solid ${t.border};padding:6px 13px;border-radius:999px;">${esc(text)}</span>`;
};

/**
 * OrderSummary — label/value rows in a white (or light-pink) bordered card.
 * `rows`: [ [label, value] | [label, value, { mono, big, color, strong:false, raw }] | null ]
 */
const summary = (rows, { tone = 'plain' } = {}) => {
  const skin =
    tone === 'pink'
      ? { bg: BRAND.pinkSoft, border: TONES.pink.border }
      : { bg: BRAND.card, border: BRAND.border };
  const body = rows
    .filter(Boolean)
    .map(([k, v, o = {}]) => `
        <tr>
          <td style="padding:8px 0;font-family:${FONT};font-size:13px;color:${BRAND.muted};vertical-align:top;">${esc(k)}</td>
          <td align="right" style="padding:8px 0 8px 14px;font-family:${o.mono ? MONO : FONT};font-size:${o.big ? '15px' : '13px'};font-weight:${o.strong === false ? '500' : '700'};color:${o.color || BRAND.text};vertical-align:top;word-break:break-word;">${o.raw ? v : esc(v)}</td>
        </tr>`)
    .join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${skin.bg};border:1px solid ${skin.border};border-radius:12px;margin:0 0 20px;" bgcolor="${skin.bg}">
      <tr><td style="padding:6px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${body}</table>
      </td></tr>
    </table>`;
};

/**
 * VoucherCard — the visual centrepiece: light-pink field, 2px dashed pink
 * border, monospace code in dark charcoal (max contrast), wraps on mobile.
 */
const voucherCard = ({ productName, voucherType, code, validUntil, extraHtml = '' }) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0 18px;">
      <tr><td bgcolor="${BRAND.pinkSoft}" style="background:${BRAND.pinkSoft};border:2px dashed ${BRAND.pink};border-radius:16px;padding:22px 20px;">
        <div style="font-family:${FONT};font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${BRAND.pinkDark};margin:0 0 6px;">${esc(productName)}</div>
        ${voucherType ? `<div style="font-family:${FONT};font-size:12px;color:${BRAND.muted};margin:0 0 12px;">Voucher Type: ${esc(voucherType)}</div>` : ''}
        <div style="font-family:${MONO};font-size:24px;line-height:1.4;font-weight:700;letter-spacing:2px;color:${BRAND.text};word-break:break-all;margin:0 0 12px;">${esc(code)}</div>
        ${validUntil ? `<div style="font-family:${FONT};font-size:12px;color:${BRAND.text};">Valid Until: <strong>${esc(validUntil)}</strong></div>` : ''}
        ${extraHtml}
      </td></tr>
    </table>`;

/** PrimaryButton — Apex pink, white text, rounded, mobile-friendly padding. */
const primaryButton = (text, href) => `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:26px auto 10px;">
      <tr><td align="center" bgcolor="${BRAND.pink}" style="background:${BRAND.pink};border-radius:10px;">
        <a href="${esc(href)}" target="_blank" style="display:inline-block;font-family:${FONT};font-size:14px;font-weight:800;line-height:1;color:#FFFFFF;text-decoration:none;padding:15px 34px;border-radius:10px;">${esc(text)}</a>
      </td></tr>
    </table>`;

/** Callout — light tinted note (info / warning / success). `html` is raw. */
const calloutNote = (html, tone = 'warn') => {
  const t = TONES[tone] || TONES.warn;
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px;">
      <tr><td bgcolor="${t.bg}" style="background:${t.bg};border:1px solid ${t.border};border-radius:12px;padding:14px 16px;font-family:${FONT};font-size:13px;line-height:1.65;color:${t.fg};">${html}</td></tr>
    </table>`;
};

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const dmy = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const dmyLong = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

/** "IELTS Voucher" → "IELTS Voucher"; "PTE Academic" → "PTE Academic Voucher" (no doubled word). */
const voucherTitle = (name) => {
  const n = String(name || 'Exam Voucher').trim();
  return /\bvouchers?\b/i.test(n) ? n : `${n} Voucher`;
};

/* ══════════════════════════════════════════════════════════════════════════
 * CUSTOMER EMAILS
 * ══════════════════════════════════════════════════════════════════════════ */

export const sendRegistrationWelcome = (user) => {
  const subject = `Welcome to ${config.business.name} — Your Account Is Ready`;
  const body = `
    ${h1(`Welcome aboard, ${user.name || 'there'}!`, '🎉')}
    ${para(`Thank you for creating your candidate account on <strong>${esc(config.business.name)}</strong>. You can now log in, buy official exam vouchers at the best price, and access your voucher inventory anytime.`)}
    ${primaryButton('Go to My Dashboard →', `${clientUrl()}/login`)}
  `;
  return sendEmail({
    to: user.email,
    tag: 'welcome',
    subject,
    html: emailShell({ title: subject, preheader: 'Your Apex Vouchers account is ready to use.', body }),
  });
};

/**
 * Customer Purchase Confirmation Email (Sent ONLY AFTER confirmed payment)
 */
export const sendOrderConfirmation = (user, order, vouchers = []) => {
  const customerName = user.name || order.customerSnapshot?.name || order.billingDetails?.name || 'Valued Customer';
  const targetEmail = user.email || order.customerSnapshot?.email || order.billingDetails?.email;
  const firstProductName = order.items?.[0]?.productName || 'Exam Voucher';
  const dateStr = dmyLong(order.paidAt || order.createdAt || Date.now());
  const paymentRef = order.razorpayPaymentId || order.paymentReference || null;
  const totalQty = (order.items || []).reduce((s, i) => s + (i.quantity || 1), 0) || vouchers.length || 1;

  const subject = `Your ${voucherTitle(firstProductName)} Is Ready 🎉 | ${config.business.name}`;

  const itemsBlock =
    (order.items || []).length > 1
      ? `${sectionLabel('Items')}
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:12px;margin:0 0 20px;">
           <tr><td style="padding:6px 18px;">
             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
               ${(order.items || [])
                 .map(
                   (it) => `<tr>
                     <td style="padding:8px 0;font-family:${FONT};font-size:13px;color:${BRAND.text};font-weight:600;">${esc(it.productName)}</td>
                     <td align="center" style="padding:8px 0;font-family:${FONT};font-size:13px;color:${BRAND.muted};">×${esc(it.quantity)}</td>
                     <td align="right" style="padding:8px 0;font-family:${FONT};font-size:13px;color:${BRAND.text};font-weight:700;">${inr(it.unitPrice * it.quantity)}</td>
                   </tr>`,
                 )
                 .join('')}
             </table>
           </td></tr>
         </table>`
      : '';

  const voucherCardsHtml = vouchers.length
    ? vouchers
        .map((v, idx) => {
          const steps = Array.isArray(v.redemptionSteps) ? v.redemptionSteps.filter(Boolean) : [];
          const extra =
            (steps.length
              ? `<div style="margin-top:14px;padding-top:12px;border-top:1px solid ${TONES.pink.border};font-family:${FONT};font-size:12px;line-height:1.65;color:${BRAND.text};">
                   <strong>How to use this voucher:</strong>
                   <ol style="margin:6px 0 0;padding-left:18px;color:${BRAND.muted};">
                     ${steps.map((s) => `<li style="margin-bottom:3px;">${esc(s)}</li>`).join('')}
                   </ol>
                 </div>`
              : '') +
            (v.officialWebsiteUrl
              ? `<div style="margin-top:10px;font-family:${FONT};font-size:12px;color:${BRAND.muted};">Redeem at: <a href="${esc(v.officialWebsiteUrl)}" style="color:${BRAND.pink};text-decoration:none;font-weight:600;">${esc(v.officialWebsiteUrl)}</a></div>`
              : '');
          return voucherCard({
            productName: `${v.productName || firstProductName}${vouchers.length > 1 ? ` — Voucher ${idx + 1} of ${vouchers.length}` : ''}`,
            voucherType: v.voucherType || order.items?.[0]?.voucherType || 'EXAM',
            code: v.code,
            validUntil: v.expiryDate ? dmy(v.expiryDate) : '',
            extraHtml: extra,
          });
        })
        .join('')
    : calloutNote('Your voucher code is active and accessible inside your Apex account dashboard.', 'warn');

  const body = `
    ${h1('Your Voucher Is Ready!', '🎉')}
    ${para(`Hi ${esc(customerName)},`)}
    ${para(`Thank you for purchasing your exam voucher from <strong>${esc(config.business.name)}</strong>. Your payment has been successfully confirmed and your voucher is ready.`)}
    <div style="margin:0 0 4px;">${statusBadge('Payment Successful ✓', 'success')}</div>

    ${sectionLabel('Order Summary')}
    ${summary([
      ['Order ID', order.orderNo],
      ['Purchase Date', dateStr, { strong: false }],
      ['Voucher', firstProductName],
      ['Quantity', String(totalQty)],
      paymentRef ? ['Payment Reference', paymentRef, { mono: true, strong: false }] : null,
      ['Amount Paid', inr(order.total), { big: true, color: BRAND.pink }],
    ])}
    ${itemsBlock}

    ${sectionLabel('Your Voucher')}
    ${paraMuted('Use the voucher below to schedule your official exam directly on the test provider website.')}
    ${voucherCardsHtml}

    ${primaryButton('View My Voucher →', `${clientUrl()}/account`)}
  `;

  return sendEmail({
    to: targetEmail,
    tag: 'voucher',
    subject,
    html: emailShell({ title: subject, preheader: `Your ${voucherTitle(firstProductName)} code is inside — ready to redeem.`, body }),
  });
};

/**
 * Customer confirmation for a paid order that needs a moment before the voucher
 * code is attached. Says nothing about stock / inventory / admins — from the
 * customer's side this is a normal successful purchase being finalised.
 */
export const sendFulfillmentPendingConfirmation = (request, order) => {
  const customerName = request.customerName || order?.customerSnapshot?.name || 'there';
  const productName = request.productName || order?.items?.[0]?.productName || 'your exam voucher';
  const amount = Number(request.amountPaid || order?.total || 0);
  const orderNo = request.orderNo || order?.orderNo || '';
  const subject = `Payment Successful — ${productName} | ${config.business.name}`;

  const body = `
    ${h1('Payment Successful!', '🎉')}
    ${para(`Hi ${esc(customerName)},`)}
    ${para(`Your payment for <strong>${esc(productName)}</strong> was successful. Your voucher is now being prepared and will be delivered to this email address and your account within <strong>1–2 minutes</strong>. No further action is needed.`)}
    <div style="margin:0 0 4px;">${statusBadge('Payment Successful ✓', 'success')}</div>

    ${sectionLabel('Order Details')}
    ${summary([
      ['Order ID', orderNo],
      ['Voucher', productName],
      ['Amount Paid', inr(amount), { big: true, color: BRAND.pink }],
      ['Voucher Status', 'Being prepared', { color: TONES.warn.fg }],
    ])}

    ${primaryButton('View Order Status →', `${clientUrl()}/account?tab=vouchers`)}
  `;

  return sendEmail({
    to: request.customerEmail || order?.customerSnapshot?.email,
    subject,
    tag: 'fulfillment-pending',
    html: emailShell({ title: subject, preheader: 'Payment confirmed — your voucher is being prepared.', body }),
  });
};

export const sendPasswordReset = (user, token) => {
  const url = `${clientUrl()}/reset-password?token=${token}`;
  const subject = `Reset Your ${config.business.name} Password`;
  const body = `
    ${h1('Reset your password')}
    ${para('We received a request to reset your password. Click the button below to choose a new one. This link is valid for <strong>60 minutes</strong>.')}
    ${primaryButton('Reset Password →', url)}
    ${paraMuted("If you didn't request a password reset, you can safely ignore this email — your password stays unchanged.")}
  `;
  return sendEmail({
    to: user.email,
    tag: 'password-reset',
    subject,
    html: emailShell({ title: subject, preheader: 'Reset your Apex Vouchers password (link valid 60 minutes).', body }),
  });
};

/**
 * Customer Confirmation: PTE Booking Assistance Request Received
 */
export const sendPTEBookingConfirmationToCustomer = (booking) => {
  const dateStr = booking.preferredDate ? dmyLong(booking.preferredDate) : 'Flexible';
  const subject = `PTE Booking Assistance Request Received — ${booking.requestId} | ${config.business.name}`;

  const body = `
    ${h1(`Hi ${booking.fullName},`)}
    ${para(`Thank you for requesting PTE booking assistance from <strong>${esc(config.business.name)}</strong>. We've received your request and our team will contact you shortly using the details you provided to help you book your exam slot.`)}

    ${sectionLabel('Request Details')}
    ${summary([
      ['Request ID', booking.requestId],
      ['Exam Type', booking.examType],
      ['Preferred City', booking.preferredCity, { strong: false }],
      ['Preferred Date', dateStr, { strong: false }],
      ['Status', booking.status, { color: TONES.warn.fg }],
    ])}

    ${calloutNote('This is a booking assistance request, not a guarantee of an exam slot. Our team will confirm actual availability directly with you.', 'warn')}
  `;

  return sendEmail({
    to: booking.email,
    tag: 'pte-booking-received',
    subject,
    html: emailShell({ title: subject, preheader: 'We received your PTE booking assistance request.', body }),
  });
};

/**
 * Customer Notification: Status Changed for PTE Booking Request
 */
export const sendPTEBookingStatusUpdateToCustomer = (booking, newStatus, note = '', confirmationDetails = null) => {
  const subject = `PTE Booking Update: ${newStatus} — ${booking.requestId} | ${config.business.name}`;

  let tone = 'neutral';
  if (newStatus === 'Booking Confirmed' || newStatus === 'Completed') tone = 'success';
  if (newStatus === 'Cancelled' || newStatus === 'Rejected') tone = 'danger';
  if (newStatus === 'Waiting for Customer') tone = 'warn';
  const statusFg = (TONES[tone] || TONES.neutral).fg;

  let confirmationBlock = '';
  if (newStatus === 'Booking Confirmed' && confirmationDetails && (confirmationDetails.bookingReference || confirmationDetails.confirmedCentre)) {
    const rows = [
      confirmationDetails.bookingReference ? ['Booking Reference', confirmationDetails.bookingReference] : null,
      confirmationDetails.confirmedCentre ? ['Test Centre', confirmationDetails.confirmedCentre] : null,
      confirmationDetails.confirmedCity ? ['City', confirmationDetails.confirmedCity] : null,
      confirmationDetails.confirmedDate ? ['Confirmed Date', dmyLong(confirmationDetails.confirmedDate), { color: TONES.success.fg }] : null,
      confirmationDetails.confirmedTime ? ['Confirmed Time', confirmationDetails.confirmedTime, { color: TONES.success.fg }] : null,
    ];
    confirmationBlock = `
      ${sectionLabel('Official Appointment Confirmation')}
      ${summary(rows, { tone: 'pink' })}
      ${confirmationDetails.importantInstructions ? calloutNote(`<strong>Instructions:</strong> ${esc(confirmationDetails.importantInstructions)}`, 'success') : ''}
    `;
  }

  const body = `
    ${h1(`Hi ${booking.fullName},`)}
    ${para(`Your PTE exam booking assistance request has been updated to: <strong style="color:${statusFg};">${esc(newStatus)}</strong>.`)}

    ${confirmationBlock}

    ${sectionLabel('Request Details')}
    ${summary([
      ['Request ID', booking.requestId],
      ['Exam Type', booking.examType],
      ['Preferred City', booking.preferredCity, { strong: false }],
      ['Status', newStatus, { color: statusFg }],
    ])}

    ${note ? calloutNote(`<strong>Update note:</strong> ${esc(note)}`, tone === 'danger' ? 'danger' : 'neutral') : ''}
    ${paraMuted('If you have questions or need to adjust your preferences, just reply to this email or contact Apex Vouchers support.')}
  `;

  return sendEmail({
    to: booking.email,
    tag: 'pte-booking-status',
    subject,
    html: emailShell({ title: subject, preheader: `PTE booking status: ${newStatus}`, body }),
  });
};

/* ── VOUCHER REQUEST FLOW (customer requested an out-of-stock voucher) ──────
 * All best-effort: the caller fires them without awaiting. They never throw. */

/** Customer confirmation — "we received your voucher request". */
export const sendVoucherRequestConfirmationToCustomer = (request) => {
  const subject = `Voucher Request Received — ${request.requestId} | ${config.business.name}`;
  const body = `
    ${h1(`Hi ${request.customerName},`)}
    ${para(`<strong>Voucher currently unavailable.</strong> The <strong>${esc(request.productName)}</strong> voucher is temporarily out of stock, but our team has received your request and is sourcing it now.`)}
    ${calloutNote('You will receive an update within <strong>1–2 hours</strong> once your request is processed and the voucher is ready to purchase.', 'warn')}

    ${sectionLabel('Request Details')}
    ${summary([
      ['Request ID', request.requestId],
      ['Voucher', request.productName],
      ['Voucher Type', request.voucherType || 'EXAM', { strong: false }],
      ['Status', 'Pending', { color: TONES.warn.fg }],
      ['Requested On', new Date(request.createdAt || Date.now()).toLocaleString('en-IN'), { strong: false }],
    ])}
  `;
  return sendEmail({
    to: request.customerEmail,
    tag: 'voucher-request-received',
    subject,
    html: emailShell({ title: subject, preheader: 'We received your voucher request and are sourcing it now.', body }),
  });
};

/** Customer — the voucher has been sourced and is ready to buy. */
export const sendVoucherRequestReadyForPaymentToCustomer = (request) => {
  const subject = `Your ${voucherTitle(request.productName)} Is Ready to Purchase | ${config.business.name}`;
  const priceLine = request.priceSnapshot ? inr(request.priceSnapshot) : 'shown at checkout';
  const body = `
    ${h1(`Hi ${request.customerName},`)}
    ${para(`Good news — we've sourced the <strong>${esc(request.productName)}</strong> voucher you requested. You can now complete your purchase and it will be delivered to your account instantly after payment.`)}

    ${sectionLabel('Request Details')}
    ${summary([
      ['Request ID', request.requestId],
      ['Voucher', request.productName],
      ['Price', priceLine, { color: BRAND.pink }],
      ['Status', 'Ready for payment', { color: TONES.success.fg }],
    ])}

    ${primaryButton('Complete Your Purchase →', `${clientUrl()}/account?tab=voucher-requests`)}
  `;
  return sendEmail({
    to: request.customerEmail,
    tag: 'voucher-request-ready',
    subject,
    html: emailShell({ title: subject, preheader: 'Your requested voucher is sourced and ready to buy.', body }),
  });
};

/** Customer — payment captured, requested voucher delivered. */
export const sendVoucherRequestFulfilledToCustomer = (request, voucher = null) => {
  const subject = `Your Requested ${voucherTitle(request.productName)} Is Ready 🎉 | ${config.business.name}`;
  const codeBlock = voucher?.code
    ? voucherCard({
        productName: request.productName,
        voucherType: request.voucherType,
        code: voucher.code,
        validUntil: voucher.expiryDate ? dmy(voucher.expiryDate) : '',
      })
    : calloutNote('Your voucher code is now available in your Apex account.', 'warn');
  const body = `
    ${h1('Your Requested Voucher Is Ready!', '🎉')}
    ${para(`Hi ${esc(request.customerName)},`)}
    ${para('Your payment is confirmed and the voucher you requested has been delivered to your account. A full purchase confirmation with redemption steps is on its way in a separate email.')}
    ${codeBlock}

    ${sectionLabel('Request Details')}
    ${summary([
      ['Request ID', request.requestId],
      ['Status', 'Fulfilled', { color: TONES.success.fg }],
      request.paymentReference ? ['Payment Reference', request.paymentReference, { mono: true, strong: false }] : null,
    ])}

    ${primaryButton('View My Voucher →', `${clientUrl()}/account`)}
  `;
  return sendEmail({
    to: request.customerEmail,
    tag: 'voucher-request-fulfilled',
    subject,
    html: emailShell({ title: subject, preheader: 'Your requested voucher has been delivered to your account.', body }),
  });
};

/** Customer — request was closed without fulfilment. */
export const sendVoucherRequestCancelledToCustomer = (request, reason = '') => {
  const subject = `Update on Your Voucher Request — ${request.requestId} | ${config.business.name}`;
  const body = `
    ${h1(`Hi ${request.customerName},`)}
    ${para(`We're sorry — your request for the <strong>${esc(request.productName)}</strong> voucher (${esc(request.requestId)}) has been cancelled${reason ? ` for the following reason: ${esc(reason)}` : ''}. If you have any questions, just reply to this email and our team will help.`)}
  `;
  return sendEmail({
    to: request.customerEmail,
    tag: 'voucher-request-cancelled',
    subject,
    html: emailShell({ title: subject, preheader: 'An update about your voucher request.', body }),
  });
};

/**
 * Best-effort security notice sent to the OLD email address after a successful
 * email change.
 */
export const sendEmailChangedSecurityNotice = (user, oldEmail, newEmail) => {
  const subject = `Your ${config.business.name} Account Email Was Changed`;
  const body = `
    ${h1('Your account email was changed')}
    ${para(`Hi ${esc(user.name || 'there')}, this is a confirmation that your ${esc(config.business.name)} account email was changed to <strong>${esc(newEmail)}</strong>.`)}
    ${calloutNote("If you didn't make this change, contact our support team immediately.", 'danger')}
  `;
  return sendEmail({
    to: oldEmail,
    tag: 'email-changed',
    subject,
    html: emailShell({ title: subject, preheader: 'Your Apex Vouchers account email was changed.', body }),
  });
};

/* ══════════════════════════════════════════════════════════════════════════
 * ADMIN EMAILS  —  same white + pink system, information-rich
 * ══════════════════════════════════════════════════════════════════════════ */

const adminEmail = ({ subject, heading, emoji = '', intro, tone = 'pink', rows, cta, preheader }) => {
  const urgent = tone === 'danger' || tone === 'warn';
  const body = `
    ${h1(heading, emoji)}
    ${intro ? (urgent ? calloutNote(esc(intro), tone) : para(esc(intro))) : ''}
    ${sectionLabel('Details')}
    ${summary(rows, { tone: urgent ? 'pink' : 'plain' })}
    ${cta ? primaryButton(cta.text, cta.href) : ''}
  `;
  return emailShell({ title: subject, preheader: preheader || heading, body });
};

/**
 * Internal Admin Alert: a PAID order needs manual voucher fulfillment.
 */
export const sendAdminFulfillmentRequestNotification = (request, order) => {
  const amount = Number(request.amountPaid || order?.total || 0);
  const maskedPayment = request.razorpayPaymentId ? `${String(request.razorpayPaymentId).slice(0, 8)}…` : '—';
  const subject = `Voucher Fulfillment Needed — ${request.productName} | ${request.requestId}`;

  return sendEmail({
    to: config.business.adminNotificationEmail,
    tag: 'fulfillment-request',
    subject,
    html: adminEmail({
      subject,
      heading: 'Voucher Fulfillment Requested',
      emoji: '⏳',
      tone: 'warn',
      intro: 'A customer has paid in full, but no voucher code was available in inventory at the time of allocation. Deliver a code from the admin dashboard to complete the order.',
      rows: [
        ['Request ID', request.requestId],
        ['Customer', `${request.customerName} (${request.customerEmail})`],
        ['Product', `${request.productName} (${request.voucherType}) × ${request.quantity}`],
        ['Order', request.orderNo],
        ['Amount Paid', inr(amount), { big: true, color: BRAND.pink }],
        ['Payment Reference', maskedPayment, { mono: true, strong: false }],
      ],
      cta: { text: 'Open Fulfillment Requests →', href: `${clientUrl()}/admin` },
      preheader: `Paid order ${request.orderNo} needs a voucher sourced.`,
    }),
  });
};

/**
 * Internal Admin Notification: a voucher has been SOLD & FULFILLED.
 * Voucher codes are MASKED here — the full code only goes to the customer.
 */
export const sendAdminVoucherSaleNotification = (user, order, vouchers = []) => {
  const customerName = user?.name || order.customerSnapshot?.name || order.billingDetails?.name || 'Customer';
  const customerEmail = user?.email || order.customerSnapshot?.email || order.billingDetails?.email || 'N/A';
  const customerPhone = user?.phone || order.customerSnapshot?.phone || order.billingDetails?.phone || 'N/A';
  const firstProductName = order.items?.[0]?.productName || 'Exam Voucher';
  const voucherType = vouchers?.[0]?.voucherType || order.items?.[0]?.voucherType || 'EXAM';
  const quantity = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || vouchers.length || 1;
  const paymentRef = order.razorpayPaymentId || order.paymentReference || 'N/A';
  const ts = new Date(order.paidAt || Date.now()).toLocaleString('en-IN');
  const maskedCodes = (vouchers || []).map((v) => maskVoucherCode(v.code)).join(', ') || '—';

  const subject = `Payment Received — ${firstProductName} | Order ${order.orderNo}`;

  return sendEmail({
    to: config.business.adminNotificationEmail,
    tag: 'admin-sale',
    subject,
    html: adminEmail({
      subject,
      heading: 'New Payment Received',
      emoji: '💰',
      tone: 'success',
      intro: 'A customer has successfully completed payment and the voucher has been delivered.',
      rows: [
        ['Customer Name', customerName],
        ['Customer Email', customerEmail, { color: BRAND.pink, strong: false }],
        ['Customer Phone', customerPhone, { strong: false }],
        ['Order ID', order.orderNo],
        ['Product', firstProductName],
        ['Voucher Type', voucherType],
        ['Quantity', String(quantity)],
        ['Amount Paid', inr(order.total), { big: true, color: BRAND.pink }],
        ['Payment Reference', paymentRef, { mono: true, strong: false }],
        ['Voucher(s)', maskedCodes, { mono: true, strong: false }],
        ['Payment Status', 'PAID', { color: TONES.success.fg }],
        ['Fulfillment', `${order.paymentStatus || 'PAID'} • ${order.fulfillmentStatus || 'FULFILLED'}`, { color: TONES.success.fg }],
        ['Date', ts, { strong: false }],
      ],
      cta: { text: 'View Order in Admin →', href: `${clientUrl()}/admin` },
      preheader: `${customerName} paid ${inr(order.total)} for ${firstProductName}.`,
    }),
  });
};

// Backwards-compatible alias (old name used elsewhere).
export const sendAdminNewOrderNotification = sendAdminVoucherSaleNotification;

/**
 * Internal Admin Alert: Voucher Assignment Failure
 */
export const sendAdminVoucherAssignmentFailureAlert = (order, errorMsg) => {
  const customerEmail = order.customerSnapshot?.email || order.billingDetails?.email || 'N/A';
  const customerName = order.customerSnapshot?.name || order.billingDetails?.name || 'Customer';
  const firstProductName = order.items?.[0]?.productName || 'Exam Voucher';
  const subject = `Action Required: Paid Order Without Voucher — Order ${order.orderNo}`;

  return sendEmail({
    to: config.business.adminNotificationEmail,
    tag: 'admin-allocation-failed',
    subject,
    html: adminEmail({
      subject,
      heading: 'Action Required: Voucher Unassigned',
      emoji: '🚨',
      tone: 'danger',
      intro: 'An order was successfully paid, but voucher inventory assignment failed. Please assign a voucher manually from the admin dashboard.',
      rows: [
        ['Order ID', order.orderNo],
        ['Customer Name', customerName],
        ['Customer Email', customerEmail, { color: BRAND.pink, strong: false }],
        ['Product Requested', firstProductName],
        ['Amount Paid', inr(order.total), { big: true, color: BRAND.pink }],
        ['Error Details', errorMsg || 'Inventory empty', { color: TONES.danger.fg, strong: false }],
      ],
      cta: { text: 'Assign Voucher Manually →', href: `${clientUrl()}/admin` },
      preheader: `Paid order ${order.orderNo} has no voucher assigned.`,
    }),
  });
};

/**
 * Internal Admin Alert: Customer Email Delivery Failure
 */
export const sendAdminEmailDeliveryFailureAlert = (order, errorMsg) => {
  const customerEmail = order.customerSnapshot?.email || order.billingDetails?.email || 'N/A';
  const subject = `Voucher Email Delivery Failed — Order ${order.orderNo}`;

  return sendEmail({
    to: config.business.adminNotificationEmail,
    tag: 'admin-email-failed',
    subject,
    html: adminEmail({
      subject,
      heading: 'Voucher Email Delivery Failed',
      emoji: '⚠️',
      tone: 'warn',
      intro: 'The customer\'s voucher is active in their account, but automated email dispatch failed. Use "Resend Voucher Email" in the admin console.',
      rows: [
        ['Order ID', order.orderNo],
        ['Customer Email', customerEmail, { color: BRAND.pink, strong: false }],
        ['Error Details', errorMsg || 'SMTP dispatch error', { color: TONES.warn.fg, strong: false }],
      ],
      cta: { text: 'Open Admin Console to Resend →', href: `${clientUrl()}/admin` },
      preheader: `Voucher email failed for order ${order.orderNo}.`,
    }),
  });
};

/**
 * Internal Admin Security Alert: Voucher Product Mismatch Blocked
 */
export const sendAdminVoucherMismatchAlert = (order, expectedItem, attemptedVoucher) => {
  const customerEmail = order.customerSnapshot?.email || order.billingDetails?.email || 'N/A';
  const expectedType = expectedItem?.voucherType || 'Unknown';
  const attemptedType = attemptedVoucher?.voucherType || 'Unknown';
  const subject = `Security Alert: Voucher Mismatch Blocked — Order ${order.orderNo}`;

  return sendEmail({
    to: config.business.adminNotificationEmail,
    tag: 'admin-mismatch',
    subject,
    html: adminEmail({
      subject,
      heading: 'Critical Security: Voucher Mismatch Blocked',
      emoji: '🚨',
      tone: 'danger',
      intro: 'An attempted voucher delivery was AUTOMATICALLY BLOCKED because the voucher type did not match the purchased product. The wrong voucher was NOT delivered to the customer.',
      rows: [
        ['Order ID', order.orderNo],
        ['Customer', customerEmail, { color: BRAND.pink, strong: false }],
        ['Expected Product', `${expectedItem?.productName || ''} (${expectedType})`, { color: TONES.success.fg }],
        ['Attempted Voucher', `${attemptedType} (${attemptedVoucher?.code || '—'})`, { color: TONES.danger.fg }],
        ['Action Taken', 'DELIVERY CANCELLED & BLOCKED', { color: TONES.warn.fg }],
      ],
      cta: { text: 'Review Voucher Inventory →', href: `${clientUrl()}/admin` },
      preheader: `Voucher mismatch blocked on order ${order.orderNo}.`,
    }),
  });
};

/**
 * Internal Admin Notification: New PTE Booking Assistance Request
 */
export const sendPTEBookingAdminNotification = (booking) => {
  const dateStr = booking.preferredDate ? dmyLong(booking.preferredDate) : 'Flexible';
  const subject = `New PTE Booking Request — ${booking.requestId}`;

  return sendEmail({
    to: config.business.adminNotificationEmail,
    tag: 'pte-booking-admin',
    subject,
    html: adminEmail({
      subject,
      heading: 'New PTE Booking Assistance Request',
      emoji: '📅',
      tone: 'pink',
      rows: [
        ['Customer', booking.fullName],
        ['Email', booking.email, { color: BRAND.pink, strong: false }],
        ['Phone', booking.phone, { strong: false }],
        ['Exam Type', booking.examType],
        ['Preferred City', booking.preferredCity],
        ['Preferred Date', dateStr, { strong: false }],
        ['Preferred Time', booking.preferredTime || 'Any Time', { strong: false }],
        ['Request ID', booking.requestId],
      ],
      cta: { text: 'Open Request in Admin →', href: `${clientUrl()}/admin` },
      preheader: `${booking.fullName} requested PTE booking assistance.`,
    }),
  });
};

/** Internal admin notification — a customer requested an out-of-stock voucher. */
export const sendVoucherRequestAdminNotification = (request) => {
  const subject = `New Voucher Request — ${request.productName} | ${request.requestId}`;

  return sendEmail({
    to: config.business.adminNotificationEmail,
    tag: 'voucher-request-admin',
    subject,
    html: adminEmail({
      subject,
      heading: 'New Voucher Request',
      emoji: '🎟️',
      tone: 'warn',
      intro: 'A customer requested a voucher that currently has no available inventory. Source a code, add it to stock, then mark the request ready for payment.',
      rows: [
        ['Customer', request.customerName],
        ['Email', request.customerEmail, { color: BRAND.pink, strong: false }],
        ['Voucher', request.productName],
        ['Voucher Type', request.voucherType || 'EXAM', { strong: false }],
        ['Category', request.category || '—', { strong: false }],
        ['Request ID', request.requestId],
        ['Requested On', new Date(request.createdAt || Date.now()).toLocaleString('en-IN'), { strong: false }],
      ],
      cta: { text: 'Open Voucher Requests →', href: `${clientUrl()}/admin` },
      preheader: `${request.customerName} requested ${request.productName} (out of stock).`,
    }),
  });
};

/* ══════════════════════════════════════════════════════════════════════════
 * OTP / VERIFICATION EMAILS
 * ──────────────────────────────────────────────────────────────────────────
 * Deliberately compact and mostly-text: a lean white template with a real
 * text/plain part (added by sendEmail) is far less likely to be spam-filtered
 * or greylisted by corporate / university mail servers than a full marketing
 * layout. Same white + pink identity, no dark surfaces.
 * ══════════════════════════════════════════════════════════════════════════ */

const OTP_EXPIRY_MINUTES = 10;

const otpEmail = ({ heading, intro, otp, closing }) => `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
</head>
<body style="margin:0;padding:0;background:${BRAND.page};font-family:${FONT};color:${BRAND.text};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.page}" style="background:${BRAND.page};padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="width:480px;max-width:480px;background:${BRAND.card};border:1px solid ${BRAND.borderSoft};border-radius:14px;overflow:hidden;">
        <tr><td style="padding:24px 32px 0;font-family:${FONT};font-size:18px;font-weight:800;letter-spacing:0.4px;color:${BRAND.text};">APEX<span style="color:${BRAND.pink};">&#8599;</span>&nbsp;<span style="color:${BRAND.pink};">VOUCHERS</span></td></tr>
        <tr><td style="padding:8px 32px 0;"><div style="height:3px;width:46px;background:${BRAND.pink};border-radius:3px;font-size:3px;line-height:3px;">&nbsp;</div></td></tr>
        <tr><td style="padding:18px 32px 26px;">
          <h1 style="font-family:${FONT};font-size:18px;font-weight:800;margin:6px 0 8px;color:${BRAND.text};">${esc(heading)}</h1>
          <p style="font-family:${FONT};font-size:14px;line-height:1.6;color:${BRAND.text};margin:0 0 18px;">${intro}</p>
          <p style="font-family:${FONT};font-size:12px;color:${BRAND.muted};margin:0 0 8px;">Your verification code is:</p>
          <div style="font-family:${MONO};font-size:32px;font-weight:800;letter-spacing:8px;color:${BRAND.text};background:${BRAND.pinkSoft};border:1px solid ${TONES.pink.border};border-radius:10px;padding:16px 0;text-align:center;margin:0 0 16px;">${esc(otp)}</div>
          <p style="font-family:${FONT};font-size:12px;color:${BRAND.muted};margin:0 0 4px;">This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
          <p style="font-family:${FONT};font-size:12px;color:${BRAND.muted};margin:0;">${esc(closing)}</p>
        </td></tr>
        <tr><td style="padding:14px 32px 24px;border-top:1px solid ${BRAND.borderSoft};font-family:${FONT};font-size:11px;color:${BRAND.muted};">
          Need help? <a href="mailto:${esc(config.business.supportEmail)}" style="color:${BRAND.pink};text-decoration:none;">${esc(config.business.supportEmail)}</a> &nbsp;&bull;&nbsp; &copy; ${new Date().getFullYear()} ${esc(config.business.name)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

/**
 * Registration email verification — 6-digit OTP. Returns the sendEmail result
 * { sent, error, ... } — the caller MUST check `.sent`.
 */
export const sendRegistrationOtp = (user, otp) => {
  const text =
    `Hello,\n\nYour ${config.business.name} verification code is:\n\n${otp}\n\n` +
    `This code expires in ${OTP_EXPIRY_MINUTES} minutes.\n\n` +
    `If you did not request an ${config.business.name} account, you can ignore this email.\n\nThanks,\n${config.business.name}`;
  return sendEmail({
    to: user.email,
    tag: 'otp-register',
    subject: `Your ${config.business.name} Verification Code`,
    text,
    html: otpEmail({
      heading: 'Verify your email address',
      intro: `Hello${user.name ? ' ' + esc(String(user.name).split(' ')[0]) : ''}, enter this code to finish creating your ${esc(config.business.name)} account.`,
      otp,
      closing: `If you did not request an ${config.business.name} account, you can ignore this email.`,
    }),
  });
};

/**
 * Change-email OTP — 6-digit code sent to the NEW address before the swap.
 */
export const sendEmailOtpCode = (user, newEmail, otp) => {
  const text =
    `Hello,\n\nYou requested to change your ${config.business.name} account email to ${newEmail}.\n\n` +
    `Your verification code is:\n\n${otp}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.\n\n` +
    `If you did not request this change, ignore this email — your current email stays unchanged.`;
  return sendEmail({
    to: newEmail,
    tag: 'otp-change-email',
    subject: `Verify Your New Email — ${config.business.name}`,
    text,
    html: otpEmail({
      heading: 'Verify your new email address',
      intro: `You requested to change your ${esc(config.business.name)} account email to <strong>${esc(newEmail)}</strong>. Enter this code to confirm.`,
      otp,
      closing: 'If you did not request this change, ignore this email — your current email stays unchanged.',
    }),
  });
};
