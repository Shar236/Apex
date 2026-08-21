export const PRODUCTS = [
  {
    id: "pte-practice-test",
    name: "Pearson PTE Practice Test",
    brand: "Pearson PTE",
    provider: "Pearson PTE",
    category: "Practice Test",
    originalPrice: 1132.50,
    discountedPrice: 799.00,
    savings: 333.50,
    discountPercent: 29,
    cta: "Select Options",
    inStock: false,
    displayOrder: 1,
    validityMonths: 3,
    deliveryType: "Instant Digital Delivery",
    rating: 4.7,
    reviewsCount: 520,
    badge: "Out of stock",
    description: "Official Scored PTE Mock Test with automated AI score report. Real exam interface and scoring algorithm.",
    inclusions: [
      "Official Scored Practice Test Access Code",
      "Detailed Score Report Breakdown",
      "Instant AI Evaluation within 2 Hours",
      "3-Month Access Window"
    ],
    redemptionSteps: [
      "Log into Pearson PTE Practice portal.",
      "Redeem access code to unlock mock exam."
    ]
  },
  {
    id: "pte-academic",
    name: "Pearson PTE Academic",
    brand: "Pearson PTE",
    provider: "Pearson PTE",
    category: "Exam Voucher",
    originalPrice: 18900.00,
    discountedPrice: 14999.00,
    savings: 3901.00,
    discountPercent: 21,
    cta: "Buy Now",
    inStock: true,
    displayOrder: 2,
    validityMonths: 6,
    deliveryType: "Instant Digital Delivery",
    rating: 4.9,
    reviewsCount: 1420,
    badge: "🔥 Best Seller",
    description: "Official voucher code for Pearson PTE Academic Exam. Save ₹3,901 instantly on your test booking fee with guaranteed official acceptance.",
    inclusions: [
      "Official 100% Genuine Pearson Voucher Code",
      "2 Scored Official Mock Tests Included",
      "Instant Email + WhatsApp Delivery in 10 seconds",
      "6-Month Validity Period",
      "Free 1-Time Reschedule Guide"
    ],
    redemptionSteps: [
      "Visit mypte.pearsonpte.com and create or log in to your account.",
      "Select your preferred test center, date, and time slot.",
      "Proceed to checkout and paste your Apex Voucher code in the 'Voucher / Promo Code' box.",
      "Your total payable will drop to ₹0 instantly! Confirm your appointment."
    ]
  },
  {
    id: "pte-core",
    name: "Pearson PTE Core",
    brand: "Pearson PTE",
    provider: "Pearson PTE",
    category: "Exam Voucher",
    originalPrice: 18900.00,
    discountedPrice: 15799.00,
    savings: 3101.00,
    discountPercent: 16,
    cta: "Buy Now",
    inStock: true,
    displayOrder: 3,
    validityMonths: 6,
    deliveryType: "Instant Digital Delivery",
    rating: 4.8,
    reviewsCount: 680,
    badge: "🇨🇦 Canada PR Approved",
    description: "Save big on the PTE Core exam required for Canada Permanent Residency (IRCC approved). Guaranteed valid and instantly delivered.",
    inclusions: [
      "Official IRCC-Accepted PTE Core Voucher Code",
      "2 Full-Length Practice Test Sets",
      "Instant 10-Second Digital Delivery",
      "6-Month Voucher Validity",
      "Canada Immigration Point Calculator Guide"
    ],
    redemptionSteps: [
      "Log into your official Pearson PTE Core portal.",
      "Select PTE Core exam & choose your test venue.",
      "Enter your Apex Voucher code at final payment step to complete booking."
    ]
  },
  {
    id: "ets-gre",
    name: "ETS GRE",
    brand: "ETS GRE",
    provider: "ETS GRE",
    category: "Exam Voucher",
    originalPrice: 22500.00,
    discountedPrice: 19799.00,
    savings: 2701.00,
    discountPercent: 12,
    cta: "Buy Now",
    inStock: true,
    rating: 4.9,
    reviewsCount: 910,
    badge: "🎓 Grad School Top Pick",
    description: "Discounted exam voucher code for ETS GRE General Test. Accepted by top universities worldwide across US, UK, Canada & Europe.",
    inclusions: [
      "Official ETS GRE General Test Voucher Code",
      "GRE POWERPREP Online Practice Discount",
      "Instant Code Delivery via Email & SMS",
      "12-Month Validity Period"
    ],
    redemptionSteps: [
      "Log into ets.org/gre.",
      "Register for GRE General Test (At Home or Test Center).",
      "Apply voucher code on checkout page to waive test fee."
    ]
  },
  {
    id: "ets-toefl",
    name: "ETS TOEFL",
    brand: "ETS TOEFL",
    provider: "ETS TOEFL",
    category: "Exam Voucher",
    originalPrice: 18000.00,
    discountedPrice: 13999.00,
    savings: 4001.00,
    discountPercent: 22,
    cta: "Buy Now",
    inStock: true,
    rating: 4.9,
    reviewsCount: 840,
    badge: "⚡ Max Discount (22% OFF)",
    description: "Save ₹4,001 on the TOEFL iBT test. Preferred by over 12,000 universities in 160+ countries including US Ivy Leagues.",
    inclusions: [
      "Official ETS TOEFL iBT Voucher Code",
      "Interactive TOEFL Practice Test Set",
      "Instant Delivery within seconds",
      "1-Year Extended Validity"
    ],
    redemptionSteps: [
      "Visit ets.org/toefl and log into your ETS account.",
      "Schedule your test appointment.",
      "Paste your Apex Voucher code on the payment screen."
    ]
  },
  {
    id: "duolingo-english",
    name: "Duolingo English Test",
    brand: "Duolingo",
    provider: "Duolingo",
    category: "Exam Voucher",
    originalPrice: 6112.50,
    discountedPrice: 4999.00,
    savings: 1113.50,
    discountPercent: 18,
    cta: "Buy Now",
    inStock: true,
    rating: 4.8,
    reviewsCount: 1150,
    badge: "🚀 Fast 48h Results",
    description: "Get 18% off the fast, accessible Duolingo English Test. Complete at home in 1 hour and send scores to unlimited universities for free.",
    inclusions: [
      "Official Duolingo English Test Coupon Code",
      "Priority Result Verification Support",
      "Unlimited Score Sends to Universities",
      "Instant Code Delivery via WhatsApp & Email"
    ],
    redemptionSteps: [
      "Go to englishtest.duolingo.com and purchase test.",
      "Enter your Apex Promo Code in the coupon field at checkout."
    ]
  },
  {
    id: "act-exam",
    name: "ACT Exam Voucher",
    brand: "ACT",
    provider: "ACT",
    category: "Exam Voucher",
    originalPrice: 19800.00,
    discountedPrice: 12999.00,
    savings: 6801.00,
    discountPercent: 34,
    cta: "Buy Now",
    inStock: true,
    rating: 4.8,
    reviewsCount: 380,
    badge: "⭐ Top Savings",
    description: "Official voucher code for ACT College Readiness Assessment. Accepted by all four-year US colleges and universities.",
    inclusions: [
      "Official ACT Registration Voucher Code",
      "ACT Practice Test & Prep Guide",
      "Instant Delivery via WhatsApp & Email",
      "12-Month Validity"
    ],
    redemptionSteps: [
      "Go to my.act.org and create or log into your account.",
      "Choose your test date and test center.",
      "Apply voucher code on checkout page."
    ]
  },
  {
    id: "oet-exam",
    name: "OET Exam Voucher",
    brand: "OET",
    provider: "OET",
    category: "Exam Voucher",
    originalPrice: 38940.00,
    discountedPrice: 30900.00,
    savings: 8040.00,
    discountPercent: 21,
    cta: "Buy Now",
    inStock: true,
    rating: 4.9,
    reviewsCount: 420,
    badge: "🏥 Healthcare Preferred",
    description: "Official Occupational English Test (OET) voucher for healthcare professionals (Doctors, Nurses, Dentists & Pharmacists).",
    inclusions: [
      "Official OET Test Booking Voucher Code",
      "Profession-Specific Prep Material Pack",
      "Priority Customer Support",
      "12-Month Validity"
    ],
    redemptionSteps: [
      "Visit oet.com and register your OET booking.",
      "Enter voucher code at the payment gateway to complete registration."
    ]
  },
  {
    id: "ielts-voucher",
    name: "IELTS Exam Voucher / Preparation",
    brand: "IELTS",
    provider: "IELTS",
    category: "Exam Voucher",
    originalPrice: 99.00,
    discountedPrice: 99.00,
    savings: 0,
    discountPercent: 0,
    cta: "Buy Now",
    inStock: true,
    rating: 4.9,
    reviewsCount: 2240,
    badge: "🔥 Live Prediction",
    description: "IELTS official test booking assistance, high-yield prediction files, speaking cue cards and slot reservation voucher.",
    inclusions: [
      "Official IELTS Practice & Prediction Blueprint",
      "Speaking Band 8+ Sample Answers",
      "Instant Download Link via Email & WhatsApp"
    ],
    redemptionSteps: [
      "Download preparation material and use booking discount during registration."
    ]
  },
  {
    id: "languagecert-exam",
    name: "LanguageCert Exam Voucher",
    brand: "LanguageCert",
    provider: "LanguageCert",
    category: "Exam Voucher",
    originalPrice: 16430.00,
    discountedPrice: 11000.00,
    savings: 5430.00,
    discountPercent: 33,
    cta: "Buy Now",
    inStock: true,
    rating: 4.8,
    reviewsCount: 310,
    badge: "🇬🇧 UK SELT Approved",
    description: "Official LanguageCert International ESOL & SELT examination voucher. Fast 3-day results with online live proctoring.",
    inclusions: [
      "Official LanguageCert Exam Voucher Code",
      "Take2 Free Re-sit Option Included",
      "Online Proctoring at Home 24/7",
      "12-Month Voucher Validity"
    ],
    redemptionSteps: [
      "Visit languagecert.org and select your examination.",
      "Enter the promo voucher code at checkout to book exam at ₹0."
    ]
  },
  {
    id: "celpip-exam",
    name: "CELPIP Exam Voucher",
    brand: "CELPIP",
    provider: "CELPIP",
    category: "Exam Voucher",
    originalPrice: 18290.00,
    discountedPrice: 14500.00,
    savings: 3790.00,
    discountPercent: 21,
    cta: "Buy Now",
    inStock: true,
    rating: 4.8,
    reviewsCount: 560,
    badge: "🇨🇦 Canada PR / IRCC",
    description: "Official CELPIP-General test voucher code for Canadian immigration (IRCC) and professional designation.",
    inclusions: [
      "Official 100% Genuine CELPIP Voucher Code",
      "2 Free CELPIP Practice Tests (Online)",
      "Instant 10-Second Digital Delivery",
      "6-Month Validity Period"
    ],
    redemptionSteps: [
      "Go to celpip.ca and create or log in to your account.",
      "Select your test date and location.",
      "Apply voucher code at the payment screen."
    ]
  },
  {
    id: "pte-canada",
    name: "Pearson PTE Canada Voucher",
    brand: "Pearson PTE",
    provider: "Pearson PTE",
    category: "Exam Voucher",
    originalPrice: 28000.00,
    discountedPrice: 25799.00,
    savings: 2201.00,
    discountPercent: 8,
    cta: "Buy Now",
    inStock: true,
    displayOrder: 4,
    validityMonths: 6,
    deliveryType: "Instant Digital Delivery",
    rating: 4.9,
    reviewsCount: 780,
    badge: "🇨🇦 Express Entry",
    description: "Official Pearson PTE Canada voucher for Express Entry, Provincial Nominee Programs (PNP) and Canadian citizenship.",
    inclusions: [
      "Official Pearson PTE Canada Exam Code",
      "Express Delivery via WhatsApp & Email",
      "Free Immigration Score Conversion Chart",
      "6-Month Validity Period"
    ],
    redemptionSteps: [
      "Visit mypte.pearsonpte.com and select PTE Core / Canada.",
      "Apply voucher code at payment to finalize booking."
    ]
  }
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Ananya Sharma",
    city: "Delhi",
    exam: "PTE Academic",
    score: "86 / 90",
    saved: "₹3,401",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    comment: "I was skeptical at first about buying a voucher online, but Apex delivered the code in literally 8 seconds on WhatsApp! Saved ₹3,400+ on my PTE test. Scored 86 overall!"
  },
  {
    id: 2,
    name: "Rohan Patel",
    city: "Ahmedabad",
    exam: "PTE Core",
    score: "CLB 9",
    saved: "₹3,101",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    comment: "Used the PTE Core voucher for my Canada PR application. Code worked smoothly on the Pearson portal. The included mock tests were super helpful!"
  },
  {
    id: 3,
    name: "Priya Venkatesh",
    city: "Bangalore",
    exam: "ETS GRE",
    score: "328 / 340",
    saved: "₹2,701",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    comment: "Instant GRE voucher delivery at midnight! Got ₹2,700 off and booked my center test immediately. Highly recommend Apex Vouchers."
  },
  {
    id: 4,
    name: "Gurpreet Singh",
    city: "Chandigarh",
    exam: "ETS TOEFL",
    score: "112 / 120",
    saved: "₹4,001",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    comment: "Saved ₹4,000 on my TOEFL iBT voucher. Support was responsive on WhatsApp when I had questions. Received my score report last week!"
  }
];

