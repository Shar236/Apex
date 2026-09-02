import dotenv from 'dotenv';
dotenv.config();

import { uploadImage, isCloudinaryConfigured } from '../services/cloudinaryService.js';

const IMAGES_TO_UPLOAD = [
  {
    key: 'step1',
    url: 'https://eduvouchers.com/cdn/shop/files/Duolingo_English_Test_Booking_Step_1_2.jpg?v=1775463204',
    folder: 'apex_products/redemption',
    publicId: 'duolingo_redemption_step1',
    alt: 'Duolingo English Test official booking portal - Create Account screen',
    caption: 'Duolingo English Test - Visit website & Create Account'
  },
  {
    key: 'step2',
    url: 'https://eduvouchers.com/cdn/shop/files/Duolingo_English_Test_Booking_Step_3.webp?v=1775461658',
    folder: 'apex_products/redemption',
    publicId: 'duolingo_redemption_step2',
    alt: 'Duolingo English Test Complete Profile screen',
    caption: 'Duolingo English Test - Complete Profile'
  },
  {
    key: 'step3',
    url: 'https://eduvouchers.com/cdn/shop/files/Duolingo_English_Test_Booking_Step_4.webp?v=1775461711',
    folder: 'apex_products/redemption',
    publicId: 'duolingo_redemption_step3',
    alt: 'Duolingo English Test Dashboard - Purchase a Test screen',
    caption: 'Duolingo English Test - Dashboard Access'
  },
  {
    key: 'step4',
    url: 'https://eduvouchers.com/cdn/shop/files/Duolingo_English_Test_Booking_Step_5.webp?v=1775461776',
    folder: 'apex_products/redemption',
    publicId: 'duolingo_redemption_step4',
    alt: 'Duolingo English Test choose test options screen',
    caption: 'Duolingo English Test - Purchase Options'
  },
  {
    key: 'step5',
    url: 'https://eduvouchers.com/cdn/shop/files/Duolingo_English_Test_Booking_Step_6.webp?v=1775462017',
    folder: 'apex_products/redemption',
    publicId: 'duolingo_redemption_step5',
    alt: 'Duolingo English Test Apply Coupon Code and Checkout screen',
    caption: 'Duolingo English Test - Apply Coupon Code'
  },
  {
    key: 'logo',
    url: 'https://eduvouchers.com/cdn/shop/files/duolingoexamHP.png?v=1726731313&width=1024',
    folder: 'apex_products/logos',
    publicId: 'duolingo_product_logo',
    alt: 'Duolingo English Test Voucher Logo',
    caption: 'Duolingo English Test Voucher'
  },
  {
    key: 'article_exam',
    url: 'https://eduvouchers.com/cdn/shop/articles/Duolingo_exam_985ac520-b2e2-4e78-8bb8-afae216b352d.webp?v=1786691749&width=1500',
    folder: 'apex_blog/images',
    publicId: 'duolingo_exam_guide',
    alt: 'Duolingo English Test Guide 2026',
    caption: 'Duolingo English Test Guide'
  },
  {
    key: 'article_pattern',
    url: 'https://eduvouchers.com/cdn/shop/articles/Duolingo_Exam_Pattern_Syllabus_6eb2129e-48c8-410d-a72b-4a5d361e5c4d.webp?v=1785496316&width=2600',
    folder: 'apex_blog/images',
    publicId: 'duolingo_exam_pattern_syllabus',
    alt: 'Duolingo Exam Pattern and Syllabus',
    caption: 'Duolingo Exam Pattern & Syllabus'
  },
  {
    key: 'article_result',
    url: 'https://eduvouchers.com/cdn/shop/articles/Duolingo_English_Test_Result_dbf27aa1-56d0-41b8-8c56-a3e4908823e5.jpg?v=1786694405&width=1500',
    folder: 'apex_blog/images',
    publicId: 'duolingo_test_result',
    alt: 'Duolingo English Test Result Sample',
    caption: 'Duolingo English Test Result'
  },
  {
    key: 'article_validity',
    url: 'https://eduvouchers.com/cdn/shop/articles/Duolingo_English_Test_Validity.webp?v=1786694992&width=2600',
    folder: 'apex_blog/images',
    publicId: 'duolingo_test_validity',
    alt: 'Duolingo English Test Validity Details',
    caption: 'Duolingo English Test Validity'
  }
];

async function main() {
  console.log('Cloudinary configured:', isCloudinaryConfigured());
  const uploadedResults = {};

  for (const item of IMAGES_TO_UPLOAD) {
    try {
      console.log(`Downloading ${item.key} from ${item.url}...`);
      const res = await fetch(item.url);
      if (!res.ok) {
        console.error(`Failed to fetch ${item.url}: ${res.statusText}`);
        continue;
      }
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (isCloudinaryConfigured()) {
        console.log(`Uploading ${item.key} to Cloudinary folder ${item.folder}...`);
        const uploadRes = await uploadImage(buffer, {
          folder: item.folder,
          publicId: item.publicId,
          overwrite: true
        });
        console.log(`Uploaded ${item.key}:`, uploadRes.url);
        uploadedResults[item.key] = {
          ...uploadRes,
          alt: item.alt,
          caption: item.caption
        };
      } else {
        console.log(`Cloudinary not configured, keeping original URL for ${item.key}`);
        uploadedResults[item.key] = {
          url: item.url,
          publicId: item.publicId,
          alt: item.alt,
          caption: item.caption,
          width: 1200,
          height: 600
        };
      }
    } catch (err) {
      console.error(`Error processing ${item.key}:`, err);
      uploadedResults[item.key] = {
        url: item.url,
        publicId: item.publicId,
        alt: item.alt,
        caption: item.caption,
        width: 1200,
        height: 600
      };
    }
  }

  import('fs').then(fs => {
    fs.writeFileSync('duolingo_uploaded_images.json', JSON.stringify(uploadedResults, null, 2), 'utf-8');
    console.log('Saved duolingo_uploaded_images.json');
  });
}

main().catch(console.error);
