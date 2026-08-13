# Apex Voucher — Master Website Build Prompt

Copy everything below the line into an AI website builder (v0, Bolt, Lovable, Cursor, Claude, etc.) or hand it to a developer/designer as a creative + technical brief.

---

## THE PROMPT

You are a senior full-stack product designer and developer. Build a premium, high-conversion e-commerce website for **"Apex Voucher"** — a platform that sells discounted exam vouchers and coupon codes for English proficiency and standardized tests: **PTE Academic, PTE Core, PTE Practice Test, IELTS, TOEFL, GRE, GMAT, and Duolingo English Test**.

The site must feel more premium, trustworthy, and modern than existing competitors in this niche (PTENOTE, EduVouchers, Pearson PTE, AlfaPTE, Gurully) — which currently look flat, template-y, and dated. Apex Voucher should feel like a fusion of a fintech checkout (Stripe/Razorpay-level trust and polish) and a modern SaaS product (Linear/Framer-level motion and 3D depth).

### 1. BRAND & ART DIRECTION

- **Name:** Apex Voucher
- **Tagline options:** "Book Smarter. Save More." / "Your Exam. Your Voucher. Your Price." / "Skip the Fee, Not the Test."
- **Mood:** confident, premium, fast, trustworthy — not "cheap discount site." Think exam-prep meets fintech.
- **Color system:** deep indigo/navy (#1A1F3B) or near-black base, one electric accent (violet #7C3AED or pink-magenta #EC4899 similar to the reference screenshot's "Buy Now" buttons), a success green for prices/savings, and a soft off-white background (#F7F7FB) for light sections. Support dark mode.
- **Typography:** a confident geometric sans for headings (e.g., Clash Display, Satoshi, or General Sans) paired with a clean readable body font (Inter or Plus Jakarta Sans). Strong type hierarchy, generous whitespace.
- **Design language:** rounded-xl cards, soft layered shadows, glassmorphism panels on dark sections, subtle gradient meshes/blobs in the background, no harsh flat template look.

### 2. 3D & INTERACTIVE UI REQUIREMENTS

- **Hero section:** a 3D animated voucher/ticket card (built with Three.js / React Three Fiber, or a CSS 3D transform fallback) that gently rotates on scroll and tilts toward the cursor (mouse-parallax tilt, like Apple product pages).
- **Product cards (voucher cards):** on hover, cards lift with a soft shadow, tilt slightly in 3D (perspective transform), and reveal a subtle shine/glare sweep across the card surface.
- **Scroll-triggered animations:** fade/slide-up reveals on sections using Framer Motion or GSAP + ScrollTrigger; a progress bar or animated counter for "Vouchers Sold," "Money Saved," "Students Booked."
- **Interactive price calculator widget:** slider or dropdown where the user picks exam type → sees official price, Apex price, and animated "You Save ₹X" counter.
- **Live/animated trust strip:** rotating logos of supported exams (Pearson, ETS, Duolingo) and payment partners (UPI, Razorpay, Visa/Mastercard) with a subtle marquee scroll.
- **Micro-interactions:** button ripple/magnetic hover effect, animated cart/checkout icon, confetti or checkmark burst animation on successful purchase.
- **Optional "wow" feature:** an interactive 3D globe or India map showing live pins of "X people just booked in [city]" for social proof (like a real-time activity feed).
- Keep performance in mind: lazy-load 3D scenes, reduce motion for `prefers-reduced-motion`, and ensure mobile has a lighter 2D fallback of the same interactions.

### 3. INFORMATION ARCHITECTURE / PAGES

1. **Home** — hero with 3D voucher, trust badges, exam category grid, best-seller vouchers, savings calculator, how-it-works (3 steps), testimonials/reviews carousel, AI mock-test/scoring teaser, FAQ accordion, footer with newsletter signup.
2. **Shop / All Vouchers** — grid of all products (see catalog below) with filters (exam type, price range, in stock/out of stock, discount %) and sort (popularity, price, newest). Mirror the reference screenshot layout (product image/logo, strike-through original price, bold discounted price, colored CTA button, "Out of Stock" ribbon when applicable).
3. **Product Detail Page** — exam logo, description, what's included (voucher + mock tests + expert evaluation, etc.), validity period, refund/transfer policy, quantity selector, "Buy Now" / "Select Options" (for variant products like Practice Test), reviews, related products.
4. **Checkout / Cart** — clean single-page checkout: cart summary → contact details (name, mobile, email, WhatsApp) → payment (UPI/Cards/Net Banking/PayPal) → order confirmation with instant voucher delivery via email/SMS/WhatsApp.
5. **My Account Dashboard** (full user control over their vouchers):
   - Active vouchers with status (Available / Used / Expired / Refund Requested)
   - Voucher code reveal with copy-to-clipboard and "How to redeem" walkthrough
   - Order history & invoices (downloadable PDF)
   - Request refund / request transfer-to-friend flow
   - Countdown to voucher expiry
   - Support ticket / live chat history
6. **How It Works** — step-by-step visual timeline (Choose Exam → Pay Securely → Get Code in Seconds → Redeem on Official Site).
7. **Exam Guides / Blog** — SEO content hub: "PTE Voucher Guide 2026," "PTE vs TOEFL vs IELTS," scoring tips, practice resources.
8. **About / Trust & Legal** — company info, refund policy, terms, verified-partner disclaimers (important for a voucher resale business — be transparent that Apex Voucher is an authorized reseller/partner, not the exam body).
9. **Support** — WhatsApp chat widget, contact form, FAQ, live agent hours.
10. **Testimonials / Success Stories** — video + text reviews with score screenshots.

### 4. PRODUCT CATALOG (seed data, based on provided reference image)

| Product | Category | Original Price | Discounted Price | CTA |
|---|---|---|---|---|
| Pearson PTE Practice Test | Practice/Mock | ₹1,132.50 | ₹799.00 | Select Options (Out of Stock state supported) |
| Pearson PTE Academic Voucher | Exam Voucher | ₹18,900.00 | ₹15,499.00 | Buy Now |
| Pearson PTE Core Voucher | Exam Voucher | ₹18,900.00 | ₹15,799.00 | Buy Now |
| ETS GRE Voucher | Exam Voucher | ₹22,500.00 | ₹19,799.00 | Buy Now |
| ETS TOEFL Voucher | Exam Voucher | ₹18,000.00 | ₹13,999.00 | Buy Now |
| Duolingo English Test Voucher | Exam Voucher | ₹6,112.50 | ₹4,999.00 | Buy Now |

Each product card: logo/brand mark at top, product name, "Vouchers" category label, strike-through original price in muted red, bold discounted price in green, full-width pill-shaped CTA button in the brand accent color, and an "Out of Stock" ribbon badge (top-left, rotated or flag-style) when applicable — replicate and refine the visual style from the reference screenshot with better spacing, card elevation, and hover motion.

### 5. KEY FUNCTIONAL FEATURES (full user control over vouchers)

- Secure instant checkout with multiple Indian + international payment methods (UPI, cards, net banking, PayPal, Razorpay/Stripe).
- Automated voucher code generation & delivery (email + SMS + WhatsApp) within seconds of payment.
- Self-serve dashboard: view, copy, transfer, or request refund on any voucher without contacting support.
- Real-time voucher status tracking (Active / Redeemed / Expired / Refund in progress).
- Referral/affiliate system — earn credit for referring friends.
- Coupon/promo code field at checkout stacking with existing discounts.
- Reviews & verified-purchase ratings per product.
- Admin panel (if full-stack) for inventory (mark items in/out of stock), pricing, order management, and refund approvals.

### 6. TRUST & CONVERSION ELEMENTS

- Money-back/refund policy badge, "100% Genuine Voucher" badge, SSL/secure checkout badge.
- Real-time stats bar ("12,400+ vouchers delivered," "4.8/5 rating").
- Transparent refund/transfer policy displayed near every CTA.
- Live chat bubble (WhatsApp-style) bottom-right.
- Clear countdown/urgency element for limited-time discounts (used tastefully, not spammy dark-pattern style).

### 7. TECH STACK SUGGESTION

- **Frontend:** Next.js (React) + TypeScript + Tailwind CSS
- **Animation/3D:** Framer Motion for UI motion, React Three Fiber + drei for the 3D hero voucher, GSAP ScrollTrigger for scroll storytelling
- **Backend:** Node.js/Express or Next.js API routes, PostgreSQL (orders, vouchers, users)
- **Payments:** Razorpay (India) + Stripe (international)
- **Auth:** email/OTP or WhatsApp OTP login for the dashboard
- **Notifications:** email (Resend/SendGrid) + SMS/WhatsApp (Twilio/WhatsApp Business API)
- **Hosting:** Vercel (frontend) + Supabase/Railway (DB & backend)

### 8. DELIVERABLE

Produce a fully responsive, accessible (WCAG AA contrast, keyboard navigable), SEO-optimized website with the structure, product catalog, 3D/interactive elements, and trust features described above. Prioritize a fast, buttery-smooth first impression on the homepage hero and a frictionless, anxiety-free checkout — since the core business is getting a nervous exam candidate from "browsing" to "paid and holding a valid voucher" in under two minutes.

---

### Notes for you (the founder)
- Since this is a voucher-resale business, be explicit and transparent everywhere about refund/transfer terms and that Apex Voucher is an independent reseller, not Pearson/ETS/Duolingo itself — this builds trust and avoids legal ambiguity, and competitors like PTENOTE lean heavily on this transparency to win trust.
- The self-serve dashboard (view/copy/transfer/refund without contacting support) is the single biggest differentiator you can build versus the reference sites, which mostly rely on manual WhatsApp/email support for these actions.
