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
import { resolveImageUrl } from '../utils/imageUrl.js';
import {
  prepareIncomingArticle,
  normalizeArticleTables,
  stripDocumentChrome,
  scopeCss,
  blogArticleScope,
} from '../utils/articleContent.js';

const baseUrl = () => (config.siteUrl || config.clientUrl || 'http://localhost:5173').replace(/\/$/, '');

/**
 * Output-only: deliver every blog image through Cloudinary's f_auto,q_auto
 * transform when it is a Cloudinary asset. Legacy/local paths pass through.
 * Accepts a Mongoose doc or a plain object; always returns a plain object.
 */
const serializePublicPost = (post) => {
  if (!post) return post;
  const obj = typeof post.toObject === 'function' ? post.toObject() : { ...post };
  if (obj.coverImage) obj.coverImage = resolveImageUrl(obj.coverImage);
  if (obj.authorImage) obj.authorImage = resolveImageUrl(obj.authorImage);
  if (Array.isArray(obj.images)) {
    obj.images = obj.images.map((img) => ({ ...img, url: resolveImageUrl(img.url) }));
  }
  // Article CSS is stored unscoped (author selectors as written); scope it to
  // this article's root here so it can never touch the navbar, footer, admin UI
  // or another article. `''` for every article that has no CSS.
  obj.css = obj.css ? scopeCss(obj.css, blogArticleScope(obj._id)) : '';
  return obj;
};

const serializePublicList = (posts = []) =>
  posts.map((p) => ({ ...p, coverImage: resolveImageUrl(p.coverImage) }));

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

// The block editor emits header cells as a leading `<tr><th>…</th></tr>` directly
// inside `<tbody>` (ProseMirror tables have no `<thead>`). Promote that first
// all-header row into a proper `<thead>` so the stored markup is fully semantic.
const promoteTableHead = (html) =>
  html.replace(
    /(<table>)\s*<tbody>\s*(<tr>(?:\s*<th\b[\s\S]*?<\/th>\s*)+<\/tr>)/gi,
    '$1<thead>$2</thead><tbody>',
  );

