import fs from 'fs';
import { Award } from '../models/Award.js';
import { AuditLog } from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';
import { escapeRegex } from '../utils/index.js';
import {
  buildDirectVideoUrl,
  buildVideoThumbnailUrl,
  extractPublicId,
  uploadBufferToCloudinary,
  deleteCloudinaryAsset,
  buildOptimizedImageUrl,
} from '../services/cloudinaryService.js';

const searchRegex = (search) => new RegExp(escapeRegex(search), 'i');

/**
 * Normalize an Award document for public consumption.
 */
const formatPublicAward = (a, index = 0) => ({
  _id: a._id,
  id: a._id,
  title: a.title || '',
  slug: a.slug || '',
  description: a.description || '',
  year: a.year || '',
  dateAwarded: a.dateAwarded || null,
  organization: a.organization || '',
  category: a.category || 'Recognition',
  imageUrl: a.imageUrl || '',
  imagePublicId: a.imagePublicId || '',
  imageAlt: a.imageAlt || `Award: ${a.title || ''}`,
  videoUrl: a.videoUrl || '',
  videoPublicId: a.videoPublicId || '',
  videoResourceType: a.videoResourceType || 'video',
  videoThumbnail: a.videoThumbnail || '',
  externalLink: a.externalLink || '',
  featured: !!a.featured,
  displayOrder: a.displayOrder ?? a.order ?? index + 1,
  order: a.order ?? a.displayOrder ?? index + 1,
  status: a.status || (a.isActive !== false && a.published !== false ? 'active' : 'inactive'),
  isActive: a.isActive ?? a.published ?? true,
  published: a.published ?? a.isActive ?? true,
  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
});

/**
 * List Public Awards & Achievements
 * GET /api/awards
 */