export const FAQ_ITEMS = [
  {
    question: "How do I redeem my exam voucher?",
    answer: "After purchasing, you will receive a unique voucher code via email and WhatsApp. Go to the official test provider's website (e.g., mypte.pearsonpte.com or ets.org), proceed through the booking steps, and enter the voucher code in the 'Promo / Voucher Code' field at checkout. Your test fee will be discounted or waived completely.",
    q: "How do I redeem my exam voucher?",
    a: "After purchasing, you will receive a unique voucher code via email and WhatsApp. Go to the official test provider's website (e.g., mypte.pearsonpte.com or ets.org), proceed through the booking steps, and enter the voucher code in the 'Promo / Voucher Code' field at checkout. Your test fee will be discounted or waived completely."
  },
  {
    question: "How fast will I receive my voucher code?",
    answer: "Voucher delivery is 100% automated and instant! You will receive your code via email and WhatsApp within 10 to 30 seconds after successful payment.",
    q: "How fast will I receive my voucher code?",
    a: "Voucher delivery is 100% automated and instant! You will receive your code via email and WhatsApp within 10 to 30 seconds after successful payment."
  },
  {
    question: "Are these voucher codes genuine and official?",
    answer: "Yes, 100%. All voucher codes sold by Apex Vouchers are authentic, official codes procured directly through authorized institutional channels. They carry a 100% Money-Back Validity Guarantee.",
    q: "Are these voucher codes genuine and official?",
    a: "Yes, 100%. All voucher codes sold by Apex Vouchers are authentic, official codes procured directly through authorized institutional channels. They carry a 100% Money-Back Validity Guarantee."
  },
  {
    question: "How long is my voucher valid?",
    answer: "PTE and Duolingo vouchers are valid for 6 months from the date of purchase. GRE and TOEFL vouchers are valid for 12 months. You must use the code to book your exam before the validity expires.",
    q: "How long is my voucher valid?",
    a: "PTE and Duolingo vouchers are valid for 6 months from the date of purchase. GRE and TOEFL vouchers are valid for 12 months. You must use the code to book your exam before the validity expires."
  },
  {
    question: "Can I reschedule my exam after using a voucher?",
    answer: "Yes! Rescheduling follows the official test provider's standard policy. Pearson and ETS allow rescheduling through your official candidate dashboard.",
    q: "Can I reschedule my exam after using a voucher?",
    a: "Yes! Rescheduling follows the official test provider's standard policy. Pearson and ETS allow rescheduling through your official candidate dashboard."
  },
  {
    question: "What payment methods are supported?",
    answer: "We support UPI (GPay, PhonePe, Paytm), Credit Cards, Debit Cards, Net Banking, and major digital wallets via our secure payment gateway.",
    q: "What payment methods are supported?",
    a: "We support UPI (GPay, PhonePe, Paytm), Credit Cards, Debit Cards, Net Banking, and major digital wallets via our secure payment gateway."
  }
];

export const SOCIAL_PROOF_EVENTS = [
  { name: "Rahul S.", city: "Mumbai", exam: "PTE Academic Voucher", timeAgo: "2 mins ago" },
  { name: "Simran K.", city: "Amritsar", exam: "PTE Core Voucher", timeAgo: "5 mins ago" },
  { name: "Aditya M.", city: "Hyderabad", exam: "ETS GRE Voucher", timeAgo: "8 mins ago" },
  { name: "Sneha R.", city: "Pune", exam: "ETS TOEFL Voucher", timeAgo: "12 mins ago" },
  { name: "Vikram N.", city: "Delhi", exam: "Duolingo English Test", timeAgo: "15 mins ago" },
  { name: "Harpreet B.", city: "Ludhiana", exam: "PTE Academic Voucher", timeAgo: "19 mins ago" }
];
