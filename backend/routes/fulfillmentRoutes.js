import { Router } from 'express';
import {
  adminListFulfillments,
  adminDeliverFulfillment,
  adminCancelFulfillment,
  adminResendFulfillmentEmail,
  adminUpdateFulfillmentNotes,
} from '../controllers/fulfillmentController.js';
import { protectAdmin } from '../middleware/auth.js';

const r = Router();

r.use(protectAdmin);

r.get('/', adminListFulfillments);
r.post('/:id/deliver', adminDeliverFulfillment);
r.post('/:id/cancel', adminCancelFulfillment);
r.post('/:id/resend-email', adminResendFulfillmentEmail);
r.patch('/:id/notes', adminUpdateFulfillmentNotes);

export default r;
