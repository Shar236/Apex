import { Product, Redirect, PageSEO, BlogPost, Setting, AuditLog, VoucherCode } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { analyzeSEO, sanitizeRichText, slugify, detectDuplicates } from '../utils/seo.js';
import { config } from '../config/index.js';
import { isValidObjectId } from '../config/db.js';
import { escapeRegex } from '../utils/index.js';

const recordAudit = async (req, action, resourceType, resourceId, details) => {
  try {
    if (req?.user) {
      await AuditLog.create({
        adminId: req.user._id,
        adminEmail: req.user.email,
        action,
        resourceType,
        resourceId: resourceId ? String(resourceId) : null,
        details: details || {},
        ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
      });
    }
  } catch (err) {
    console.error('[seo audit] log error:', err.message);
  }
};

const baseUrl = () => config.siteUrl || config.clientUrl || 'http://localhost:5173';

export const seoOverview = async (req, res, next) => {
  try {
    const [allProducts, allPages, allBlogs, allRedirects] = await Promise.all([
      Product.find({}).select('name slug seo seoTitle seoDescription description richDescription image imageSeo active faqs relatedProducts').lean(),
      PageSEO.find({}).lean(),
      BlogPost.find({}).select('title slug seo published excerpt').lean(),
      Redirect.find({ enabled: true }).lean(),
    ]);

    let totalScore = 0;
    let analyzedCount = 0;
    const byGrade = { Excellent: 0, Good: 0, Okay: 0, 'Needs Improvement': 0, Poor: 0 };
    const productScores = [];
    const pageScores = [];
    const blogScores = [];
    const allIssues = [];
    const allWarnings = [];

    for (const p of allProducts) {
      const analysis = analyzeSEO({
        productName: p.name,
        seoTitle: p.seo?.title || p.seoTitle || '',
        metaDescription: p.seo?.description || p.seoDescription || '',
        slug: p.seo?.slug || p.slug || '',
        focusKeyword: p.seo?.focusKeyword || '',
        secondaryKeywords: p.seo?.secondaryKeywords || [],
        description: p.description || '',
        richDescription: p.richDescription || '',
        canonicalUrl: p.seo?.canonicalUrl || '',
        productImage: p.image || '',
        imageAltText: p.imageSeo?.altText || '',
        ogTitle: p.seo?.ogTitle || '',
        ogDescription: p.seo?.ogDescription || '',
        ogImage: p.seo?.ogImage || p.image || '',
        noindex: p.seo?.noindex || false,
        relatedProducts: p.relatedProducts || [],
        faqs: p.faqs || [],
      });
      productScores.push({ id: p._id, name: p.name, slug: p.slug, analysis, active: p.active });
      if (p.active) {
        totalScore += analysis.score;
        analyzedCount++;
      }
      byGrade[analysis.grade] = (byGrade[analysis.grade] || 0) + 1;
      for (const issue of analysis.issues) {
        allIssues.push({ type: 'error', text: issue, entityType: 'product', entityId: p._id, entityName: p.name });
      }
      for (const warn of analysis.warnings) {
        allWarnings.push({ type: 'warning', text: warn, entityType: 'product', entityId: p._id, entityName: p.name });
      }
    }

    for (const page of allPages) {
      const analysis = analyzeSEO({
        productName: page.pageTitle,
        seoTitle: page.seo?.title || '',
        metaDescription: page.seo?.description || '',
        slug: page.routePath || page.pageKey,
        focusKeyword: page.seo?.focusKeyword || '',
        description: page.content || '',
        canonicalUrl: page.seo?.canonicalUrl || '',
        noindex: page.seo?.noindex || false,
      });
      pageScores.push({ id: page._id, key: page.pageKey, title: page.pageTitle, analysis });
      totalScore += analysis.score;
      analyzedCount++;
      byGrade[analysis.grade] = (byGrade[analysis.grade] || 0) + 1;
    }

    for (const post of allBlogs) {
      const analysis = analyzeSEO({
        productName: post.title,
        seoTitle: post.seo?.title || '',
        metaDescription: post.seo?.description || '',
        slug: post.slug,
        focusKeyword: post.seo?.focusKeyword || '',
        description: post.excerpt + ' ' + post.content,
        canonicalUrl: post.seo?.canonicalUrl || '',
        productImage: post.coverImage || '',
        noindex: post.seo?.noindex || !post.published,
      });
      blogScores.push({ id: post._id, title: post.title, slug: post.slug, analysis, published: post.published });
      if (post.published) {
        totalScore += analysis.score;
        analyzedCount++;
      }
      byGrade[analysis.grade] = (byGrade[analysis.grade] || 0) + 1;
    }

    const avgScore = analyzedCount > 0 ? Math.round(totalScore / analyzedCount) : 0;

    const dupTitles = detectDuplicates(
      allProducts.filter((p) => p.active).map((p) => ({ _id: p._id, name: p.name, title: p.seo?.title || p.seoTitle })),
      'title'
    );
    const dupDescriptions = detectDuplicates(
      allProducts.filter((p) => p.active).map((p) => ({ _id: p._id, name: p.name, desc: p.seo?.description || p.seoDescription })),
      'desc'
    );

    res.json({
      success: true,
      data: {
        overallHealth: {
          score: avgScore,
          grade: avgScore >= 90 ? 'Excellent' : avgScore >= 75 ? 'Good' : avgScore >= 60 ? 'Okay' : avgScore >= 40 ? 'Needs Improvement' : 'Poor',
          analyzedCount,
        },
        counts: {
          products: allProducts.filter((p) => p.active).length,
          pages: allPages.length,
          blogPosts: allBlogs.filter((b) => b.published).length,
          redirects: allRedirects.length,
        },
        gradeDistribution: byGrade,
        issuesCount: allIssues.length,
        warningsCount: allWarnings.length,
        topIssues: allIssues.slice(0, 50),
        topWarnings: allWarnings.slice(0, 50),
        duplicates: {
          seoTitles: dupTitles,
          metaDescriptions: dupDescriptions,
        },
        productScores,
        pageScores,
        blogScores,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const analyzeProductSEO = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product = null;
    if (isValidObjectId(id)) {
      product = await Product.findById(id).lean();
    }
    if (!product) {
      product = await Product.findOne({ slug: String(id).toLowerCase() }).lean();
    }
    if (!product) return next(new AppError('Product not found', 404));

    const analysis = analyzeSEO({
      productName: product.name,
      seoTitle: product.seo?.title || product.seoTitle || '',
      metaDescription: product.seo?.description || product.seoDescription || '',
      slug: product.seo?.slug || product.slug || '',
      focusKeyword: product.seo?.focusKeyword || '',
      secondaryKeywords: product.seo?.secondaryKeywords || [],
      description: product.description || '',
      richDescription: product.richDescription || '',
      canonicalUrl: product.seo?.canonicalUrl || '',
      productImage: product.image || '',
      imageAltText: product.imageSeo?.altText || '',
      ogTitle: product.seo?.ogTitle || '',
      ogDescription: product.seo?.ogDescription || '',
      ogImage: product.seo?.ogImage || product.image || '',
      noindex: product.seo?.noindex || false,
      relatedProducts: product.relatedProducts || [],
      faqs: product.faqs || [],
    });

    res.json({ success: true, data: analysis });
  } catch (err) {
    next(err);
  }
};

export const analyzeSEOInline = async (req, res, next) => {
  try {
    const analysis = analyzeSEO(req.body || {});
    res.json({ success: true, data: analysis });
  } catch (err) {
    next(err);
  }
};

export const updateProductSEO = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(new AppError('Product not found', 404));

    const { seo, richDescription, imageSeo, faqs, relatedProducts, description, slug } = req.body;
    const oldSlug = product.slug;

    if (seo !== undefined) {
      if (seo.title !== undefined) product.seo.title = seo.title;
      if (seo.description !== undefined) product.seo.description = seo.description;
      if (seo.focusKeyword !== undefined) product.seo.focusKeyword = seo.focusKeyword;
      if (seo.secondaryKeywords !== undefined) product.seo.secondaryKeywords = seo.secondaryKeywords;
      if (seo.canonicalUrl !== undefined) product.seo.canonicalUrl = seo.canonicalUrl;
      if (seo.ogTitle !== undefined) product.seo.ogTitle = seo.ogTitle;
      if (seo.ogDescription !== undefined) product.seo.ogDescription = seo.ogDescription;
      if (seo.ogImage !== undefined) product.seo.ogImage = seo.ogImage;
      if (seo.twitterTitle !== undefined) product.seo.twitterTitle = seo.twitterTitle;
      if (seo.twitterDescription !== undefined) product.seo.twitterDescription = seo.twitterDescription;
      if (seo.twitterImage !== undefined) product.seo.twitterImage = seo.twitterImage;
      if (seo.noindex !== undefined) product.seo.noindex = !!seo.noindex;
      if (seo.nofollow !== undefined) product.seo.nofollow = !!seo.nofollow;
      if (seo.slug !== undefined) {
        const newSlug = slugify(seo.slug || product.name);
        product.seo.slug = newSlug;
      }
      product.seoTitle = product.seo.title || product.seoTitle;
      product.seoDescription = product.seo.description || product.seoDescription;
    }

    if (slug !== undefined) {
      const newSlug = slugify(slug || product.name);
      if (newSlug && newSlug !== product.slug) {
        const slugTaken = await Product.exists({ slug: newSlug, _id: { $ne: product._id } });
        if (slugTaken) return next(new AppError('Slug already in use', 400));
        if (oldSlug && oldSlug !== newSlug) {
          const existingRedirect = await Redirect.exists({ sourcePath: `/exam-vouchers/${oldSlug}` });
          if (!existingRedirect) {
            await Redirect.create({
              sourcePath: `/exam-vouchers/${oldSlug}`,
              targetPath: `/exam-vouchers/${newSlug}`,
              type: 301,
              entityType: 'auto',
              entityId: product._id,
              entityTypeModel: 'Product',
              notes: `Auto-redirect from old slug "${oldSlug}" to new slug "${newSlug}"`,
            });
          }
        }
        product.slug = newSlug;
        product.seo.slug = newSlug;
      }
    }

    if (richDescription !== undefined) {
      product.richDescription = sanitizeRichText(richDescription);
    }
    if (description !== undefined) {
      product.description = description;
    }
    if (imageSeo !== undefined) {
      product.imageSeo = {
        altText: imageSeo.altText || '',
        imageTitle: imageSeo.imageTitle || '',
        caption: imageSeo.caption || '',
      };
    }
    if (faqs !== undefined) {
      product.faqs = faqs;
    }
    if (relatedProducts !== undefined) {
      product.relatedProducts = relatedProducts;
    }

    await product.save();

    await recordAudit(req, 'PRODUCT_SEO_UPDATED', 'Product', product._id, {
      name: product.name,
      slugChanged: oldSlug !== product.slug,
      oldSlug,
      newSlug: product.slug,
    });

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const listPagesSEO = async (req, res, next) => {
  try {
    const pages = await PageSEO.find().sort({ pageKey: 1 }).lean();
    res.json({ success: true, count: pages.length, data: pages });
  } catch (err) {
    next(err);
  }
};

const DEFAULT_PAGES = [
  { pageKey: 'home', pageTitle: 'Homepage', routePath: '/' },
  { pageKey: 'exam-vouchers', pageTitle: 'Exam Vouchers Catalog', routePath: '/#vouchers' },
  { pageKey: 'how-it-works', pageTitle: 'How It Works', routePath: '/#how-it-works' },
  { pageKey: 'savings-calculator', pageTitle: 'Savings Calculator', routePath: '/#calculator' },
  { pageKey: 'exam-guides', pageTitle: 'Exam Guides', routePath: '/#exam-guides' },
  { pageKey: 'faq', pageTitle: 'Frequently Asked Questions', routePath: '/#faq' },
  { pageKey: 'about', pageTitle: 'About Apex Vouchers', routePath: '/#about' },
  { pageKey: 'terms', pageTitle: 'Terms of Service', routePath: '/#terms' },
  { pageKey: 'privacy', pageTitle: 'Privacy Policy', routePath: '/#privacy' },
  { pageKey: 'refund-policy', pageTitle: 'Refund Policy', routePath: '/#refund-policy' },
  { pageKey: 'contact', pageTitle: 'Contact Us', routePath: '/#contact' },
  { pageKey: 'blog', pageTitle: 'Blog / Exam Guides', routePath: '/#blog' },
];

export const ensureDefaultPages = async () => {
  for (const def of DEFAULT_PAGES) {
    await PageSEO.findOneAndUpdate(
      { pageKey: def.pageKey },
      { $setOnInsert: { ...def, seo: {} } },
      { upsert: true, new: false }
    ).catch(() => {});
  }
};

export const getPageSEO = async (req, res, next) => {
  try {
    const { pageKey } = req.params;
    let page = await PageSEO.findOne({ pageKey }).lean();
    if (!page) {
      const def = DEFAULT_PAGES.find((d) => d.pageKey === pageKey) || { pageKey, pageTitle: pageKey, routePath: '' };
      page = await PageSEO.create({ ...def, seo: {} });
      page = page.toObject();
    }
    res.json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
};

export const updatePageSEO = async (req, res, next) => {
  try {
    const { pageKey } = req.params;
    const { seo, content, pageTitle, routePath } = req.body;
    const page = await PageSEO.findOneAndUpdate(
      { pageKey },
      {
        $set: {
          ...(pageTitle && { pageTitle }),
          ...(routePath !== undefined && { routePath }),
          ...(content !== undefined && { content }),
          ...(seo && {
            'seo.title': seo.title,
            'seo.description': seo.description,
            'seo.focusKeyword': seo.focusKeyword,
            'seo.secondaryKeywords': seo.secondaryKeywords,
            'seo.canonicalUrl': seo.canonicalUrl,
            'seo.ogTitle': seo.ogTitle,
            'seo.ogDescription': seo.ogDescription,
            'seo.ogImage': seo.ogImage,
            'seo.twitterTitle': seo.twitterTitle,
            'seo.twitterDescription': seo.twitterDescription,
            'seo.twitterImage': seo.twitterImage,
            'seo.noindex': !!seo.noindex,
            'seo.nofollow': !!seo.nofollow,
          }),
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    await recordAudit(req, 'PAGE_SEO_UPDATED', 'PageSEO', pageKey, { pageTitle: page.pageTitle });

    res.json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
};

export const listRedirects = async (req, res, next) => {
  try {
    const { search, type, status } = req.query;
    const filter = {};
    if (type) filter.type = Number(type);
    if (status === 'enabled') filter.enabled = true;
    if (status === 'disabled') filter.enabled = false;
    if (search) {
      const s = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ sourcePath: s }, { targetPath: s }, { notes: s }];
    }
    const redirects = await Redirect.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: redirects.length, data: redirects });
  } catch (err) {
    next(err);
  }
};

export const createRedirect = async (req, res, next) => {
  try {
    const { sourcePath, targetPath, type = 301, notes = '', enabled = true, entityType = 'custom' } = req.body;
    if (!sourcePath || !targetPath) return next(new AppError('Source path and target path are required', 400));
    const normalizedSource = sourcePath.startsWith('/') ? sourcePath.toLowerCase() : `/${sourcePath.toLowerCase()}`;
    const existing = await Redirect.exists({ sourcePath: normalizedSource });
    if (existing) return next(new AppError('A redirect for this source path already exists', 400));
    const redirect = await Redirect.create({ sourcePath: normalizedSource, targetPath, type, notes, enabled, entityType });
    await recordAudit(req, 'REDIRECT_CREATED', 'Redirect', redirect._id, { sourcePath: normalizedSource, targetPath });
    res.status(201).json({ success: true, data: redirect });
  } catch (err) {
    next(err);
  }
};

export const updateRedirect = async (req, res, next) => {
  try {
    const { id } = req.params;
    const redirect = await Redirect.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!redirect) return next(new AppError('Redirect not found', 404));
    await recordAudit(req, 'REDIRECT_UPDATED', 'Redirect', redirect._id, { sourcePath: redirect.sourcePath });
    res.json({ success: true, data: redirect });
  } catch (err) {
    next(err);
  }
};

export const deleteRedirect = async (req, res, next) => {
  try {
    const { id } = req.params;
    const redirect = await Redirect.findByIdAndDelete(id);
    if (!redirect) return next(new AppError('Redirect not found', 404));
    await recordAudit(req, 'REDIRECT_DELETED', 'Redirect', id, { sourcePath: redirect.sourcePath });
    res.json({ success: true, deleted: true });
  } catch (err) {
    next(err);
  }
};

export const listBlogsAdmin = async (req, res, next) => {
  try {
    const { search, status, category } = req.query;
    const filter = {};
    if (status === 'published') filter.published = true;
    if (status === 'draft') filter.published = false;
    if (category) filter.category = category;
    if (search) {
      const s = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ title: s }, { category: s }, { excerpt: s }];
    }
    const posts = await BlogPost.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    next(err);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const post = new BlogPost({ ...req.body, seo: req.body.seo || {} });
    await post.save();
    await recordAudit(req, 'BLOG_CREATED', 'BlogPost', post._id, { title: post.title, published: post.published });
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.slug) payload.slug = slugify(payload.slug);
    const post = await BlogPost.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!post) return next(new AppError('Blog post not found', 404));
    await recordAudit(req, 'BLOG_UPDATED', 'BlogPost', post._id, { title: post.title, published: post.published });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) return next(new AppError('Blog post not found', 404));
    await recordAudit(req, 'BLOG_DELETED', 'BlogPost', id, { title: post.title });
    res.json({ success: true, deleted: true });
  } catch (err) {
    next(err);
  }
};

