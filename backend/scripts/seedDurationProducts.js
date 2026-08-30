/**
 * Seed APS Test + PTAI Test products with duration-based pricing variants.
 *
 * IMPORTANT: no real prices are invented here. Each duration option carries a
 * placeholder price of 1 and the products are seeded `comingSoon: true`, so they
 * render with their duration selector but CANNOT be purchased (the card shows
 * "Coming Soon" and the backend rejects comingSoon products) until the admin
 * sets real prices in Admin → Products & Pricing → the product's "Duration
 * options" section and unchecks "Coming soon". This prevents an accidental ₹1
 * sale on live Razorpay.
 *
 * Idempotent: existing products are updated (duration options refreshed), never
 * duplicated.
 */
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import { Product } from '../models/Product.js';

const DURATION_PRODUCTS = [
  {
    name: 'APS Test',
    slug: 'aps-test',
    provider: 'APS',
    brand: 'APS',
    category: 'Practice Test',
    description: 'APS (Alternate Practice Series) test with full practice access. Choose your access period below.',
    shortDescription: 'Full APS test/practice access with instant delivery.',
    originalPrice: 1,
    sellingPrice: 1,
    currency: 'INR',
    validityDays: 7,
    validityMonths: 1,
    badge: 'NEW',
    badgeEnabled: true,
    badgeType: 'new',
    rating: 4.8,
    reviewsCount: 0,
    featured: true,
    active: true,
    comingSoon: true,
    displayOrder: 2,
    deliveryType: 'Instant Delivery',
    inclusions: ['Genuine Digital Voucher', 'Fast Delivery to Email', 'Clear Redemption Instructions', 'Official Provider Redemption', 'Customer Support', 'Transparent Pricing'],
    durationOptions: [
      { key: '1-week', label: '1 Week', sellingPrice: 1, originalPrice: 1, validityDays: 7, enabled: true },
      { key: '1-month', label: '1 Month', sellingPrice: 1, originalPrice: 1, validityDays: 30, enabled: true },
      { key: '3-months', label: '3 Months', sellingPrice: 1, originalPrice: 1, validityDays: 90, enabled: true },
    ],
  },
  {
    name: 'PTAI Test',
    slug: 'ptai-test',
    provider: 'PTAI',
    brand: 'PTAI',
    category: 'Practice Test',
    description: 'PTAI (Practice Test & Assessment Interface) with full practice access. Choose your access period below.',
    shortDescription: 'Full PTAI test/practice access with instant delivery.',
    originalPrice: 1,
    sellingPrice: 1,
    currency: 'INR',
    validityDays: 7,
    validityMonths: 1,
    badge: 'NEW',
    badgeEnabled: true,
    badgeType: 'new',
    rating: 4.8,
    reviewsCount: 0,
    featured: true,
    active: true,
    comingSoon: true,
    displayOrder: 2,
    deliveryType: 'Instant Delivery',
    inclusions: ['Genuine Digital Voucher', 'Fast Delivery to Email', 'Clear Redemption Instructions', 'Official Provider Redemption', 'Customer Support', 'Transparent Pricing'],
    durationOptions: [
      { key: '1-week', label: '1 Week', sellingPrice: 1, originalPrice: 1, validityDays: 7, enabled: true },
      { key: '1-month', label: '1 Month', sellingPrice: 1, originalPrice: 1, validityDays: 30, enabled: true },
      { key: '3-months', label: '3 Months', sellingPrice: 1, originalPrice: 1, validityDays: 90, enabled: true },
    ],
  },
];

async function run() {
  await connectDB();
  for (const data of DURATION_PRODUCTS) {
    const existing = await Product.findOne({ slug: data.slug });
    if (existing) {
      await Product.updateOne({ slug: data.slug }, { $set: data });
      console.log(`[seed-duration] updated: ${data.name} (id ${existing._id})`);
    } else {
      const created = await Product.create(data);
      console.log(`[seed-duration] created: ${data.name} (id ${created._id})`);
    }
  }
  console.log('[seed-duration] done — APS Test + PTAI Test ready. Set real prices in Admin → Products & Pricing → Duration options.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed-duration] failed:', err.message);
  process.exit(1);
});