export const listPublicAwards = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 12, featured } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(60, Math.max(1, parseInt(limit, 10) || 12));

    const filter = { $or: [{ status: 'active' }, { isActive: true }, { published: true }] };
    if (category) filter.category = category;
    if (featured === 'true' || featured === '1') filter.featured = true;

    const [total, featuredCount, data] = await Promise.all([
      Award.countDocuments(filter),
      Award.countDocuments({ ...filter, featured: true }),
      Award.find(filter)
        .sort({ featured: -1, displayOrder: 1, order: 1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
    ]);

    const formatted = data.map((a, index) => formatPublicAward(a, index));

    res.json({
      success: true,
      count: formatted.length,
      total,
      featuredCount,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / limitNum)),
      hasMore: pageNum * limitNum < total,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Single Public Award
 * GET /api/awards/:id
 */
export const getPublicAward = async (req, res, next) => {
  try {
    const { id } = req.params;
    const award = await Award.findOne({
      _id: id,
      $or: [{ status: 'active' }, { isActive: true }, { published: true }],
    }).lean();
    if (!award) return next(new AppError('Award not found', 404));

    res.json({ success: true, data: formatPublicAward(award) });
  } catch (err) {
    next(err);
  }
};

/**
 * List Awards for admin (with search / filters / KPIs)
 * GET /api/admin/awards
 */
export const listAdminAwards = async (req, res, next) => {
  try {
    const { search, status, category, featured } = req.query;
    const filter = {};

    if (status === 'published' || status === 'active') {
      filter.$or = [{ status: 'active' }, { isActive: true }, { published: true }];
    } else if (status === 'draft' || status === 'inactive') {
      filter.$and = [
        { status: { $ne: 'active' } },
        { isActive: { $ne: true } },
        { published: { $ne: true } },
      ];
    } else if (status === 'featured') {
      filter.featured = true;
    }
    if (featured === 'true' || featured === '1') filter.featured = true;
    if (category) filter.category = category;

    if (search) {
      const s = searchRegex(search);
      const searchConditions = [
        { title: s },
        { description: s },
        { organization: s },
        { year: s },
        { category: s },
        { imagePublicId: s },
        { videoPublicId: s },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    const awards = await Award.find(filter).sort({ displayOrder: 1, order: 1, createdAt: -1 }).lean();
    const allAwards = await Award.find().lean();

    const kpis = allAwards.reduce(
      (acc, a) => {
        acc.totalAwards += 1;
        if (a.status === 'active' || a.isActive || a.published) acc.activeAwards += 1;
        else acc.inactiveAwards += 1;
        if (a.featured) acc.featuredAwards += 1;
        if (a.videoUrl) acc.videoAwards += 1;
        return acc;
      },
      { totalAwards: 0, activeAwards: 0, inactiveAwards: 0, featuredAwards: 0, videoAwards: 0 }
    );

    const formatted = awards.map((a, index) => formatPublicAward(a, index));

    res.json({ success: true, count: formatted.length, kpis, data: formatted });
  } catch (err) {
    next(err);
  }
};
/**
 * Get Single Award for admin
 * GET /api/admin/awards/:id
 */
export const getAdminAward = async (req, res, next) => {
  try {
    const { id } = req.params;
    const award = await Award.findById(id).lean();
    if (!award) return next(new AppError('Award not found', 404));
    res.json({ success: true, data: formatPublicAward(award) });
  } catch (err) {
    next(err);
  }
};

/**
 * Create Award
 * POST /api/admin/awards
 */
export const createAward = async (req, res, next) => {
  try {
    const {
      title,
      description,
      year,
      dateAwarded,
      organization,
      category,
      imageUrl,
      imagePublicId,
      imageAlt,
      videoUrl,
      videoPublicId,
      videoResourceType,
      videoThumbnail,
      externalLink,
      featured = false,
      displayOrder,
      status,
      isActive,
      published,
    } = req.body;

    if (!title) {
      return next(new AppError('Award title is required', 400));
    }

    // Auto-resolve Cloudinary public IDs and delivery URLs
    let resolvedImageUrl = (imageUrl || '').trim();
    let resolvedImagePublicId = (imagePublicId || '').trim();
    let resolvedVideoUrl = (videoUrl || '').trim();
    let resolvedVideoPublicId = (videoPublicId || '').trim();
    let resolvedVideoThumbnail = (videoThumbnail || '').trim();

    if (resolvedImagePublicId && !resolvedImageUrl) {
      resolvedImageUrl = buildOptimizedImageUrl(
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'nbcbpuql'}/image/upload/${resolvedImagePublicId}`
      );
    } else if (resolvedImageUrl && resolvedImageUrl.includes('cloudinary.com')) {
      resolvedImagePublicId = resolvedImagePublicId || extractPublicId(resolvedImageUrl);
    }

    if (resolvedVideoPublicId) {
      if (!resolvedVideoUrl) resolvedVideoUrl = buildDirectVideoUrl(resolvedVideoPublicId);
      if (!resolvedVideoThumbnail) resolvedVideoThumbnail = buildVideoThumbnailUrl(resolvedVideoPublicId);
    } else if (resolvedVideoUrl && resolvedVideoUrl.includes('cloudinary.com')) {
      resolvedVideoPublicId = extractPublicId(resolvedVideoUrl);
      if (!resolvedVideoThumbnail) resolvedVideoThumbnail = buildVideoThumbnailUrl(resolvedVideoPublicId);
    }

    const active = isActive !== undefined ? !!isActive : published !== undefined ? !!published : status !== 'inactive';

    const resolvedOrder = Number(displayOrder) || (await Award.countDocuments()) + 1;

    const payload = {
      title: title.trim(),
      description: (description || '').trim(),
      year: (year || '').trim(),
      dateAwarded: dateAwarded ? new Date(dateAwarded) : null,
      organization: (organization || '').trim(),
      category: (category || 'Recognition').trim(),
      imageUrl: resolvedImageUrl,
      imagePublicId: resolvedImagePublicId,
      imageAlt: (imageAlt || `Award: ${title.trim()}`).trim(),
      videoUrl: resolvedVideoUrl,
      videoPublicId: resolvedVideoPublicId,
      videoResourceType: videoResourceType || 'video',
      videoThumbnail: resolvedVideoThumbnail,
      externalLink: (externalLink || '').trim(),
      featured: !!featured,
      displayOrder: resolvedOrder,
      order: resolvedOrder,
      status: active ? 'active' : 'inactive',
      isActive: active,
      published: active,
    };

    if (payload.featured) {
      await Award.updateMany({}, { featured: false });
    }

    const award = new Award(payload);
    await award.save();

    if (req?.user) {
      AuditLog.create({
        adminId: req.user._id,
        adminEmail: req.user.email,
        action: 'AWARD_CREATED',
        resourceType: 'Award',
        resourceId: String(award._id),
        details: { title: award.title, featured: award.featured, status: award.status },
      }).catch(() => {});
    }

    res.status(201).json({ success: true, data: formatPublicAward(award.toObject()) });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Award
 * PATCH/PUT /api/admin/awards/:id
 */
export const updateAward = async (req, res, next) => {
  try {
    const { id } = req.params;
    const oldAward = await Award.findById(id).lean();
    if (!oldAward) return next(new AppError('Award not found', 404));

    // Whitelist writable fields — never spread req.body (mass assignment guard).
    const b = req.body || {};
    const payload = {
      title: b.title !== undefined ? String(b.title).trim() : undefined,
      description: b.description !== undefined ? String(b.description).trim() : undefined,
      year: b.year !== undefined ? String(b.year).trim() : undefined,
      dateAwarded: b.dateAwarded !== undefined && b.dateAwarded ? new Date(b.dateAwarded) : b.dateAwarded === null ? null : undefined,
      organization: b.organization !== undefined ? String(b.organization).trim() : undefined,
      category: b.category !== undefined ? String(b.category).trim() : undefined,
      imageUrl: b.imageUrl !== undefined ? String(b.imageUrl).trim() : undefined,
      imagePublicId: b.imagePublicId !== undefined ? String(b.imagePublicId).trim() : undefined,
      imageAlt: b.imageAlt !== undefined ? String(b.imageAlt).trim() : undefined,
      videoUrl: b.videoUrl !== undefined ? String(b.videoUrl).trim() : undefined,
      videoPublicId: b.videoPublicId !== undefined ? String(b.videoPublicId).trim() : undefined,
      videoResourceType: b.videoResourceType !== undefined ? String(b.videoResourceType).trim() : undefined,
      videoThumbnail: b.videoThumbnail !== undefined ? String(b.videoThumbnail).trim() : undefined,
      externalLink: b.externalLink !== undefined ? String(b.externalLink).trim() : undefined,
      featured: b.featured !== undefined ? !!b.featured : undefined,
      displayOrder: b.displayOrder !== undefined ? Number(b.displayOrder) : undefined,
      order: b.order !== undefined ? Number(b.order) : undefined,
      status: b.status !== undefined ? String(b.status) : undefined,
      isActive: b.isActive !== undefined ? !!b.isActive : undefined,
      published: b.published !== undefined ? !!b.published : undefined,
    };
    // Drop fields the client did not send
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    // Auto-resolve Cloudinary URLs / IDs
    if (payload.imagePublicId) {
      if (!payload.imageUrl) {
        payload.imageUrl = buildOptimizedImageUrl(
          `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'nbcbpuql'}/image/upload/${payload.imagePublicId}`
        );
      }
    } else if (payload.imageUrl && payload.imageUrl.includes('cloudinary.com')) {
      payload.imagePublicId = extractPublicId(payload.imageUrl);
    }

    if (payload.videoPublicId) {
      if (!payload.videoUrl || payload.videoUrl.includes('sample/ForBigger')) {
        payload.videoUrl = buildDirectVideoUrl(payload.videoPublicId);
      }
      if (!payload.videoThumbnail) payload.videoThumbnail = buildVideoThumbnailUrl(payload.videoPublicId);
    } else if (payload.videoUrl && payload.videoUrl.includes('cloudinary.com')) {
      payload.videoPublicId = extractPublicId(payload.videoUrl);
      if (!payload.videoThumbnail) payload.videoThumbnail = buildVideoThumbnailUrl(payload.videoPublicId);
    }

    if (payload.displayOrder !== undefined) payload.order = Number(payload.displayOrder);
    if (payload.order !== undefined && payload.displayOrder === undefined) payload.displayOrder = Number(payload.order);

    if (payload.isActive !== undefined || payload.published !== undefined || payload.status !== undefined) {
      const active =
        payload.isActive !== undefined
          ? !!payload.isActive
          : payload.published !== undefined
          ? !!payload.published
          : payload.status !== 'inactive';
      payload.isActive = active;
      payload.published = active;
      payload.status = active ? 'active' : 'inactive';
    }

    if (payload.featured) {
      await Award.updateMany({ _id: { $ne: id } }, { featured: false });
    }

    const award = await Award.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!award) return next(new AppError('Award not found', 404));

    // Clean up old Cloudinary media if replaced or explicitly cleared
    if (oldAward.imagePublicId && payload.imagePublicId && oldAward.imagePublicId !== payload.imagePublicId) {
      deleteCloudinaryAsset(oldAward.imagePublicId, 'image').catch(() => {});
    } else if (oldAward.imagePublicId && payload.imagePublicId === '') {
      deleteCloudinaryAsset(oldAward.imagePublicId, 'image').catch(() => {});
    }
    if (oldAward.videoPublicId && payload.videoPublicId && oldAward.videoPublicId !== payload.videoPublicId) {
      deleteCloudinaryAsset(oldAward.videoPublicId, 'video').catch(() => {});
    } else if (oldAward.videoPublicId && payload.videoPublicId === '') {
      deleteCloudinaryAsset(oldAward.videoPublicId, 'video').catch(() => {});
    }

    if (req?.user) {
      AuditLog.create({
        adminId: req.user._id,
        adminEmail: req.user.email,
        action: 'AWARD_UPDATED',
        resourceType: 'Award',
        resourceId: String(award._id),
        details: {
          title: award.title,
          oldFeatured: !!oldAward.featured,
          newFeatured: !!award.featured,
          oldStatus: oldAward.status || oldAward.isActive,
          newStatus: award.status,
        },
      }).catch(() => {});
    }

    res.json({ success: true, data: formatPublicAward(award.toObject()) });
  } catch (err) {
    next(err);
  }
};
/**
 * Quick toggle featured
 * PATCH /api/admin/awards/:id/featured
 */
export const quickToggleFeaturedAward = async (req, res, next) => {
  try {
    const { id } = req.params;
    const featured = !!req.body.featured;

    if (featured) {
      await Award.updateMany({ _id: { $ne: id } }, { featured: false });
    }

    const award = await Award.findByIdAndUpdate(id, { featured }, { new: true });
    if (!award) return next(new AppError('Award not found', 404));

    if (req?.user) {
      AuditLog.create({
        adminId: req.user._id,
        adminEmail: req.user.email,
        action: 'AWARD_FEATURED_TOGGLED',
        resourceType: 'Award',
        resourceId: String(award._id),
        details: { title: award.title, featured: award.featured },
      }).catch(() => {});
    }

    res.json({ success: true, data: formatPublicAward(award.toObject()) });
  } catch (err) {
    next(err);
  }
};

/**
 * Quick toggle status (active/inactive)
 * PATCH /api/admin/awards/:id/status
 */
export const quickToggleStatusAward = async (req, res, next) => {
  try {
    const { id } = req.params;
    const active =
      req.body.status !== undefined
        ? req.body.status !== 'inactive'
        : req.body.isActive !== undefined
        ? !!req.body.isActive
        : !(req.body.published === false);

    const award = await Award.findByIdAndUpdate(
      id,
      { status: active ? 'active' : 'inactive', isActive: active, published: active },
      { new: true }
    );
    if (!award) return next(new AppError('Award not found', 404));

    if (req?.user) {
      AuditLog.create({
        adminId: req.user._id,
        adminEmail: req.user.email,
        action: 'AWARD_STATUS_CHANGED',
        resourceType: 'Award',
        resourceId: String(award._id),
        details: { title: award.title, status: award.status },
      }).catch(() => {});
    }

    res.json({ success: true, data: formatPublicAward(award.toObject()) });
  } catch (err) {
    next(err);
  }
};

/**
 * Quick update display order
 * PATCH /api/admin/awards/:id/order
 */
export const quickUpdateOrderAward = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orderNum = Number(req.body.order ?? req.body.displayOrder) || 0;
    const award = await Award.findByIdAndUpdate(
      id,
      { order: orderNum, displayOrder: orderNum },
      { new: true }
    );
    if (!award) return next(new AppError('Award not found', 404));
    res.json({ success: true, data: formatPublicAward(award.toObject()) });
  } catch (err) {
    next(err);
  }
};

/**
 * Bulk reorder awards
 * PATCH /api/admin/awards/reorder
 */
export const bulkReorderAwards = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return next(new AppError('Items array is required for bulk reordering', 400));
    }

    const updates = items.map((item, index) => {
      const orderNum = Number(item.order) || index + 1;
      return Award.findByIdAndUpdate(item.id || item._id, {
        order: orderNum,
        displayOrder: orderNum,
      });
    });

    await Promise.all(updates);

    if (req?.user) {
      AuditLog.create({
        adminId: req.user._id,
        adminEmail: req.user.email,
        action: 'AWARDS_BULK_REORDERED',
        resourceType: 'Award',
        resourceId: null,
        details: { count: items.length },
      }).catch(() => {});
    }

    res.json({ success: true, message: 'Awards order updated successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete Award (also removes Cloudinary assets when possible)
 * DELETE /api/admin/awards/:id
 */
export const deleteAward = async (req, res, next) => {
  try {
    const { id } = req.params;
    const award = await Award.findByIdAndDelete(id);
    if (!award) return next(new AppError('Award not found', 404));

    if (award.imagePublicId) {
      deleteCloudinaryAsset(award.imagePublicId, 'image').catch(() => {});
    }
    if (award.videoPublicId) {
      deleteCloudinaryAsset(award.videoPublicId, 'video').catch(() => {});
    }

    if (req?.user) {
      AuditLog.create({
        adminId: req.user._id,
        adminEmail: req.user.email,
        action: 'AWARD_DELETED',
        resourceType: 'Award',
        resourceId: String(id),
        details: { title: award.title },
      }).catch(() => {});
    }

    res.json({ success: true, deleted: true, message: 'Award permanently deleted.' });
  } catch (err) {
    next(err);
  }
};

/**
 * Upload award media (image and/or video) to Cloudinary
 * POST /api/admin/awards/upload
 */
export const uploadAwardMedia = async (req, res, next) => {
  try {
    const files = req.files || {};
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    let imageUrl = '';
    let imagePublicId = '';
    let videoUrl = '';
    let videoPublicId = '';
    let videoResourceType = 'video';
    let videoThumbnail = '';
    let duration = '';

    // Award image upload
    if (files.image && files.image[0]) {
      const imageFile = files.image[0];
      try {
        const buffer = fs.readFileSync(imageFile.path);
        const cloudRes = await uploadBufferToCloudinary(buffer, {
          resource_type: 'image',
          folder: 'apex_awards/images',
        });
        if (cloudRes && cloudRes.secure_url) {
          imageUrl = buildOptimizedImageUrl(cloudRes.secure_url);
          imagePublicId = cloudRes.public_id;
          try { fs.unlinkSync(imageFile.path); } catch {}
        }
      } catch (cloudErr) {
        console.warn('[Award] Image Cloudinary upload fallback to local storage:', cloudErr.message);
        imageUrl = `${baseUrl}/uploads/awards/${imageFile.filename}`;
      }
    }

    // Award video upload
    if (files.video && files.video[0]) {
      const videoFile = files.video[0];
      try {
        const buffer = fs.readFileSync(videoFile.path);
        const cloudRes = await uploadBufferToCloudinary(buffer, {
          resource_type: 'video',
          folder: 'apex_awards/videos',
        });
        if (cloudRes && cloudRes.secure_url) {
          videoUrl = cloudRes.secure_url;
          videoPublicId = cloudRes.public_id;
          videoResourceType = cloudRes.resource_type || 'video';
          videoThumbnail = buildVideoThumbnailUrl(cloudRes.public_id);
          if (cloudRes.duration) {
            duration = `${Math.round(cloudRes.duration)}s`;
          }
          try { fs.unlinkSync(videoFile.path); } catch {}
        }
      } catch (cloudErr) {
        console.warn('[Award] Video Cloudinary upload fallback to local storage:', cloudErr.message);
        videoUrl = `${baseUrl}/uploads/videos/${videoFile.filename}`;
      }
    }

    if (!imageUrl && !videoUrl) {
      return next(new AppError('No valid file uploaded', 400));
    }

    res.json({
      success: true,
      message: 'Award media uploaded successfully',
      imageUrl,
      imagePublicId,
      videoUrl,
      videoPublicId,
      videoResourceType,
      videoThumbnail,
      duration,
    });
  } catch (err) {
    next(err);
  }
};