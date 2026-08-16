import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  createOrder,
  getOrder,
  simulatePaymentSuccess,
} from '../controllers/orderController.js';

const r = Router();

r.post('/', protect, createOrder);
r.get('/:id', protect, getOrder);
r.post('/:id/pay', protect, simulatePaymentSuccess);

export default r;
