import { VoucherCode } from '../models/VoucherCode.js';
import { AuditLog } from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';
import { isValidObjectId } from '../config/db.js';

/**
 * Admin voucher-inventory operations — the single place that decides whether a
 * voucher code may be removed from, or re-statused in, inventory.
 *
 * The rule that matters: an order must never lose the voucher it was fulfilled
 * with because an admin tidied up inventory. So codes split into two groups:
 *
 *   REMOVABLE  AVAILABLE / RESERVED / EXPIRED / INVALID / CANCELLED
 *              — pure inventory rows nobody has been given. Hard-deleted.
 *
 *   HISTORICAL SOLD / ASSIGNED / USED
 *              — delivered to a customer and referenced by an order.
 *              Never deleted. The admin can only mark them (EXPIRED / INVALID)
 *              via `setVoucherStatuses`, which keeps the row and its linkage.
 *
 * Deletion is additionally guarded on `orderId: null` in the query itself, so a
 * row whose status was hand-edited but which is still attached to an order
 * survives regardless of what its status field says.
 */

export const REMOVABLE_STATUSES = ['AVAILABLE', 'RESERVED', 'EXPIRED', 'INVALID', 'CANCELLED'];
export const HISTORICAL_STATUSES = ['SOLD', 'ASSIGNED', 'USED'];

/** Statuses an admin may set by hand. Delivery/allocation owns the rest. */
export const ADMIN_SETTABLE_STATUSES = ['AVAILABLE', 'EXPIRED', 'INVALID', 'CANCELLED'];

/** Fields an admin may edit directly. Everything else (code, userId, orderId, soldAt…) is owned by the fulfillment pipeline. */
const EDITABLE_FIELDS = ['expiryDate', 'status'];

const maskCode = (code) => {
  const s = String(code || '');
  if (s.length <= 8) return '****';
  return `${s.slice(0, 4)}-****-${s.slice(-4)}`;
};

/**
 * Canonical admin-facing mask for a voucher code. Dash-aware: a code like
 * ABCDE-FGHJK-LMNPQ-XYZAB keeps its first and last segments and hides the
 * middle ones. Exported so every admin surface (list, order detail, product
 * inventory) masks identically and the raw code never leaves the server
 * outside the audited reveal endpoints.
 */
export const maskVoucherCode = (code) => {
  const s = String(code || '');
  const parts = s.split('-');
  if (parts.length >= 3 && parts.every((p) => p.length > 0)) {
    return `${parts[0]}-****-****-${parts[parts.length - 1]}`;
  }
  return maskCode(s);
};

const normalizeIds = (input) => {
  const raw = Array.isArray(input) ? input : [input];
  const ids = [...new Set(raw.map((v) => String(v || '').trim()).filter(Boolean))];
  if (!ids.length) throw new AppError('No voucher ids provided', 400, 'IDS_REQUIRED');
  if (ids.length > 500) throw new AppError('Maximum 500 vouchers per operation', 400, 'TOO_MANY_IDS');
  const bad = ids.filter((id) => !isValidObjectId(id));
  if (bad.length) throw new AppError('Invalid voucher id in request', 400, 'INVALID_VOUCHER_ID');
  return ids;
};

const writeAudit = (admin, action, details) =>
  AuditLog.create({
    adminId: admin?._id || null,
    adminEmail: admin?.email || 'admin@apexvouchers.in',
    action,
    resourceType: 'VoucherCode',
    resourceId: details?.resourceId || null,
    details,
    ipAddress: admin?.ip || null,
  }).catch((err) => console.error(`[audit] ${action}: ${err.message}`));

/**
 * Preview what a delete would do — used to render an honest confirmation dialog
 * ("25 will be removed, 3 are attached to orders and will be kept").
 */
export const previewVoucherDeletion = async (idsInput) => {
  const ids = normalizeIds(idsInput);
  const vouchers = await VoucherCode.find({ _id: { $in: ids } })
    .select('code status orderId productId voucherType expiryDate')
    .populate('productId', 'name')
    .lean();

  const removable = [];
  const blocked = [];
  for (const v of vouchers) {
    const isHistorical = HISTORICAL_STATUSES.includes(v.status) || !!v.orderId;
    (isHistorical ? blocked : removable).push({
      _id: v._id,
      code: maskCode(v.code),
      status: v.status,
      productName: v.productId?.name || '',
      reason: isHistorical
        ? v.orderId
          ? 'Delivered to a customer — kept for order history'
          : `Status ${v.status} is part of order history`
        : null,
    });
  }

  const missing = ids.length - vouchers.length;
  return { removable, blocked, requested: ids.length, missing: missing > 0 ? missing : 0 };
};

/**
 * Permanently remove inventory rows. Historical (delivered) codes are skipped,
 * never deleted, and reported back so the admin sees exactly what happened.
 */
