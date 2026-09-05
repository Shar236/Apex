import { AppError } from '../middleware/errorHandler.js';
import { config } from '../config/index.js';
import { sendEmail } from '../services/email.js';

const MAX_LENGTHS = {
  name: 120,
  email: 254,
  phone: 40,
  orderId: 100,
  subject: 180,
  category: 80,
  message: 5000,
};

const clean = (value, max) => String(value || '').trim().slice(0, max);
const escapeHtml = (value) => clean(value, 5000).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

export const submitContact = async (req, res, next) => {
  try {
    const body = req.body || {};
    const contact = Object.fromEntries(Object.entries(MAX_LENGTHS).map(([key, max]) => [key, clean(body[key], max)]));

    if (!contact.name || !contact.email || !contact.subject || !contact.message) {
      return next(new AppError('Name, email, subject, and message are required.', 400, 'VALIDATION_ERROR'));
    }
    if (!/^\S+@\S+\.\S+$/.test(contact.email)) {
      return next(new AppError('Please provide a valid email address.', 400, 'VALIDATION_ERROR'));
    }

    const html = `
      <h2>New contact request</h2>
      <p><strong>Name:</strong> ${escapeHtml(contact.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(contact.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(contact.phone || 'Not provided')}</p>
      <p><strong>Order ID:</strong> ${escapeHtml(contact.orderId || 'Not provided')}</p>
      <p><strong>Category:</strong> ${escapeHtml(contact.category || 'General Question')}</p>
      <p><strong>Subject:</strong> ${escapeHtml(contact.subject)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(contact.message).replace(/\n/g, '<br>')}</p>
    `;
    const text = [
      `Name: ${contact.name}`,
      `Email: ${contact.email}`,
      `Phone: ${contact.phone || 'Not provided'}`,
      `Order ID: ${contact.orderId || 'Not provided'}`,
      `Category: ${contact.category || 'General Question'}`,
      `Subject: ${contact.subject}`,
      '',
      contact.message,
    ].join('\n');

    const result = await sendEmail({
      to: config.business.adminNotificationEmail || config.business.supportEmail,
      subject: `[Contact] ${contact.subject}`,
      html,
      text,
      replyTo: contact.email,
      tag: 'contact',
    });

    if (!result.sent) return next(new AppError('Contact email could not be sent. Please try again later.', 503, 'EMAIL_UNAVAILABLE'));
    res.status(201).json({ success: true, message: 'Your message has been sent.' });
  } catch (error) {
    next(error);
  }
};