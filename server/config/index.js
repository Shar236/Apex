import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongodbUri:
    process.env.MONGODB_URI ||
    'mongodb+srv://sharvandev28_db_user:Fjq9DDde0TfrkZME@apexcluster.adxjwp2.mongodb.net/apex_vouchers?retryWrites=true&w=majority&appName=apexcluster',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me-in-production-super-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@apexvouchers.in',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    name: process.env.ADMIN_NAME || 'System Admin',
  },

  payment: {
    key: process.env.PAYMENT_KEY || '',
    secret: process.env.PAYMENT_SECRET || '',
    provider: process.env.PAYMENT_PROVIDER || 'razorpay',
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || '"Apex Vouchers" <no-reply@apexvouchers.in>',
    secure: process.env.SMTP_SECURE === 'true',
  },
};
