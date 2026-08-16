import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  createCashfreeOrder,
  getCashfreeOrderStatus,
  handleCashfreeWebhook,
} from '../controllers/paymentController.js';

const router = Router();

router.post('/cashfree/create-order', protect, createCashfreeOrder);
router.get('/cashfree/status/:orderId', protect, getCashfreeOrderStatus);
router.post('/cashfree/webhook', handleCashfreeWebhook);

export default router;
