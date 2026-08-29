import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { seedAdmin } from './controllers/adminController.js';
import { getSitemapXML, getRobotsTxt, getPublicSEOData, ensureDefaultPages } from './controllers/seoController.js';
import { ensureVoucherSchemaConsistency } from './scripts/ensureVoucherSchema.js';
import { Redirect } from './models/index.js';
import { startBlogScheduler } from './services/blogScheduler.js';
import { migrateBlogPosts } from './scripts/migrateBlogPosts.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
import pteBookingRoutes from './routes/pteBookingRoutes.js';
import awardRoutes from './routes/awardRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import publicBlogRoutes from './routes/publicBlogRoutes.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = new Set(
  [config.clientUrl, ...(process.env.CORS_EXTRA_ORIGINS || '').split(',')]
    .map((o) => o && o.trim().replace(/\/$/, ''))
    .filter(Boolean)
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Non-browser clients (curl, server-to-server, health checks) send no Origin.
      if (!origin) return callback(null, true);
      const o = origin.replace(/\/$/, '');
      if (allowedOrigins.has(o) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)) {
        return callback(null, true);
      }
      console.warn(`[cors] blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
  })
);
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'public/uploads'), {
    setHeaders: (res) => {
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  })
);

app.use(
  express.json({
    limit: '50mb',
    verify: (req, _res, buffer) => {
      // Capture the exact bytes for endpoints whose signature is computed over
      // the raw request body (payment gateway webhooks).
      if (req.path === '/api/payments/webhook') {
        req.rawBody = buffer.toString('utf8');
      }
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('tiny'));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});
app.use('/api/auth', authLimiter);

const accountSensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/account/email/send-otp', accountSensitiveLimiter);
app.use('/api/account/email/verify-otp', accountSensitiveLimiter);
app.use('/api/account/phone', accountSensitiveLimiter);
app.use('/api/account/password/change', accountSensitiveLimiter);

const registerOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/auth/register/verify-otp', registerOtpLimiter);
app.use('/api/auth/register/resend-otp', registerOtpLimiter);

const avatarUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  message: { success: false, message: 'Too many upload attempts. Please try again later.' },
});
app.use('/api/account/profile/avatar', avatarUploadLimiter);

const pteBookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  message: { success: false, message: 'Too many booking assistance requests. Please try again later.' },
});
app.use('/api/pte-bookings', pteBookingLimiter);
app.use('/api/pte-booking-requests', pteBookingLimiter);

app.get('/sitemap.xml', getSitemapXML);
app.get('/robots.txt', getRobotsTxt);

app.use(async (req, res, next) => {
  try {
    const path = req.path.toLowerCase();
    if (path.startsWith('/api/') || path === '/sitemap.xml' || path === '/robots.txt') {
      return next();
    }
    const redirect = await Redirect.findOne({ sourcePath: path, enabled: true }).lean();
    if (redirect) {
      await Redirect.findByIdAndUpdate(redirect._id, { $inc: { hits: 1 }, $set: { lastHitAt: new Date() } }).catch(() => {});
      return res.redirect(redirect.type || 301, redirect.targetPath);
    }
    next();
  } catch {
    next();
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/seo/public', getPublicSEOData);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/reels', videoRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/pte-bookings', pteBookingRoutes);
app.use('/api/pte-booking-requests', pteBookingRoutes);
app.use('/api/awards', awardRoutes);
app.use('/api/admin/blogs', blogRoutes);
app.use('/api/blog', publicBlogRoutes);


app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

export const startServer = async () => {
  await connectDB();
  await seedAdmin();
  await ensureDefaultPages();
  await ensureVoucherSchemaConsistency();
  await migrateBlogPosts();
  startBlogScheduler();
  const port = config.port;
  app.listen(port, () => {
    console.log(`[server] Apex Vouchers API listening on http://localhost:${port}`);
  });
  return app;
};

export default app;