export const getGlobalSEOSettings = async (req, res, next) => {
  try {
    const [siteName, defaultTitle, defaultDesc, defaultOgImage, siteUrl, orgName, orgLogo, defaultSocialImage, gscCode, gaMeasurementId] = await Promise.all([
      Setting.findOne({ key: 'seo_siteName' }).lean(),
      Setting.findOne({ key: 'seo_defaultTitle' }).lean(),
      Setting.findOne({ key: 'seo_defaultDescription' }).lean(),
      Setting.findOne({ key: 'seo_defaultOgImage' }).lean(),
      Setting.findOne({ key: 'seo_siteUrl' }).lean(),
      Setting.findOne({ key: 'seo_orgName' }).lean(),
      Setting.findOne({ key: 'seo_orgLogo' }).lean(),
      Setting.findOne({ key: 'seo_defaultSocialImage' }).lean(),
      Setting.findOne({ key: 'seo_gscVerification' }).lean(),
      Setting.findOne({ key: 'seo_gaMeasurementId' }).lean(),
    ]);

    res.json({
      success: true,
      data: {
        websiteName: siteName?.value || 'Apex Vouchers',
        defaultSeoTitle: defaultTitle?.value || 'Exam Vouchers at Best Prices | Apex Vouchers',
        defaultMetaDescription: defaultDesc?.value || 'Buy official exam vouchers for PTE, IELTS, TOEFL and Duolingo at competitive prices. Save on exam fees with Apex Vouchers.',
        defaultOgImage: defaultOgImage?.value || '',
        websiteUrl: siteUrl?.value || baseUrl(),
        organizationName: orgName?.value || 'Apex Vouchers',
        organizationLogo: orgLogo?.value || '',
        defaultSocialImage: defaultSocialImage?.value || defaultOgImage?.value || '',
        gscVerificationCode: gscCode?.value || '',
        gaMeasurementId: gaMeasurementId?.value || '',
      },
    });
  } catch (err) {
    next(err);
  }
};

