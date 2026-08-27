import sanitizeHtml from 'sanitize-html';
import fs from 'fs';
import { BlogPost, BlogPostRevision, Redirect, AuditLog } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { isValidObjectId } from '../config/db.js';
import { escapeRegex } from '../utils/index.js';
import { slugify } from '../utils/seo.js';
import { analyzeBlogSEO, checkBlogSafetyWarnings, SEO_DISCLAIMER } from '../utils/blogSeo.js';
import { searchInternalLinks } from '../services/internalLinkIndex.js';
import { uploadBlogImage, deleteBlogImage } from '../services/blogImageService.js';
import { getBlogStructuredData } from '../utils/blogStructuredData.js';
import { config } from '../config/index.js';

const baseUrl = () => (config.siteUrl || config.clientUrl || 'http://localhost:5173').replace(/\/$/, '');

const recordAudit = async (req, action, resourceId, details) => {
  try {
    if (req?.user) {
      await AuditLog.create({
        adminId: req.user._id,
        adminEmail: req.user.email,
        action,
        resourceType: 'BlogPost',
        resourceId: resourceId ? String(resourceId) : null,
        details: details || {},
        ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
      });
    }
  } catch (err) {
    console.error('[blog audit] log error:', err.message);
  }
};

// Allowlist-based sanitizer — replaces the client's raw HTML entirely on save.
const YOUTUBE_VIMEO_SRC = /^https:\/\/(www\.)?(youtube\.com\/embed\/|player\.vimeo\.com\/video\/)/i;

const sanitizeBlogContent = (html) => {
  if (!html) return '';
  return sanitizeHtml(html, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'figure', 'figcaption', 'span', 'div', 'iframe',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
      iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title'],
      div: ['class', 'data-callout'],
      span: ['class'],
      '*': [],
    },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com'],
    exclusiveFilter: (frame) => frame.tag === 'iframe' && frame.attribs?.src && !YOUTUBE_VIMEO_SRC.test(frame.attribs.src),
    disallowedTagsMode: 'discard',
  });
};

const WRITABLE_FIELDS = [
  'title', 'slug', 'excerpt', 'content', 'coverImage', 'coverImagePublicId',
  'coverImageAlt', 'coverImageTitle', 'coverImageCaption', 'coverImageDescription',
  'images', 'author', 'authorBio', 'authorImage', 'reviewer', 'reviewedAt',
  'category', 'tags', 'featured', 'faqs', 'relatedPosts', 'seo',
];

const pickWritable = (body) => {
  const out = {};
  for (const key of WRITABLE_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  if (out.content !== undefined) out.content = sanitizeBlogContent(out.content);
  if (out.slug !== undefined) out.slug = slugify(out.slug);
  return out;
};

const summarizeChanges = (oldDoc, patch) => {
  const changed = [];
  for (const key of Object.keys(patch)) {
    if (key === 'seo' && patch.seo && typeof patch.seo === 'object') {
      for (const seoKey of Object.keys(patch.seo)) {
        if (JSON.stringify(oldDoc.seo?.[seoKey]) !== JSON.stringify(patch.seo[seoKey])) {
          changed.push(`seo.${seoKey}`);
        }
      }
      continue;
    }
    if (JSON.stringify(oldDoc[key]) !== JSON.stringify(patch[key])) {
      changed.push(key);
    }
  }
  return changed.length ? changed.join(', ') : 'No field changes';
};

const findPostOr404 = async (id) => {
  let post = null;
  if (isValidObjectId(id)) post = await BlogPost.findById(id);
  if (!post) post = await BlogPost.findOne({ slug: String(id).toLowerCase() });
  return post;
};

// ── Admin: List / Get ────────────────────────────────────────────────────────

export const listAdminBlogs = async (req, res, next) => {
  try {
    const { search, status, category, sort = '-createdAt' } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      const s = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ title: s }, { category: s }, { excerpt: s }, { tags: s }];
    }
    const sortSpec = {};
    const sortField = String(sort).replace(/^-/, '');
    sortSpec[sortField] = String(sort).startsWith('-') ? -1 : 1;

    const posts = await BlogPost.find(filter).sort(sortSpec).lean();
    res.json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    next(err);
  }
};

