import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongodbUri:
    process.env.MONGODB_URI ||
    'mongodb+srv://sharvandev28_db_user:Fjq9DDde0TfrkZME@apexcluster.adxjwp2.mongodb.net/apex_vouchers?retryWrites=true&w=majority&appName=apexcluster',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me-in-production-super-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

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

  payment: {
    key: process.env.PAYMENT_KEY || '',
    secret: process.env.PAYMENT_SECRET || '',
    provider: process.env.PAYMENT_PROVIDER || 'cashfree',
  },

  cashfree: {
    appId: process.env.CASHFREE_APP_ID || '',
    secretKey: process.env.CASHFREE_SECRET_KEY || '',
    env: process.env.CASHFREE_ENV || 'sandbox',
    apiVersion: process.env.CASHFREE_API_VERSION || '2023-08-01',
    baseUrl:
      (process.env.CASHFREE_ENV || 'sandbox') === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg',
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER || 'apexvouchers@gmail.com',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || '"Apex Vouchers" <apexvouchers@gmail.com>',
    secure: process.env.SMTP_SECURE === 'true',
  },
};
