import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import { Product } from '../models/Product.js';

async function updateProducts() {
  await connectDB();

  // 1. GRE DATA
  const greData = {
    name: 'ETS GRE Exam Voucher',
    provider: 'ETS GRE',
    brand: 'ETS GRE',
    voucherType: 'ETSGRE',
    category: 'Exam Voucher',
    shortDescription: 'Save on your GRE exam booking with an official ETS discount voucher code. Accepted by 1,300+ business schools and thousands of graduate programs worldwide.',
    description: 'Save instantly on the official ETS GRE General Test fee with 100% authentic digital exam vouchers from Apex Vouchers. Valid for test centre and home edition bookings.',
    originalPrice: 23452.00,
    sellingPrice: 21699.00,
    discountEnabled: true,
    discountPercent: 7,
    currency: 'INR',
    validityMonths: 12,
    validityDays: 365,
    badge: '🎓 Top Savings (Save ₹1,753)',
    badgeEnabled: true,
    badgeType: 'popular',
    rating: 4.9,
    reviewsCount: 1650,
    featured: true,
    inStock: true,
    active: true,
    displayOrder: 4,
    deliveryType: 'Instant Delivery in 2 Minutes',
    officialWebsiteUrl: 'https://www.ets.org/gre',
    officialProductUrl: 'https://www.ets.org/gre',
    logo: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369884/apex_products/logos/ets_gre_logo.png',
    logoPublicId: 'apex_products/logos/ets_gre_logo',
    image: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369899/apex_blog/images/gre_exam_guide_banner.jpg',
    imagePublicId: 'apex_blog/images/gre_exam_guide_banner',
    imageSeo: {
      altText: 'ETS GRE Exam Voucher Discount Code 2026',
      imageTitle: 'ETS GRE Exam Voucher',
      caption: 'Official ETS GRE Discount Voucher',
    },
    seo: {
      title: 'ETS GRE Voucher Code 2026: Save on GRE General Test Fee | Apex Vouchers',
      description: 'Buy official ETS GRE exam voucher codes with instant delivery and save ₹1,753 on your GRE test booking. Use coupon code GRE100 for an extra ₹100 discount.',
      slug: 'ets-gre-voucher',
      focusKeyword: 'gre voucher code',
      secondaryKeywords: ['gre discount code', 'ets gre promo code', 'buy gre voucher online india', 'gre exam fee discount'],
      ogTitle: 'ETS GRE Voucher Code 2026 | Save on GRE General Test',
      ogDescription: 'Official genuine ETS GRE exam vouchers at discounted rates with instant email delivery from Apex Vouchers.',
      ogImage: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369899/apex_blog/images/gre_exam_guide_banner.jpg',
      twitterTitle: 'ETS GRE Exam Voucher | Save on GRE Registration',
      twitterDescription: 'Save ₹1,753 on GRE General Test with instant digital voucher delivery.',
      twitterImage: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369899/apex_blog/images/gre_exam_guide_banner.jpg',
      noindex: false,
      nofollow: false,
    },
    inclusions: [
      'Official 100% Genuine ETS GRE General Test Voucher Code',
      'Flat 7% Instant Exam Fee Discount (Save ₹1,753 on Official Fee)',
      'Extra ₹100 Off with Coupon GRE100 at Checkout',
      'Digital Voucher Code Emailed in 2 Minutes',
      'Valid for Both Test Centre & GRE General Test at Home',
      'Pay via UPI, Net Banking, Debit/Credit Cards (No Forex Fees)',
      '4 Free Official Score Reports to Universities Included',
      'Dedicated Customer & Registration Support',
    ],
    importantInfo: [
      { label: 'Exam Format', value: 'Computer-delivered GRE General Test (Centre & At Home)' },
      { label: 'Test Duration', value: '1 Hour 58 Minutes (Shorter GRE Format)' },
      { label: 'Score Validity', value: '5 Years from Test Date' },
      { label: 'Score Reporting', value: '4 Free Score Reports to Universities included' },
      { label: 'ID Requirement', value: 'Valid Original Passport (Mandatory for Indian Candidates)' },
      { label: 'Delivery Method', value: 'Instant Digital Delivery to Email in 2 Minutes' },
      { label: 'Retake Policy', value: 'Once every 21 days, up to 5 times in a 12-month period' },
      { label: 'Payment Options', value: 'UPI / GPay / PhonePe / Net Banking / Indian Cards (INR)' },
      { label: 'Refund Policy', value: 'Refund guarantee if voucher code is unredeemed within 7 days' },
    ],
    importantNotes: [
      'For Indian candidates, a valid original Passport is mandatory for identity verification on test day.',
      'Each voucher code is valid for a single GRE General Test registration on www.ets.org.',
      'GRE scores are valid for 5 full years from your exam date.',
    ],
    faqs: [
      {
        question: 'Are GRE voucher codes valid for all test centers?',
        answer: 'Yes, GRE vouchers from Apex Vouchers can be used for any official Prometric test center across India and globally, as well as for the GRE General Test at Home.',
      },
      {
        question: 'Can I avail both the voucher discount and the ₹100 coupon together?',
        answer: 'Yes! You can apply coupon code GRE100 at checkout to receive an extra ₹100 off on top of the discounted voucher fee.',
      },
      {
        question: 'What is the fee of GRE exam in India?',
        answer: 'The regular GRE General Test fee in India is ₹23,452 (inclusive of 18% GST). Through Apex Vouchers, you pay only ₹21,699, saving ₹1,753 on your booking.',
      },
      {
        question: 'What is the GRE exam used for?',
        answer: 'The GRE (Graduate Record Examination) is a standardized admissions test required for Master’s, MS, MBA, specialized business master’s, and doctoral (PhD) programs worldwide.',
      },
      {
        question: 'What is a good GRE score out of 340?',
        answer: 'A score of 300–310 is considered solid for many programs, while a score of 320+ (with 165+ in Quantitative Reasoning for STEM) is competitive for top global universities like MIT, Stanford, and Ivy League schools.',
      },
      {
        question: 'How many times can I take the GRE?',
        answer: 'You can take the GRE once every 21 days, up to five times within any continuous 12-month period.',
      },
      {
        question: 'What subjects does the GRE test on?',
        answer: 'The GRE tests three core areas: Analytical Writing (1 essay task, 30 min), Verbal Reasoning (reading comprehension and critical reasoning), and Quantitative Reasoning (algebra, geometry, arithmetic, and data analysis).',
      },
      {
        question: 'What is the total duration of the GRE test?',
        answer: 'The shorter GRE General Test takes 1 hour and 58 minutes in total to complete.',
      },
      {
        question: 'How long are GRE scores valid?',
        answer: 'GRE scores are officially valid for 5 years from your test date.',
      },
      {
        question: 'How do I receive my GRE voucher code?',
        answer: 'Your voucher code is delivered instantly to your registered email address within 2 minutes of payment.',
      },
      {
        question: 'What should I bring to the GRE test center?',
        answer: 'You must bring your original, valid passport and your ETS appointment confirmation email. No personal belongings or unauthorized electronic devices are allowed inside the testing room.',
      },
    ],
    redemptionGuide: {
      enabled: true,
      providerLabel: 'ETS GRE',
      officialUrl: 'https://www.ets.org/gre',
      buttonText: 'Visit ETS GRE Portal',
      introduction: 'How to Redeem Your GRE Voucher Code on the Official ETS Website?',
      steps: [
        {
          order: 1,
          title: 'Visit the Official ETS Website',
          description: 'Visit the official ETS website at www.ets.org and click on the "Register for GRE" option.',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369886/apex_products/redemption/gre_redemption_step1.jpg',
            publicId: 'apex_products/redemption/gre_redemption_step1',
            alt: 'Visit ETS Official Website for GRE',
            caption: 'Visit the Official ETS Website',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
        {
          order: 2,
          title: 'Create or Sign In to Your ETS Account',
          description: 'If you are a new user, create your account. Fill in all details ensuring they match your passport exactly.',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369888/apex_products/redemption/gre_redemption_step2.jpg',
            publicId: 'apex_products/redemption/gre_redemption_step2',
            alt: 'Create or Sign In to ETS Account',
            caption: 'Create or Sign In to Your ETS Account',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
        {
          order: 3,
          title: 'Access Your Dashboard',
          description: 'On your GRE dashboard, click on the "Register / Find Test Centers, Dates" tab to proceed.',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369890/apex_products/redemption/gre_redemption_step3.jpg',
            publicId: 'apex_products/redemption/gre_redemption_step3',
            alt: 'Access ETS Dashboard',
            caption: 'Access Your ETS Dashboard',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
        {
          order: 4,
          title: 'Start the GRE Registration Process',
          description: 'Select your preferred Test Type and choose whether you want to take the exam at a test centre or at home.',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369892/apex_products/redemption/gre_redemption_step4.jpg',
            publicId: 'apex_products/redemption/gre_redemption_step4',
            alt: 'Start GRE Registration Process',
            caption: 'Start the Registration Process',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
        {
          order: 5,
          title: 'Select Test Centre and Date',
          description: 'Pick your preferred GRE exam date and available test centre slot, then accept the testing policy.',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369893/apex_products/redemption/gre_redemption_step5.jpg',
            publicId: 'apex_products/redemption/gre_redemption_step5',
            alt: 'Select GRE Test Centre and Date',
            caption: 'Select Test Centre and Date',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
        {
          order: 6,
          title: 'Complete Background Information',
          description: 'Verify your details, answer the demographic & academic preference questions, and proceed to checkout.',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369895/apex_products/redemption/gre_redemption_step6.jpg',
            publicId: 'apex_products/redemption/gre_redemption_step6',
            alt: 'Complete Background Information',
            caption: 'Complete Background Information',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
        {
          order: 7,
          title: 'Apply Voucher Code at Checkout',
          description: 'On the checkout screen, enter the GRE voucher code received from Apex Vouchers in the promo code field.',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369897/apex_products/redemption/gre_redemption_step7.jpg',
            publicId: 'apex_products/redemption/gre_redemption_step7',
            alt: 'Apply GRE Voucher Code and Confirm',
            caption: 'Apply Voucher Code & Checkout',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
        {
          order: 8,
          title: 'Confirm Your Booking',
          description: 'Click "Proceed to Payment" to confirm your registration. Your payable amount will be cleared and your seat confirmed.',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788370056/apex_products/redemption/gre_redemption_step8.jpg',
            publicId: 'apex_products/redemption/gre_redemption_step8',
            alt: 'Confirm GRE Booking Screen',
            caption: 'Confirm Booking & Download Admission Ticket',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
      ],
      warnings: [
        'Ensure your name on your ETS account matches your Passport exactly. Contact support if you need assistance during booking.',
      ],
      lastUpdated: new Date(),
    },
    productContent: {
      enabled: true,
      heading: 'About the ETS GRE Exam Voucher',
      content: `<h2>GRE Exam Booking in India at the Lowest Price</h2>
<figure>
  <img src="https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369899/apex_blog/images/gre_exam_guide_banner.jpg" alt="GRE Exam Guide 2026" loading="lazy" />
  <figcaption>Official ETS GRE General Test 2026 — Instant Discount Voucher</figcaption>
</figure>
<p>Looking to save on your GRE exam booking? <strong>Apex Vouchers</strong> offers verified ETS GRE voucher codes with instant digital delivery, helping you reduce exam registration fees without dealing with foreign exchange markups or international credit card hassles.</p>

<figure>
  <img src="https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369901/apex_blog/images/gre_exam_fee_details.jpg" alt="GRE Exam Fee and Savings Breakdown" loading="lazy" />
  <figcaption>GRE Exam Fee Breakdown &amp; Savings</figcaption>
</figure>

<table>
  <thead>
    <tr>
      <th>Details</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Standard GRE Registration Fee (India)</td>
      <td>₹23,452</td>
    </tr>
    <tr>
      <td>Apex Vouchers Discounted Price</td>
      <td>₹21,699</td>
    </tr>
    <tr>
      <td>Extra Coupon Code (Code: GRE100)</td>
      <td>-₹100</td>
    </tr>
    <tr>
      <td><strong>Final Payable Price</strong></td>
      <td><strong>₹21,599</strong></td>
    </tr>
    <tr>
      <td><strong>Total Savings</strong></td>
      <td><strong>₹1,853 OFF</strong></td>
    </tr>
  </tbody>
</table>

<h2>What is a GRE Voucher Code?</h2>
<p>A GRE voucher code is a prepaid 100% genuine alphanumeric digital code used to pay for your GRE General Test registration. Instead of paying full price on the ETS portal via an international card, you buy the voucher in INR and apply it at checkout to cover the test fee.</p>

<h2>Benefits of Buying a GRE Voucher from Apex Vouchers</h2>
<ul>
  <li><p><strong>Official &amp; Trusted:</strong> 100% authentic voucher codes accepted directly on www.ets.org/gre.</p></li>
  <li><p><strong>Instant Email Delivery:</strong> Get your voucher code within 2 minutes of payment.</p></li>
  <li><p><strong>Pay via UPI &amp; Local Cards:</strong> Avoid 3.5% foreign currency conversion charges by paying in INR.</p></li>
  <li><p><strong>Valid Worldwide:</strong> Applicable for test centre appointments across India and the GRE General Test at Home.</p></li>
  <li><p><strong>4 Free Score Reports:</strong> Send your official GRE scores to up to 4 graduate institutions for free.</p></li>
</ul>

<h2>GRE Exam Pattern &amp; Structure (Shorter Format)</h2>
<figure>
  <img src="https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369904/apex_blog/images/gre_syllabus_pattern.jpg" alt="GRE Syllabus and Pattern" loading="lazy" />
  <figcaption>GRE General Test (1 Hr 58 Min Structure)</figcaption>
</figure>
<p>The revised shorter GRE General Test format takes less than 2 hours to complete and consists of three scored measures:</p>
<ul>
  <li><p><strong>Analytical Writing:</strong> 1 "Analyze an Issue" essay task (30 minutes).</p></li>
  <li><p><strong>Verbal Reasoning:</strong> 2 sections (27 questions total, 41 minutes) testing text completion, sentence equivalence, and reading comprehension.</p></li>
  <li><p><strong>Quantitative Reasoning:</strong> 2 sections (27 questions total, 47 minutes) testing arithmetic, algebra, geometry, and data interpretation.</p></li>
</ul>

<h2>Top Universities Worldwide Accepting GRE Scores</h2>
<figure>
  <img src="https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369906/apex_blog/images/gre_accepting_universities.jpg" alt="Top Universities Accepting GRE" loading="lazy" />
  <figcaption>Accepted by 1,300+ Business Schools &amp; Top Graduate Universities</figcaption>
</figure>
<table>
  <thead>
    <tr>
      <th>Country</th>
      <th>Top Universities Accepting GRE</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>United States (USA)</strong></td>
      <td>MIT, Stanford, Harvard, UC Berkeley, Carnegie Mellon, Georgia Tech, Columbia University, NYU, UCLA</td>
    </tr>
    <tr>
      <td><strong>Canada</strong></td>
      <td>University of Toronto, UBC, McGill University, University of Waterloo, McMaster University</td>
    </tr>
    <tr>
      <td><strong>United Kingdom (UK) &amp; Europe</strong></td>
      <td>Oxford, Cambridge, Imperial College London, LSE, INSEAD, HEC Paris, ETH Zurich, TU Munich</td>
    </tr>
    <tr>
      <td><strong>Singapore &amp; Asia</strong></td>
      <td>National University of Singapore (NUS), NTU Singapore, HKUST</td>
    </tr>
  </tbody>
</table>`,
    },
  };

  // 2. TOEFL DATA
  const toeflData = {
    name: 'ETS TOEFL iBT Exam Voucher',
    provider: 'ETS TOEFL',
    brand: 'ETS TOEFL',
    voucherType: 'ETSTOEFL',
    category: 'Exam Voucher',
    shortDescription: 'Save ₹2,799 on your TOEFL iBT exam booking with an official ETS discount voucher. Accepted by 12,500+ universities in over 160 countries worldwide.',
    description: 'Get an instant discount on the official TOEFL iBT exam fee. Complete your test booking at home or at an authorized ETS test centre with verified vouchers from Apex Vouchers.',
    originalPrice: 17999.00,
    sellingPrice: 15200.00,
    discountEnabled: true,
    discountPercent: 16,
    currency: 'INR',
    validityMonths: 12,
    validityDays: 365,
    badge: '⚡ Save ₹2,799 (Flat Discount)',
    badgeEnabled: true,
    badgeType: 'popular',
    rating: 4.9,
    reviewsCount: 1420,
    featured: true,
    inStock: true,
    active: true,
    displayOrder: 5,
    deliveryType: 'Instant Delivery in 2 Minutes',
    officialWebsiteUrl: 'https://www.ets.org/toefl',
    officialProductUrl: 'https://www.ets.org/toefl',
    logo: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369907/apex_products/logos/ets_toefl_logo.png',
    logoPublicId: 'apex_products/logos/ets_toefl_logo',
    image: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369920/apex_blog/images/toefl_exam_fee_details.jpg',
    imagePublicId: 'apex_blog/images/toefl_exam_fee_details',
    imageSeo: {
      altText: 'ETS TOEFL iBT Exam Voucher Discount Code 2026',
      imageTitle: 'ETS TOEFL iBT Exam Voucher',
      caption: 'Official ETS TOEFL iBT Discount Voucher',
    },
    seo: {
      title: 'TOEFL Exam Voucher & Discount Code 2026: Save ₹2,799 | Apex Vouchers',
      description: 'Buy verified ETS TOEFL iBT exam vouchers with instant delivery and save ₹2,799 on your registration. Use coupon code TOEFL100 for an extra ₹100 off.',
      slug: 'ets-toefl-voucher',
      focusKeyword: 'toefl exam voucher',
      secondaryKeywords: ['toefl discount code', 'toefl ibt promo code', 'buy toefl voucher india', 'toefl exam fee discount'],
      ogTitle: 'TOEFL Exam Voucher & Discount Code 2026 | Save ₹2,799',
      ogDescription: 'Official genuine ETS TOEFL iBT exam vouchers with instant email delivery from Apex Vouchers.',
      ogImage: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369920/apex_blog/images/toefl_exam_fee_details.jpg',
      twitterTitle: 'ETS TOEFL iBT Exam Voucher | Save on TOEFL Booking',
      twitterDescription: 'Save ₹2,799 on TOEFL iBT with instant digital voucher delivery.',
      twitterImage: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369920/apex_blog/images/toefl_exam_fee_details.jpg',
      noindex: false,
      nofollow: false,
    },
    inclusions: [
      'Official 100% Genuine ETS TOEFL iBT Exam Voucher Code',
      'Save ₹2,799 Instantly on Official Test Registration Fee',
      'Extra ₹100 Off with Coupon TOEFL100 at Checkout',
      'Digital Voucher Code Emailed in 2 Minutes',
      'Valid for Both Test Centre & TOEFL iBT Home Edition',
      'Pay via UPI, Net Banking, Debit/Credit Cards (No Forex Fees)',
      '4 Free Official Score Reports to Universities Included',
      'Dedicated Customer & Registration Support',
    ],
    importantInfo: [
      { label: 'Exam Format', value: 'TOEFL iBT (Test Centre & Home Edition)' },
      { label: 'Test Duration', value: 'Under 2 Hours (Fast Shorter Format)' },
      { label: 'Score Scale', value: '0–120 Total (0–30 per Section)' },
      { label: 'Score Validity', value: '2 Years from Test Date' },
      { label: 'Score Reporting', value: '4 Free Score Reports to Universities included' },
      { label: 'ID Requirement', value: 'Valid Original Passport (Mandatory for Indian Candidates)' },
      { label: 'Delivery Method', value: 'Instant Digital Delivery to Email in 2 Minutes' },
      { label: 'Payment Options', value: 'UPI / GPay / PhonePe / Net Banking / Indian Cards (INR)' },
      { label: 'Refund Policy', value: 'Refund guarantee if voucher code is unredeemed within 7 days' },
    ],
    importantNotes: [
      'For Indian test takers, a valid original Passport is mandatory for identity verification on test day.',
      'Each voucher code is valid for a single TOEFL iBT exam registration on www.ets.org/toefl.',
      'TOEFL scores are officially valid for 2 years from your test date.',
    ],
    faqs: [
      {
        question: 'Can I take a TOEFL test online?',
        answer: 'Yes! You can take the TOEFL test online through the TOEFL iBT Home Edition. It has the exact same content, scoring, and university acceptance as the test centre version.',
      },
      {
        question: 'How Does Apex Vouchers Offer the Best TOEFL Deals?',
        answer: 'Apex Vouchers provides authentic bulk vouchers that waive off your exam registration fee, allowing you to save ₹2,799 on official test fees without forex conversion charges.',
      },
      {
        question: 'Can I use both the voucher discount and the ₹100 coupon together?',
        answer: 'Yes! You can apply coupon code TOEFL100 at checkout to receive an extra ₹100 off on top of your voucher discount.',
      },
      {
        question: 'What is the TOEFL exam for?',
        answer: 'The TOEFL iBT test measures English proficiency across Reading, Listening, Speaking, and Writing for university admissions, study visas, and professional licensing in English-speaking countries.',
      },
      {
        question: 'How much does the TOEFL exam cost in India?',
        answer: 'The standard TOEFL iBT fee in India is ₹17,999. Through Apex Vouchers, you pay only ₹15,200, saving ₹2,799 instantly.',
      },
      {
        question: 'What is a good TOEFL score?',
        answer: 'A score between 80–100 is good for most undergraduate and master’s programs, while competitive universities and top MBA programs typically look for 100+ (with 25+ in Speaking and Writing).',
      },
      {
        question: 'How many attempts are there for TOEFL?',
        answer: 'You can take the TOEFL exam as many times as you need, with a minimum waiting period of 3 days between test appointments.',
      },
      {
        question: 'What sections are on the TOEFL test?',
        answer: 'The TOEFL test comprises four sections: Reading (20 questions, 35 min), Listening (28 questions, 36 min), Speaking (4 tasks, 16 min), and Writing (2 tasks, 29 min). Total duration is under 2 hours.',
      },
      {
        question: 'How long are TOEFL scores valid?',
        answer: 'TOEFL scores are officially valid for 2 years from your test date.',
      },
      {
        question: 'How do I receive my TOEFL voucher code?',
        answer: 'Your voucher code is delivered instantly to your registered email address within 2 minutes of completing payment.',
      },
    ],
    redemptionGuide: {
      enabled: true,
      providerLabel: 'ETS TOEFL',
      officialUrl: 'https://www.ets.org/toefl',
      buttonText: 'Visit ETS TOEFL Portal',
      introduction: 'How to Redeem Your TOEFL Voucher Code on the Official ETS Website?',
      steps: [
        {
          order: 1,
          title: 'Visit the Official TOEFL Website',
          description: 'Go to the official ETS website at www.ets.org/toefl and click on "Register for Test" to begin your booking.',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369910/apex_products/redemption/toefl_redemption_step1.jpg',
            publicId: 'apex_products/redemption/toefl_redemption_step1',
            alt: 'Visit Official TOEFL Website',
            caption: 'Visit the Official ETS TOEFL Website',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
        {
          order: 2,
          title: 'Create or Sign In to Your Account at ETS',
          description: 'Sign in with your existing ETS account or register a new profile ensuring your details match your passport exactly.',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369911/apex_products/redemption/toefl_redemption_step2.jpg',
            publicId: 'apex_products/redemption/toefl_redemption_step2',
            alt: 'Create or Sign In to TOEFL Account',
            caption: 'Create or Sign In to Your Account',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
        {
          order: 3,
          title: 'Choose Your Test Format and Location',
          description: 'Select whether you want to take the test at an authorized Test Centre or the TOEFL iBT Home Edition.',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369913/apex_products/redemption/toefl_redemption_step3.jpg',
            publicId: 'apex_products/redemption/toefl_redemption_step3',
            alt: 'Choose TOEFL Test Format',
            caption: 'Choose Your TOEFL Test Format',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
        {
          order: 4,
          title: 'Select Test Date and Time',
          description: 'Choose from available test dates, slot timings, and test centre locations that suit your schedule.',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369915/apex_products/redemption/toefl_redemption_step4.jpg',
            publicId: 'apex_products/redemption/toefl_redemption_step4',
            alt: 'Select TOEFL Test Date, Time and Location',
            caption: 'Select Test Date, Time and Location',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
        {
          order: 5,
          title: 'Fill in Personal & ID Details',
          description: 'Enter your passport details, contact information, and select up to 4 universities for free score reporting.',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369917/apex_products/redemption/toefl_redemption_step5.jpg',
            publicId: 'apex_products/redemption/toefl_redemption_step5',
            alt: 'Enter Personal & ID Details for TOEFL',
            caption: 'Enter Personal & Identification Details',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
        {
          order: 6,
          title: 'Apply Voucher Code & Complete Checkout',
          description: 'On the checkout page, enter your Apex Voucher code in the "Voucher / Promo Code" box. Your fee will reduce to zero.',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369918/apex_products/redemption/toefl_redemption_step6.jpg',
            publicId: 'apex_products/redemption/toefl_redemption_step6',
            alt: 'Review Cart and Apply TOEFL Voucher Code',
            caption: 'Review Cart & Apply Voucher Code',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
      ],
      warnings: [
        'Ensure your name on your ETS account matches your Passport exactly. Contact support if you need assistance during booking.',
      ],
      lastUpdated: new Date(),
    },
    productContent: {
      enabled: true,
      heading: 'About the ETS TOEFL iBT Exam Voucher',
      content: `<h2>Buy TOEFL Exam Voucher &amp; Discount Code in India: Instant Delivery &amp; Lowest Price</h2>
<figure>
  <img src="https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369920/apex_blog/images/toefl_exam_fee_details.jpg" alt="TOEFL Exam Fee and Savings Breakdown" loading="lazy" />
  <figcaption>Official ETS TOEFL iBT Exam Voucher — Flat Discount</figcaption>
</figure>
<p>Booking your TOEFL iBT shouldn't break the bank. With <strong>Apex Vouchers</strong>, you get genuine, instant ETS TOEFL vouchers that let you register in local INR currency without paying expensive credit card forex conversion fees, saving up to ₹2,799 on your registration.</p>

<table>
  <thead>
    <tr>
      <th>Details</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Standard TOEFL iBT Fee (India)</td>
      <td>₹17,999</td>
    </tr>
    <tr>
      <td>Apex Vouchers Discounted Price</td>
      <td>₹15,200</td>
    </tr>
    <tr>
      <td>Extra Coupon Code (Code: TOEFL100)</td>
      <td>-₹100</td>
    </tr>
    <tr>
      <td><strong>Final Payable Price</strong></td>
      <td><strong>₹15,100</strong></td>
    </tr>
    <tr>
      <td><strong>Total Savings</strong></td>
      <td><strong>₹2,899 OFF</strong></td>
    </tr>
  </tbody>
</table>

<h2>What is a TOEFL Exam Voucher in India?</h2>
<p>A TOEFL exam voucher is a prepaid digital code that covers the full cost of your test. It allows you to pay upfront in Indian Rupees (INR) and apply the voucher code on the official ETS portal (www.ets.org/toefl) to reduce your final payable amount to zero.</p>

<h2>Why Choose Apex Vouchers for Your TOEFL Registration?</h2>
<ul>
  <li><p><strong>100% Genuine ETS Vouchers:</strong> Guaranteed validity on all test dates and formats.</p></li>
  <li><p><strong>Instant Delivery in 2 Minutes:</strong> Digital voucher delivered straight to your email.</p></li>
  <li><p><strong>Pay via UPI, GPay, Cards &amp; Net Banking:</strong> Zero forex transaction fees.</p></li>
  <li><p><strong>4 Free University Score Reports:</strong> Included directly in your registration.</p></li>
  <li><p><strong>Dedicated Customer Support:</strong> Round-the-clock help with booking and voucher redemption.</p></li>
</ul>

<h2>TOEFL iBT Exam Pattern &amp; Structure</h2>
<figure>
  <img src="https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369922/apex_blog/images/toefl_syllabus_pattern.jpg" alt="TOEFL iBT Syllabus and Pattern" loading="lazy" />
  <figcaption>TOEFL iBT 4-Section Exam Pattern (Under 2 Hours)</figcaption>
</figure>
<p>The streamlined TOEFL iBT format takes less than 2 hours to complete:</p>
<ul>
  <li><p><strong>Reading:</strong> 20 questions based on academic passages (35 minutes).</p></li>
  <li><p><strong>Listening:</strong> 28 questions based on campus lectures and conversations (36 minutes).</p></li>
  <li><p><strong>Speaking:</strong> 4 real-world communication tasks (16 minutes).</p></li>
  <li><p><strong>Writing:</strong> 2 tasks — Integrated writing and Academic Discussion writing (29 minutes).</p></li>
</ul>

<figure>
  <img src="https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369924/apex_blog/images/toefl_results_breakdown.jpg" alt="TOEFL Score Results Breakdown" loading="lazy" />
  <figcaption>Certified TOEFL Score Scale (0–120 Total)</figcaption>
</figure>

<h2>Universities Worldwide Accepting TOEFL iBT</h2>
<figure>
  <img src="https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369926/apex_blog/images/toefl_accepting_universities.jpg" alt="Top Universities Accepting TOEFL" loading="lazy" />
  <figcaption>Accepted by 12,500+ Universities across 160+ Countries</figcaption>
</figure>
<table>
  <thead>
    <tr>
      <th>Country</th>
      <th>Accepting Institutions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>United States</strong></td>
      <td>100% of US universities including Harvard, Princeton, MIT, Stanford, Yale, Columbia</td>
    </tr>
    <tr>
      <td><strong>Canada</strong></td>
      <td>University of Toronto, UBC, McGill University, University of Waterloo</td>
    </tr>
    <tr>
      <td><strong>United Kingdom</strong></td>
      <td>100% of UK universities including Russell Group (Oxford, Cambridge, Imperial, UCL, LSE)</td>
    </tr>
    <tr>
      <td><strong>Australia &amp; NZ</strong></td>
      <td>100% of Australian universities and for all Australian visa tiers</td>
    </tr>
    <tr>
      <td><strong>Germany &amp; Europe</strong></td>
      <td>TU Munich, RWTH Aachen, Heidelberg, Erasmus University, TU Delft</td>
    </tr>
  </tbody>
</table>`,
    },
  };

  // Update GRE
  let greProduct = await Product.findOne({
    $or: [{ name: /gre/i }, { slug: 'ets-gre-voucher' }, { slug: 'ets-gre' }],
  });
  if (greProduct) {
    Object.assign(greProduct, greData);
    await greProduct.save();
    console.log('✓ Updated GRE product:', greProduct._id, 'slug:', greProduct.slug);
  } else {
    greProduct = new Product(greData);
    await greProduct.save();
    console.log('✓ Created GRE product:', greProduct._id, 'slug:', greProduct.slug);
  }

  // Update TOEFL
  let toeflProduct = await Product.findOne({
    $or: [{ name: /toefl/i }, { slug: 'ets-toefl-voucher' }, { slug: 'ets-toefl' }],
  });
  if (toeflProduct) {
    Object.assign(toeflProduct, toeflData);
    await toeflProduct.save();
    console.log('✓ Updated TOEFL product:', toeflProduct._id, 'slug:', toeflProduct.slug);
  } else {
    toeflProduct = new Product(toeflData);
    await toeflProduct.save();
    console.log('✓ Created TOEFL product:', toeflProduct._id, 'slug:', toeflProduct.slug);
  }

  process.exit(0);
}

updateProducts().catch(err => {
  console.error(err);
  process.exit(1);
});
