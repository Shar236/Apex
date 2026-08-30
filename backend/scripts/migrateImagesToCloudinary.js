import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import { config } from '../config/index.js';
import {
  uploadImage,
  isCloudinaryUrl,
  isCloudinaryConfigured,
} from '../services/cloudinaryService.js';
import { Product, BlogPost, Award, Setting } from '../models/index.js';

/**
 * migrateImagesToCloudinary
 * ─────────────────────────
 * Moves existing website/content images (local files + non-Cloudinary URLs
 * stored in the database) onto Cloudinary, safely and idempotently.
 *
 *   node scripts/migrateImagesToCloudinary.js                → DRY RUN (report only)
 *   node scripts/migrateImagesToCloudinary.js --upload       → upload assets to Cloudinary, refresh the map
 *   node scripts/migrateImagesToCloudinary.js --upload --commit
 *                                                            → also rewrite DB image fields
 *   node scripts/migrateImagesToCloudinary.js --upload --public-map
 *                                                            → also (re)generate frontend/src/lib/imageMap.js
 *
 * GUARANTEES
 *  - Never deletes a local file or a Cloudinary asset.
 *  - Never touches a non-image field. Orders / payments / users are not read.
 *  - Deterministic public_id per source → re-running overwrites in place,
 *    never creates duplicate Cloudinary copies.
 *  - Anything already on Cloudinary is skipped.
 *  - A persistent map (scripts/.cloudinary-migration-map.json) records
 *    oldPath → { publicId, url, ... } so partial runs resume cleanly.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const BACKEND_ROOT = path.resolve(__dirname, '..');
const MAP_PATH = path.join(__dirname, '.cloudinary-migration-map.json');
const IMAGE_MAP_JS = path.join(REPO_ROOT, 'frontend/src/lib/imageMap.js');

const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;

const args = process.argv.slice(2);
const FLAG = {
  upload: args.includes('--upload'),
  commit: args.includes('--commit'),
  publicMap: args.includes('--public-map'),
  help: args.includes('--help') || args.includes('-h'),
};

const report = {
  found: 0,
  alreadyCloudinary: 0,
  alreadyMapped: 0,
  uploaded: 0,
  skipped: 0,
  failed: 0,
  dbUpdates: 0,
  manual: [],
};

// ── persistent mapping ──────────────────────────────────────────────────────
let map = {};
const loadMap = () => {
  try {
    map = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
  } catch {
    map = {};
  }
};
const saveMap = () => {
  fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2) + '\n');
};

// Sanitize a source reference into a stable, folder-scoped public_id so a
// second run overwrites the same asset instead of creating a copy.
const publicIdFor = (folder, ref) => {
  const base = path
    .basename(String(ref).split('?')[0])
    .replace(IMAGE_EXT, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'asset';
  return `${folder}/${base}`;
};

/**
 * Resolve one source (local path or URL) to a Cloudinary descriptor.
 * Returns { url, publicId, ... } or null. Honours dry-run and the cached map.
 */
const migrateOne = async (ref, folder, { label } = {}) => {
  if (!ref || typeof ref !== 'string') return null;
  const src = ref.trim();
  if (!src) return null;

  if (isCloudinaryUrl(src)) {
    report.alreadyCloudinary += 1;
    return null;
  }

  report.found += 1;

  if (map[src]?.url) {
    report.alreadyMapped += 1;
    return map[src];
  }

  // Locate the bytes.
  let buffer = null;
  if (/^https?:\/\//i.test(src)) {
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      buffer = Buffer.from(await res.arrayBuffer());
    } catch (err) {
      report.failed += 1;
      report.manual.push(`${label || src} — could not fetch remote URL (${err.message})`);
      return null;
    }
  } else {
    // Local reference. Try common roots for a leading-slash path.
    const candidates = src.startsWith('/')
      ? [
          path.join(REPO_ROOT, 'frontend/public', src),
          path.join(BACKEND_ROOT, 'public', src),
          path.join(REPO_ROOT, 'frontend/public/images', src.replace(/^\/images/, '')),
        ]
      : [path.resolve(src)];
    const hit = candidates.find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
    if (!hit) {
      report.failed += 1;
      report.manual.push(`${label || src} — local file not found (looked in ${candidates.join(', ')})`);
      return null;
    }
    buffer = fs.readFileSync(hit);
  }

  if (!FLAG.upload) {
    report.skipped += 1;
    console.log(`  would upload  ${label || src}  →  ${folder}/`);
    return null;
  }

  try {
    const result = await uploadImage(buffer, {
      folder,
      publicId: publicIdFor(folder, src),
      overwrite: true,
    });
    map[src] = { ...result, source: src, folder, migratedAt: new Date().toISOString() };
    saveMap();
    report.uploaded += 1;
    console.log(`  uploaded      ${label || src}  →  ${result.publicId}`);
    return map[src];
  } catch (err) {
    report.failed += 1;
    report.manual.push(`${label || src} — upload failed (${err.message})`);
    return null;
  }
};

