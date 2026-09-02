import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import { Product } from '../models/Product.js';

async function updateDuolingo() {
  await connectDB();

  const duolingoData = {
    name: 'Duolingo English Test Voucher',
    provider: 'Duolingo',
    brand: 'Duolingo',
    voucherType: 'DUOLINGO',
    category: 'Exam Voucher',
    shortDescription: 'Book your official Duolingo English Test with an instant discount voucher and save up to ₹1,268. Get certified results in 48 hours and send scores to unlimited universities for free.',
    description: 'Save 18% on the official Duolingo English Test (DET) with instant digital voucher delivery. Accepted by 6,000+ top universities worldwide. Take the test at home in 1 hour with results in 48 hours.',
    originalPrice: 6667.00,
    sellingPrice: 5499.00,
    discountEnabled: true,
    discountPercent: 18,
    currency: 'INR',
    validityMonths: 12,
    validityDays: 365,
    badge: '🔥 Flat 18% Off',
    badgeEnabled: true,
    badgeType: 'popular',
    rating: 4.9,
    reviewsCount: 1840,
    featured: true,
    inStock: true,
    active: true,
    deliveryType: 'Instant Delivery in 2 Minutes',
    officialWebsiteUrl: 'https://englishtest.duolingo.com',
    officialProductUrl: 'https://englishtest.duolingo.com',
    logo: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369021/apex_products/logos/duolingo_product_logo.png',
    logoPublicId: 'apex_products/logos/duolingo_product_logo',
    image: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369026/apex_blog/images/duolingo_exam_guide.jpg',
    imagePublicId: 'apex_blog/images/duolingo_exam_guide',
    imageSeo: {
      altText: 'Duolingo English Test Voucher Coupon Code 2026',
      imageTitle: 'Duolingo English Test Voucher',
      caption: 'Official Duolingo English Test Discount Voucher',
    },
    seo: {
      title: 'Duolingo English Test Coupon Code Flat 18% Off 2026 | Apex Vouchers',
      description: 'Book your Duolingo English Test with a verified discount voucher code and save up to ₹1,268. Use coupon code DET100 for an extra ₹100 off. Instant email delivery.',
      slug: 'duolingo-english-test-voucher',
      focusKeyword: 'duolingo english test voucher',
      secondaryKeywords: [
        'duolingo english test coupon code',
        'det promo code',
        'duolingo test discount india',
        'buy duolingo voucher online',
      ],
      ogTitle: 'Duolingo English Test Coupon Code Flat 18% Off 2026',
      ogDescription: 'Book your Duolingo English Test with a discount voucher code and save up to ₹1,268. Instant digital voucher delivered in 2 minutes.',
      ogImage: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369026/apex_blog/images/duolingo_exam_guide.jpg',
      twitterTitle: 'Duolingo English Test Voucher Flat 18% Off',
      twitterDescription: 'Save up to ₹1,268 on the Duolingo English Test. Instant delivery via email.',
      twitterImage: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369026/apex_blog/images/duolingo_exam_guide.jpg',
      noindex: false,
      nofollow: false,
    },
    inclusions: [
      'Official 100% Genuine Duolingo Exam Voucher Code',
      'Flat 18% Instant Discount (Save ₹1,168 on Official Fee)',
      'Extra ₹100 Off with Coupon DET100 at Checkout',
      'Digital Voucher Code Emailed in 2 Minutes',
      'Pay via UPI, Net Banking, Debit/Credit Card (No Forex / Card Fees)',
      'Unlimited Free Score Reports to 6,000+ Global Universities',
      'Certified Test Results Delivered in 48 Hours',
      'Dedicated Customer & Redemption Support',
    ],
    importantInfo: [
      { label: 'Exam Format', value: '100% Online Computer Adaptive Test (Home Proctored)' },
      { label: 'Test Duration', value: '1 Hour (60 Minutes)' },
      { label: 'Result Turnaround', value: '48 Hours (12-Hour Fast Track Available)' },
      { label: 'Score Validity', value: '2 Years from Test Date' },
      { label: 'Score Sharing', value: 'Unlimited Free Reports to 6,000+ Institutions Worldwide' },
      { label: 'ID Requirement', value: 'Valid Passport (Mandatory for Indian Candidates)' },
      { label: 'Delivery Method', value: 'Instant Digital Delivery to Email in 2 Minutes' },
      { label: 'Payment Options', value: 'UPI / GPay / PhonePe / Net Banking / Indian Cards (INR)' },
      { label: 'Refund Policy', value: 'Refund guarantee if voucher code is unredeemed within 7 days' },
    ],
    importantNotes: [
      'For Indian test takers, a valid original Passport is mandatory for identity verification during the Duolingo English Test.',
      'Ensure your testing room is quiet, well-lit, and you have a computer with a functional webcam, microphone, speakers, and stable internet.',
      'Each voucher code is unique and valid for a single official exam registration on englishtest.duolingo.com.',
    ],
    faqs: [
      {
        question: 'How much discount do I get with this Duolingo promo code?',
        answer: 'Apex Vouchers offers an exclusive 18% discount on the Duolingo English Test fee. Instead of paying ₹6,667, you only pay ₹5,499 when purchasing through us. You can also use coupon code DET100 to get an extra ₹100 off, bringing your total cost down to ₹5,399 and total savings to ₹1,268 (19% off).',
      },
      {
        question: 'Is this Duolingo coupon code valid worldwide?',
        answer: 'Yes! The Duolingo test voucher purchased from Apex Vouchers is valid globally and can be used to take the test from anywhere in the world.',
      },
      {
        question: 'Is this a valid and official discount?',
        answer: 'Yes, Apex Vouchers provides 100% verified and genuine Duolingo English Test vouchers that are accepted directly on the official Duolingo English Test website (englishtest.duolingo.com).',
      },
      {
        question: 'Can I use both the 18% discount and the ₹100 coupon together?',
        answer: 'Yes! You can apply coupon code DET100 at checkout to receive an extra ₹100 off on top of the flat 18% voucher discount.',
      },
      {
        question: 'How do I receive my Duolingo coupon code?',
        answer: 'Your voucher code is emailed instantly to your registered email address within 2 minutes of payment completion.',
      },
      {
        question: 'How long is the Duolingo English Test (DET)?',
        answer: 'The Duolingo English Test takes approximately 1 hour to complete. It comprises three sections: a quick 5-minute onboarding setup, a 45-minute adaptive test measuring Reading, Writing, Listening and Speaking, and a 10-minute Writing & Speaking sample.',
      },
      {
        question: 'When will I receive my DET (Duolingo English Test) results?',
        answer: 'You will receive your official certified DET results within 48 hours of completing the test. You will be notified via email and can also view/download your score report from your Duolingo account.',
      },
      {
        question: 'Can I take the Duolingo English Test more than once?',
        answer: 'Yes, you can take the Duolingo English Test multiple times. You can purchase and take up to 3 tests within any 30-day period.',
      },
      {
        question: 'How long are Duolingo English Test scores valid?',
        answer: 'Duolingo English Test scores are officially valid for 2 years from the date of the test.',
      },
      {
        question: 'How do I send my Duolingo scores to universities?',
        answer: 'Duolingo allows you to send your verified score reports to unlimited universities and institutions for FREE directly from your dashboard.',
      },
      {
        question: 'Can I get a refund if I don’t use the voucher?',
        answer: 'Apex Vouchers offers a refund guarantee if your voucher code is unredeemed within 7 days of purchase. Please contact our support team with your order ID to request assistance.',
      },
    ],
    redemptionGuide: {
      enabled: true,
      providerLabel: 'Duolingo English Test',
      officialUrl: 'https://englishtest.duolingo.com',
      buttonText: 'Visit Duolingo English Test Portal',
      introduction: 'How to Redeem Your Duolingo English Test Promo Code?',
      steps: [
        {
          order: 1,
          title: 'Visit the Website & Create Your Account',
          description: 'Go to englishtest.duolingo.com and create your account. If you already have an account, log in.',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369007/apex_products/redemption/duolingo_redemption_step1.jpg',
            publicId: 'apex_products/redemption/duolingo_redemption_step1',
            alt: 'Duolingo English Test official booking portal - Create Account screen',
            caption: 'Duolingo English Test - Visit website & Create Account',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
        {
          order: 2,
          title: 'Complete Your Profile',
          description: 'Fill in your profile details, study abroad plans, and personal information, then click "Continue".',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369009/apex_products/redemption/duolingo_redemption_step2.jpg',
            publicId: 'apex_products/redemption/duolingo_redemption_step2',
            alt: 'Duolingo English Test Complete Profile screen',
            caption: 'Duolingo English Test - Complete Profile',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
        {
          order: 3,
          title: 'Get Access to Dashboard',
          description: 'On your Duolingo English Test dashboard, click on "Purchase a Test".',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369011/apex_products/redemption/duolingo_redemption_step3.jpg',
            publicId: 'apex_products/redemption/duolingo_redemption_step3',
            alt: 'Duolingo English Test Dashboard - Purchase a Test screen',
            caption: 'Duolingo English Test - Dashboard Access',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
        {
          order: 4,
          title: 'Select Your Test Option',
          description: 'Choose the Single Test option (or bundle if applicable). You will receive your results within 2 days at no extra fee.',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369012/apex_products/redemption/duolingo_redemption_step4.jpg',
            publicId: 'apex_products/redemption/duolingo_redemption_step4',
            alt: 'Duolingo English Test choose test options screen',
            caption: 'Duolingo English Test - Purchase Options',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
        {
          order: 5,
          title: 'Apply Voucher Code & Confirm',
          description: 'Enter your Apex Voucher code in the "Coupon Code" field and apply it. Your payable amount will reduce to zero. Complete checkout and start your test when ready!',
          screenshot: {
            url: 'https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369014/apex_products/redemption/duolingo_redemption_step5.jpg',
            publicId: 'apex_products/redemption/duolingo_redemption_step5',
            alt: 'Duolingo English Test Apply Coupon Code and Checkout screen',
            caption: 'Duolingo English Test - Apply Coupon Code',
            width: 1200,
            height: 600,
          },
          importantNote: '',
          videoUrl: '',
        },
      ],
      warnings: [
        'The redemption process is quick and simple. If you encounter any issues redeeming your voucher, our support team is available to assist you via WhatsApp or Email.',
      ],
      lastUpdated: new Date(),
    },
    productContent: {
      enabled: true,
      heading: 'About the Duolingo English Test Voucher',
      content: `<h2>Duolingo English Test Coupon Code 2026: Save 18% Today</h2>
<figure>
  <img src="https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369026/apex_blog/images/duolingo_exam_guide.jpg" alt="Duolingo English Test Voucher Guide" loading="lazy" />
  <figcaption>Duolingo English Test (DET) 2026 — Flat 18% Discount</figcaption>
</figure>
<p>Looking to take the Duolingo English Test without paying heavy international card fees or full retail price? With <strong>Apex Vouchers</strong>, you get verified, instant DET discount vouchers that let you pay in local INR currency via UPI, Google Pay, PhonePe, or Net Banking, while saving up to ₹1,268 on your exam.</p>

<table>
  <thead>
    <tr>
      <th>Details</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Regular Duolingo Test Fee</td>
      <td>₹6,667</td>
    </tr>
    <tr>
      <td>Apex Vouchers Discounted Price</td>
      <td>₹5,499</td>
    </tr>
    <tr>
      <td>Extra Coupon Discount (Code: DET100)</td>
      <td>-₹100</td>
    </tr>
    <tr>
      <td><strong>Final Price via Apex Vouchers</strong></td>
      <td><strong>₹5,399</strong></td>
    </tr>
    <tr>
      <td><strong>Total Savings</strong></td>
      <td><strong>₹1,268 (19% OFF)</strong></td>
    </tr>
  </tbody>
</table>

<h2>What is a Duolingo English Test Coupon Code?</h2>
<p>A Duolingo promo code is a 100% genuine prepaid digital voucher. Instead of paying the full fee on the official site (which requires an international credit card and incurs additional forex transaction charges), you purchase a voucher from Apex Vouchers in Indian Rupees (INR) and apply it directly on <strong>englishtest.duolingo.com</strong> at checkout to waive off the registration fee.</p>

<h2>Benefits of Using Apex Vouchers for Duolingo English Test</h2>
<ul>
  <li><p><strong>Instant Email Delivery:</strong> Receive your 100% authentic voucher code within 2 minutes of payment.</p></li>
  <li><p><strong>No International Credit Card Needed:</strong> Pay effortlessly with UPI, Google Pay, PhonePe, Paytm, Debit Cards, or Net Banking.</p></li>
  <li><p><strong>Official &amp; Verified:</strong> Redemptions occur directly on the official Duolingo portal with guaranteed validity.</p></li>
  <li><p><strong>Unlimited Free Score Reporting:</strong> Unlike IELTS/TOEFL which charge extra after 4–5 universities, DET allows you to send scores to unlimited universities at zero extra charge.</p></li>
  <li><p><strong>24/7 Dedicated Support:</strong> Our team is available round-the-clock via WhatsApp and email to assist you with registration or redemption questions.</p></li>
</ul>

<h2>Why Choose the Duolingo English Test?</h2>
<figure>
  <img src="https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369030/apex_blog/images/duolingo_exam_pattern_syllabus.jpg" alt="Duolingo Exam Pattern and Syllabus" loading="lazy" />
  <figcaption>DET Exam Structure &amp; Adaptive Format</figcaption>
</figure>
<p><strong>1. Take the Test Anytime from Home</strong><br/>Traditional tests like IELTS or TOEFL require booking appointments weeks ahead and traveling to a crowded testing centre. With the Duolingo English Test, you can take the test from your home whenever you are ready — 24 hours a day, 365 days a year.</p>

<p><strong>2. Fast 1-Hour Test Duration</strong><br/>While other proficiency exams take nearly 3 hours, the DET takes only 60 minutes, helping you maintain peak focus and energy throughout the exam.</p>

<p><strong>3. Certified Results in Just 48 Hours</strong><br/>Receive your official, certified score report in 48 hours (or 12 hours with Fast Track). Perfect for meeting urgent university application deadlines.</p>
<figure>
  <img src="https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369036/apex_blog/images/duolingo_test_result.jpg" alt="Duolingo English Test Result" loading="lazy" />
  <figcaption>Duolingo English Test Score Breakdown</figcaption>
</figure>

<p><strong>4. AI-Powered Adaptive Testing</strong><br/>The test adapts to your ability level in real-time. If you answer correctly, subsequent questions become more challenging; if you make a mistake, questions adjust accordingly. This provides an accurate measurement without unnecessary filler questions.</p>

<p><strong>5. Global Acceptance by 6,000+ Higher Ed Institutions</strong><br/>Accepted by top global universities including Yale, Harvard, Stanford, MIT, Columbia, NYU, Imperial College London, University of Toronto, McGill, and many more.</p>
<figure>
  <img src="https://res.cloudinary.com/nbcbpuql/image/upload/f_auto,q_auto/v1788369045/apex_blog/images/duolingo_test_validity.jpg" alt="Duolingo English Test Validity" loading="lazy" />
  <figcaption>DET Scores are Valid for 2 Years</figcaption>
</figure>

<h2>Top Universities Worldwide Accepting DET Scores</h2>
<table>
  <thead>
    <tr>
      <th>Country</th>
      <th>Prominent Accepting Universities</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>United States (USA)</strong></td>
      <td>MIT, Harvard University, Stanford University, Yale University, Columbia University, NYU, UC Berkeley, Johns Hopkins, UCLA, University of Chicago</td>
    </tr>
    <tr>
      <td><strong>Canada</strong></td>
      <td>University of Toronto, McGill University, University of British Columbia (UBC), University of Waterloo, McMaster University, University of Alberta</td>
    </tr>
    <tr>
      <td><strong>United Kingdom (UK)</strong></td>
      <td>Imperial College London, UCL, King’s College London, University of Warwick, University of Southampton, University of Glasgow</td>
    </tr>
    <tr>
      <td><strong>Australia &amp; New Zealand</strong></td>
      <td>University of Melbourne, Monash University, UNSW Sydney, University of Queensland, University of Auckland</td>
    </tr>
    <tr>
      <td><strong>Ireland &amp; Europe</strong></td>
      <td>Trinity College Dublin, University College Dublin (UCD), National University of Ireland Galway</td>
    </tr>
  </tbody>
</table>

<h2>Duolingo English Test (DET) Requirements 2026</h2>
<ul>
  <li><p><strong>Valid Passport:</strong> For candidates in India, a valid original passport is mandatory for identity verification and score certification.</p></li>
  <li><p><strong>Computer Setup:</strong> A desktop or laptop with a working front-facing webcam, microphone, speakers, and stable high-speed internet (min. 2 Mbps).</p></li>
  <li><p><strong>Private Environment:</strong> A quiet, well-lit room where you are completely alone with no external noise or distractions.</p></li>
  <li><p><strong>Test Validity:</strong> Once you purchase and apply your voucher code, complete your test within the designated validity window.</p></li>
</ul>`,
    },
  };

  let product = await Product.findOne({
    $or: [
      { name: /duolingo/i },
      { slug: 'duolingo-english-test-voucher' },
      { slug: 'duolingo-english-test' },
    ],
  });

  if (!product) {
    product = new Product(duolingoData);
    await product.save();
    console.log('[update] Created Duolingo product:', product._id);
  } else {
    Object.assign(product, duolingoData);
    await product.save();
    console.log('[update] Updated Duolingo product:', product._id, 'slug:', product.slug);
  }

  process.exit(0);
}

updateDuolingo().catch(err => {
  console.error(err);
  process.exit(1);
});
