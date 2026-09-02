import dotenv from 'dotenv';
dotenv.config();

import { uploadImage, isCloudinaryConfigured } from '../services/cloudinaryService.js';
import fs from 'fs';

const IMAGES = [
  // GRE Redemption Steps
  {
    key: 'gre_logo',
    url: 'https://eduvouchers.com/cdn/shop/files/GRE_ProductPage.png?v=1723118398',
    folder: 'apex_products/logos',
    publicId: 'ets_gre_logo',
    alt: 'ETS GRE Exam Voucher Logo',
    caption: 'ETS GRE Exam Voucher'
  },
  {
    key: 'gre_step1',
    url: 'https://eduvouchers.com/cdn/shop/files/Visit_the_ETS_Website.webp?v=1775735873',
    folder: 'apex_products/redemption',
    publicId: 'gre_redemption_step1',
    alt: 'Visit ETS Official Website for GRE',
    caption: 'Visit the Official ETS Website'
  },
  {
    key: 'gre_step2',
    url: 'https://eduvouchers.com/cdn/shop/files/Create_Your_Account.webp?v=1775736023',
    folder: 'apex_products/redemption',
    publicId: 'gre_redemption_step2',
    alt: 'Create or Sign In to ETS Account',
    caption: 'Create or Sign In to Your ETS Account'
  },
  {
    key: 'gre_step3',
    url: 'https://eduvouchers.com/cdn/shop/files/Access_Your_Dashboard.webp?v=1775735873',
    folder: 'apex_products/redemption',
    publicId: 'gre_redemption_step3',
    alt: 'Access ETS Dashboard',
    caption: 'Access Your ETS Dashboard'
  },
  {
    key: 'gre_step4',
    url: 'https://eduvouchers.com/cdn/shop/files/Start_the_Registration_Process.webp?v=1775735873',
    folder: 'apex_products/redemption',
    publicId: 'gre_redemption_step4',
    alt: 'Start GRE Registration Process',
    caption: 'Start the Registration Process'
  },
  {
    key: 'gre_step5',
    url: 'https://eduvouchers.com/cdn/shop/files/Select_Test_Centre_and_Date.webp?v=1775735873',
    folder: 'apex_products/redemption',
    publicId: 'gre_redemption_step5',
    alt: 'Select GRE Test Centre and Date',
    caption: 'Select Test Centre and Date'
  },
  {
    key: 'gre_step6',
    url: 'https://eduvouchers.com/cdn/shop/files/Complete_Background_Information.webp?v=1775736618',
    folder: 'apex_products/redemption',
    publicId: 'gre_redemption_step6',
    alt: 'Complete Background Information',
    caption: 'Complete Background Information'
  },
  {
    key: 'gre_step7',
    url: 'https://eduvouchers.com/cdn/shop/files/Apply_Voucher_Code.webp?v=1775735873',
    folder: 'apex_products/redemption',
    publicId: 'gre_redemption_step7',
    alt: 'Apply GRE Voucher Code and Confirm',
    caption: 'Apply Voucher Code & Checkout'
  },
  // GRE Article Images
  {
    key: 'gre_article_guide',
    url: 'https://eduvouchers.com/cdn/shop/articles/GRE_Exam_Guide_e8e51811-d8a6-46b9-a753-7bb5c2120933.jpg?v=1779261961&width=1500',
    folder: 'apex_blog/images',
    publicId: 'gre_exam_guide_banner',
    alt: 'GRE Exam Guide 2026',
    caption: 'GRE General Test Guide 2026'
  },
  {
    key: 'gre_article_fee',
    url: 'https://eduvouchers.com/cdn/shop/articles/GRE_exam_fee_41000500-037e-4b54-a2a2-666e5b9fd06b.webp?v=1778676453&width=1500',
    folder: 'apex_blog/images',
    publicId: 'gre_exam_fee_details',
    alt: 'GRE Exam Fee and Savings',
    caption: 'GRE Exam Fee & Savings Breakdown'
  },
  {
    key: 'gre_article_syllabus',
    url: 'https://eduvouchers.com/cdn/shop/articles/GRE_Syllabus_477e80e8-b638-4e47-8933-5a36e5ebaf8b.jpg?v=1781689970&width=2600',
    folder: 'apex_blog/images',
    publicId: 'gre_syllabus_pattern',
    alt: 'GRE General Test Syllabus and Pattern',
    caption: 'GRE Exam Pattern & Section Breakdown'
  },
  {
    key: 'gre_article_universities',
    url: 'https://eduvouchers.com/cdn/shop/articles/GRE_Accepting_Countries_and_Universities_fcf5d5ad-00e6-42c4-be3a-fcd7dda7b77f.webp?v=1781701490&width=1000',
    folder: 'apex_blog/images',
    publicId: 'gre_accepting_universities',
    alt: 'Top Universities Accepting GRE Scores',
    caption: 'Top Universities Worldwide Accepting GRE'
  },

  // TOEFL Redemption Steps
  {
    key: 'toefl_logo',
    url: 'https://eduvouchers.com/cdn/shop/files/TOEFL_ProductPage.png?v=1770017145',
    folder: 'apex_products/logos',
    publicId: 'ets_toefl_logo',
    alt: 'ETS TOEFL iBT Exam Voucher Logo',
    caption: 'ETS TOEFL iBT Exam Voucher'
  },
  {
    key: 'toefl_step1',
    url: 'https://eduvouchers.com/cdn/shop/files/Step_1__Visit_the_Official_TOEFL_Website.jpg?v=1777007991',
    folder: 'apex_products/redemption',
    publicId: 'toefl_redemption_step1',
    alt: 'Visit Official TOEFL Website',
    caption: 'Visit the Official ETS TOEFL Website'
  },
  {
    key: 'toefl_step2',
    url: 'https://eduvouchers.com/cdn/shop/files/Step_2_Create_or_Sign_In_to_Your_Account.jpg?v=1777008099',
    folder: 'apex_products/redemption',
    publicId: 'toefl_redemption_step2',
    alt: 'Create or Sign In to TOEFL Account',
    caption: 'Create or Sign In to Your Account'
  },
  {
    key: 'toefl_step3',
    url: 'https://eduvouchers.com/cdn/shop/files/Step_3__Choose_Your_TOEFL_Test_Format.jpg?v=1777007990',
    folder: 'apex_products/redemption',
    publicId: 'toefl_redemption_step3',
    alt: 'Choose TOEFL Test Format',
    caption: 'Choose Your TOEFL Test Format'
  },
  {
    key: 'toefl_step4',
    url: 'https://eduvouchers.com/cdn/shop/files/Step_4__Select_Your_Test_Date_Time_and_Location.jpg?v=1777007991',
    folder: 'apex_products/redemption',
    publicId: 'toefl_redemption_step4',
    alt: 'Select TOEFL Test Date, Time and Location',
    caption: 'Select Test Date, Time and Location'
  },
  {
    key: 'toefl_step5',
    url: 'https://eduvouchers.com/cdn/shop/files/Step_5__Enter_Personal_and_Identification_Details.jpg?v=1777007990',
    folder: 'apex_products/redemption',
    publicId: 'toefl_redemption_step5',
    alt: 'Enter Personal & ID Details for TOEFL',
    caption: 'Enter Personal & Identification Details'
  },
  {
    key: 'toefl_step6',
    url: 'https://eduvouchers.com/cdn/shop/files/Step_6_Review_Cart_and_Apply_Coupon_Code.jpg?v=1777026713',
    folder: 'apex_products/redemption',
    publicId: 'toefl_redemption_step6',
    alt: 'Review Cart and Apply TOEFL Voucher Code',
    caption: 'Review Cart & Apply Voucher Code'
  },
  // TOEFL Article Images
  {
    key: 'toefl_article_fee',
    url: 'https://eduvouchers.com/cdn/shop/articles/TOEFL_Exam_Fee_df737b95-b0e7-41d1-bc0e-1e3fbe3ba4b3.jpg?v=1784281321&width=1500',
    folder: 'apex_blog/images',
    publicId: 'toefl_exam_fee_details',
    alt: 'TOEFL Exam Fee and Savings',
    caption: 'TOEFL Exam Fee & Savings Breakdown'
  },
  {
    key: 'toefl_article_syllabus',
    url: 'https://eduvouchers.com/cdn/shop/articles/TOEFL_syllabus_5e0a35df-f6fa-45e6-ba57-543d2c44af05.jpg?v=1782279198&width=1500',
    folder: 'apex_blog/images',
    publicId: 'toefl_syllabus_pattern',
    alt: 'TOEFL iBT Syllabus and Pattern',
    caption: 'TOEFL iBT 4-Section Exam Pattern'
  },
  {
    key: 'toefl_article_results',
    url: 'https://eduvouchers.com/cdn/shop/articles/TOEFL_results_132a47d9-1285-4f6e-beed-935edf871974.jpg?v=1779087331&width=1500',
    folder: 'apex_blog/images',
    publicId: 'toefl_results_breakdown',
    alt: 'TOEFL Score Results Breakdown',
    caption: 'TOEFL iBT Official Results & Scoring'
  },
  {
    key: 'toefl_article_universities',
    url: 'https://eduvouchers.com/cdn/shop/articles/TOEFL_accepting_universities_and_countries.webp?v=1784636645&width=1500',
    folder: 'apex_blog/images',
    publicId: 'toefl_accepting_universities',
    alt: 'Universities Accepting TOEFL iBT',
    caption: 'Top Universities Worldwide Accepting TOEFL'
  }
];

async function main() {
  console.log('Starting image uploads for GRE & TOEFL...');
  const uploadedResults = {};

  for (const item of IMAGES) {
    try {
      console.log(`Downloading ${item.key}...`);
      const res = await fetch(item.url);
      if (!res.ok) {
        console.error(`Failed to fetch ${item.url}: ${res.statusText}`);
        continue;
      }
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (isCloudinaryConfigured()) {
        console.log(`Uploading ${item.key} to ${item.folder}...`);
        const uploadRes = await uploadImage(buffer, {
          folder: item.folder,
          publicId: item.publicId,
          overwrite: true
        });
        console.log(`✓ Uploaded ${item.key}:`, uploadRes.url);
        uploadedResults[item.key] = {
          ...uploadRes,
          alt: item.alt,
          caption: item.caption
        };
      }
    } catch (err) {
      console.error(`Error processing ${item.key}:`, err);
    }
  }

  fs.writeFileSync('gre_toefl_uploaded_images.json', JSON.stringify(uploadedResults, null, 2), 'utf-8');
  console.log('Saved gre_toefl_uploaded_images.json successfully!');
}

main().catch(console.error);