const sanitizeBlogContent = (html) => {
  if (!html) return '';
  // Collapse any pasted full document to its body first; extract <style> upstream
  // (prepareIncomingArticle). normalizeArticleTables strips colgroup / redundant
  // colspan="1" so the article stylesheet can lay tables out responsively.
  const fragment = stripDocumentChrome(html);
  return normalizeArticleTables(promoteTableHead(sanitizeHtml(fragment, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's',
      'sub', 'sup', 'mark', 'small', 'del', 'ins', 'abbr', 'code', 'pre', 'kbd',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'picture', 'source',
      'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      'figure', 'figcaption', 'span', 'div', 'section', 'article', 'header', 'footer', 'aside', 'iframe',
    ],
    // `class` / `id` are inert (no script surface) and are exactly what pasted
    // article CSS targets — allowing them broadly is what makes
    // "Article = HTML + CSS" actually work. `style` is allowed but filtered to a
    // safe property allowlist by `allowedStyles` below.
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel', 'id', 'class', 'style', 'name'],
      img: ['src', 'srcset', 'sizes', 'alt', 'title', 'width', 'height', 'loading', 'id', 'class', 'style'],
      source: ['src', 'srcset', 'sizes', 'type', 'media'],
      td: ['colspan', 'rowspan', 'id', 'class', 'style', 'scope'],
      th: ['colspan', 'rowspan', 'id', 'class', 'style', 'scope'],
      iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title'],
      div: ['id', 'class', 'style', 'data-callout'],
      '*': ['id', 'class', 'style'],
    },
    allowedStyles: {
      '*': {
        color: [/.*/],
        'background-color': [/.*/],
        background: [/^(?!.*(?:url\(\s*['"]?\s*(?:javascript|vbscript|data:text\/html))).*$/i],
        'text-align': [/^(?:left|right|center|justify)$/],
        'text-decoration': [/.*/],
        'font-weight': [/.*/],
        'font-style': [/.*/],
        'font-size': [/.*/],
        'font-family': [/^(?!.*(?:expression|javascript:|url\()).*$/i],
        'line-height': [/.*/],
        'letter-spacing': [/.*/],
        'text-transform': [/.*/],
        margin: [/.*/], 'margin-top': [/.*/], 'margin-right': [/.*/], 'margin-bottom': [/.*/], 'margin-left': [/.*/],
        padding: [/.*/], 'padding-top': [/.*/], 'padding-right': [/.*/], 'padding-bottom': [/.*/], 'padding-left': [/.*/],
        border: [/.*/], 'border-top': [/.*/], 'border-right': [/.*/], 'border-bottom': [/.*/], 'border-left': [/.*/],
        'border-color': [/.*/], 'border-width': [/.*/], 'border-style': [/.*/], 'border-radius': [/.*/],
        'border-collapse': [/.*/], 'border-spacing': [/.*/],
        width: [/.*/], height: [/.*/], 'max-width': [/.*/], 'min-height': [/.*/],
        display: [/^(?:block|inline|inline-block|flex|inline-flex|grid|table|none|list-item)$/],
        'vertical-align': [/.*/],
        float: [/^(?:left|right|none)$/],
        'box-shadow': [/^(?!.*(?:expression|javascript:)).*$/i],
        opacity: [/.*/],
      },
    },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowedSchemesByTag: { a: ['https', 'http', 'mailto', 'tel'] },
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com'],
    exclusiveFilter: (frame) => frame.tag === 'iframe' && frame.attribs?.src && !YOUTUBE_VIMEO_SRC.test(frame.attribs.src),
    disallowedTagsMode: 'discard',
  })));
};

const WRITABLE_FIELDS = [
  'title', 'slug', 'excerpt', 'content', 'css', 'coverImage', 'coverImagePublicId',
  'coverImageAlt', 'coverImageTitle', 'coverImageCaption', 'coverImageDescription',
  'images', 'author', 'authorBio', 'authorImage', 'reviewer', 'reviewedAt',
  'category', 'tags', 'featured', 'faqs', 'relatedPosts', 'seo', 'contentSource',
];

// Article = HTML + CSS + structured metadata. Whenever the body OR the css is
// written, the pair is re-derived together: pasted <style> blocks and full
// `<!DOCTYPE html>` documents are split into { html, css } so CSS is never
// silently dropped, and HTML+CSS can never end up in an inconsistent state
// (section 32). `existing` supplies the current css when only `content` is sent.
const pickWritable = (body, existing = {}) => {
  const out = {};
  for (const key of WRITABLE_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  if (out.content !== undefined || out.css !== undefined) {
    const baseCss = out.css !== undefined ? out.css : (existing.css || '');
    const prepared = prepareIncomingArticle(out.content ?? existing.content ?? '', baseCss);
    if (out.content !== undefined) out.content = sanitizeBlogContent(prepared.html);
    out.css = prepared.css;
  }
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

    const patch = pickWritable(req.body, post.toObject());
    const oldSlug = post.slug;
    const oldDoc = post.toObject();
    // Autosaves must not spam revision history or touch slug redirects — they
    // are frequent, silent background writes (see useBlogDraft.js).
    const isAutosave = req.body.__autosave === true || req.body.__autosave === 'true';

    if (!isAutosave && Object.keys(patch).length > 0) {
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
    if (!isAutosave && patch.slug && patch.slug !== oldSlug && oldDoc.status === 'published') {
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
    // Preview renders through the exact same path as the public page — scoped
    // CSS, Cloudinary-resolved images — so "Preview" is faithful (section 28).
    res.json({ success: true, data: serializePublicPost(post), relatedPosts, structuredData });
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
      key: r.key || null,
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
        .select('title slug excerpt coverImage coverImageAlt category tags author authorImage authorBio publishedAt updatedAt readingTime featured contentSource')
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
      data: serializePublicList(posts),
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
        // HTTP 200 + REDIRECT contract: the Next.js data layer fetches this with
        // `redirect: 'follow'`, and a 3xx without a Location header throws a
        // network error there (the REDIRECT branch was unreachable). The actual
        // 301 to browsers comes from the Next side via permanentRedirect().
        return res.json({
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

    res.json({
      success: true,
      data: serializePublicPost(post),
      relatedPosts: serializePublicList(relatedPosts),
      structuredData,
    });
  } catch (err) {
    next(err);
  }
};
