import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongodbUri:
    process.env.MONGODB_URI ||
    'mongodb+srv://sharvandev28_db_user:Fjq9DDde0TfrkZME@apexcluster.adxjwp2.mongodb.net/apex_vouchers?retryWrites=true&w=majority&appName=apexcluster',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me-in-production-super-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  otpSecret: process.env.OTP_SECRET || `otp:${process.env.JWT_SECRET || 'dev-only-change-me-in-production-super-secret'}`,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  serverUrl: process.env.SERVER_URL || process.env.API_URL || 'http://localhost:5000',

  business: {
    name: process.env.BUSINESS_NAME || 'Apex Vouchers',
    email: process.env.BUSINESS_EMAIL || 'apexvouchers@gmail.com',
    supportEmail: process.env.SUPPORT_EMAIL || 'apexvouchers@gmail.com',
    supportPhone: process.env.SUPPORT_PHONE || '+91 9855926113',
    adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'apexvouchers@gmail.com',
    website: process.env.BUSINESS_WEBSITE || 'https://apexvouchers.com',
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'apexvouchers@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    name: process.env.ADMIN_NAME || 'System Admin',
  },

  // Which provider the checkout flow uses. Only "razorpay" is implemented.
  paymentProvider: (process.env.PAYMENT_PROVIDER || 'razorpay').toLowerCase(),

  razorpay: {
    // Publishable — safe to send to the browser.
    keyId: process.env.RAZORPAY_KEY_ID || '',
    // SECRET — server only. Never sent to the client, never logged.
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    // Separate secret configured in the Razorpay dashboard for webhook signing.
    // Falls back to keySecret only so a mis-config fails closed, not open.
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '',
    env: (process.env.RAZORPAY_ENV || 'test').toLowerCase(),
    apiBase: 'https://api.razorpay.com/v1',
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || '',
    secure: process.env.SMTP_SECURE === 'true',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'nbcbpuql',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || '',
  },

  // Canonical/absolute base URL for SEO (sitemap, canonical tags, structured data).
  siteUrl: process.env.SEO_SITE_URL || '',
};

