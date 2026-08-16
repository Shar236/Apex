import { Product } from '../models/Product.js';
import { VoucherCode } from '../models/VoucherCode.js';
import { Campaign } from '../models/Campaign.js';
import { Setting } from '../models/Setting.js';
import { Redirect } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { isValidObjectId } from '../config/db.js';
import { escapeRegex } from '../utils/index.js';
import { config } from '../config/index.js';

const baseUrl = () => config.siteUrl || config.business?.website || config.clientUrl || 'http://localhost:5173';

const applyAvailability = async (products) => {
  if (!products.length) return products;
  const ids = products.map((p) => p._id);
  const counts = await VoucherCode.aggregate([
    { $match: { productId: { $in: ids }, status: 'AVAILABLE' } },
    { $group: { _id: '$productId', total: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(counts.map((c) => [c._id.toString(), c.total]));
  return products.map((p) => {
    const raw = typeof p.toObject === 'function' ? p.toObject() : p;
    const avail = map[raw._id.toString()] || 0;
    const threshold = raw.lowStockThreshold || 10;
    const stockStatus = avail > threshold ? 'IN STOCK' : avail > 0 ? 'LOW STOCK' : 'OUT OF STOCK';
    const inStock = avail > 0;
    const savings = Math.max(0, (raw.originalPrice || 0) - (raw.sellingPrice || 0));
    return {
      ...raw,
      availability: avail,
      availableStock: avail,
      inStock,
      stockStatus,
      discountedPrice: raw.sellingPrice,
      savings,
    };
  });
};

const buildProductJsonLd = (product) => {
  if (!product) return null;
  const base = baseUrl().replace(/\/$/, '');
  const price = product.sellingPrice || product.discountedPrice || 0;
  const availability = product.inStock && (product.availableStock == null || product.availableStock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.seo?.description || product.seoDescription || product.description || product.shortDescription || '',
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

export const listProducts = async (req, res, next) => {
  try {
    const { category, brand, provider, featured, search, all } = req.query;
    const filter = all === '1' ? {} : { active: true };
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (provider) filter.provider = provider;
    if (featured) filter.featured = featured === '1';
    if (search) {
      const s = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: s }, { brand: s }, { provider: s }, { category: s }];
    }

    const products = await Product.find(filter).sort({ displayOrder: 1, featured: -1, createdAt: -1 }).lean();
    const hydrated = await applyAvailability(products);
    res.json({ success: true, count: hydrated.length, data: hydrated });
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product = null;
    if (isValidObjectId(id)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ slug: String(id).toLowerCase() });
    }
    if (!product) {
      const asPath = `/exam-vouchers/${String(id).toLowerCase()}`;
      const redirect = await Redirect.findOne({ sourcePath: asPath, enabled: true }).lean();
      if (redirect) {
        await Redirect.findByIdAndUpdate(redirect._id, { $inc: { hits: 1 }, $set: { lastHitAt: new Date() } }).catch(() => {});
        const newSlug = redirect.targetPath.split('/').pop();
        if (newSlug) {
          product = await Product.findOne({ slug: newSlug });
        }
      }
    }
    if (!product || (!product.active && req.user?.role !== 'admin')) {
      return next(new AppError('Product not found', 404, 'NOT_FOUND'));
    }
    const hydrated = (await applyAvailability([product]))[0];

    let related = [];
    if (hydrated.relatedProducts && hydrated.relatedProducts.length > 0) {
      const rel = await Product.find({ _id: { $in: hydrated.relatedProducts }, active: true }).select('name slug brand provider image sellingPrice originalPrice badge badgeType seo featured').lean();
      related = await applyAvailability(rel);
    } else if (hydrated.brand || hydrated.provider) {
      const rel = await Product.find({
        _id: { $ne: hydrated._id },
        active: true,
        $or: [{ brand: hydrated.brand }, { provider: hydrated.provider }, { category: hydrated.category }],
      }).select('name slug brand provider image sellingPrice originalPrice badge badgeType seo featured').sort({ featured: -1, displayOrder: 1 }).limit(4).lean();
      related = await applyAvailability(rel);
    }

    const jsonLd = buildProductJsonLd(hydrated);

    const breadcrumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl().replace(/\/$/, '')}/` },
        { '@type': 'ListItem', position: 2, name: 'Exam Vouchers', item: `${baseUrl().replace(/\/$/, '')}/#vouchers` },
        { '@type': 'ListItem', position: 3, name: hydrated.name },
      ],
    };

    res.json({
      success: true,
      data: hydrated,
      relatedProducts: related,
      structuredData: {
        product: jsonLd,
        breadcrumb: breadcrumbJsonLd,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getWebsiteConfig = async (req, res, next) => {
  try {
    const now = new Date();

    await Campaign.updateMany(
      { endDate: { $lt: now }, status: { $in: ['ACTIVE', 'SCHEDULED'] } },
      { $set: { status: 'EXPIRED' } }
    ).catch(() => {});

    const activeCampaigns = await Campaign.find({
      status: { $in: ['ACTIVE', 'SCHEDULED'] },
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ priority: -1, createdAt: -1 })
      .populate('applicableProducts', 'name brand sellingPrice originalPrice')
      .lean();

    const activeCampaign = activeCampaigns.length > 0 ? activeCampaigns[0] : null;

    const heroSettingDoc = await Setting.findOne({ key: 'heroSettings' }).lean();
    const announcementDoc = await Setting.findOne({ key: 'announcementSettings' }).lean();
    const benefitCardsDoc = await Setting.findOne({ key: 'benefitCards' }).lean();
    const footerDoc = await Setting.findOne({ key: 'footerSettings' }).lean();
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

    const heroSettings = heroSettingDoc?.value || {
      headingLine1: 'Your Exam. Your Dream.',
      headingHighlight: 'Our Vouchers.',
      headingLine3: 'Your Savings.',
      descriptionText: 'Get official voucher codes for PTE, IELTS, TOEFL & Duolingo at the best prices and save more on your exam fees.',
      ctaText: 'Browse Vouchers',
      ctaLink: '/#vouchers',
    };

    const announcementSettings = announcementDoc?.value || {
      enabled: true,
      text: '⚡ Instant Voucher Delivery in 10s • 100% Genuine Official Vouchers',
      link: '/#vouchers',
      overrideWithCampaign: true,
    };

    const benefitCards = benefitCardsDoc?.value || [
      { id: 1, title: 'Best Prices', sub: 'Guaranteed', icon: '🏷️' },
      { id: 2, title: 'Instant Delivery', sub: 'in 10 Seconds', icon: '⚡' },
      { id: 3, title: '100% Official', sub: 'Vouchers', icon: '🛡️' },
      { id: 4, title: 'Secure Payments', sub: '& Safe Checkout', icon: '🔒' },
    ];

    const footerSettings = footerDoc?.value || {
      description: 'Apex Vouchers helps candidates save on official exam voucher fees for PTE, IELTS, TOEFL and Duolingo with 100% genuine guaranteed vouchers.',
      phone: '+91 9855926113',
      email: 'apexvouchers@gmail.com',
      copyright: '© 2026 Apex Vouchers. All rights reserved.',
      usefulLinks: [
        { label: 'About Us', url: '/#about' },
        { label: 'Exam Vouchers', url: '/#vouchers' },
        { label: 'How It Works', url: '/#how-it-works' },
        { label: 'FAQ', url: '/#faq' },
        { label: 'Privacy Policy', url: '/#privacy' },
        { label: 'Terms of Service', url: '/#terms' },
      ],
    };

    const globalSEO = {
      websiteName: siteName?.value || 'Apex Vouchers',
      defaultSeoTitle: defaultTitle?.value || 'Exam Vouchers at Best Prices | PTE, IELTS, TOEFL & Duolingo | Apex Vouchers',
      defaultMetaDescription: defaultDesc?.value || 'Buy official exam vouchers for PTE, IELTS, TOEFL and Duolingo at competitive prices. Save on exam fees with Apex Vouchers.',
      defaultOgImage: defaultOgImage?.value || '',
      websiteUrl: siteUrl?.value || baseUrl(),
      organizationName: orgName?.value || 'Apex Vouchers',
      organizationLogo: orgLogo?.value || '',
      gscVerificationCode: gscCode?.value || '',
      gaMeasurementId: gaId?.value || '',
    };

    const orgJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: globalSEO.organizationName,
      url: globalSEO.websiteUrl,
      logo: globalSEO.organizationLogo || undefined,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'apexvouchers@gmail.com',
        telephone: '+91 9855926113',
        areaServed: 'IN',
      },
      sameAs: [],
    };

    const websiteJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: globalSEO.websiteName,
      url: globalSEO.websiteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${globalSEO.websiteUrl}/#vouchers?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };

    const products = await Product.find({ active: true })
      .sort({ displayOrder: 1, featured: -1, createdAt: -1 })
      .lean();
    const hydratedProducts = await applyAvailability(products);

    res.json({
      success: true,
      activeCampaign,
      heroSettings,
      announcementSettings,
      benefitCards,
      footerSettings,
      globalSEO,
      structuredData: {
        organization: orgJsonLd,
        website: websiteJsonLd,
      },
      products: hydratedProducts,
    });
  } catch (err) {
    next(err);
  }
};
