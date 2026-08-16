import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

let transporter = null;

const getTransport = () => {
  if (transporter) return transporter;
  if (!config.smtp.host) {
    console.warn('[email] SMTP not configured. Emails will be logged instead.');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: +config.smtp.port,
    secure: config.smtp.secure || +config.smtp.port === 465,
    auth: config.smtp.user
      ? { user: config.smtp.user, pass: config.smtp.password }
      : undefined,
  });
  return transporter;
};

export const sendEmail = async ({ to, subject, html, text = '' }) => {
  const transport = getTransport();
  const mail = {
    from: config.smtp.from,
    to,
    subject,
    html,
    text,
  };
  if (!transport) {
    console.log('[email:dev-send]', JSON.stringify({ to, subject }));
    return { sent: false, stub: true, mail };
  }
  try {
    const info = await transport.sendMail(mail);
    return { sent: true, info };
  } catch (err) {
    console.error('[email] failed:', err.message);
    return { sent: false, error: err.message };
  }
};

const htmlWrap = (title, body) => `
<!DOCTYPE html>
<html lang="en"><body style="font-family:system-ui,sans-serif;color:#111;max-width:620px;margin:0 auto;padding:24px">
  <div style="background:#7B4CF0;color:#fff;padding:18px 22px;border-radius:14px;margin-bottom:18px">
    <h1 style="margin:0;font-size:22px;letter-spacing:0.5px">APEX <span style="color:#E63946">●</span> VOUCHERS</h1>
  </div>
  <h2 style="color:#111;margin-top:0">${title}</h2>
  ${body}
  <p style="color:#777;font-size:12px;margin-top:28px">© Apex Vouchers. Reach top scores, skip the extra fee.</p>
</body></html>`;

export const sendRegistrationWelcome = (user) =>
  sendEmail({
    to: user.email,
    subject: 'Welcome to Apex Vouchers — your dashboard is ready',
    html: htmlWrap(
      `Hi ${user.name}, welcome aboard!`,
      `<p>Thanks for signing up with Apex Vouchers. You can now log in, browse discounted exam vouchers, and manage all your codes in one place.</p>
       <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" style="display:inline-block;background:#E63946;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none">Go to My Dashboard</a>`
    ),
  });

export const sendOrderConfirmation = (user, order, vouchers) => {
  const rows = order.items
    .map(
      (it) =>
        `<tr><td>${it.productName}</td><td style="text-align:right">${it.quantity}</td><td style="text-align:right">₹${it.unitPrice}</td></tr>`
    )
    .join('');
  const codes = vouchers?.length
    ? `<h3 style="margin-top:24px">Your Voucher Codes</h3>
       <table style="border-collapse:collapse;width:100%"><thead><tr><th style="text-align:left;border-bottom:1px solid #eee;padding:8px">Product</th><th style="text-align:left;border-bottom:1px solid #eee;padding:8px">Code</th><th style="text-align:left;border-bottom:1px solid #eee;padding:8px">Expires</th></tr></thead>
       <tbody>${vouchers
         .map(
           (v) =>
             `<tr><td style="padding:8px">${v.productName}</td><td style="padding:8px;font-family:monospace;background:#F3EEFF">${v.code}</td><td style="padding:8px">${v.expiryDate.toISOString().slice(0, 10)}</td></tr>`
         )
         .join('')}</tbody></table>`
    : '';
  return sendEmail({
    to: user.email,
    subject: `Order #${order.orderNo} confirmed — your Apex voucher codes`,
    html: htmlWrap(
      `Order #${order.orderNo} confirmed 🎉`,
      `<p>Payment received successfully. Your voucher codes are now available in your dashboard:</p>
       <table style="width:100%;border-collapse:collapse;font-size:14px">
         <thead><tr><th style="text-align:left;border-bottom:1px solid #eee;padding:6px">Item</th><th style="text-align:right;border-bottom:1px solid #eee;padding:6px">Qty</th><th style="text-align:right;border-bottom:1px solid #eee;padding:6px">Price</th></tr></thead>
         <tbody>${rows}</tbody>
         <tfoot><tr><td colspan="2" style="padding:6px;text-align:right;font-weight:700">Total Paid</td><td style="padding:6px;text-align:right;font-weight:700">₹${order.total}</td></tr></tfoot>
       </table>
       ${codes}`
    ),
  });
};

export const sendPasswordReset = (user, token) => {
  const url = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Reset your Apex Vouchers password',
    html: htmlWrap(
      'Reset your password',
      `<p>Click the link below to create a new password. This link is valid for 60 minutes.</p>
       <a href="${url}" style="display:inline-block;background:#E63946;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none">Reset Password</a>
       <p style="color:#888;font-size:12px">If you didn't request this, please ignore this email.</p>`
    ),
  });
};