// ── filesystem discovery ────────────────────────────────────────────────────
const walk = (dir, acc = []) => {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (IMAGE_EXT.test(entry.name)) acc.push(full);
  }
  return acc;
};

const migrateFilesystem = async () => {
  console.log('\n▸ Filesystem: frontend/public');
  const publicDir = path.join(REPO_ROOT, 'frontend/public');
  for (const file of walk(publicDir)) {
    const rel = '/' + path.relative(publicDir, file).split(path.sep).join('/');
    let folder = 'apex_general';
    if (rel.startsWith('/images/blogs/covers/')) folder = 'apex_blog/featured';
    else if (rel.startsWith('/images/blogs/')) folder = `apex_blog/articles/${rel.split('/')[3] || 'general'}`;
    await migrateOne(rel, folder, { label: `public${rel}` });
  }

  console.log('\n▸ Filesystem: backend/public/uploads');
  for (const file of walk(path.join(BACKEND_ROOT, 'public/uploads'))) {
    const rel = '/uploads/' + path.relative(path.join(BACKEND_ROOT, 'public/uploads'), file).split(path.sep).join('/');
    await migrateOne(rel, 'apex_general/uploads', { label: `backend${rel}` });
  }
};

// ── database discovery ──────────────────────────────────────────────────────
const migrateProducts = async () => {
  console.log('\n▸ Database: products');
  const products = await Product.find({}).lean();
  for (const p of products) {
    const updates = {};
    for (const [field, folder, pubField] of [
      ['image', 'apex_products/images', 'imagePublicId'],
      ['logo', 'apex_products/logos', 'logoPublicId'],
    ]) {
      const res = await migrateOne(p[field], folder, { label: `Product "${p.name}".${field}` });
      if (res && FLAG.commit) {
        updates[field] = res.url;
        updates[pubField] = res.publicId;
      }
    }
    if (Object.keys(updates).length) {
      await Product.updateOne({ _id: p._id }, { $set: updates });
      report.dbUpdates += 1;
      console.log(`  db update     Product "${p.name}"`);
    }
  }
};

const migrateBlogPosts = async () => {
  console.log('\n▸ Database: blog posts');
  const posts = await BlogPost.find({}).lean();
  for (const post of posts) {
    const set = {};

    const cover = await migrateOne(post.coverImage, 'apex_blog/featured', {
      label: `BlogPost "${post.slug}".coverImage`,
    });
    if (cover && FLAG.commit) {
      set.coverImage = cover.url;
      set.coverImagePublicId = cover.publicId;
    }

    const authorImg = await migrateOne(post.authorImage, 'apex_blog/authors', {
      label: `BlogPost "${post.slug}".authorImage`,
    });
    if (authorImg && FLAG.commit) set.authorImage = authorImg.url;

    if (Array.isArray(post.images) && post.images.length) {
      const nextImages = [];
      let changed = false;
      for (const img of post.images) {
        const folder = `apex_blog/articles/${post.slug}`;
        const res = await migrateOne(img.url, folder, {
          label: `BlogPost "${post.slug}".images[${img.filename || img._id}]`,
        });
        if (res && FLAG.commit) {
          nextImages.push({ ...img, url: res.url, publicId: res.publicId });
          changed = true;
        } else {
          nextImages.push(img);
        }
      }
      if (changed) set.images = nextImages;
    }

    if (Object.keys(set).length) {
      await BlogPost.updateOne({ _id: post._id }, { $set: set });
      report.dbUpdates += 1;
      console.log(`  db update     BlogPost "${post.slug}"`);
    }
  }
};

const migrateAwards = async () => {
  console.log('\n▸ Database: awards');
  if (!Award) return;
  const awards = await Award.find({}).lean();
  for (const a of awards) {
    const res = await migrateOne(a.imageUrl, 'apex_awards/images', {
      label: `Award "${a.title || a._id}".imageUrl`,
    });
    if (res && FLAG.commit) {
      await Award.updateOne(
        { _id: a._id },
        { $set: { imageUrl: res.url, imagePublicId: res.publicId } }
      );
      report.dbUpdates += 1;
      console.log(`  db update     Award "${a.title || a._id}"`);
    }
  }
};

