export const PRODUCTS = [
  {
    id: "pte-academic",
    name: "Pearson PTE Academic Voucher",
    brand: "Pearson PTE",
    category: "Exam Voucher",
    originalPrice: 18900,
    discountedPrice: 15499,
    savings: 3401,
    discountPercent: 18,
    cta: "Buy Now",
    inStock: true,
    rating: 4.9,
    reviewsCount: 1420,
    badge: "🔥 Best Seller",
    description: "Official voucher code for Pearson PTE Academic Exam. Save ₹3,401 instantly on your test booking fee with guaranteed official acceptance.",
    inclusions: [
      "Official 100% Genuine Pearson Voucher Code",
      "2 Scored Official Mock Tests Included (Worth ₹2,200)",
      "Instant Email + WhatsApp Delivery in 10 seconds",
      "6-Month Validity Period",
      "Free 1-Time Reschedule Guide & Exam Prep Blueprint"
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
    name: "Pearson PTE Core Voucher",
    brand: "Pearson PTE",
    category: "Exam Voucher",
    originalPrice: 18900,
    discountedPrice: 15799,
    savings: 3101,
    discountPercent: 16,
    cta: "Buy Now",
    inStock: true,
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
    name: "ETS GRE Voucher",
    brand: "ETS GRE",
    category: "Exam Voucher",
    originalPrice: 22500,
    discountedPrice: 19799,
    savings: 2701,
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
      "12-Month Validity Period",
      "Analytical Writing Essay Rubric Guide"
    ],
    redemptionSteps: [
      "Log into ets.org/gre.",
      "Register for GRE General Test (At Home or Test Center).",
      "Apply voucher code on checkout page to waive test fee."
    ]
  },
  {
    id: "ets-toefl",
    name: "ETS TOEFL Voucher",
    brand: "ETS TOEFL",
    category: "Exam Voucher",
    originalPrice: 18000,
    discountedPrice: 13999,
    savings: 4001,
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
      "1-Year Extended Validity",
      "Speaking & Writing AI Scoring Blueprint"
    ],
    redemptionSteps: [
      "Visit ets.org/toefl and log into your ETS account.",
      "Schedule your test appointment.",
      "Paste your Apex Voucher code on the payment screen to apply ₹18,000 credit."
    ]
  },
  {
    id: "duolingo-english",
    name: "Duolingo English Test Voucher",
    brand: "Duolingo",
    category: "Exam Voucher",
    originalPrice: 6112.50,
    discountedPrice: 4999,
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
      "Instant Code Delivery via WhatsApp & Email",
      "Duolingo Subscore Boost Tips"
    ],
    redemptionSteps: [
      "Go to englishtest.duolingo.com and purchase test.",
      "Enter your Apex Promo Code in the coupon field at checkout.",
      "Start or schedule your test anytime within 90 days."
    ]
  },
  {
    id: "pte-practice-test",
    name: "Pearson PTE Practice Test",
    brand: "Pearson PTE",
    category: "Practice/Mock",
    originalPrice: 1132.50,
    discountedPrice: 799.00,
    savings: 333.50,
    discountPercent: 29,
    cta: "Select Options",
    inStock: false, // Out of Stock demonstration state
    rating: 4.7,
    reviewsCount: 520,
    badge: "Out of Stock",
    description: "Official Scored PTE Mock Test with automated AI score report. Real exam interface and scoring algorithm.",
    inclusions: [
      "Official Scored Practice Test Access Code",
      "Detailed Score Report Breakdown (Enabling Skill Scores)",
      "Instant AI Evaluation within 2 Hours",
      "3-Month Access Window"
    ],
    redemptionSteps: [
      "Log into Pearson PTE Practice portal.",
      "Redeem access code to unlock Version D or E mock exam."
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
    name: "Rohan Kulkarni",
    city: "Pune",
    exam: "ETS GRE",
    score: "328 / 340",
    saved: "₹2,701",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    comment: "Flawless experience! Used the GRE voucher on official ETS site without any issues. The savings covered my prep books. High recommendation for any study abroad aspirant."
  },
  {
    id: 3,
    name: "Meera Nair",
    city: "Kochi",
    exam: "TOEFL iBT",
    score: "112 / 120",
    saved: "₹4,001",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    comment: "Saved ₹4,000 on TOEFL! Got the voucher immediately and the free prep guides included were super helpful for my writing section."
  }
];

