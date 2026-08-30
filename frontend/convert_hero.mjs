import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processHeroImage() {
  const inputPath = 'C:\\Users\\Sharv\\.gemini\\antigravity-ide\\brain\\94f6eb58-5693-4999-b083-bb4ee7467af8\\apex_hero_student_3d_1787229425897.jpg';
  const outPublic = path.resolve('public/apex_hero_student_3d.png');
  const outAssets = path.resolve('src/assets/daylight-hero-graphic.png');
  const outAssetsNew = path.resolve('src/assets/apex_hero_student_3d.png');

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`Image size: ${width}x${height}, channels: ${channels}`);

  // Create an output buffer
  const outBuffer = Buffer.from(data);

  // Loop through pixels and make pure/near white transparent
  for (let i = 0; i < outBuffer.length; i += 4) {
    const r = outBuffer[i];
    const g = outBuffer[i + 1];
    const b = outBuffer[i + 2];

    // Check if pixel is near white
    const minVal = Math.min(r, g, b);
    const maxVal = Math.max(r, g, b);
    const diff = maxVal - minVal;

    if (r > 240 && g > 240 && b > 240 && diff < 15) {
      // Linear falloff between 240 and 254
      const brightness = (r + g + b) / 3;
      if (brightness >= 253) {
        outBuffer[i + 3] = 0; // Fully transparent
      } else {
        const factor = (253 - brightness) / 13;
        outBuffer[i + 3] = Math.round(255 * factor);
      }
    } else if (r > 230 && g > 230 && b > 230 && diff < 10) {
      // Soft shadow transition
      const brightness = (r + g + b) / 3;
      const factor = (250 - brightness) / 20;
      outBuffer[i + 3] = Math.min(255, Math.round(255 * Math.max(0, factor)));
    }
  }

  // Save as high quality PNG
  await sharp(outBuffer, { raw: { width, height, channels: 4 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outPublic);

  await sharp(outBuffer, { raw: { width, height, channels: 4 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outAssets);

  await sharp(outBuffer, { raw: { width, height, channels: 4 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outAssetsNew);

  console.log('Successfully saved transparent PNG to:', outPublic, outAssets, outAssetsNew);
}

processHeroImage().catch(console.error);