export const getAdminBlog = async (req, res, next) => {
  try {
    const post = await findPostOr404(req.params.id);
    if (!post) return next(new AppError('Blog post not found', 404));
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Create / Update ───────────────────────────────────────────────────

export const createBlog = async (req, res, next) => {
  try {
    const payload = pickWritable(req.body);
    if (!payload.title) return next(new AppError('Blog title is required', 400));
    payload.status = 'draft';
    const post = new BlogPost(payload);
    await post.save();
    await recordAudit(req, 'BLOG_CREATED', post._id, { title: post.title });
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const post = await findPostOr404(req.params.id);
    if (!post) return next(new AppError('Blog post not found', 404));

    const patch = pickWritable(req.body);
    const oldSlug = post.slug;
    const oldDoc = post.toObject();

    if (Object.keys(patch).length > 0) {
      await BlogPostRevision.create({
        blogId: post._id,
        snapshot: oldDoc,
        editedBy: req.user?._id || null,
        editedByEmail: req.user?.email || '',
        changeSummary: summarizeChanges(oldDoc, patch),
      });
    }

    Object.assign(post, patch);

    // Slug change on an already-published post: create a 301 redirect, never a chain.
    if (patch.slug && patch.slug !== oldSlug && oldDoc.status === 'published') {
      const oldPath = `/blog/${oldSlug}`;
      const newPath = `/blog/${post.slug}`;
      const alreadyRedirectedElsewhere = await Redirect.exists({ sourcePath: newPath });
      if (!alreadyRedirectedElsewhere) {
        const existing = await Redirect.exists({ sourcePath: oldPath });
        if (!existing) {
          await Redirect.create({
            sourcePath: oldPath,
            targetPath: newPath,
            type: 301,
            entityType: 'auto',
            entityId: post._id,
            entityTypeModel: 'BlogPost',
            notes: `Auto-redirect from old blog slug "${oldSlug}" to new slug "${post.slug}"`,
          });
        }
      }
      if (!post.seo.canonicalUrl || post.seo.canonicalUrl.includes(oldSlug)) {
        post.seo.canonicalUrl = `${baseUrl()}${newPath}`;
      }
    }

    await post.save();
    await recordAudit(req, 'BLOG_UPDATED', post._id, { title: post.title, changed: Object.keys(patch) });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Status workflow ───────────────────────────────────────────────────

export const publishBlog = async (req, res, next) => {
  try {
    const post = await findPostOr404(req.params.id);
    if (!post) return next(new AppError('Blog post not found', 404));
    post.status = 'published';
    post.publishedAt = post.publishedAt || new Date();
    post.scheduledAt = null;
    if (post.seo.noindex === undefined) post.seo.noindex = false;
    if (post.seo.nofollow === undefined) post.seo.nofollow = false;
    await post.save();
    await recordAudit(req, 'BLOG_PUBLISHED', post._id, { title: post.title });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

export const unpublishBlog = async (req, res, next) => {
  try {
    const post = await findPostOr404(req.params.id);
    if (!post) return next(new AppError('Blog post not found', 404));
    post.status = 'unpublished';
    await post.save();
    await recordAudit(req, 'BLOG_UNPUBLISHED', post._id, { title: post.title });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

export const scheduleBlog = async (req, res, next) => {
  try {
    const { scheduledAt } = req.body;
    if (!scheduledAt) return next(new AppError('scheduledAt is required', 400));
    const when = new Date(scheduledAt);
    if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
      return next(new AppError('scheduledAt must be a valid future date/time', 400));
    }
    const post = await findPostOr404(req.params.id);
    if (!post) return next(new AppError('Blog post not found', 404));
    post.status = 'scheduled';
    post.scheduledAt = when;
    await post.save();
    await recordAudit(req, 'BLOG_SCHEDULED', post._id, { title: post.title, scheduledAt: when });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

export const duplicateBlog = async (req, res, next) => {
  try {
    const post = await findPostOr404(req.params.id);
    if (!post) return next(new AppError('Blog post not found', 404));
    const obj = post.toObject();
    delete obj._id;
    delete obj.createdAt;
    delete obj.updatedAt;
    obj.title = `${obj.title} (Copy)`;
    let baseSlug = slugify(obj.title);
    let candidate = baseSlug;
    let i = 1;
    while (await BlogPost.exists({ slug: candidate })) {
      candidate = `${baseSlug}-${++i}`;
    }
    obj.slug = candidate;
    obj.status = 'draft';
    obj.publishedAt = null;
    obj.scheduledAt = null;
    obj.trashedAt = null;
    obj.previousStatus = null;
    obj.viewsCount = 0;
    const copy = new BlogPost(obj);
    await copy.save();
    await recordAudit(req, 'BLOG_DUPLICATED', copy._id, { fromId: post._id, title: copy.title });
    res.status(201).json({ success: true, data: copy });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Trash / Restore / Permanent delete ───────────────────────────────

export const trashBlog = async (req, res, next) => {
  try {
    const post = await findPostOr404(req.params.id);
    if (!post) return next(new AppError('Blog post not found', 404));
    if (post.status !== 'trash') {
      post.previousStatus = post.status;
      post.status = 'trash';
      post.trashedAt = new Date();
      await post.save();
    }
    await recordAudit(req, 'BLOG_TRASHED', post._id, { title: post.title });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

export const restoreBlog = async (req, res, next) => {
  try {
    const post = await findPostOr404(req.params.id);
    if (!post) return next(new AppError('Blog post not found', 404));
    if (post.status === 'trash') {
      post.status = post.previousStatus || 'draft';
      post.previousStatus = null;
      post.trashedAt = null;
      await post.save();
    }
    await recordAudit(req, 'BLOG_RESTORED', post._id, { title: post.title, restoredTo: post.status });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

export const permanentlyDeleteBlog = async (req, res, next) => {
  try {
    const post = await findPostOr404(req.params.id);
    if (!post) return next(new AppError('Blog post not found', 404));
    if (post.status !== 'trash') {
      return next(new AppError('Move the post to Trash before permanently deleting it', 400));
    }
    const imagesToDelete = [post.coverImagePublicId, ...(post.images || []).map((i) => i.publicId)].filter(Boolean);
    await BlogPost.findByIdAndDelete(post._id);
    await BlogPostRevision.deleteMany({ blogId: post._id });
    for (const publicId of imagesToDelete) {
      deleteBlogImage(publicId).catch(() => {});
    }
    await recordAudit(req, 'BLOG_PERMANENTLY_DELETED', post._id, { title: post.title });
    res.json({ success: true, deleted: true });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Revisions ─────────────────────────────────────────────────────────

export const listRevisions = async (req, res, next) => {
  try {
    const post = await findPostOr404(req.params.id);
    if (!post) return next(new AppError('Blog post not found', 404));
    const revisions = await BlogPostRevision.find({ blogId: post._id }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, count: revisions.length, data: revisions });
  } catch (err) {
    next(err);
  }
};

export const restoreRevision = async (req, res, next) => {
  try {
    const post = await findPostOr404(req.params.id);
    if (!post) return next(new AppError('Blog post not found', 404));
    const revision = await BlogPostRevision.findOne({ _id: req.params.revisionId, blogId: post._id }).lean();
    if (!revision) return next(new AppError('Revision not found', 404));

    await BlogPostRevision.create({
      blogId: post._id,
      snapshot: post.toObject(),
      editedBy: req.user?._id || null,
      editedByEmail: req.user?.email || '',
      changeSummary: `Restored from revision dated ${new Date(revision.createdAt).toISOString()}`,
    });

    const snap = revision.snapshot || {};
    for (const field of WRITABLE_FIELDS) {
      if (snap[field] !== undefined) post[field] = snap[field];
    }
    await post.save();
    await recordAudit(req, 'BLOG_REVISION_RESTORED', post._id, { revisionId: revision._id });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Preview / SEO analysis / Improve SEO ─────────────────────────────

export const previewBlog = async (req, res, next) => {
  try {
    const post = await findPostOr404(req.params.id);
    if (!post) return next(new AppError('Blog post not found', 404));
    let relatedPosts = [];
    if (post.relatedPosts && post.relatedPosts.length > 0) {
      relatedPosts = await BlogPost.find({ _id: { $in: post.relatedPosts } }).select('title slug excerpt coverImage category').lean();
    }
    const structuredData = await getBlogStructuredData(post);
    res.json({ success: true, data: post, relatedPosts, structuredData });
  } catch (err) {
    next(err);
  }
};

export const analyzeBlogSeoEndpoint = async (req, res, next) => {
  try {
    const post = await findPostOr404(req.params.id);
    if (!post) return next(new AppError('Blog post not found', 404));
    const analysis = analyzeBlogSEO(post);
    const allPosts = await BlogPost.find({ _id: { $ne: post._id } }).select('title seo').lean();
    const safetyWarnings = checkBlogSafetyWarnings(post.toObject(), [post.toObject(), ...allPosts]);

    post.seoScore = analysis.score;
    post.seoScoreGrade = analysis.grade;
    await post.save();

    res.json({ success: true, data: { ...analysis, safetyWarnings } });
  } catch (err) {
    next(err);
  }
};

export const improveArticleSeo = async (req, res, next) => {
  try {
    const post = await findPostOr404(req.params.id);
    if (!post) return next(new AppError('Blog post not found', 404));
    const analysis = analyzeBlogSEO(post);

    // Rule-based suggestions only — never mutates the post, never calls an LLM.
    const suggestions = analysis.recommendations.map((r) => ({
      field: r.text.toLowerCase().includes('title') ? 'seo.title'
        : r.text.toLowerCase().includes('meta description') ? 'seo.description'
        : r.text.toLowerCase().includes('h1') ? 'content'
        : r.text.toLowerCase().includes('alt') ? 'images'
        : r.text.toLowerCase().includes('internal link') ? 'content'
        : r.text.toLowerCase().includes('faq') ? 'faqs'
        : 'content',
      priority: r.priority,
      issue: r.text,
      suggestion: r.fix,
    }));

    res.json({
      success: true,
      data: {
        suggestions,
        metrics: analysis.metrics,
        disclaimer: SEO_DISCLAIMER,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const internalLinkSuggestions = async (req, res, next) => {
  try {
    const { q, excludeId } = req.query;
    const results = await searchInternalLinks(q, { excludeBlogId: excludeId });
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Image upload ──────────────────────────────────────────────────────

export const uploadBlogImageHandler = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No image file uploaded', 400));
    const buffer = fs.readFileSync(req.file.path);
    let result;
    try {
      result = await uploadBlogImage(buffer, req.file.originalname);
    } finally {
      fs.unlink(req.file.path, () => {});
    }
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// ── Public ────────────────────────────────────────────────────────────────

export const listBlogCategories = async (req, res, next) => {
  try {
    const cats = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: { $toLower: '$category' }, category: { $first: '$category' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, name: '$category', count: 1 } },
    ]);
    res.json({ success: true, count: cats.length, data: cats });
  } catch (err) {
    next(err);
  }
};

export const listPublicBlogs = async (req, res, next) => {
  try {
    const { category, tag, search, page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));

    const filter = { status: 'published' };
    if (category) filter.category = { $regex: new RegExp(`^${escapeRegex(String(category))}$`, 'i') };
    if (tag) filter.tags = tag;
    if (search) {
      const s = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ title: s }, { excerpt: s }, { tags: s }];
    }

    const [total, posts] = await Promise.all([
      BlogPost.countDocuments(filter),
      BlogPost.find(filter)
        .select('title slug excerpt coverImage coverImageAlt category tags author authorImage authorBio publishedAt updatedAt readingTime featured')
        .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
    ]);

    res.json({
      success: true,
      count: posts.length,
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / limitNum)),
      hasMore: pageNum * limitNum < total,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicBlog = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const post = await BlogPost.findOneAndUpdate(
      { slug: String(slug).toLowerCase(), status: 'published' },
      { $inc: { viewsCount: 1 } },
      { new: true }
    );
    if (!post) {
      // Slug not found — check for a managed redirect (e.g. old slug → new slug)
      const redirect = await Redirect.findOne({ sourcePath: `/blog/${String(slug).toLowerCase()}`, enabled: true }).lean();
      if (redirect) {
        return res.status(redirect.type || 301).json({
          success: false,
          code: 'REDIRECT',
          message: 'Article moved',
          redirectTo: redirect.targetPath,
        });
      }
      return next(new AppError('Blog post not found', 404));
    }

    let relatedPosts = [];
    if (post.relatedPosts && post.relatedPosts.length > 0) {
      relatedPosts = await BlogPost.find({ _id: { $in: post.relatedPosts }, status: 'published' })
        .select('title slug excerpt coverImage category publishedAt')
        .lean();
    } else {
      relatedPosts = await BlogPost.find({
        _id: { $ne: post._id },
        status: 'published',
        $or: [{ category: post.category }, { tags: { $in: post.tags || [] } }],
      })
        .select('title slug excerpt coverImage category publishedAt')
        .limit(3)
        .lean();
    }

    const structuredData = await getBlogStructuredData(post);

    res.json({ success: true, data: post, relatedPosts, structuredData });
  } catch (err) {
    next(err);
  }
};
