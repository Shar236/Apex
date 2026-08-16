import { Router } from 'express';
import {
  getAccount,
  updateProfile,
  myOrders,
  myVouchers,
  dashboardStats,
  transferVoucher,
  markVoucherUsed,
} from '../controllers/accountController.js';
import { protect } from '../middleware/auth.js';
import { validatePromotionEndpoint } from '../services/promotions.js';

const r = Router();

r.use(protect);

r.get('/', getAccount);
r.patch('/profile', updateProfile);
r.get('/stats', dashboardStats);
r.get('/orders', myOrders);
r.get('/vouchers', myVouchers);
r.patch('/vouchers/:id/transfer', transferVoucher);
r.patch('/vouchers/:id/used', markVoucherUsed);
r.post('/validate-promo', validatePromotionEndpoint);

export default r;