const upsertSetting = async (key, value) => {
  if (value === undefined) return;
  await Setting.findOneAndUpdate({ key }, { key, value }, { upsert: true }).catch(() => {});
};

export const updateGlobalSEOSettings = async (req, res, next) => {
  try {
    const d = req.body || {};
    await Promise.all([
      upsertSetting('seo_siteName', d.websiteName),
      upsertSetting('seo_defaultTitle', d.defaultSeoTitle),
      upsertSetting('seo_defaultDescription', d.defaultMetaDescription),
      upsertSetting('seo_defaultOgImage', d.defaultOgImage),
      upsertSetting('seo_siteUrl', d.websiteUrl),
      upsertSetting('seo_orgName', d.organizationName),
      upsertSetting('seo_orgLogo', d.organizationLogo),
      upsertSetting('seo_defaultSocialImage', d.defaultSocialImage),
      upsertSetting('seo_gscVerification', d.gscVerificationCode),
      upsertSetting('seo_gaMeasurementId', d.gaMeasurementId),
    ]);
    await recordAudit(req, 'GLOBAL_SEO_SETTINGS_UPDATED', 'Setting', null, { keys: Object.keys(d) });
    res.json({ success: true, message: 'Global SEO settings updated successfully.' });
  } catch (err) {
    next(err);
  }
};

