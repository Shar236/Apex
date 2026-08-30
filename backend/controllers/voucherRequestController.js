import { AppError } from '../middleware/errorHandler.js';
import { listMyVoucherRequests } from '../services/voucherRequestService.js';

/**
 * POST /api/voucher-requests   — RETIRED.
 *
 * The storefront no longer has a pre-payment "Request Voucher" path. Every
 * voucher is bought with the normal "Buy Now" → Razorpay flow; when inventory
 * is empty the *paid* order is turned into a post-payment FulfillmentRequest
 * automatically (see paymentController.fulfillVerifiedOrder). This endpoint is
 * kept only to return a clear error to any stale client.
 */
export const submitVoucherRequest = async (_req, _res, next) => {
  next(new AppError('This request flow has been replaced — please buy the voucher directly.', 410, 'VOUCHER_REQUEST_RETIRED'));
};

/**
 * GET /api/voucher-requests/mine   (auth required)
 * The authenticated customer's own voucher requests.
 */
export const myVoucherRequests = async (req, res, next) => {
  try {
    const rows = await listMyVoucherRequests(req.user.id);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};
