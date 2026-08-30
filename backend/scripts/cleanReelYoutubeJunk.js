import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Video } from '../models/Video.js';

/**
 * Clear stale / non-YouTube `youtubeEmbed` values from reels that are actually
 * backed by a Cloudinary video.
 *
 * Background: several reels had a `youtubeEmbed` pointing at an unrelated
 * YouTube clip (or a broken localhost path) even though the reel has a valid
 * `cloudinaryPublicId`. With the frontend now always preferring Cloudinary,
 * that field is dead data — this removes it so the admin form and API stop
 * carrying the misleading value. Reels with NO Cloudinary id are left alone
 * (a genuine YouTube-only reel keeps its embed).
 *
 *   node scripts/cleanReelYoutubeJunk.js           # DRY RUN — list what would change
 *   node scripts/cleanReelYoutubeJunk.js --apply   # execute
 */

const APPLY = process.argv.includes('--apply');
const isRealYouTube = (u = '') => /^https?:\/\/(?:www\.)?(?:youtube(?:-nocookie)?\.com|youtu\.be)\//i.test(u);

const run = async () => {
  console.log(`\n=== CLEAN REEL youtubeEmbed JUNK — ${APPLY ? 'APPLY' : 'DRY RUN'} ===\n`);
  await connectDB();

  const reels = await Video.find({
    cloudinaryPublicId: { $nin: [null, ''] },
    youtubeEmbed: { $nin: [null, ''] },
  }).lean();

  if (!reels.length) {
    console.log('Nothing to clean — no Cloudinary-backed reel carries a youtubeEmbed value.');
    await mongoose.disconnect();
    process.exit(0);
  }

  for (const r of reels) {
    const label = isRealYouTube(r.youtubeEmbed) ? 'redundant YouTube embed' : 'invalid / non-YouTube value';
    console.log(`  ${r._id}  "${r.title}"`);
    console.log(`     cloudinaryPublicId = ${JSON.stringify(r.cloudinaryPublicId)}  (media source — kept)`);
    console.log(`     youtubeEmbed       = ${JSON.stringify(r.youtubeEmbed)}  → cleared (${label})`);
  }

  if (!APPLY) {
    console.log(`\n${reels.length} reel(s) would be updated. Re-run with --apply.\n`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const res = await Video.updateMany(
    { _id: { $in: reels.map((r) => r._id) } },
    { $set: { youtubeEmbed: '' } }
  );
  console.log(`\n[apply] cleared youtubeEmbed on ${res.modifiedCount} reel(s).`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(async (err) => {
  console.error('[cleanReelYoutubeJunk] FAILED:', err.message);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
