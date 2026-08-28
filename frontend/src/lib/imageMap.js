/**
 * Legacy local image path -> Cloudinary delivery URL.
 *
 * Populated by `backend/scripts/migrateImagesToCloudinary.js --public-map` after
 * the content images in `frontend/public/` are uploaded to Cloudinary. Until an
 * entry exists here, `imageUrl()` falls back to the original local path, so the
 * site keeps working before and during migration.
 *
 * Keys are the exact `src` strings used in components (leading slash, as served
 * from `frontend/public/`). Only website/content images belong here — never
 * icons, the favicon, or small UI SVGs.
 */
export const imageMap = {
  // '/apex_hero_student_3d.png': 'https://res.cloudinary.com/nbcbpuql/image/upload/v1/apex_general/apex_hero_student_3d.png',
  // '/pte-academic-illustration.jpg': '...',
  // '/pte-core-illustration.jpg': '...',
  // '/pte-ukvi-illustration.jpg': '...',
};

export default imageMap;
