import { Router } from 'express';
import {
  register,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  login,
  forgotPassword,
  resetPassword,
  me,
  validateRegister,
  validateLogin,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const r = Router();

r.post('/register', validateRegister, register);
r.post('/register/verify-otp', verifyRegistrationOtp);
r.post('/register/resend-otp', resendRegistrationOtp);
r.post('/login', validateLogin, login);
r.post('/forgot-password', forgotPassword);
r.post('/reset-password', resetPassword);
r.get('/me', protect, me);

export default r;
