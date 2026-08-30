import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { createOrder, getOrder } from '../controllers/orderController.js';

const r = Router();

r.post('/', protect, createOrder);
r.get('/:id', protect, getOrder);

// NOTE: there is deliberately NO "mark this order paid" endpoint here.
// The ONLY way an order becomes PAID is a cryptographically verified Razorpay
// payment via POST /api/payments/verify or the signed Razorpay webhook.

export default r;
