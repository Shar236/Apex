/**
 * Legacy local-path / bare-id → Cloudinary URL aliases carried over from the
 * Vite app (frontend/src/lib/imageMap.js) so existing CMS/DB image references
 * using these short ids keep resolving after the migration.
 */
export const imageMap: Record<string, string> = {
  'pte-academic': 'https://res.cloudinary.com/nbcbpuql/image/upload/pte-academic',
  'pte-core': 'https://res.cloudinary.com/nbcbpuql/image/upload/pte-core',
  'pte-academic-ukvi': 'https://res.cloudinary.com/nbcbpuql/image/upload/pte-academic-ukvi',
  ukvi: 'https://res.cloudinary.com/nbcbpuql/image/upload/pte-academic-ukvi',
  'pte-ukvi': 'https://res.cloudinary.com/nbcbpuql/image/upload/pte-academic-ukvi',
  'PTE Academic UKVI': 'https://res.cloudinary.com/nbcbpuql/image/upload/pte-academic-ukvi',

  '/pte-academic-illustration.jpg': 'https://res.cloudinary.com/nbcbpuql/image/upload/pte-academic',
  '/pte-core-illustration.jpg': 'https://res.cloudinary.com/nbcbpuql/image/upload/pte-core',
  '/pte-ukvi-illustration.jpg': 'https://res.cloudinary.com/nbcbpuql/image/upload/pte-academic-ukvi',

  '/apex_hero_student_3d.png': 'https://res.cloudinary.com/nbcbpuql/image/upload/apex_general/apex_hero_student_3d.png',
  'apex_hero_student_3d.png': 'https://res.cloudinary.com/nbcbpuql/image/upload/apex_general/apex_hero_student_3d.png',
};
