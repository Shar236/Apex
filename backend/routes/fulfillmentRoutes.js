import { Router } from 'express';
import {
  adminListFulfillments,
  adminDeliverFulfillment,
  adminCancelFulfillment,
} from '../controllers/fulfillmentController.js';
import { protectAdmin } from '../middleware/auth.js';

const r = Router();

r.use(protectAdmin);

r.get('/', adminListFulfillments);
r.post('/:id/deliver', adminDeliverFulfillment);
r.post('/:id/cancel', adminCancelFulfillment);

export default r;
