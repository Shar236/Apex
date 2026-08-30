import { Router } from 'express';
import { submitVoucherRequest, myVoucherRequests } from '../controllers/voucherRequestController.js';
import { protect } from '../middleware/auth.js';

const r = Router();

// Both endpoints require an authenticated customer — anonymous voucher requests
// are not supported (there would be no account to deliver the voucher to).
r.post('/', protect, submitVoucherRequest);
r.get('/mine', protect, myVoucherRequests);

export default r;
