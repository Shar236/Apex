import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { seedAdmin } from './controllers/adminController.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import videoRoutes from './routes/videoRoutes.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin/proxy)
      if (!origin) return callback(null, true);
      if (
        origin === config.clientUrl ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(null, true); // Permissive in dev to prevent CORS blockage
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});
app.use('/api/auth', authLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

export const startServer = async () => {
  await connectDB();
  await seedAdmin();
  const port = config.port;
  app.listen(port, () => {
    console.log(`[server] Apex Vouchers API listening on http://localhost:${port}`);
  });
  return app;
};

export default app;