export const FAQ_ITEMS = [
  {
    question: "What is an exam voucher?",
    answer: "An exam voucher is an official prepaid digital discount code issued by institutional test organizers (Pearson, ETS, Duolingo). When entered during checkout on official test booking portals, it waives or reduces your exam registration fee."
  },
  {
    question: "How quickly will I receive my voucher?",
    answer: "Instantly! Our automated issuing system delivers your unique voucher code within 10 seconds of successful payment directly to your Email, WhatsApp, and User Dashboard."
  },
  {
    question: "How do I redeem my voucher?",
    answer: "Visit the official test site (e.g. mypte.pearsonpte.com or ets.org), choose your preferred exam center and date, and paste your Apex Voucher code into the 'Voucher / Promo Code' box at checkout. Your fee drops instantly!"
  },
  {
    question: "How long is the voucher valid?",
    answer: "Voucher validity ranges from 6 to 12 months depending on the exam (PTE vouchers: 6 months; GRE/TOEFL: 12 months; Duolingo: 90 days). You can book your test slot for any date within this validity period."
  },
  {
    question: "Can I use the voucher for any test center?",
    answer: "Yes! Our official exam vouchers are valid across all authorized test centers nationwide as well as for Online/Home Edition exams."
  },
  {
    question: "Can I get a refund?",
    answer: "Yes. We offer a 100% Money-Back Guarantee within 7 days of purchase, provided the voucher code has not been redeemed on the official exam portal."
  },
  {
    question: "Can I transfer my voucher?",
    answer: "Yes, absolutely. You can transfer your unredeemed voucher code to a friend or classmate anytime with 1-click inside your User Dashboard."
  },
  {
    question: "Is payment secure?",
    answer: "100% secure. All transactions are processed via bank-grade PCI-DSS compliant payment gateways with 256-bit SSL encryption. We support UPI, Credit/Debit Cards, NetBanking, and EMI."
  },
  {
    question: "Which exams do you support?",
    answer: "We support Pearson PTE Academic, Pearson PTE Core (Canada PR approved), ETS GRE General Test, ETS TOEFL iBT, and Duolingo English Test vouchers."
  },
  {
    question: "What happens if I need help?",
    answer: "Our dedicated student support team is available 24/7 via WhatsApp (+91 9855926113) and email (apexvouchers@gmail.com) to assist you with booking, date selection, or code redemption."
  }
];

export const SOCIAL_PROOF_EVENTS = [
  { name: "Rahul M.", city: "Mumbai", exam: "PTE Academic", saved: "₹3,401", time: "2 mins ago" },
  { name: "Priya S.", city: "Bengaluru", exam: "TOEFL iBT", saved: "₹4,001", time: "5 mins ago" },
  { name: "Vikram R.", city: "Hyderabad", exam: "ETS GRE", saved: "₹2,701", time: "8 mins ago" },
  { name: "Sneha P.", city: "Ahmedabad", exam: "Duolingo English", saved: "₹1,113", time: "12 mins ago" },
  { name: "Karan D.", city: "Chandigarh", exam: "PTE Core", saved: "₹3,101", time: "15 mins ago" }
];

export const SEEDED_USER_VOUCHERS = [
  {
    id: "ord-88321",
    productName: "Pearson PTE Academic Voucher",
    code: "APEX-PTE-8921-X7K",
    purchaseDate: "2026-08-01",
    expiryDate: "2027-02-01",
    daysRemaining: 174,
    status: "Active",
    originalPrice: 18900,
    paidPrice: 15499,
    savings: 3401,
    inclusions: ["PTE Academic Exam Voucher", "2 Official Scored Mock Tests", "Reschedule Guide"]
  }
];
