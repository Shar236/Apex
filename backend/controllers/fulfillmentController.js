import {
  listFulfillmentRequests,
  deliverFulfillmentRequest,
  cancelFulfillmentRequest,
} from '../services/fulfillmentService.js';

export const adminListFulfillments = async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;
    const result = await listFulfillmentRequests({ status, search, page, limit });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const adminDeliverFulfillment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code } = req.body;
    const result = await deliverFulfillmentRequest({ requestId: id, code, admin: req.user });
    res.json({ success: true, data: result.request, delivered: !result.alreadyDelivered });
  } catch (err) {
    next(err);
  }
};

export const adminCancelFulfillment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await cancelFulfillmentRequest({ requestId: id, reason, admin: req.user });
    res.json({ success: true, data: result.request });
  } catch (err) {
    next(err);
  }
};