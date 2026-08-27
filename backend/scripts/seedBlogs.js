/**
 * Migrate the previously hard-coded "Students Diary & Exam Guides" articles
 * (frontend/src/components/ExamGuides.jsx) into the BlogPost CMS.
 * Idempotent: skips posts whose slug already exists.
 */
import { BlogPost } from '../models/index.js';
import { connectDB } from '../config/db.js';

const ARTICLES = [
  {
    title: 'IELTS Score for Canada: The 8-7-7-7 Rule for PR 2026',
    slug: 'ielts-score-canada-8-7-7-7-rule-2026',
    category: 'IELTS',
    tags: ['IELTS Canada PR', 'CLB 9', 'Express Entry', '8 7 7 7 rule'],
    excerpt: 'The IELTS score for Canada is not just about your overall band. IRCC converts each IELTS skill score into CLB levels. Here is the full breakdown of the 8-7-7-7 rule for PR 2026.',
    author: 'Apex Vouchers Editorial Team',
    authorBio: 'The Apex Vouchers editorial team writes practical, up-to-date guides on exam vouchers, scoring and study abroad for Indian students.',
    featured: true,
    content: `<h2>Understanding the 8-7-7-7 IELTS Rule for Canada PR</h2>
<p>If you are planning to immigrate to Canada under the Federal Skilled Worker Program (FSWP) through Express Entry, achieving Canadian Language Benchmark (CLB) Level 9 is the single biggest booster for your CRS score.</p>
<h3>What is the 8-7-7-7 Rule?</h3>
<p>The famous 8-7-7-7 score corresponds to:</p>
<ul><li><strong>Listening:</strong> 8.0 Band</li><li><strong>Reading:</strong> 7.0 Band</li><li><strong>Writing:</strong> 7.0 Band</li><li><strong>Speaking:</strong> 7.0 Band</li></ul>
<h3>Why CLB 9 Matters</h3>
<p>When you achieve CLB 9 (8-7-7-7), you unlock maximum points under Skill Transferability factors. A candidate under 30 years with CLB 9 gains an extra <strong>50+ CRS points</strong> automatically!</p>
<h3>IELTS General Training vs Academic for PR</h3>
<p>IRCC accepts <strong>IELTS General Training</strong> for permanent residence under Express Entry and most Provincial Nominee Programs. Academic IELTS is only needed for study permits.</p>
<table><thead><tr><th>CLB Level</th><th>Listening</th><th>Reading</th><th>Writing</th><th>Speaking</th></tr></thead><tbody><tr><td>CLB 9</td><td>8.0</td><td>7.0</td><td>7.0</td><td>7.0</td></tr><tr><td>CLB 8</td><td>7.5</td><td>6.5</td><td>6.5</td><td>6.5</td></tr><tr><td>CLB 7</td><td>6.0</td><td>6.0</td><td>6.0</td><td>6.0</td></tr></tbody></table>
<h2>PTE Core Alternative</h2>
<p>Did you know? IRCC now accepts <strong>PTE Core</strong> for Canada PR! The PTE Core score equivalent for CLB 9 is:</p>
<ul><li>Listening: 84 - 88</li><li>Reading: 78 - 87</li><li>Writing: 88 - 89</li><li>Speaking: 84 - 88</li></ul>
<div class="callout" data-callout="note"><p>📌 <strong>Apex Saver Tip:</strong> You can book your PTE Core Voucher on Apex Vouchers and save up to ₹3,700 on official test fees. All codes are 100% genuine and delivered instantly.</p></div>
<h2>How to Improve Your Score</h2>
<p>Focus on your weakest subscore first. Most candidates lose points in Writing and Speaking because they memorise templates instead of answering the task directly.</p>
<blockquote>Book your PTE Core voucher on Apex Vouchers and save up to ₹3,700 on official test fees.</blockquote>`,
    faqs: [
      { question: 'What IELTS score is required for Canada PR?', answer: 'For Express Entry, CLB 9 (Listening 8.0, Reading 7.0, Writing 7.0, Speaking 7.0) is the most rewarding target, adding up to 50+ CRS points.' },
      { question: 'Is IELTS General Training accepted for Canada PR?', answer: 'Yes — IELTS General Training is the accepted version for Canada PR under Express Entry and most Provincial Nominee Programs.' },
    ],
    seo: {
      title: 'IELTS Score for Canada: The 8-7-7-7 Rule for PR 2026',
      description: 'Understand how IELTS scores convert to Canadian immigration language requirements. The 8-7-7-7 rule and CLB 9 breakdown for Canada PR 2026.',
      focusKeyword: 'IELTS score for Canada',
      secondaryKeywords: ['IELTS Canada PR', 'IELTS score for Canadian PR', 'Canada IELTS requirements', 'IELTS 8 7 7 7'],
    },
  },
  {
    title: 'IELTS Score for USA 2026: What 5.5 to 8.0 Bands Mean for Admission?',
    slug: 'ielts-score-usa-2026',
    category: 'IELTS',
    tags: ['IELTS USA', 'US universities', 'study abroad'],
    excerpt: 'Find the right IELTS score for USA applications across top public state universities — from 5.5 for pathway programmes to 8.0 for competitive graduate schools.',
    author: 'Apex Vouchers Editorial Team',
    authorBio: 'The Apex Vouchers editorial team writes practical, up-to-date guides on exam vouchers, scoring and study abroad for Indian students.',
    content: `<h2>IELTS Scores Accepted by US Universities</h2>
<p>Unlike UK universities, US institutions accept both IELTS Academic and TOEFL iBT. Most US universities require an overall IELTS band of <strong>6.5 to 7.5</strong> for undergraduate and graduate admission.</p>
<h3>5.5 Band: Pathway and Foundation Programmes</h3>
<p>Some community colleges and pathway programmes accept an IELTS score of 5.5 with a conditional admission offer.</p>
<h3>6.0 - 6.5 Band: Most State Universities</h3>
<p>Public state universities typically require an overall band of 6.0 - 6.5 with no subscore below 5.5.</p>
<h3>7.0 - 8.0 Band: Top Graduate Schools</h3>
<p>Ivy League and top-ranked graduate programmes often ask for 7.0 - 8.0, especially for law, journalism and business programmes.</p>
<div class="callout" data-callout="warning"><p>⚠️ <strong>Check subscore requirements too:</strong> Some universities require a minimum Writing score of 6.0 even when the overall band is lower.</p></div>
<h2>Save on Your IELTS Test</h2>
<p>Book your official IELTS voucher through Apex Vouchers and save up to ₹4,000 on registration fees, with instant email delivery.</p>`,
    faqs: [
      { question: 'Is IELTS 6.5 enough for USA universities?', answer: 'Yes — most public US universities accept an overall IELTS band of 6.5 for undergraduate admission, though top programmes may ask for 7.0+.' },
    ],
    seo: {
      title: 'IELTS Score for USA 2026: What Band Do You Need?',
      description: 'Find the right IELTS score for USA applications across top public state universities, from 5.5 pathway programmes to 8.0 graduate schools.',
      focusKeyword: 'IELTS score for USA',
      secondaryKeywords: ['IELTS USA requirements', 'IELTS band for US universities', 'IELTS for America'],
    },
  },
  {
    title: 'IELTS Score for UK 2026: Which Band Do You Need?',
    slug: 'ielts-score-uk-2026',
    category: 'IELTS',
    tags: ['IELTS UK', 'UK universities', 'study abroad'],
    excerpt: 'This guide breaks down the IELTS score for UK undergraduate and postgraduate applications, including UKVI Academic requirements and 2026 updates.',
    author: 'Apex Vouchers Editorial Team',
    authorBio: 'The Apex Vouchers editorial team writes practical, up-to-date guides on exam vouchers, scoring and study abroad for Indian students.',
    content: `<h2>UK University IELTS Requirements</h2>
<p>UK universities typically require an overall IELTS band of <strong>6.0 to 7.5</strong> depending on the course level and institution.</p>
<h3>Undergraduate Courses</h3>
<p>Most undergraduate programmes ask for an overall band of 6.0 - 6.5 with no subscore below 5.5 - 6.0.</p>
<h3>Postgraduate Courses</h3>
<p>Master's programmes usually require 6.5 - 7.0 overall, while law, medicine and education courses may ask for 7.0 - 7.5.</p>
<h3>UKVI Academic vs Academic</h3>
<p>If you need a student visa (Tier 4), you may be required to take <strong>IELTS for UKVI (Academic)</strong>, which is identical in content but taken at approved test centres with additional security checks.</p>
<h2>Book Your IELTS Voucher</h2>
<p>Save up to ₹4,000 on your official IELTS registration with Apex Vouchers — genuine codes delivered instantly to email and WhatsApp.</p>`,
    faqs: [
      { question: 'Is IELTS 6.0 enough for UK universities?', answer: 'Yes — many UK undergraduate programmes accept an overall band of 6.0 with minimum subscore requirements of 5.5.' },
    ],
    seo: {
      title: 'IELTS Score for UK 2026: Which Band Do You Need?',
      description: 'This guide breaks down the IELTS score for UK undergraduate and postgraduate applications, including UKVI requirements.',
      focusKeyword: 'IELTS score for UK',
      secondaryKeywords: ['IELTS UK requirements', 'IELTS band for UK universities', 'IELTS UKVI'],
    },
  },
  {
    title: 'Duolingo English Test Syllabus 2026: All 13 Tasks & Timings',
    slug: 'duolingo-english-test-syllabus-2026',
    category: 'Duolingo',
    tags: ['Duolingo English Test', 'DET syllabus', 'adaptive test'],
    excerpt: 'Check the full Duolingo English Test syllabus guide 2026 with all 13 question types, timings, scoring subscores, and preparation tips.',
    author: 'Apex Vouchers Editorial Team',
    authorBio: 'The Apex Vouchers editorial team writes practical, up-to-date guides on exam vouchers, scoring and study abroad for Indian students.',
    content: `<h2>Duolingo English Test: What Is Tested</h2>
<p>The Duolingo English Test (DET) is a computer-adaptive test that takes just <strong>1 hour</strong> and costs a fraction of other exams. It is accepted by 5,000+ universities worldwide.</p>
<h3>Test Structure</h3>
<ul><li><strong>Introduction (5 min):</strong> Setup, ID verification and rules</li><li><strong>Adaptive Test (45 min):</strong> 13 question types mixing reading, writing, listening and speaking</li><li><strong>Writing & Speaking Sample (10 min):</strong> Sent to universities with your results</li></ul>
<h3>Scoring and Subscores</h3>
<p>The DET produces an overall score of 10-160 along with four subscores: Literacy, Comprehension, Conversation and Production.</p>
<table><thead><tr><th>Score Range</th><th>Proficiency</th></tr></thead><tbody><tr><td>120-160</td><td>Advanced</td></tr><tr><td>90-119</td><td>Intermediate</td></tr><tr><td>60-89</td><td>Basic</td></tr><tr><td>10-59</td><td>Emerging</td></tr></tbody></table>
<div class="callout" data-callout="success"><p>✅ <strong>Fast results:</strong> Scores are available within 48 hours and can be shared with unlimited universities for free.</p></div>
<h2>Save 18% on Your DET</h2>
<p>Book your Duolingo English Test voucher on Apex Vouchers and get an instant <strong>18% discount</strong> on the official test fee.</p>`,
    faqs: [
      { question: 'Is Duolingo English Test accepted by universities?', answer: 'Yes — 5,000+ universities worldwide, including many US, UK, Canadian and Australian institutions, accept the DET.' },
      { question: 'How long is the Duolingo English Test valid?', answer: 'The DET score is valid for 2 years from the test date.' },
    ],
    seo: {
      title: 'Duolingo English Test Syllabus 2026: All 13 Tasks & Timings',
      description: 'Check the full Duolingo English Test syllabus guide 2026 with all 13 question types, timings, subscores and preparation tips.',
      focusKeyword: 'Duolingo English Test syllabus',
      secondaryKeywords: ['DET syllabus 2026', 'Duolingo test structure', 'Duolingo English Test tasks'],
    },
  },
  {
    title: 'IELTS Band Score Chart 2026: Meaning + Free Calculator',
    slug: 'ielts-band-score-chart-2026',
    category: 'IELTS',
    tags: ['IELTS bands', 'IELTS scoring', 'band calculator'],
    excerpt: 'Confused by 6.5 vs 7.0? Here is the full IELTS band score chart 2026, how each skill is scored, and what universities and immigration need.',
    author: 'Apex Vouchers Editorial Team',
    authorBio: 'The Apex Vouchers editorial team writes practical, up-to-date guides on exam vouchers, scoring and study abroad for Indian students.',
    content: `<h2>How IELTS Band Scores Work</h2>
<p>IELTS results are reported on a 9-band scale from 1 (non-user) to 9 (expert user). Your overall band score is the <strong>average of four skills</strong>, rounded to the nearest half band.</p>
<h3>The 9 Bands Explained</h3>
<table><thead><tr><th>Band</th><th>Skill Level</th><th>Typical Use</th></tr></thead><tbody><tr><td>9</td><td>Expert User</td><td>Academic leadership roles</td></tr><tr><td>8</td><td>Very Good</td><td>Top graduate programmes</td></tr><tr><td>7</td><td>Good</td><td>Most UK/US universities, PR</td></tr><tr><td>6</td><td>Competent</td><td>Undergraduate admission</td></tr><tr><td>5</td><td>Modest</td><td>Foundation programmes</td></tr></tbody></table>
<h3>How Your Overall Band Is Calculated</h3>
<p>Example: Listening 7.5, Reading 7.0, Writing 6.5, Speaking 6.5 → average 6.875 → rounded to <strong>7.0</strong>.</p>
<h2>Save on IELTS Registration</h2>
<p>Get your official IELTS voucher from Apex Vouchers and save up to ₹4,000 with instant delivery.</p>`,
    faqs: [
      { question: 'Is 7.5 a good IELTS score?', answer: 'Yes — 7.5 is a very good score that meets requirements for most top universities and skilled migration programmes worldwide.' },
    ],
    seo: {
      title: 'IELTS Band Score Chart 2026: Meaning + Free Calculator',
      description: 'Confused by 6.5 vs 7.0? Here is the full IELTS band score chart 2026, how each skill is scored, and what universities need.',
      focusKeyword: 'IELTS band score chart',
      secondaryKeywords: ['IELTS band calculator', 'IELTS scoring 2026', 'IELTS 6.5 vs 7.0'],
    },
  },
  {
    title: 'TOEFL Dates & Test Centres in India 2026 (Live List)',
    slug: 'toefl-dates-test-centres-india-2026',
    category: 'TOEFL',
    tags: ['TOEFL India', 'TOEFL dates', 'test centres'],
    excerpt: 'Plan your TOEFL 2026 test in India with details on exam dates, test centre locations, registration deadlines, and voucher savings.',
    author: 'Apex Vouchers Editorial Team',
    authorBio: 'The Apex Vouchers editorial team writes practical, up-to-date guides on exam vouchers, scoring and study abroad for Indian students.',
    content: `<h2>TOEFL iBT in India 2026</h2>
<p>The TOEFL iBT is offered multiple times every month across 40+ test centres in India, including Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Pune, Kolkata and Ahmedabad.</p>
<h3>How to Choose Your Test Date</h3>
<ul><li>Book 4-6 weeks before your university application deadline</li><li>Avoid end-of-month dates when seats fill fastest</li><li>Use the Home Edition if no nearby centre has availability</li></ul>
<h3>TOEFL Home Edition</h3>
<p>ETS now offers the TOEFL iBT Home Edition with 24/7 availability — same score, taken on your own computer with a proctor.</p>
<div class="callout" data-callout="note"><p>📌 <strong>Tip:</strong> Your official score report is available 4-13 days after the test.</p></div>
<h2>Save on TOEFL Registration</h2>
<p>Book your TOEFL voucher on Apex Vouchers and save on the official ETS registration fee.</p>`,
    faqs: [
      { question: 'How many times can I take TOEFL in a year?', answer: 'There is no limit — you can take the TOEFL iBT as many times as you want, but you can only take it once every 3 days.' },
    ],
    seo: {
      title: 'TOEFL Dates & Test Centres in India 2026 (Live List)',
      description: 'Plan your TOEFL 2026 test in India with details on exam dates, test centre locations, deadlines and voucher savings.',
      focusKeyword: 'TOEFL dates India 2026',
      secondaryKeywords: ['TOEFL test centres India', 'TOEFL India 2026', 'TOEFL registration'],
    },
  },
  {
    title: 'PTE Academic Score for Australia PR & University Cutoffs 2026',
    slug: 'pte-academic-score-australia-pr-2026',
    category: 'PTE',
    tags: ['PTE Academic', 'Australia PR', 'student visa'],
    excerpt: 'Complete score guide for Australian student visas and skilled independent 189/190 visas, including 2026 PTE score requirements and university cutoffs.',
    author: 'Apex Vouchers Editorial Team',
    authorBio: 'The Apex Vouchers editorial team writes practical, up-to-date guides on exam vouchers, scoring and study abroad for Indian students.',
    content: `<h2>PTE Academic for Australia</h2>
<p>The PTE Academic is fully accepted by the Australian Department of Home Affairs for student visas and skilled migration, and by all Australian universities.</p>
<h3>Skilled Visas (189 / 190 / 491)</h3>
<p>For skilled independent visas you generally need an overall PTE score of <strong>50+</strong> (equivalent to IELTS 6.0), with higher scores earning more points.</p>
<h3>Student Visa (Subclass 500)</h3>
<p>Most universities require an overall PTE score of <strong>50 - 65</strong> depending on the course.</p>
<table><thead><tr><th>University Group</th><th>Overall PTE</th></tr></thead><tbody><tr><td>Group of Eight (Go8)</td><td>58 - 65</td></tr><tr><td>Other universities</td><td>50 - 58</td></tr><tr><td>TAFE / VET courses</td><td>42 - 50</td></tr></tbody></table>
<h2>Save on PTE Academic</h2>
<p>Book your PTE Academic voucher on Apex Vouchers and save up to ₹3,401 on official registration with instant delivery.</p>`,
    faqs: [
      { question: 'Is PTE accepted for Australia PR?', answer: 'Yes — PTE Academic is accepted by the Australian Department of Home Affairs for all skilled migration visas including 189, 190 and 491.' },
    ],
    seo: {
      title: 'PTE Academic Score for Australia PR & University Cutoffs 2026',
      description: 'Complete PTE score guide for Australian student visas and skilled independent 189/190 visas, including 2026 university cutoffs.',
      focusKeyword: 'PTE score for Australia PR',
      secondaryKeywords: ['PTE Australia 2026', 'PTE for student visa Australia', 'PTE university cutoffs'],
    },
  },
];

async function run() {
  await connectDB();
  let created = 0;
  let skipped = 0;
  for (const article of ARTICLES) {
    const exists = await BlogPost.exists({ slug: article.slug });
    if (exists) { skipped++; continue; }
    const post = new BlogPost({ ...article, status: 'published', publishedAt: new Date() });
    await post.save();
    created++;
    console.log(`[seed-blog] created: ${article.slug}`);
  }
  console.log(`[seed-blog] done — ${created} created, ${skipped} skipped`);
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed-blog] failed:', err.message);
  process.exit(1);
});
