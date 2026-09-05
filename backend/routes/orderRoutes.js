import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getOrder } from '../controllers/orderController.js';

const r = Router();

r.get('/:id', protect, getOrder);

// NOTE: this router is READ-ONLY by design.
// Orders are created only by POST /api/payments/order (which also creates the
// matching Razorpay order), and an order becomes PAID only through a
// cryptographically verified Razorpay payment — POST /api/payments/verify or
// the signed Razorpay webhook.

export default r;
