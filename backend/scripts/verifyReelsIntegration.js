import mongoose from 'mongoose';
import { Video, Reel } from '../models/Video.js';
import {
  buildDirectVideoUrl,
  buildVideoThumbnailUrl,
  extractPublicId,
  isCloudinaryConfigured,
} from '../services/cloudinaryService.js';
import { config } from '../config/index.js';

async function runVerification() {
  console.log('[test] Starting Cloudinary Reels Verification...');

  // 1. Cloudinary Service Unit Tests
  console.log('[test] 1. Testing Cloudinary URL builder helpers...');
  const directMp4 = buildDirectVideoUrl('v1');
  if (directMp4 !== 'https://res.cloudinary.com/nbcbpuql/video/upload/v1.mp4') {
    throw new Error(`Direct video URL mismatch: ${directMp4}`);
  }
  console.log('  ✓ buildDirectVideoUrl: OK (' + directMp4 + ')');

  const directPoster = buildVideoThumbnailUrl('v1');
  if (directPoster !== 'https://res.cloudinary.com/nbcbpuql/video/upload/so_0/v1.jpg') {
    throw new Error(`Direct poster URL mismatch: ${directPoster}`);
  }
  console.log('  ✓ buildVideoThumbnailUrl: OK (' + directPoster + ')');

  const ext1 = extractPublicId('https://res.cloudinary.com/nbcbpuql/video/upload/v2.mp4');
  if (ext1 !== 'v2') throw new Error(`extractPublicId mismatch for direct MP4: ${ext1}`);

  const ext2 = extractPublicId('v3');
  if (ext2 !== 'v3') throw new Error(`extractPublicId mismatch for raw ID: ${ext2}`);
  console.log('  ✓ extractPublicId: OK');

  // 2. Database Connection & Model Tests
  console.log('[test] 2. Connecting to MongoDB & testing models...');
  await mongoose.connect(config.mongodbUri);
  console.log('  ✓ MongoDB connected');

  const reels = await Reel.find({}).sort({ order: 1 });
  console.log(`  ✓ Found ${reels.length} total reels in DB`);

  if (reels.length < 5) {
    throw new Error(`Expected at least 5 seeded reels, found ${reels.length}`);
  }

  // Verify all 5 Cloudinary IDs exist
  for (let i = 1; i <= 5; i++) {
    const r = reels.find((x) => x.cloudinaryPublicId === `v${i}`);
    if (!r) throw new Error(`Missing seeded reel with Cloudinary ID v${i}`);
    if (!r.videoUrl || !r.videoUrl.includes(`v${i}.mp4`)) {
      throw new Error(`Reel v${i} videoUrl invalid: ${r.videoUrl}`);
    }
    if (r.order == null) throw new Error(`Reel v${i} missing order`);
    if (r.isActive !== true) throw new Error(`Reel v${i} is not active`);
    console.log(`  ✓ Verified Reel v${i}: "${r.title}" (order=${r.order}, views=${r.views}, active=${r.isActive})`);
  }

  // 3. Test Field Aliases Synchronization Hook
  console.log('[test] 3. Testing Mongoose pre-save bidirectional alias synchronization...');
  const testReel = new Reel({
    title: 'Test Verification Reel',
    cloudinaryPublicId: 'v1',
    order: 99,
    isActive: true,
    views: 50,
  });
  await testReel.validate();

  if (testReel.displayOrder !== 99) throw new Error(`Alias displayOrder mismatch: ${testReel.displayOrder}`);
  if (testReel.published !== true) throw new Error(`Alias published mismatch: ${testReel.published}`);
  if (testReel.viewsCount !== 50) throw new Error(`Alias viewsCount mismatch: ${testReel.viewsCount}`);
  if (!testReel.videoUrl || !testReel.videoUrl.includes('v1.mp4')) {
    throw new Error(`Auto-generated videoUrl mismatch: ${testReel.videoUrl}`);
  }
  console.log('  ✓ Pre-validate synchronization hooks verified');

  await mongoose.disconnect();
  console.log('\n[test] ALL VERIFICATION CHECKS PASSED SUCCESSFULLY! 🎉\n');
}

runVerification().catch((err) => {
  console.error('[test] Verification FAILED:', err);
  process.exit(1);
});
