import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import { Product } from '../models/Product.js';

async function normalize() {
  await connectDB();

  // 1. PTE Practice Test
  await Product.findOneAndUpdate(
    { name: { $regex: /practice test/i } },
    {
      name: 'Pearson PTE Practice Test',
      brand: 'Pearson PTE',
      provider: 'Pearson PTE',
      category: 'Practice Test',
      originalPrice: 1132.50,
      sellingPrice: 799.00,
      inStock: false,
      stockStatus: 'OUT OF STOCK',
      badge: 'Out of stock',
      active: true,
      featured: true,
      displayOrder: 1,
    }
  );

  // 2. PTE Academic
  await Product.findOneAndUpdate(
    { name: { $regex: /pte academic/i } },
    {
      name: 'Pearson PTE Academic',
      brand: 'Pearson PTE',
      provider: 'Pearson PTE',
      category: 'Exam Voucher',
      originalPrice: 18900.00,
      sellingPrice: 14999.00,
      inStock: true,
      stockStatus: 'IN STOCK',
      badge: '🔥 Best Seller',
      active: true,
      featured: true,
      displayOrder: 2,
    }
  );

  // 3. PTE Core
  await Product.findOneAndUpdate(
    { name: { $regex: /pte core/i } },
    {
      name: 'Pearson PTE Core',
      brand: 'Pearson PTE',
      provider: 'Pearson PTE',
      category: 'Exam Voucher',
      originalPrice: 18900.00,
      sellingPrice: 15799.00,
      inStock: true,
      stockStatus: 'IN STOCK',
      badge: '🇨🇦 Canada PR Approved',
      active: true,
      featured: true,
      displayOrder: 3,
    }
  );

  // 4. PTE Canada
  await Product.findOneAndUpdate(
    { name: { $regex: /pte canada/i } },
    {
      name: 'Pearson PTE Canada',
      brand: 'Pearson PTE',
      provider: 'Pearson PTE',
      category: 'Exam Voucher',
      originalPrice: 28000.00,
      sellingPrice: 25799.00,
      inStock: true,
      stockStatus: 'IN STOCK',
      badge: '🇨🇦 Express Entry',
      active: true,
      featured: true,
      displayOrder: 4,
    }
  );

  const finalProds = await Product.find({}).sort({ displayOrder: 1 }).lean();
  console.log('\n--- Final 12 Products in DB ---');
  finalProds.forEach((p) =>
    console.log(
      `[${p.displayOrder}] ${p.name} (id: ${p._id}) - Orig: ₹${p.originalPrice}, Sell: ₹${p.sellingPrice} (inStock: ${p.inStock}, featured: ${p.featured})`
    )
  );

  process.exit(0);
}

normalize().catch((err) => {
  console.error(err);
  process.exit(1);
});
