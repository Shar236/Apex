import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

let transporter = null;

const maskEmail = (email) => {
  const value = String(email || '');
  const at = value.indexOf('@');
  if (at <= 1) return value ? '[redacted]' : '[missing]';
  return `${value[0]}***${value.slice(at - 1)}`;
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
  });
  return transporter;
};

export const sendEmail = async ({ to, subject, html, text = '', from = config.smtp.from }) => {
  if (!to) {
    return { sent: false, error: 'Email recipient is missing' };
  }

  const transport = getTransport();
  const mail = {
    from: from || `"${config.business.name}" <${config.business.email}>`,
    to,
    subject,
    html,
    text,
  };
  if (!transport) {
    const error = 'SMTP configuration is incomplete';
    console.error(`[email:failed] provider=smtp recipient=${maskEmail(to)} reason=${error}`);
    return { sent: false, error };
  }
  try {
    const info = await transport.sendMail(mail);
    console.log(
      `[email:sent] provider=smtp recipient=${maskEmail(to)} messageId=${info.messageId || 'unknown'} response=${info.response || 'accepted'}`
    );
    return { sent: true, info };
  } catch (err) {
    console.error(`[email:failed] provider=smtp recipient=${maskEmail(to)} reason=${err.message}`);
    return { sent: false, error: err.message };
  }
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
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const subject = `🎉 Congratulations! Your ${firstProductName} Order is Confirmed (#${order.orderNo})`;

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
        .map(
          (v) => `
      <div style="background-color: #240514; border: 2px dashed #FF005C; border-radius: 16px; padding: 20px; margin-top: 16px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #FF005C; margin-bottom: 6px;">
          ${v.productName || firstProductName}
        </div>
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff; margin-bottom: 10px; word-break: break-all;">
          ${v.code}
        </div>
        <div style="font-size: 12px; color: #aaaaaa;">
          Valid Until: <strong style="color: #ffffff;">${new Date(v.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
        </div>
      </div>`
        )
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
 * Internal Admin New Order Notification Email
 */
export const sendAdminNewOrderNotification = (user, order, vouchers = []) => {
  const clientUrl = config.clientUrl || 'http://localhost:5173';
  const customerName = user.name || order.customerSnapshot?.name || order.billingDetails?.name || 'Customer';
  const customerEmail = user.email || order.customerSnapshot?.email || order.billingDetails?.email || 'N/A';
  const customerPhone = user.phone || order.customerSnapshot?.phone || order.billingDetails?.phone || 'N/A';

  const firstProductName = order.items?.[0]?.productName || 'Exam Voucher';
  const quantity = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 1;

  const subject = `🛒 New Voucher Purchase — Order #${order.orderNo}`;

  const bodyHtml = `
    <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff;">NEW VOUCHER PURCHASE</h2>
    <div style="background-color: #1a1a1a; border: 1px solid #292929; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Customer:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${customerName}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Email:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #FF005C; padding-bottom: 6px;">${customerEmail}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">WhatsApp / Phone:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #cccccc; padding-bottom: 6px;">${customerPhone}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Order ID:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${order.orderNo}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Voucher Product:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${firstProductName}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Quantity:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 6px;">${quantity}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Amount Paid:</td>
          <td align="right" style="font-size: 16px; font-weight: 900; color: #FF005C; padding-bottom: 6px;">₹${order.total?.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Payment Method:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #ffffff; padding-bottom: 6px;">${(order.paymentMethod || 'UPI/Card').toUpperCase()}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Payment Status:</td>
          <td align="right" style="font-size: 13px; font-weight: 800; color: #34d399; padding-bottom: 6px;">PAID</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #999999; padding-bottom: 6px;">Voucher Assignment:</td>
          <td align="right" style="font-size: 13px; font-weight: 800; color: #34d399; padding-bottom: 6px;">ASSIGNED</td>
        </tr>
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

const otpCodeBlock = (otp) => `
  <div style="text-align: center; margin: 28px 0;">
    <span style="display: inline-block; background-color: #1a1a1a; border: 1px solid #292929; border-radius: 14px; padding: 16px 32px; font-size: 32px; font-weight: 900; letter-spacing: 10px; color: #ffffff; font-family: 'Courier New', monospace;">
      ${otp}
    </span>
  </div>
`;

/**
 * Registration email verification — 6-digit OTP sent to the address the user just registered with.
 */
export const sendRegistrationOtp = (user, otp) => {
  return sendEmail({
    to: user.email,
    subject: `Verify your email — ${config.business.name}`,
    html: htmlWrap(
      'Verify your email',
      `
      <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff;">Verify your email address</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #cccccc; margin: 0 0 8px 0;">
        Hi ${user.name || 'there'}, welcome to ${config.business.name}! Enter this code to finish creating your account:
      </p>
      ${otpCodeBlock(otp)}
      <p style="color: #666666; font-size: 12px; text-align: center; margin: 0;">This code expires in 5 minutes.</p>
      <p style="color: #666666; font-size: 12px; margin-top: 24px;">If you didn't create this account, please ignore this email.</p>
      `
    ),
  });
};

/**
 * Change-email OTP — 6-digit code sent to the NEW address before the swap is applied.
 */
export const sendEmailOtpCode = (user, newEmail, otp) => {
  return sendEmail({
    to: newEmail,
    subject: `Verify your new email address — ${config.business.name}`,
    html: htmlWrap(
      'Verify your email',
      `
      <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff;">Verify your new email</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #cccccc; margin: 0 0 8px 0;">
        Hi ${user.name || 'there'},
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #cccccc; margin: 0 0 8px 0;">
        You requested to change your ${config.business.name} account email to <strong style="color: #ffffff;">${newEmail}</strong>. Enter this code to confirm:
      </p>
      ${otpCodeBlock(otp)}
      <p style="color: #666666; font-size: 12px; text-align: center; margin: 0;">This code expires in 5 minutes.</p>
      <p style="color: #666666; font-size: 12px; margin-top: 24px;">If you didn't request this change, please ignore this email. Your current email will remain unchanged.</p>
      `
    ),
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