export const deleteVouchers = async ({ ids: idsInput, admin }) => {
  const ids = normalizeIds(idsInput);

  const vouchers = await VoucherCode.find({ _id: { $in: ids } })
    .select('code status orderId productId voucherType')
    .lean();

  if (!vouchers.length) {
    throw new AppError('Voucher not found', 404, 'VOUCHER_NOT_FOUND');
  }

  const removableIds = [];
  const skipped = [];
  for (const v of vouchers) {
    if (HISTORICAL_STATUSES.includes(v.status) || v.orderId) {
      skipped.push({
        _id: v._id,
        code: maskCode(v.code),
        status: v.status,
        reason: 'Assigned to a customer order — preserved for order history',
      });
    } else {
      removableIds.push(v._id);
    }
  }

  let deletedCount = 0;
  if (removableIds.length) {
    // The status + orderId guard is re-applied in the delete itself, so a code
    // allocated by a concurrent purchase between the read and this write is not
    // removed out from under that order.
    const res = await VoucherCode.deleteMany({
      _id: { $in: removableIds },
      status: { $in: REMOVABLE_STATUSES },
      orderId: null,
    });
    deletedCount = res?.deletedCount || 0;

    if (deletedCount < removableIds.length) {
      skipped.push({
        _id: null,
        code: null,
        status: null,
        reason: `${removableIds.length - deletedCount} code(s) were claimed by an order during deletion and were kept`,
      });
    }
  }

  await writeAudit(admin, 'VOUCHERS_DELETED', {
    resourceId: removableIds.length === 1 ? String(removableIds[0]) : null,
    requested: ids.length,
    deleted: deletedCount,
    skipped: skipped.length,
    codes: vouchers
      .filter((v) => removableIds.some((id) => String(id) === String(v._id)))
      .map((v) => ({ code: maskCode(v.code), status: v.status, voucherType: v.voucherType })),
  });

  return { requested: ids.length, deleted: deletedCount, skipped };
};

/**
 * Mark codes EXPIRED / INVALID / CANCELLED (or return them to AVAILABLE).
 * This is the "soft delete" for a code that must stay on record — and the only
 * way a delivered code can be retired.
 */
export const setVoucherStatuses = async ({ ids: idsInput, status, admin }) => {
  const ids = normalizeIds(idsInput);
  const next = String(status || '').trim().toUpperCase();
  if (!ADMIN_SETTABLE_STATUSES.includes(next)) {
    throw new AppError(
      `Status must be one of ${ADMIN_SETTABLE_STATUSES.join(', ')}`,
      400,
      'INVALID_STATUS'
    );
  }

  const vouchers = await VoucherCode.find({ _id: { $in: ids } }).select('code status orderId').lean();
  if (!vouchers.length) throw new AppError('Voucher not found', 404, 'VOUCHER_NOT_FOUND');

  const skipped = [];
  const targetIds = [];
  for (const v of vouchers) {
    // Returning a delivered code to AVAILABLE would hand a customer's voucher to
    // the next buyer — never allowed. Retiring one (EXPIRED/INVALID) is fine.
    if (next === 'AVAILABLE' && (HISTORICAL_STATUSES.includes(v.status) || v.orderId)) {
      skipped.push({
        _id: v._id,
        code: maskCode(v.code),
        status: v.status,
        reason: 'Already delivered to a customer — cannot be returned to inventory',
      });
      continue;
    }
    targetIds.push(v._id);
  }

  let modified = 0;
  if (targetIds.length) {
    const filter = { _id: { $in: targetIds } };
    // Only free codes may be handed back to inventory.
    if (next === 'AVAILABLE') {
      filter.status = { $nin: HISTORICAL_STATUSES };
      filter.orderId = null;
    }
    const res = await VoucherCode.updateMany(filter, { $set: { status: next } });
    modified = res?.modifiedCount ?? res?.nModified ?? 0;
  }

  await writeAudit(admin, 'VOUCHERS_STATUS_CHANGED', {
    resourceId: targetIds.length === 1 ? String(targetIds[0]) : null,
    status: next,
    requested: ids.length,
    modified,
    skipped: skipped.length,
  });

  return { requested: ids.length, modified, status: next, skipped };
};

/**
 * Field-level edit of a single voucher. Whitelisted — the previous handler
 * passed `req.body` straight into `findByIdAndUpdate`, which allowed an admin to
 * rewrite `code`, `userId` or `orderId` and silently break an order's linkage.
 */
export const updateVoucherFields = async ({ id, patch = {}, admin }) => {
  const [voucherId] = normalizeIds(id);
  const update = {};

  for (const field of EDITABLE_FIELDS) {
    if (patch[field] === undefined) continue;
    if (field === 'status') {
      const next = String(patch.status || '').trim().toUpperCase();
      if (!ADMIN_SETTABLE_STATUSES.includes(next)) {
        throw new AppError(
          `Status must be one of ${ADMIN_SETTABLE_STATUSES.join(', ')}`,
          400,
          'INVALID_STATUS'
        );
      }
      update.status = next;
    } else if (field === 'expiryDate') {
      const d = new Date(patch.expiryDate);
      if (Number.isNaN(d.getTime())) {
        throw new AppError('Invalid expiry date', 400, 'INVALID_EXPIRY_DATE');
      }
      update.expiryDate = d;
    }
  }

  if (!Object.keys(update).length) {
    throw new AppError('No editable fields supplied (expiryDate, status)', 400, 'NOTHING_TO_UPDATE');
  }

  const existing = await VoucherCode.findById(voucherId).select('status orderId code').lean();
  if (!existing) throw new AppError('Voucher not found', 404, 'VOUCHER_NOT_FOUND');
  if (update.status === 'AVAILABLE' && (HISTORICAL_STATUSES.includes(existing.status) || existing.orderId)) {
    throw new AppError(
      'This voucher has been delivered to a customer and cannot be returned to inventory',
      409,
      'VOUCHER_ALREADY_DELIVERED'
    );
  }

  const voucher = await VoucherCode.findByIdAndUpdate(voucherId, { $set: update }, { new: true });

  await writeAudit(admin, 'VOUCHER_UPDATED', {
    resourceId: String(voucherId),
    code: maskCode(voucher.code),
    changed: Object.keys(update),
    status: voucher.status,
    voucherType: voucher.voucherType,
  });

  return voucher;
};
