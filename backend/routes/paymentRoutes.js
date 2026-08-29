import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import {
  getPublicPaymentConfig,
  createPaymentOrder,
  verifyPayment,
  reconcilePayment,
  getPaymentStatus,
  handleRazorpayWebhook,
} from '../controllers/paymentController.js';

const router = Router();

// Tight limits on the money endpoints (per IP). Webhook is excluded — it is
// authenticated by HMAC and Razorpay legitimately retries.
const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  message: { success: false, message: 'Too many payment attempts. Please wait a few minutes and try again.' },
});

// The reconcile endpoint is polled by the success page, so it gets a roomier
// limit than the one-shot order/verify calls.
const reconcileLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  message: { success: false, message: 'Too many status checks. Please wait a moment.' },
});

router.get('/config', getPublicPaymentConfig);
router.post('/order', protect, paymentLimiter, createPaymentOrder);
router.post('/verify', protect, paymentLimiter, verifyPayment);
router.post('/reconcile/:orderId', protect, reconcileLimiter, reconcilePayment);
router.get('/order/:orderId', protect, reconcileLimiter, getPaymentStatus);
router.post('/webhook', handleRazorpayWebhook);

export default router;
