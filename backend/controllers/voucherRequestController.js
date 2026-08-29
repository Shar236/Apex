import { AppError } from '../middleware/errorHandler.js';
import {
  createVoucherRequest,
  listMyVoucherRequests,
} from '../services/voucherRequestService.js';

/**
 * POST /api/voucher-requests   (auth required)
 * Customer submits a request for a voucher that has zero available codes.
 */
export const submitVoucherRequest = async (req, res, next) => {
  try {
    const { request, duplicate } = await createVoucherRequest(req.body || {}, req.user);
    res.status(duplicate ? 200 : 201).json({
      success: true,
      duplicate,
      message: duplicate
        ? 'You already have a pending request for this voucher. Our team is processing it and you should receive it within 1–2 hours.'
        : 'Request received. You will receive your voucher within 1–2 hours.',
      data: {
        id: request._id,
        requestId: request.requestId,
        status: request.status,
        productId: request.productId,
        productName: request.productName,
        voucherType: request.voucherType,
        createdAt: request.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
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
