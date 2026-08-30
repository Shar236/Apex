import { Router } from 'express';
import {
  getAccount,
  updateProfile,
  uploadProfileImage,
  removeProfileImage,
  sendEmailOtp,
  verifyEmailOtp,
  updatePhone,
  changePassword,
  logout,
  myOrders,
  myVouchers,
  myFulfillments,
  dashboardStats,
  transferVoucher,
  markVoucherUsed,
} from '../controllers/accountController.js';
import { protect } from '../middleware/auth.js';
import { profileImageUpload } from '../middleware/upload.js';
import { validatePromotionEndpoint } from '../services/promotions.js';

const r = Router();

r.use(protect);

r.get('/', getAccount);
r.patch('/profile', updateProfile);
r.post('/profile/avatar', profileImageUpload.single('avatar'), uploadProfileImage);
r.delete('/profile/avatar', removeProfileImage);
r.post('/email/send-otp', sendEmailOtp);
r.post('/email/verify-otp', verifyEmailOtp);
r.patch('/phone', updatePhone);
r.post('/password/change', changePassword);
r.post('/logout', logout);
r.get('/stats', dashboardStats);
r.get('/orders', myOrders);
r.get('/vouchers', myVouchers);
r.get('/fulfillments', myFulfillments);
r.patch('/vouchers/:id/transfer', transferVoucher);
r.patch('/vouchers/:id/used', markVoucherUsed);
r.post('/validate-promo', validatePromotionEndpoint);

export default r;
