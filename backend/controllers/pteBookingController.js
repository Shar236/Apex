import { AuditLog, PTE_EXAM_TYPES, PTE_BOOKING_STATUSES } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  createBookingRequest,
  listBookingRequests,
  getBookingRequestById,
  updateBookingRequestStatus,
  listMyBookingRequests,
  getPTEBookingStats,
} from '../services/pteBookingService.js';

const recordAudit = async (req, action, resourceId, details) => {
  try {
    if (req?.user) {
      await AuditLog.create({
        adminId: req.user._id,
        adminEmail: req.user.email,
        action,
        resourceType: 'PTEBookingRequest',
        resourceId: resourceId ? String(resourceId) : null,
        details: details || {},
        ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
      });
    }
  } catch (err) {
    console.error('[audit] log error:', err.message);
  }
};

// ── Public: submit a booking assistance request ─────────────────────────────
export const submitPTEBookingRequest = async (req, res, next) => {
  try {
    const { booking, duplicate } = await createBookingRequest(req.body, req.user?.id || null);
    res.status(duplicate ? 200 : 201).json({
      success: true,
      duplicate,
      data: {
        requestId: booking.requestId,
        status: booking.status,
        examType: booking.examType,
        preferredCity: booking.preferredCity,
        preferredDate: booking.preferredDate,
        preferredTime: booking.preferredTime,
        createdAt: booking.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Customer (logged-in): my own booking requests ───────────────────────────
export const myPTEBookingRequests = async (req, res, next) => {
  try {
    const rows = await listMyBookingRequests(req.user.id);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// ── Admin: list ──────────────────────────────────────────────────────────────
export const listPTEBookingRequestsAdmin = async (req, res, next) => {
  try {
    const [{ rows, total, page, pages }, stats] = await Promise.all([
      listBookingRequests(req.query),
      getPTEBookingStats(),
    ]);
    res.json({ success: true, count: rows.length, total, page, pages, stats, data: rows });
  } catch (err) {
    next(err);
  }
};

// ── Admin: get one ───────────────────────────────────────────────────────────
export const getPTEBookingRequestAdmin = async (req, res, next) => {
  try {
    const booking = await getBookingRequestById(req.params.id);
    if (!booking) return next(new AppError('PTE booking request not found', 404, 'NOT_FOUND'));
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// ── Admin: update status / notes / confirmation details ──────────────────────
export const updatePTEBookingRequestAdmin = async (req, res, next) => {
  try {
    const { status, adminNotes, confirmationDetails } = req.body;
    if (status && !PTE_BOOKING_STATUSES.includes(status)) {
      return next(new AppError('Invalid status value', 400, 'VALIDATION_ERROR'));
    }
    const { booking, oldStatus } = await updateBookingRequestStatus(req.params.id, {
      status,
      adminNotes,
      confirmationDetails,
      adminUser: req.user,
    });

    await recordAudit(req, 'PTE_BOOKING_STATUS_CHANGED', booking._id, {
      requestId: booking.requestId,
      oldStatus,
      newStatus: booking.status,
      confirmationDetails: confirmationDetails ? true : false,
    });

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

export const PTE_EXAM_TYPE_OPTIONS = PTE_EXAM_TYPES;
export const PTE_BOOKING_STATUS_OPTIONS = PTE_BOOKING_STATUSES;
