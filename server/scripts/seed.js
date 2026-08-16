import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import { seedAdmin } from '../controllers/adminController.js';
import { Product } from '../models/Product.js';
import { VoucherCode } from '../models/VoucherCode.js';
import { hashPassword } from '../middleware/auth.js';
import { User } from '../models/User.js';

const SAMPLE_PRODUCTS = [
  {
    name: 'Pearson PTE Academic Voucher',
    provider: 'Pearson PTE',
    brand: 'Pearson PTE',
    category: 'Exam Voucher',
    description: 'Official voucher code for Pearson PTE Academic Exam. Save ₹3,401 instantly on your test booking fee with guaranteed official acceptance.',
    originalPrice: 18900,
    sellingPrice: 15499,
    currency: 'INR',
    validityMonths: 6,
    inclusions: [
      'Official 100% Genuine Pearson Voucher Code',
      '2 Scored Official Mock Tests Included (Worth ₹2,200)',
      'Instant Email + WhatsApp Delivery in 10 seconds',
      '6-Month Validity Period',
      'Free 1-Time Reschedule Guide & Exam Prep Blueprint',
    ],
    redemptionSteps: [
      'Visit mypte.pearsonpte.com and create or log in to your account.',
      'Select your preferred test center, date, and time slot.',
      'Proceed to checkout and paste your Apex Voucher code in the Voucher / Promo Code box.',
      'Confirm your appointment at ₹0 fee.',
    ],
    badge: '🔥 Best Seller',
    rating: 4.9,
    reviewsCount: 1420,
    featured: true,
    inStock: true,
    active: true,
  },
  {
    name: 'Pearson PTE Core Voucher',
    provider: 'Pearson PTE',
    brand: 'Pearson PTE',
    category: 'Exam Voucher',
    description: 'Save big on the PTE Core exam required for Canada Permanent Residency (IRCC approved). Guaranteed valid and instantly delivered.',
    originalPrice: 18900,
    sellingPrice: 15799,
    validityMonths: 6,
    badge: '🇨🇦 Canada PR Approved',
    rating: 4.8,
    reviewsCount: 680,
    featured: true,
    active: true,
    inStock: true,
  },
  {
    name: 'ETS GRE Voucher',
    provider: 'ETS GRE',
    brand: 'ETS GRE',
    category: 'Exam Voucher',
    description: 'Discounted exam voucher code for ETS GRE General Test. Accepted by top universities worldwide.',
    originalPrice: 22500,
    sellingPrice: 19799,
    validityMonths: 12,
    badge: '🎓 Grad School Top Pick',
    rating: 4.9,
    reviewsCount: 910,
    featured: true,
    active: true,
    inStock: true,
  },
  {
    name: 'ETS TOEFL Voucher',
    provider: 'ETS TOEFL',
    brand: 'ETS TOEFL',
    category: 'Exam Voucher',
    description: 'Save ₹4,001 on the TOEFL iBT test. Preferred by over 12,000 universities in 160+ countries.',
    originalPrice: 18000,
    sellingPrice: 13999,
    validityMonths: 12,
    badge: '⚡ Max Discount (22% OFF)',
    rating: 4.9,
    reviewsCount: 840,
    featured: false,
    active: true,
    inStock: true,
  },
  {
    name: 'Duolingo English Test Voucher',
    provider: 'Duolingo',
    brand: 'Duolingo',
    category: 'Exam Voucher',
    description: 'Get 18% off the fast, accessible Duolingo English Test. Complete at home in 1 hour.',
    originalPrice: 6112.5,
    sellingPrice: 4999,
    validityMonths: 3,
    badge: '🚀 Fast 48h Results',
    rating: 4.8,
    reviewsCount: 1150,
    featured: false,
    active: true,
    inStock: true,
  },
];

const generateCode = (brand) => {
  const pre = (brand || 'APEX').replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
  const rnd = (n) => Math.floor(Math.random() * 10 ** n).toString().padStart(n, '0');
  return `APX-${pre}-${rnd(4)}-${rnd(3)}`;
};

export default async function seed() {
  await connectDB();
  await seedAdmin();

  const demoUserEmail = 'demo@apexvouchers.in';
  const demoUser = await User.findOne({ email: demoUserEmail });
  if (!demoUser) {
    const u = new User({
      name: 'Demo Customer',
      email: demoUserEmail,
      phone: '+919000000000',
      passwordHash: await hashPassword('Demo@123'),
      role: 'user',
      status: 'active',
    });
    await u.save();
    console.log('[seed] demo user created:', demoUserEmail, ' / Demo@123');
  }

  for (const p of SAMPLE_PRODUCTS) {
    const exists = await Product.findOne({ name: p.name });
    let product = exists;
    if (!exists) {
      product = new Product(p);
      await product.save();
      console.log(`[seed] product created: ${product.name}`);
    }
    const count = await VoucherCode.countDocuments({ productId: product._id, status: 'AVAILABLE' });
    if (count < 25) {
      const need = 25 - count;
      const docs = [];
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + (product.validityMonths || 6));
      for (let i = 0; i < need; i++) {
        docs.push({
          code: generateCode(product.brand),
          productId: product._id,
          status: 'AVAILABLE',
          expiryDate: expiry,
        });
      }
      try {
        await VoucherCode.insertMany(docs, { ordered: false });
        console.log(`[seed] +${docs.length} voucher codes for ${product.name}`);
      } catch (err) {
        console.log('[seed] vouchers insertMany skipped (dupes)');
      }
    }
  }

  const SAMPLE_VIDEOS = [
    {
      title: "How to Buy an Exam Voucher",
      category: "Step-By-Step Guide",
      duration: "15s",
      description: "Watch how to select your exam, apply discount promo codes, and receive your voucher code in 10 seconds.",
      thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      youtubeEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0",
      viewsCount: 14200,
      featured: true,
      published: true,
      displayOrder: 1,
    },
    {
      title: "How Does a PTE Voucher Work?",
      category: "PTE Voucher",
      duration: "18s",
      description: "Official Pearson PTE Academic & Core vouchers waive off registration fees instantly at checkout.",
      thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      youtubeEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0",
      viewsCount: 22800,
      featured: false,
      published: true,
      displayOrder: 2,
    },
    {
      title: "How to Redeem Your Voucher",
      category: "Redemption Guide",
      duration: "14s",
      description: "Paste your unique voucher code in the Promo Code field on Pearson, ETS, or Duolingo portals.",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      youtubeEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0",
      viewsCount: 18500,
      featured: false,
      published: true,
      displayOrder: 3,
    },
    {
      title: "How Much Can You Save?",
      category: "Offers",
      duration: "16s",
      description: "Compare regular official exam prices vs Apex bulk discounted prices for PTE, GRE, TOEFL, and Duolingo.",
      thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoypasses.mp4",
      youtubeEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0",
      viewsCount: 31900,
      featured: false,
      published: true,
      displayOrder: 4,
    },
    {
      title: "IELTS Voucher Explained",
      category: "IELTS",
      duration: "20s",
      description: "Everything about IELTS Academic & General discount codes for IDP registration across India.",
      thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      youtubeEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0",
      viewsCount: 11700,
      featured: false,
      published: true,
      displayOrder: 5,
    },
  ];

  const { Video } = await import('../models/Video.js');
  const videoCount = await Video.countDocuments();
  if (videoCount === 0) {
    await Video.insertMany(SAMPLE_VIDEOS);
    console.log('[seed] sample videos initialized');
  }

  console.log('[seed] done');
  process.exit(0);
}

if (process.argv[1]?.endsWith('seed.js')) {
  seed().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
