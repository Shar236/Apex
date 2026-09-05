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
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/**
 * Send one email. NEVER throws — returns { sent:boolean, error?, info?, tag? }
 * so callers can decide what to tell the user. `tag` is a short label used only
 * for log correlation (e.g. 'otp', 'voucher').
 */
export const sendEmail = async ({ to, subject, html, text = '', from = config.smtp.from, replyTo, tag = 'generic' }) => {
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
    ...(replyTo ? { replyTo } : {}),
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

const htmlWrap = (title, body) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d0d0d; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #161616; border: 1px solid #262626; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Branding -->
          <tr>
            <td style="background-color: #111111; padding: 24px 32px; border-bottom: 1px solid #262626;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                      APEX<span style="color: #FF005C;">●</span>VOUCHERS
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; font-weight: 800; background-color: #220512; color: #FF005C; border: 1px solid #FF005C; padding: 4px 10px; border-radius: 8px; text-transform: uppercase;">
                      Official Delivery
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              ${body}
            </td>
          </tr>

          <!-- Official Customer Support Footer -->
          <tr>
            <td style="background-color: #111111; padding: 24px 32px; border-top: 1px solid #262626; text-align: center; font-size: 12px; color: #888888; line-height: 1.6;">
              <p style="margin: 0 0 10px 0; font-weight: 700; color: #aaaaaa;">
                🔒 Security Notice: For your safety, never share your voucher code or account password with anyone.
              </p>
              <p style="margin: 0 0 10px 0; color: #cccccc;">
                Need help? Contact <strong>${config.business.name} Support</strong><br/>
                Email: <a href="mailto:${config.business.supportEmail}" style="color: #FF005C; text-decoration: none; font-weight: 700;">${config.business.supportEmail}</a> | Phone: <a href="tel:${config.business.supportPhone.replace(/\s+/g, '')}" style="color: #FF005C; text-decoration: none; font-weight: 700;">${config.business.supportPhone}</a>
              </p>
              <p style="margin: 0; color: #666666; font-size: 11px;">
                © ${new Date().getFullYear()} ${config.business.name}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const sendRegistrationWelcome = (user) => {
  const clientUrl = config.clientUrl || 'http://localhost:5173';
  return sendEmail({
    to: user.email,
    subject: `Welcome to ${config.business.name} — Account Ready`,
    html: htmlWrap(
      `Welcome to ${config.business.name}`,
      `
      <h2 style="font-size: 22px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff;">Hi ${user.name}, welcome aboard!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #cccccc; margin: 0 0 24px 0;">
        Thank you for creating your candidate account on ${config.business.name}. You can now log in, purchase official exam vouchers at maximum discount, and access your voucher inventory anytime.
      </p>
      <div style="text-align: center; margin-top: 28px;">
        <a href="${clientUrl}/login" style="display: inline-block; background-color: #FF005C; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px;">
          Go to My Dashboard →
        </a>
      </div>
      `
    ),
  });
};

/**
 * Customer Purchase Confirmation Email (Sent ONLY AFTER confirmed payment)
 */
export const sendOrderConfirmation = (user, order, vouchers = []) => {
  const clientUrl = config.clientUrl || 'http://localhost:5173';
  const customerName = user.name || order.customerSnapshot?.name || order.billingDetails?.name || 'Valued Customer';
  const targetEmail = user.email || order.customerSnapshot?.email || order.billingDetails?.email;
  const firstProductName = order.items?.[0]?.productName || 'Exam Voucher';
  const dateStr = new Date(order.paidAt || order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const paymentRef = order.razorpayPaymentId || order.paymentReference || null;
  const totalQty = (order.items || []).reduce((s, i) => s + (i.quantity || 1), 0) || vouchers.length || 1;

  const subject = `Your Voucher Is Ready 🎉 (#${order.orderNo})`;

  const itemRows = (order.items || [])
    .map(
      (it) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #262626; font-size: 14px; color: #ffffff; font-weight: 600;">${it.productName}</td>
        <td align="center" style="padding: 12px 0; border-bottom: 1px solid #262626; font-size: 14px; color: #cccccc;">${it.quantity}</td>
        <td align="right" style="padding: 12px 0; border-bottom: 1px solid #262626; font-size: 14px; color: #ffffff; font-weight: 700;">₹${(it.unitPrice * it.quantity).toLocaleString('en-IN')}</td>
      </tr>`
    )
    .join('');

  const voucherCards = vouchers.length
    ? vouchers
        .map((v, idx) => {
          const steps = Array.isArray(v.redemptionSteps) ? v.redemptionSteps.filter(Boolean) : [];
          const instructionsHtml = steps.length
            ? `<div style="margin-top: 12px; font-size: 12px; color: #bbbbbb; line-height: 1.6;">
                 <strong style="color:#ffffff;">How to use this voucher:</strong>
                 <ol style="margin: 6px 0 0 0; padding-left: 18px;">
                   ${steps.map((s) => `<li style="margin-bottom: 3px;">${s}</li>`).join('')}
                 </ol>
                 ${v.officialWebsiteUrl ? `<div style="margin-top:8px;">Redeem at: <a href="${v.officialWebsiteUrl}" style="color:#FF005C;">${v.officialWebsiteUrl}</a></div>` : ''}
               </div>`
            : v.officialWebsiteUrl
              ? `<div style="margin-top:10px; font-size:12px; color:#bbbbbb;">Redeem at: <a href="${v.officialWebsiteUrl}" style="color:#FF005C;">${v.officialWebsiteUrl}</a></div>`
              : '';
          return `
      <div style="background-color: #240514; border: 2px dashed #FF005C; border-radius: 16px; padding: 20px; margin-top: 16px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #FF005C; margin-bottom: 4px;">
          ${v.productName || firstProductName}${vouchers.length > 1 ? ` — Voucher ${idx + 1} of ${vouchers.length}` : ''}
        </div>
        <div style="font-size: 11px; color: #999999; margin-bottom: 8px;">Voucher Type: ${v.voucherType || order.items?.[0]?.voucherType || 'EXAM'}</div>
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff; margin-bottom: 10px; word-break: break-all;">
          ${v.code}
        </div>
        <div style="font-size: 12px; color: #aaaaaa;">
          Valid Until: <strong style="color: #ffffff;">${new Date(v.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
        </div>
        ${instructionsHtml}
      </div>`;
        })
        .join('')
    : `
      <div style="background-color: #261f0a; border: 1px solid #7c5e10; border-radius: 14px; padding: 16px; margin-top: 16px; font-size: 13px; color: #f5c045; text-align: center;">
        Your voucher code is active and accessible inside your Apex account dashboard.
      </div>`;

  const bodyHtml = `
    <!-- Greeting -->
    <h2 style="font-size: 24px; font-weight: 900; margin: 0 0 12px 0; color: #ffffff;">Hi ${customerName},</h2>
    
    <!-- Congratulations Message -->
    <p style="font-size: 15px; line-height: 1.6; color: #dddddd; margin: 0 0 24px 0;">
      🎉 <strong>Congratulations!</strong> Thank you for purchasing your exam voucher from Apex Vouchers. Your payment has been successfully confirmed and your voucher is now available in your Apex account.
    </p>

    <!-- Order Summary Card -->
    <div style="background-color: #1a1a1a; border: 1px solid #292929; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
        <tr>
          <td><span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #888888; letter-spacing: 0.5px;">ORDER DETAILS</span></td>
          <td align="right"><span style="font-size: 12px; font-weight: 800; background-color: #0f2e1b; color: #34d399; padding: 3px 8px; border-radius: 6px;">PAYMENT PAID</span></td>
        </tr>
      </table>
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Order ID:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${order.orderNo}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Purchase Date:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #cccccc; padding-bottom: 6px;">${dateStr}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Total Vouchers:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${totalQty}</td>
        </tr>
        ${paymentRef ? `<tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Payment Reference:</td>
          <td align="right" style="font-size: 12px; font-weight: 600; color: #cccccc; padding-bottom: 6px; font-family:'Courier New',monospace;">${paymentRef}</td>
        </tr>` : ''}
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Amount Paid:</td>
          <td align="right" style="font-size: 16px; font-weight: 900; color: #FF005C; padding-bottom: 6px;">₹${order.total?.toLocaleString('en-IN')}</td>
        </tr>
      </table>

      <!-- Item Breakdown Table -->
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 12px; border-top: 1px solid #262626;">
        <thead>
          <tr>
            <th align="left" style="padding: 10px 0 6px 0; font-size: 11px; color: #777777; text-transform: uppercase;">Item</th>
            <th align="center" style="padding: 10px 0 6px 0; font-size: 11px; color: #777777; text-transform: uppercase;">Qty</th>
            <th align="right" style="padding: 10px 0 6px 0; font-size: 11px; color: #777777; text-transform: uppercase;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    </div>

    <!-- Voucher Details Section -->
    <h3 style="font-size: 16px; font-weight: 800; margin: 0 0 8px 0; color: #ffffff;">YOUR VOUCHER DETAILS</h3>
    <p style="font-size: 13px; color: #aaaaaa; margin: 0 0 14px 0;">Use the voucher code below to schedule your official exam directly on the test administrator website.</p>
    
    ${voucherCards}

    <!-- Call to Action Button -->
    <div style="text-align: center; margin-top: 32px; margin-bottom: 12px;">
      <a href="${clientUrl}/account" style="display: inline-block; background-color: #FF005C; color: #ffffff; font-weight: 900; font-size: 15px; text-decoration: none; padding: 16px 36px; border-radius: 14px; box-shadow: 0 4px 15px rgba(255, 0, 92, 0.4);">
        View My Voucher →
      </a>
    </div>
  `;

  return sendEmail({
    to: targetEmail,
    subject,
    html: htmlWrap(subject, bodyHtml),
  });
};

/**
 * Customer confirmation for a paid order that needs a moment before the voucher
 * code is attached. Deliberately says nothing about stock / inventory / admins —
 * from the customer's side this is a normal successful purchase that is being
 * finalised. Sent once, right after the fulfilment request is created; the real
 * voucher email follows when the code is delivered.
 */
export const sendFulfillmentPendingConfirmation = (request, order) => {
  const clientUrl = config.clientUrl || 'http://localhost:5173';
  const customerName = request.customerName || order?.customerSnapshot?.name || 'there';
  const productName = request.productName || order?.items?.[0]?.productName || 'your exam voucher';
  const amount = Number(request.amountPaid || order?.total || 0);
  const orderNo = request.orderNo || order?.orderNo || '';
  const subject = `🎉 Payment successful — your voucher is on its way (#${orderNo})`;

  const bodyHtml = `
    <h2 style="font-size: 24px; font-weight: 900; margin: 0 0 12px 0; color: #ffffff;">Hi ${customerName},</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #dddddd; margin: 0 0 20px 0;">
      🎉 <strong>Congratulations!</strong> Your payment for <strong>${productName}</strong> was successful.
      Your voucher is being prepared and will be delivered to this email address and your
      account within <strong>1–2 minutes</strong>. No further action is needed.
    </p>
    <div style="background-color: #1a1a1a; border: 1px solid #292929; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr><td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Order ID:</td>
            <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${orderNo}</td></tr>
        <tr><td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Voucher:</td>
            <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${productName}</td></tr>
        <tr><td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Amount Paid:</td>
            <td align="right" style="font-size: 16px; font-weight: 900; color: #FF005C; padding-bottom: 6px;">₹${amount.toLocaleString('en-IN')}</td></tr>
        <tr><td style="font-size: 13px; color: #999999;">Payment:</td>
            <td align="right" style="font-size: 12px; font-weight: 800; color: #34d399;">PAID</td></tr>
      </table>
    </div>
    <div style="text-align: center; margin-top: 28px;">
      <a href="${clientUrl}/account?tab=vouchers" style="display: inline-block; background-color: #FF005C; color: #ffffff; font-weight: 900; font-size: 15px; text-decoration: none; padding: 16px 36px; border-radius: 14px;">
        View My Vouchers →
      </a>
    </div>
  `;

  return sendEmail({
    to: request.customerEmail || order?.customerSnapshot?.email,
    subject,
    html: htmlWrap(subject, bodyHtml),
    tag: 'fulfillment-pending',
  });
};

/**
 * Internal Admin Alert: a PAID order needs manual voucher fulfillment.
 * Sent when payment is captured but no inventory code is available — the
 * admin must source a code and deliver it (admin → Fulfillment Requests).
 */
export const sendAdminFulfillmentRequestNotification = (request, order) => {
  const clientUrl = config.clientUrl || 'http://localhost:5173';
  const amount = Number(request.amountPaid || order?.total || 0);
  const maskedPayment = request.razorpayPaymentId
    ? `${String(request.razorpayPaymentId).slice(0, 8)}…`
    : '—';

  const subject = `⏳ Voucher Fulfillment Needed — ${request.requestId} (${request.productName})`;

  const bodyHtml = `
    <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 12px 0; color: #fbbf24;">⏳ VOUCHER FULFILLMENT REQUESTED</h2>
    <p style="font-size: 14px; color: #e5e5e5; margin-bottom: 20px;">
      A customer has paid in full, but no voucher code was available in inventory at
      the time of allocation. Deliver a code from the admin dashboard to complete the order.
    </p>
    <div style="background-color: #1a1a1a; border: 1px solid #292929; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr><td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Request ID:</td>
            <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${request.requestId}</td></tr>
        <tr><td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Customer:</td>
            <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${request.customerName} (${request.customerEmail})</td></tr>
        <tr><td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Product:</td>
            <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${request.productName} (${request.voucherType}) × ${request.quantity}</td></tr>
        <tr><td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Order:</td>
            <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${request.orderNo}</td></tr>
        <tr><td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Amount Paid:</td>
            <td align="right" style="font-size: 15px; font-weight: 900; color: #FF005C; padding-bottom: 6px;">₹${amount.toLocaleString('en-IN')}</td></tr>
        <tr><td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Payment Reference:</td>
            <td align="right" style="font-size: 12px; font-weight: 600; color: #cccccc; padding-bottom: 6px; font-family:'Courier New',monospace;">${maskedPayment}</td></tr>
      </table>
    </div>
    <div style="text-align: center; margin-top: 28px;">
      <a href="${clientUrl}/admin" style="display: inline-block; background-color: #FF005C; color: #ffffff; font-weight: 900; font-size: 15px; text-decoration: none; padding: 16px 36px; border-radius: 14px;">
        Open Fulfillment Requests →
      </a>
    </div>
  `;

  return sendEmail({
    to: config.business.adminNotificationEmail,
    subject,
    html: htmlWrap(subject, bodyHtml),
    tag: 'fulfillment-request',
  });
};

/**
 * Internal Admin Notification: a voucher has been SOLD & FULFILLED.
 * Sent exactly once, only after a verified payment + successful allocation.
 * Voucher codes are MASKED here — the full code only goes to the customer.
 */
export const sendAdminVoucherSaleNotification = (user, order, vouchers = []) => {
  const clientUrl = config.clientUrl || 'http://localhost:5173';
  const customerName = user?.name || order.customerSnapshot?.name || order.billingDetails?.name || 'Customer';
  const customerEmail = user?.email || order.customerSnapshot?.email || order.billingDetails?.email || 'N/A';
  const customerPhone = user?.phone || order.customerSnapshot?.phone || order.billingDetails?.phone || 'N/A';

  const firstProductName = order.items?.[0]?.productName || 'Exam Voucher';
  const voucherType = vouchers?.[0]?.voucherType || order.items?.[0]?.voucherType || 'EXAM';
  const quantity = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || vouchers.length || 1;
  const paymentRef = order.razorpayPaymentId || order.paymentReference || 'N/A';
  const ts = new Date(order.paidAt || Date.now()).toLocaleString('en-IN');
  const maskedCodes = (vouchers || []).map((v) => maskVoucherCode(v.code)).join(', ') || '—';

  const subject = `🔔 New Voucher Sale — Order #${order.orderNo}`;

  const row = (label, value, color = '#ffffff') => `
    <tr>
      <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">${label}</td>
      <td align="right" style="font-size: 13px; font-weight: 700; color: ${color}; padding-bottom: 6px;">${value}</td>
    </tr>`;

  const bodyHtml = `
    <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 6px 0; color: #ffffff;">New Voucher Sale</h2>
    <p style="font-size: 13px; color: #34d399; margin: 0 0 16px 0;">A voucher has been successfully sold and fulfilled.</p>
    <div style="background-color: #1a1a1a; border: 1px solid #292929; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        ${row('Customer', customerName)}
        ${row('Email', customerEmail, '#FF005C')}
        ${row('Phone', customerPhone, '#cccccc')}
        ${row('Order', order.orderNo)}
        ${row('Product', firstProductName)}
        ${row('Voucher Type', voucherType)}
        ${row('Quantity', quantity)}
        ${row('Amount', `₹${order.total?.toLocaleString('en-IN')}`, '#FF005C')}
        ${row('Payment ID', paymentRef, '#cccccc')}
        ${row('Voucher(s)', maskedCodes, '#cccccc')}
        ${row('Payment', 'CAPTURED', '#34d399')}
        ${row('Status', `${order.paymentStatus || 'PAID'} • ${order.fulfillmentStatus || 'FULFILLED'}`, '#34d399')}
        ${row('Time', ts, '#cccccc')}
      </table>
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${clientUrl}/admin" style="display: inline-block; background-color: #FF005C; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px;">
        Open Order in Admin Dashboard →
      </a>
    </div>
  `;

  return sendEmail({
    to: config.business.adminNotificationEmail,
    subject,
    html: htmlWrap(subject, bodyHtml),
  });
};

// Backwards-compatible alias (old name used elsewhere).
export const sendAdminNewOrderNotification = sendAdminVoucherSaleNotification;

/**
 * Internal Admin Alert: Voucher Assignment Failure
 */
export const sendAdminVoucherAssignmentFailureAlert = (order, errorMsg) => {
  const clientUrl = config.clientUrl || 'http://localhost:5173';
  const customerEmail = order.customerSnapshot?.email || order.billingDetails?.email || 'N/A';
  const customerName = order.customerSnapshot?.name || order.billingDetails?.name || 'Customer';
  const firstProductName = order.items?.[0]?.productName || 'Exam Voucher';

  const subject = `🚨 Action Required — Paid Order Without Voucher Assignment (#${order.orderNo})`;

  const bodyHtml = `
    <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 12px 0; color: #f87171;">🚨 ACTION REQUIRED: VOUCHER UNASSIGNED</h2>
    <p style="font-size: 14px; color: #fca5a5; margin-bottom: 20px;">
      An order was successfully paid, but voucher inventory assignment failed. Please assign a voucher manually from the admin dashboard.
    </p>
    <div style="background-color: #1a1a1a; border: 1px solid #991b1b; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Order ID:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${order.orderNo}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Customer Name:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${customerName}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Customer Email:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #FF005C; padding-bottom: 6px;">${customerEmail}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Product Requested:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${firstProductName}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Amount Paid:</td>
          <td align="right" style="font-size: 14px; font-weight: 900; color: #FF005C; padding-bottom: 6px;">₹${order.total?.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Error Details:</td>
          <td align="right" style="font-size: 12px; font-weight: 600; color: #f87171; padding-bottom: 6px;">${errorMsg || 'Inventory empty'}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${clientUrl}/admin" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px;">
        Assign Voucher Manually in Admin →
      </a>
    </div>
  `;

  return sendEmail({
    to: config.business.adminNotificationEmail,
    subject,
    html: htmlWrap(subject, bodyHtml),
  });
};

/**
 * Internal Admin Alert: Customer Email Delivery Failure
 */
export const sendAdminEmailDeliveryFailureAlert = (order, errorMsg) => {
  const clientUrl = config.clientUrl || 'http://localhost:5173';
  const customerEmail = order.customerSnapshot?.email || order.billingDetails?.email || 'N/A';

  const subject = `⚠️ Voucher Email Delivery Failed — Order #${order.orderNo}`;

  const bodyHtml = `
    <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 12px 0; color: #fbbf24;">⚠️ VOUCHER EMAIL DELIVERY FAILED</h2>
    <p style="font-size: 14px; color: #fde68a; margin-bottom: 20px;">
      The customer's voucher is active in their account, but automated email dispatch failed. You can click "Resend Voucher Email" in the admin console.
    </p>
    <div style="background-color: #1a1a1a; border: 1px solid #92400e; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Order ID:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${order.orderNo}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Customer Email:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #FF005C; padding-bottom: 6px;">${customerEmail}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Error Details:</td>
          <td align="right" style="font-size: 12px; font-weight: 600; color: #fbbf24; padding-bottom: 6px;">${errorMsg || 'SMTP dispatch error'}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${clientUrl}/admin" style="display: inline-block; background-color: #d97706; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px;">
        Open Admin Console to Resend →
      </a>
    </div>
  `;

  return sendEmail({
    to: config.business.adminNotificationEmail,
    subject,
    html: htmlWrap(subject, bodyHtml),
  });
};

/**
 * Internal Admin Security Alert: Voucher Product Mismatch Blocked
 */
export const sendAdminVoucherMismatchAlert = (order, expectedItem, attemptedVoucher) => {
  const clientUrl = config.clientUrl || 'http://localhost:5173';
  const customerEmail = order.customerSnapshot?.email || order.billingDetails?.email || 'N/A';
  const expectedType = expectedItem?.voucherType || 'Unknown';
  const attemptedType = attemptedVoucher?.voucherType || 'Unknown';

  const subject = `🚨 CRITICAL ALERT: Voucher Product Mismatch Blocked — Order #${order.orderNo}`;

  const bodyHtml = `
    <h2 style="font-size: 20px; font-weight: 900; margin: 0 0 12px 0; color: #ef4444;">🚨 CRITICAL SECURITY: VOUCHER MISMATCH BLOCKED</h2>
    <p style="font-size: 14px; color: #fca5a5; margin-bottom: 20px; line-height: 1.6;">
      An attempted voucher delivery was <strong>AUTOMATICALLY BLOCKED</strong> because the voucher type did not match the purchased product. The wrong voucher was NOT delivered to the customer.
    </p>
    <div style="background-color: #1a1a1a; border: 2px solid #ef4444; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Order ID:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${order.orderNo}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Customer:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #FF005C; padding-bottom: 6px;">${customerEmail}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Expected Product:</td>
          <td align="right" style="font-size: 13px; font-weight: 800; color: #34d399; padding-bottom: 6px;">${expectedItem?.productName || ''} (${expectedType})</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Attempted Voucher Type:</td>
          <td align="right" style="font-size: 13px; font-weight: 800; color: #ef4444; padding-bottom: 6px;">${attemptedType} (${attemptedVoucher?.code || '—'})</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Action Taken:</td>
          <td align="right" style="font-size: 13px; font-weight: 800; color: #fbbf24; padding-bottom: 6px;">DELIVERY CANCELLED & BLOCKED</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${clientUrl}/admin" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px;">
        Review Voucher Inventory in Admin →
      </a>
    </div>
  `;

  return sendEmail({
    to: config.business.adminNotificationEmail,
    subject,
    html: htmlWrap(subject, bodyHtml),
  });
};

export const sendPasswordReset = (user, token) => {
  const clientUrl = config.clientUrl || 'http://localhost:5173';
  const url = `${clientUrl}/reset-password?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: `Reset your ${config.business.name} password`,
    html: htmlWrap(
      'Reset your password',
      `
      <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff;">Reset your password</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #cccccc; margin: 0 0 24px 0;">
        We received a request to reset your password. Click the button below to choose a new password. This link is valid for 60 minutes.
      </p>
      <div style="text-align: center;">
        <a href="${url}" style="display: inline-block; background-color: #FF005C; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px;">
          Reset Password Now
        </a>
      </div>
      <p style="color: #666666; font-size: 12px; margin-top: 24px;">If you didn't request a password reset, please ignore this message.</p>
      `
    ),
  });
};

/**
 * Customer Confirmation: PTE Booking Assistance Request Received
 */
export const sendPTEBookingConfirmationToCustomer = (booking) => {
  const subject = 'PTE Booking Assistance Request Received';
  const dateStr = booking.preferredDate
    ? new Date(booking.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Flexible';

  const bodyHtml = `
    <h2 style="font-size: 22px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff;">Hi ${booking.fullName},</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #cccccc; margin: 0 0 24px 0;">
      Thank you for requesting PTE booking assistance from ${config.business.name}. We've received your request and our team will contact you shortly using the details you provided to help you book your exam slot.
    </p>

    <div style="background-color: #1a1a1a; border: 1px solid #292929; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Request ID:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${booking.requestId}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Exam Type:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${booking.examType}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Preferred City:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #cccccc; padding-bottom: 6px;">${booking.preferredCity}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Preferred Date:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #cccccc; padding-bottom: 6px;">${dateStr}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Status:</td>
          <td align="right" style="font-size: 13px; font-weight: 800; color: #f5c045; padding-bottom: 6px;">${booking.status}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #261f0a; border: 1px solid #7c5e10; border-radius: 14px; padding: 16px; font-size: 13px; color: #f5c045; text-align: center;">
      This is a booking assistance request, not a guarantee of an exam slot. Our team will confirm actual availability directly with you.
    </div>
  `;

  return sendEmail({
    to: booking.email,
    subject: `PTE Booking Assistance Request Received — ${booking.requestId}`,
    html: htmlWrap(`PTE Booking Request ${booking.requestId}`, bodyHtml),
  });
};

/**
 * Customer Notification: Status Changed for PTE Booking Request
 */
export const sendPTEBookingStatusUpdateToCustomer = (booking, newStatus, note = '', confirmationDetails = null) => {
  const subject = `PTE Booking Status Update: ${newStatus} — ${booking.requestId}`;
  const dateStr = booking.preferredDate
    ? new Date(booking.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Flexible';

  let statusColor = '#38bdf8';
  if (newStatus === 'Booking Confirmed' || newStatus === 'Completed') statusColor = '#10b981';
  if (newStatus === 'Cancelled' || newStatus === 'Rejected') statusColor = '#ef4444';
  if (newStatus === 'Waiting for Customer') statusColor = '#f59e0b';

  let confirmationBlock = '';
  if (newStatus === 'Booking Confirmed' && confirmationDetails && (confirmationDetails.bookingReference || confirmationDetails.confirmedCentre)) {
    confirmationBlock = `
      <div style="background-color: #062419; border: 1px solid #059669; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 12px 0; color: #34d399; font-size: 16px; font-weight: 800;">OFFICIAL APPOINTMENT CONFIRMATION DETAILS</h3>
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          ${confirmationDetails.bookingReference ? `<tr><td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Booking Reference:</td><td align="right" style="font-size: 13px; font-weight: 800; color: #ffffff; padding-bottom: 6px;">${confirmationDetails.bookingReference}</td></tr>` : ''}
          ${confirmationDetails.confirmedCentre ? `<tr><td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Test Centre:</td><td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${confirmationDetails.confirmedCentre}</td></tr>` : ''}
          ${confirmationDetails.confirmedCity ? `<tr><td style="font-size: 13px; color: #999999; padding-bottom: 6px;">City:</td><td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${confirmationDetails.confirmedCity}</td></tr>` : ''}
          ${confirmationDetails.confirmedDate ? `<tr><td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Confirmed Date:</td><td align="right" style="font-size: 13px; font-weight: 700; color: #34d399; padding-bottom: 6px;">${new Date(confirmationDetails.confirmedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>` : ''}
          ${confirmationDetails.confirmedTime ? `<tr><td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Confirmed Time:</td><td align="right" style="font-size: 13px; font-weight: 700; color: #34d399; padding-bottom: 6px;">${confirmationDetails.confirmedTime}</td></tr>` : ''}
          ${confirmationDetails.importantInstructions ? `<tr><td colspan="2" style="font-size: 12px; color: #cccccc; padding-top: 10px; border-top: 1px solid #065f46;"><strong>Instructions:</strong> ${confirmationDetails.importantInstructions}</td></tr>` : ''}
        </table>
      </div>
    `;
  }

  const bodyHtml = `
    <h2 style="font-size: 22px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff;">Hi ${booking.fullName},</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #cccccc; margin: 0 0 20px 0;">
      Your PTE exam booking assistance request has been updated to: <strong style="color: ${statusColor};">${newStatus}</strong>.
    </p>

    ${confirmationBlock}

    <div style="background-color: #1a1a1a; border: 1px solid #292929; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Request ID:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${booking.requestId}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Exam Type:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${booking.examType}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Preferred City:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #cccccc; padding-bottom: 6px;">${booking.preferredCity}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Status:</td>
          <td align="right" style="font-size: 13px; font-weight: 800; color: ${statusColor}; padding-bottom: 6px;">${newStatus}</td>
        </tr>
      </table>
    </div>

    ${note ? `<div style="background-color: #141414; border-left: 4px solid ${statusColor}; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; font-size: 13px; color: #dddddd;"><strong>Update Note:</strong> ${note}</div>` : ''}

    <p style="font-size: 13px; color: #888888; line-height: 1.5;">
      If you have questions or need to make adjustments to your preferences, reply directly to this email or contact Apex Vouchers support.
    </p>
  `;

  return sendEmail({
    to: booking.email,
    subject,
    html: htmlWrap(subject, bodyHtml),
  });
};

/**
 * Internal Admin Notification: New PTE Booking Assistance Request
 */
export const sendPTEBookingAdminNotification = (booking) => {
  const clientUrl = config.clientUrl || 'http://localhost:5173';
  const subject = `New PTE Booking Assistance Request — ${booking.requestId}`;
  const dateStr = booking.preferredDate
    ? new Date(booking.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Flexible';

  const bodyHtml = `
    <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff;">NEW PTE BOOKING ASSISTANCE REQUEST</h2>
    <div style="background-color: #1a1a1a; border: 1px solid #292929; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Customer:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${booking.fullName}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Email:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #FF005C; padding-bottom: 6px;">${booking.email}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Phone:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #cccccc; padding-bottom: 6px;">${booking.phone}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Exam Type:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${booking.examType}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Preferred City:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${booking.preferredCity}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Preferred Date:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #cccccc; padding-bottom: 6px;">${dateStr}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Preferred Time:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #cccccc; padding-bottom: 6px;">${booking.preferredTime || 'Any Time'}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Request ID:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${booking.requestId}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${clientUrl}/admin" style="display: inline-block; background-color: #FF005C; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px;">
        Open Request in Admin Panel →
      </a>
    </div>
  `;

  return sendEmail({
    to: config.business.adminNotificationEmail,
    subject,
    html: htmlWrap(subject, bodyHtml),
  });
};

/* ══════════════════════════════════════════════════════════════════════════
 * VOUCHER REQUEST FLOW — customer requested a voucher that had zero available
 * codes. All of these are best-effort: the caller fires them without awaiting
 * and logs any failure. They never throw.
 * ══════════════════════════════════════════════════════════════════════════ */

const voucherRequestRow = (label, value, color = '#ffffff') => `
  <tr>
    <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">${label}</td>
    <td align="right" style="font-size: 13px; font-weight: 700; color: ${color}; padding-bottom: 6px;">${value}</td>
  </tr>`;

/** Customer confirmation — "we received your voucher request". */
export const sendVoucherRequestConfirmationToCustomer = (request) => {
  const subject = `Voucher Request Received — ${request.requestId}`;
  const bodyHtml = `
    <h2 style="font-size: 22px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff;">Hi ${request.customerName},</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #cccccc; margin: 0 0 8px 0;">
      <strong style="color:#ffffff;">Voucher Currently Unavailable.</strong> This voucher is temporarily out of stock, but our team has received your request and is sourcing it now.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #f5c045; margin: 0 0 24px 0;">
      You will receive your voucher within <strong>1–2 hours</strong> after your request is processed.
    </p>

    <div style="background-color: #1a1a1a; border: 1px solid #292929; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        ${voucherRequestRow('Request ID', request.requestId)}
        ${voucherRequestRow('Voucher', request.productName)}
        ${voucherRequestRow('Voucher Type', request.voucherType || 'EXAM', '#cccccc')}
        ${voucherRequestRow('Status', 'Pending', '#f5c045')}
        ${voucherRequestRow('Requested On', new Date(request.createdAt || Date.now()).toLocaleString('en-IN'), '#cccccc')}
      </table>
    </div>

    <div style="background-color: #261f0a; border: 1px solid #7c5e10; border-radius: 14px; padding: 16px; font-size: 13px; color: #f5c045; text-align: center;">
      We'll email you again as soon as your voucher is ready to purchase and deliver.
    </div>
  `;
  return sendEmail({
    to: request.customerEmail,
    tag: 'voucher-request-received',
    subject,
    html: htmlWrap(subject, bodyHtml),
  });
};

/** Internal admin notification — a customer requested an out-of-stock voucher. */
export const sendVoucherRequestAdminNotification = (request) => {
  const clientUrl = config.clientUrl || 'http://localhost:5173';
  const subject = `🎟️ New Voucher Request — ${request.productName} (${request.requestId})`;
  const bodyHtml = `
    <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 6px 0; color: #ffffff;">New Voucher Request</h2>
    <p style="font-size: 13px; color: #f5c045; margin: 0 0 16px 0;">
      A customer requested a voucher that currently has <strong>no available inventory</strong>. Source a code, add it to stock, then mark the request ready for payment.
    </p>
    <div style="background-color: #1a1a1a; border: 1px solid #292929; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        ${voucherRequestRow('Customer', request.customerName)}
        ${voucherRequestRow('Email', request.customerEmail, '#FF005C')}
        ${voucherRequestRow('Voucher', request.productName)}
        ${voucherRequestRow('Voucher Type', request.voucherType || 'EXAM', '#cccccc')}
        ${voucherRequestRow('Category', request.category || '—', '#cccccc')}
        ${voucherRequestRow('Request ID', request.requestId)}
        ${voucherRequestRow('Requested On', new Date(request.createdAt || Date.now()).toLocaleString('en-IN'), '#cccccc')}
      </table>
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${clientUrl}/admin" style="display: inline-block; background-color: #FF005C; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px;">
        Open Voucher Requests →
      </a>
    </div>
  `;
  return sendEmail({
    to: config.business.adminNotificationEmail,
    tag: 'voucher-request-admin',
    subject,
    html: htmlWrap(subject, bodyHtml),
  });
};

/** Customer — the voucher has been sourced and is ready to buy. */
export const sendVoucherRequestReadyForPaymentToCustomer = (request) => {
  const clientUrl = config.clientUrl || 'http://localhost:5173';
  const subject = `Your Requested Voucher Is Ready to Purchase — ${request.productName}`;
  const priceLine = request.priceSnapshot
    ? `₹${Number(request.priceSnapshot).toLocaleString('en-IN')}`
    : 'shown at checkout';
  const bodyHtml = `
    <h2 style="font-size: 22px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff;">Hi ${request.customerName},</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #cccccc; margin: 0 0 20px 0;">
      Good news — we've sourced the <strong style="color:#ffffff;">${request.productName}</strong> voucher you requested. You can now complete your purchase and it will be delivered to your account instantly after payment.
    </p>

    <div style="background-color: #1a1a1a; border: 1px solid #292929; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        ${voucherRequestRow('Request ID', request.requestId)}
        ${voucherRequestRow('Voucher', request.productName)}
        ${voucherRequestRow('Price', priceLine, '#FF005C')}
        ${voucherRequestRow('Status', 'Ready for payment', '#34d399')}
      </table>
    </div>

    <div style="text-align: center; margin-top: 28px;">
      <a href="${clientUrl}/account?tab=voucher-requests" style="display: inline-block; background-color: #FF005C; color: #ffffff; font-weight: 900; font-size: 15px; text-decoration: none; padding: 16px 36px; border-radius: 14px;">
        Complete Your Purchase →
      </a>
    </div>
  `;
  return sendEmail({
    to: request.customerEmail,
    tag: 'voucher-request-ready',
    subject,
    html: htmlWrap(subject, bodyHtml),
  });
};

/** Customer — payment captured, requested voucher delivered. */
export const sendVoucherRequestFulfilledToCustomer = (request, voucher = null) => {
  const clientUrl = config.clientUrl || 'http://localhost:5173';
  const subject = `🎉 Your Requested ${request.productName} Voucher Is Ready`;
  const codeBlock = voucher?.code
    ? `
      <div style="background-color: #240514; border: 2px dashed #FF005C; border-radius: 16px; padding: 20px; margin: 16px 0;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #FF005C; margin-bottom: 8px;">${request.productName}</div>
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #ffffff; margin-bottom: 10px; word-break: break-all;">${voucher.code}</div>
        ${voucher.expiryDate ? `<div style="font-size: 12px; color: #aaaaaa;">Valid Until: <strong style="color:#ffffff;">${new Date(voucher.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>` : ''}
      </div>`
    : `<div style="background-color: #261f0a; border: 1px solid #7c5e10; border-radius: 14px; padding: 16px; margin: 16px 0; font-size: 13px; color: #f5c045; text-align: center;">Your voucher code is now available in your Apex account.</div>`;
  const bodyHtml = `
    <h2 style="font-size: 22px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff;">Hi ${request.customerName},</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #dddddd; margin: 0 0 8px 0;">
      Your payment is confirmed and the voucher you requested has been delivered to your account. A full purchase confirmation with redemption steps is on its way in a separate email.
    </p>
    ${codeBlock}
    <div style="background-color: #1a1a1a; border: 1px solid #292929; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        ${voucherRequestRow('Request ID', request.requestId)}
        ${voucherRequestRow('Status', 'Fulfilled', '#34d399')}
        ${request.paymentReference ? voucherRequestRow('Payment Reference', request.paymentReference, '#cccccc') : ''}
      </table>
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${clientUrl}/account" style="display: inline-block; background-color: #FF005C; color: #ffffff; font-weight: 900; font-size: 15px; text-decoration: none; padding: 16px 36px; border-radius: 14px;">
        View My Voucher →
      </a>
    </div>
  `;
  return sendEmail({
    to: request.customerEmail,
    tag: 'voucher-request-fulfilled',
    subject,
    html: htmlWrap(subject, bodyHtml),
  });
};

/** Customer — request was closed without fulfilment. */
export const sendVoucherRequestCancelledToCustomer = (request, reason = '') => {
  const subject = `Update on Your Voucher Request — ${request.requestId}`;
  const bodyHtml = `
    <h2 style="font-size: 22px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff;">Hi ${request.customerName},</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #cccccc; margin: 0 0 20px 0;">
      We're sorry — your request for the <strong style="color:#ffffff;">${request.productName}</strong> voucher (${request.requestId}) has been cancelled${reason ? ` for the following reason: ${reason}` : ''}. If you have any questions, just reply to this email and our team will help.
    </p>
  `;
  return sendEmail({
    to: request.customerEmail,
    tag: 'voucher-request-cancelled',
    subject,
    html: htmlWrap(subject, bodyHtml),
  });
};

const OTP_EXPIRY_MINUTES = 10;

/**
 * Light, mostly-text HTML for verification emails. Deliverability matters far
 * more than branding here: a plain white template with a real text/plain part
 * (added by sendEmail) is far less likely to be spam-filtered or greylisted by
 * corporate / university mail servers than the dark marketing template.
 */
const otpEmail = ({ heading, intro, otp, closing }) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;">
        <tr><td style="padding:28px 32px 8px;font-size:16px;font-weight:700;color:#18181b;">${config.business.name}</td></tr>
        <tr><td style="padding:0 32px 24px;">
          <h1 style="font-size:18px;font-weight:700;margin:12px 0 8px;color:#18181b;">${heading}</h1>
          <p style="font-size:14px;line-height:1.6;color:#3f3f46;margin:0 0 20px;">${intro}</p>
          <p style="font-size:13px;color:#71717a;margin:0 0 6px;">Your verification code is:</p>
          <div style="font-size:30px;font-weight:700;letter-spacing:6px;color:#18181b;font-family:'Courier New',monospace;margin:0 0 16px;">${otp}</div>
          <p style="font-size:13px;color:#71717a;margin:0 0 4px;">This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
          <p style="font-size:13px;color:#71717a;margin:0;">${closing}</p>
        </td></tr>
        <tr><td style="padding:16px 32px 28px;border-top:1px solid #e4e4e7;font-size:12px;color:#a1a1aa;">
          Need help? Contact ${config.business.supportEmail}<br>© ${new Date().getFullYear()} ${config.business.name}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

/**
 * Registration email verification — 6-digit OTP sent to the address the user
 * just registered with. Returns the sendEmail result { sent, error, ... } — the
 * caller MUST check `.sent` before telling the user the code was sent.
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
      intro: `Hello${user.name ? ' ' + String(user.name).split(' ')[0] : ''}, enter this code to finish creating your ${config.business.name} account.`,
      otp,
      closing: `If you did not request an ${config.business.name} account, you can ignore this email.`,
    }),
  });
};

/**
 * Change-email OTP — 6-digit code sent to the NEW address before the swap is applied.
 */
export const sendEmailOtpCode = (user, newEmail, otp) => {
  const text =
    `Hello,\n\nYou requested to change your ${config.business.name} account email to ${newEmail}.\n\n` +
    `Your verification code is:\n\n${otp}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.\n\n` +
    `If you did not request this change, ignore this email — your current email stays unchanged.`;
  return sendEmail({
    to: newEmail,
    tag: 'otp-change-email',
    subject: `Verify your new email — ${config.business.name}`,
    text,
    html: otpEmail({
      heading: 'Verify your new email address',
      intro: `You requested to change your ${config.business.name} account email to <strong>${newEmail}</strong>. Enter this code to confirm.`,
      otp,
      closing: 'If you did not request this change, ignore this email — your current email stays unchanged.',
    }),
  });
};

/**
 * Best-effort security notice sent to the OLD email address after a successful email change.
 */
export const sendEmailChangedSecurityNotice = (user, oldEmail, newEmail) => {
  return sendEmail({
    to: oldEmail,
    subject: `Your ${config.business.name} account email was changed`,
    html: htmlWrap(
      'Email address changed',
      `
      <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff;">Your account email was changed</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #cccccc; margin: 0 0 8px 0;">
        Hi ${user.name || 'there'}, this is a confirmation that your ${config.business.name} account email was changed to <strong style="color: #ffffff;">${newEmail}</strong>.
      </p>
      <p style="color: #666666; font-size: 12px; margin-top: 24px;">If you didn't make this change, please contact our support team immediately.</p>
      `
    ),
  });
};

