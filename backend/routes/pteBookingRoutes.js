import { Router } from 'express';
import { submitPTEBookingRequest, myPTEBookingRequests } from '../controllers/pteBookingController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const r = Router();

r.post('/', optionalAuth, submitPTEBookingRequest);
r.get('/mine', protect, myPTEBookingRequests);

export default r;