const migrateSettings = async () => {
  console.log('\n▸ Database: settings (SEO images)');
  for (const key of ['seo_orgLogo', 'seo_defaultOgImage']) {
    const doc = await Setting.findOne({ key }).lean();
    if (!doc?.value) continue;
    const res = await migrateOne(doc.value, 'apex_general', { label: `Setting ${key}` });
    if (res && FLAG.commit) {
      await Setting.updateOne({ key }, { $set: { value: res.url } });
      report.dbUpdates += 1;
      console.log(`  db update     Setting ${key}`);
    }
  }
};

// ── frontend imageMap.js generation ─────────────────────────────────────────
const writeImageMapJs = () => {
  const entries = Object.entries(map)
    .filter(([src]) => src.startsWith('/') && !src.startsWith('/uploads/'))
    .map(([src, v]) => `  ${JSON.stringify(src)}: ${JSON.stringify(v.url)},`)
    .join('\n');

  const contents = `/**
 * Legacy local image path -> Cloudinary delivery URL.
 *
 * GENERATED by backend/scripts/migrateImagesToCloudinary.js --public-map.
 * Safe to edit by hand; re-running the script with --public-map regenerates it.
 * \`imageUrl()\` falls back to the original local path for any key not listed.
 */
export const imageMap = {
${entries}
};

export default imageMap;
`;
  fs.writeFileSync(IMAGE_MAP_JS, contents);
  console.log(`\n▸ Wrote ${path.relative(REPO_ROOT, IMAGE_MAP_JS)} (${Object.keys(map).length ? entries.split('\n').filter(Boolean).length : 0} entries)`);
};

// ── main ────────────────────────────────────────────────────────────────────
const printHelp = () => {
  console.log(`
migrateImagesToCloudinary — move existing content images onto Cloudinary

  npm run migrate:images                       dry run: report only, no uploads, no DB writes
  npm run migrate:images -- --upload           upload assets to Cloudinary, refresh the migration map
  npm run migrate:images -- --upload --commit  also rewrite DB image fields (Product/BlogPost/Award/Setting)
  npm run migrate:images -- --upload --public-map
                                               also (re)generate frontend/src/lib/imageMap.js

Guarantees: never deletes a local file or a Cloudinary asset; never touches a
non-image field; deterministic public_id per source (safe to re-run); anything
already on Cloudinary is skipped. Map: scripts/.cloudinary-migration-map.json
`);
};

const run = async () => {
  if (FLAG.help) return printHelp();

  console.log('═'.repeat(70));
  console.log(' Cloudinary image migration');
  console.log(`   mode:   ${FLAG.upload ? 'UPLOAD' : 'DRY RUN (no uploads)'}`);
  console.log(`   db:     ${FLAG.commit ? 'WILL rewrite image fields' : 'read-only'}`);
  console.log(`   cloud:  ${isCloudinaryConfigured() ? config.cloudinary.cloudName : 'NOT CONFIGURED'}`);
  console.log('═'.repeat(70));

  if (FLAG.upload && !isCloudinaryConfigured()) {
    console.error('\n✗ CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET must be set to --upload. Aborting.');
    process.exit(1);
  }

  loadMap();
  await connectDB();

  await migrateFilesystem();
  await migrateProducts();
  await migrateBlogPosts();
  await migrateAwards();
  await migrateSettings();

  if (FLAG.upload) saveMap();
  if (FLAG.publicMap) writeImageMapJs();

  console.log('\n' + '─'.repeat(70));
  console.log(' MIGRATION REPORT');
  console.log('─'.repeat(70));
  console.log(`  non-Cloudinary refs found:      ${report.found}`);
  console.log(`  already on Cloudinary:          ${report.alreadyCloudinary}`);
  console.log(`  already in migration map:       ${report.alreadyMapped}`);
  console.log(`  uploaded this run:              ${report.uploaded}`);
  console.log(`  would upload (dry run):         ${report.skipped}`);
  console.log(`  failed:                         ${report.failed}`);
  console.log(`  database records updated:       ${report.dbUpdates}`);
  console.log(`  map file:                       ${path.relative(REPO_ROOT, MAP_PATH)}`);
  if (report.manual.length) {
    console.log('\n  NEEDS MANUAL ATTENTION:');
    for (const m of report.manual) console.log(`   - ${m}`);
  }
  if (!FLAG.upload) {
    console.log('\n  This was a DRY RUN. Re-run with --upload to push assets, then');
    console.log('  add --commit to rewrite DB fields and --public-map for imageMap.js.');
  }
  console.log('─'.repeat(70));

  process.exit(report.failed > 0 ? 1 : 0);
};

run().catch((err) => {
  console.error('\n✗ Migration crashed:', err);
  process.exit(1);
});
