/**
 * Migrate blog cover images to Cloudinary.
 *
 * 1. For every post whose coverImage is a LOCAL path (e.g. /images/blogs/covers/*.webp):
 *    - upload the matching file from web/public into Cloudinary folder apex_blog/covers
 *    - update coverImage (optimized URL) + coverImagePublicId
 * 2. For posts whose coverImage is local but coverImagePublicId is ALREADY set
 *    (e.g. PTE Australia — asset uploaded, URL stale): fix coverImage from the
 *    existing publicId WITHOUT re-uploading.
 * 3. Idempotent: posts already pointing at a Cloudinary cover are skipped.
 *
 * Existing Cloudinary assets are reused, never duplicated.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { BlogPost } from '../models/index.js';
import { connectDB } from '../config/db.js';
import { uploadBufferToCloudinary, buildOptimizedImageUrl } from '../services/cloudinaryService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../');
const WEB_PUBLIC = path.join(REPO_ROOT, 'web', 'public');
const COVERS_DIR = path.join(WEB_PUBLIC, 'images', 'blogs', 'covers');

// slug → local cover file (relative to web/public/images/blogs/covers/)
const SLUG_TO_FILE = {
  'toefl-dates-test-centres-india-2026': 'toefl-dates-hero.webp',
  'duolingo-english-test-syllabus-2026': 'duolingo-syllabus-hero.webp',
  'ielts-band-score-chart-2026': 'ielts-band-chart-hero.webp',
  'ielts-score-uk-2026': 'ielts-uk-score-hero.webp',
  'ielts-score-usa-2026': 'ielts-usa-score-hero.webp',
};

// Code-article static images bundled in the repo under web/public/images/blogs/<slug>/
// → uploaded once to Cloudinary (apex_blog/articles/<slug>/<key>) and mapped in
// web/lib/image-map.ts so the code articles' local fallback paths resolve to CDN.
const ARTICLE_IMAGES = [
  { dir: 'ielts-canada', key: 'hero', file: 'hero.webp' },
  { dir: 'ielts-canada', key: 'ielts-clb-chart', file: 'ielts-clb-chart.webp' },
  { dir: 'ielts-canada', key: 'canada-pr-score', file: 'canada-pr-score.webp' },
  { dir: 'ielts-canada', key: 'express-entry', file: 'express-entry.webp' },
  { dir: 'pte-tests-comparison', key: 'hero', file: 'hero.webp' },
  { dir: 'pte-tests-comparison', key: 'pte-tests-comparison-chart', file: 'pte-tests-comparison-chart.webp' },
  { dir: 'pte-tests-comparison', key: 'pte-decision-flowchart', file: 'pte-decision-flowchart.webp' },
];

const isCloudinaryUrl = (value) =>
  typeof value === 'string' && value.includes('res.cloudinary.com') && value.includes('/upload/');

async function run() {
  await connectDB();
  const posts = await BlogPost.find({}).select('title slug coverImage coverImagePublicId status').lean();

  let uploaded = 0;
  let fixedFromPublicId = 0;
  let skippedCloudinary = 0;
  let missingFile = 0;
  const failures = [];

  // ── Phase 2: code-article static images → Cloudinary ────────────────────
  console.log('\n=== Phase 2: code-article images → Cloudinary ===');
  for (const art of ARTICLE_IMAGES) {
    const filePath = path.join(WEB_PUBLIC, 'images', 'blogs', art.dir, art.file);
    if (!fs.existsSync(filePath)) {
      console.log(`[warn] missing article image: ${art.dir}/${art.file}`);
      continue;
    }
    try {
      const buffer = fs.readFileSync(filePath);
      const cloudRes = await uploadBufferToCloudinary(buffer, {
        resource_type: 'image',
        folder: `apex_blog/articles/${art.dir}`,
        public_id: art.key,
        overwrite: true,
        invalidate: true,
      });
      console.log(
        `[upload] /images/blogs/${art.dir}/${art.file} → ${cloudRes.public_id} | IMAGE_MAP: '/images/blogs/${art.dir}/${art.file}': '${cloudRes.secure_url}'`
      );
      uploaded++;
    } catch (err) {
      failures.push({ file: art.file, error: err.message });
      console.error(`[error] ${art.file}: ${err.message}`);
    }
  }

  // ── Phase 1: blog cover images → Cloudinary ─────────────────────────────
  console.log('\n=== Phase 1: blog covers → Cloudinary ===');
  for (const post of posts) {
    const cover = post.coverImage || '';
    const publicId = post.coverImagePublicId || '';

    // Already Cloudinary-backed → nothing to do.
    if (isCloudinaryUrl(cover)) {
      skippedCloudinary++;
      console.log(`[skip] ${post.slug} — cover already on Cloudinary`);
      continue;
    }

    // Cover local but a publicId already exists → fix the URL from the publicId.
    if (publicId && !isCloudinaryUrl(cover)) {
      const fixedUrl = buildOptimizedImageUrl(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'nbcbpuql'}/image/upload/${publicId}`);
      await BlogPost.updateOne({ _id: post._id }, { $set: { coverImage: fixedUrl } });
      fixedFromPublicId++;
      console.log(`[fix] ${post.slug} — coverImage set from existing publicId ${publicId}`);
      continue;
    }

    // Local cover + no publicId → upload the file.
    const file = SLUG_TO_FILE[post.slug];
    const filePath = file ? path.join(COVERS_DIR, file) : null;
    if (!filePath || !fs.existsSync(filePath)) {
      missingFile++;
      console.log(`[warn] ${post.slug} — no local cover file mapped (cover=${cover})`);
      continue;
    }

    try {
      const buffer = fs.readFileSync(filePath);
      const cloudRes = await uploadBufferToCloudinary(buffer, {
        resource_type: 'image',
        folder: 'apex_blog/covers',
        public_id: post.slug, // folder is prefixed by Cloudinary → apex_blog/covers/<slug>
        overwrite: true,
        invalidate: true,
      });
      const secureUrl = buildOptimizedImageUrl(cloudRes.secure_url);
      await BlogPost.updateOne(
        { _id: post._id },
        {
          $set: {
            coverImage: secureUrl,
            coverImagePublicId: cloudRes.public_id,
          },
        }
      );
      uploaded++;
      console.log(`[upload] ${post.slug} → ${cloudRes.public_id} (${buffer.length} bytes)`);
    } catch (err) {
      failures.push({ slug: post.slug, error: err.message });
      console.error(`[error] ${post.slug}: ${err.message}`);
    }
  }

  console.log('\n=== Migration summary ===');
  console.log('uploaded:', uploaded);
  console.log('fixed from existing publicId:', fixedFromPublicId);
  console.log('already on Cloudinary (skipped):', skippedCloudinary);
  console.log('no local file mapped:', missingFile);
  console.log('failures:', failures.length);
  await mongoose.disconnect();
  process.exit(failures.length ? 1 : 0);
}

run().catch((err) => {
  console.error('[migrate] fatal:', err.message);
  process.exit(1);
});