export const getSitemapXML = async (req, res, next) => {
  try {
    const base = baseUrl().replace(/\/$/, '');
    const today = new Date().toISOString().split('T')[0];

    const [products, activePages, blogPosts] = await Promise.all([
      Product.find({ active: true, $or: [{ 'seo.noindex': { $ne: true } }, { 'seo.noindex': { $exists: false } }] }).select('slug updatedAt').lean(),
      PageSEO.find({ 'seo.noindex': { $ne: true } }).select('pageKey routePath updatedAt').lean(),
      BlogPost.find({ published: true, 'seo.noindex': { $ne: true } }).select('slug updatedAt').lean(),
    ]);

    const staticUrls = [
      { loc: `${base}/`, lastmod: today, priority: '1.0', changefreq: 'daily' },
      { loc: `${base}/#vouchers`, lastmod: today, priority: '0.9', changefreq: 'daily' },
      { loc: `${base}/#how-it-works`, lastmod: today, priority: '0.7', changefreq: 'weekly' },
      { loc: `${base}/#calculator`, lastmod: today, priority: '0.7', changefreq: 'weekly' },
      { loc: `${base}/#exam-guides`, lastmod: today, priority: '0.8', changefreq: 'weekly' },
      { loc: `${base}/#faq`, lastmod: today, priority: '0.7', changefreq: 'monthly' },
      { loc: `${base}/#about`, lastmod: today, priority: '0.6', changefreq: 'monthly' },
      { loc: `${base}/#terms`, lastmod: today, priority: '0.3', changefreq: 'yearly' },
      { loc: `${base}/#privacy`, lastmod: today, priority: '0.3', changefreq: 'yearly' },
      { loc: `${base}/#refund-policy`, lastmod: today, priority: '0.4', changefreq: 'yearly' },
    ];

    const prodUrls = products.map((p) => ({
      loc: `${base}/exam-vouchers/${p.slug}`,
      lastmod: (p.updatedAt || new Date()).toISOString().split('T')[0],
      priority: '0.9',
      changefreq: 'weekly',
    }));

    const pageUrls = activePages
      .filter((p) => p.routePath && !p.routePath.startsWith('/#'))
      .map((p) => ({
        loc: `${base}${p.routePath}`,
        lastmod: (p.updatedAt || new Date()).toISOString().split('T')[0],
        priority: '0.7',
        changefreq: 'monthly',
      }));

    const blogUrls = blogPosts.map((b) => ({
      loc: `${base}/blog/${b.slug}`,
      lastmod: (b.updatedAt || new Date()).toISOString().split('T')[0],
      priority: '0.8',
      changefreq: 'weekly',
    }));

    const allUrls = [...staticUrls, ...prodUrls, ...pageUrls, ...blogUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(xml);
  } catch (err) {
    next(err);
  }
};

export const getRobotsTxt = async (req, res, next) => {
  try {
    const base = baseUrl().replace(/\/$/, '');
    const txt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /account
Disallow: /checkout
Disallow: /cart
Disallow: /payment

Sitemap: ${base}/sitemap.xml
`;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(txt);
  } catch (err) {
    next(err);
  }
};

export const getPublicSEOData = async (req, res, next) => {
  try {
    const [siteName, defaultTitle, defaultDesc, defaultOgImage, siteUrl, orgName, orgLogo, gscCode, gaId] = await Promise.all([
      Setting.findOne({ key: 'seo_siteName' }).lean(),
      Setting.findOne({ key: 'seo_defaultTitle' }).lean(),
      Setting.findOne({ key: 'seo_defaultDescription' }).lean(),
      Setting.findOne({ key: 'seo_defaultOgImage' }).lean(),
      Setting.findOne({ key: 'seo_siteUrl' }).lean(),
      Setting.findOne({ key: 'seo_orgName' }).lean(),
      Setting.findOne({ key: 'seo_orgLogo' }).lean(),
      Setting.findOne({ key: 'seo_gscVerification' }).lean(),
      Setting.findOne({ key: 'seo_gaMeasurementId' }).lean(),
    ]);

    res.json({
      success: true,
      data: {
        global: {
          websiteName: siteName?.value || 'Apex Vouchers',
          defaultSeoTitle: defaultTitle?.value || 'Exam Vouchers at Best Prices | Apex Vouchers',
          defaultMetaDescription: defaultDesc?.value || 'Buy official exam vouchers for PTE, IELTS, TOEFL and Duolingo at competitive prices. Save on exam fees with Apex Vouchers.',
          defaultOgImage: defaultOgImage?.value || '',
          websiteUrl: siteUrl?.value || baseUrl(),
          organizationName: orgName?.value || 'Apex Vouchers',
          organizationLogo: orgLogo?.value || '',
          gscVerificationCode: gscCode?.value || '',
          gaMeasurementId: gaId?.value || '',
        },
        pages: (await PageSEO.find({}).select('pageKey routePath seo').lean()).reduce((acc, p) => {
          acc[p.pageKey] = p;
          return acc;
        }, {}),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getProductStructuredData = async (product) => {
  if (!product) return null;
  const base = baseUrl().replace(/\/$/, '');
  const price = product.sellingPrice || product.discountedPrice || 0;
  const availability = product.inStock && (product.availableStock == null || product.availableStock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.seo?.description || product.description || product.shortDescription || '',
    image: product.image ? [product.image] : undefined,
    sku: product.slug,
    brand: {
      '@type': 'Brand',
      name: product.brand || product.provider || 'Apex Vouchers',
    },
    offers: {
      '@type': 'Offer',
      url: `${base}/exam-vouchers/${product.slug}`,
      priceCurrency: product.currency || 'INR',
      price: String(price),
      availability,
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      seller: {
        '@type': 'Organization',
        name: 'Apex Vouchers',
        url: base,
      },
    },
    aggregateRating: product.reviewsCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: String(product.rating || 5),
      reviewCount: product.reviewsCount,
    } : undefined,
  };
};
