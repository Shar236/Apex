import Link from 'next/link';
import { Lightbulb, TriangleAlert, ShieldCheck, Sparkles } from 'lucide-react';
import { ArticleFigure } from '@/components/blog/article-figure';
import { ArticleInfoBox } from '@/components/blog/article-info-box';
import { ScoreCards } from '@/components/blog/score-cards';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqAccordion } from '@/components/blog/faq-accordion';
import { RelatedArticles } from '@/components/blog/related-articles';
import { TableOfContents } from '@/components/blog/table-of-contents';
import { articleImage } from '@/lib/article-image';
import type { BlogFaq, BlogPost } from '@/lib/blog-types';
import './pte-tests-comparison.css';

const IMG = '/images/blogs/pte-tests-comparison';

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null);

const DEFAULT_FAQS: BlogFaq[] = [
  {
    question: 'What is the main difference between PTE Academic and PTE Core?',
    answer:
      'PTE Academic is designed for university study abroad and international migration (accepted by 3,300+ universities worldwide and immigration authorities in Australia, New Zealand, and the UK). PTE Core is specifically tailored for Canadian permanent residency and work permits under IRCC economic immigration programs, focusing on everyday vocational language instead of university lectures.',
  },
  {
    question: 'Can I use PTE Academic for Canada PR (Express Entry)?',
    answer:
      'No. For Canadian permanent residency (Express Entry, PNP, FSWP, CEC), IRCC only accepts PTE Core (or IELTS General Training / CELPIP General). PTE Academic is accepted by Canadian institutions for study permits, but not for economic PR streams.',
  },
  {
    question: 'Is PTE Academic UKVI harder than standard PTE Academic?',
    answer:
      'No, the test format, questions, difficulty level, and scoring are 100% identical. The only difference is that PTE Academic UKVI is administered at Home Office-approved SELT test centres with additional identity verification and provides a Unique Electronic Reference Number (UERN) required on UK visa applications.',
  },
  {
    question: 'Which PTE test should I take for Australia and New Zealand migration?',
    answer:
      'PTE Academic is the accepted test for all Australian Department of Home Affairs and Immigration New Zealand visa categories (Subclass 189, 190, 491, 500, etc.). PTE Core is not accepted for Australia or New Zealand visas.',
  },
  {
    question: 'How long are PTE test results valid?',
    answer: 'Pearson PTE score reports are officially valid for 2 years from the date of the exam for universities and most immigration departments (note: Australian skilled migration allows PTE Academic scores up to 3 years old at time of invitation).',
  },
  {
    question: 'Can I save money on my PTE exam booking in India?',
    answer: "Yes! By purchasing an official PTE voucher code from Apex Vouchers before booking on Pearson's website, you can save up to ₹3,900 on your test fee with guaranteed instant code delivery.",
  },
];

export function PteTestsComparison({ post, relatedPosts = [] }: { post: BlogPost; relatedPosts?: BlogPost[] }) {
  const title = post.title || 'PTE Tests Comparison 2026: PTE Academic vs PTE Core vs PTE UKVI vs PTE Home';
  const published = fmtDate(post.publishedAt || post.createdAt);
  const updated = fmtDate(post.updatedAt);
  const showUpdated = updated && post.updatedAt && post.publishedAt && new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > 86400000;
  const faqs = post.faqs && post.faqs.length > 0 ? post.faqs : DEFAULT_FAQS;

  return (
    <article className="blog-article blog-pte-tests-comparison">
      <header className="ca-header">
        <span className="ca-eyebrow">{post.category || 'PTE'} · Exam Comparison</span>
        <h1 className="ca-title">{title}</h1>
        <div className="ca-meta">
          <span>By {post.author || 'Apex Vouchers Editorial Team'}</span>
          {published ? <span>Published {published}</span> : null}
          {showUpdated ? <span>Updated {updated}</span> : null}
          {post.readingTime ? <span>{post.readingTime} min read</span> : null}
        </div>
        <p className="ca-lede">
          {post.excerpt ||
            'Confused about which Pearson PTE exam to book? With PTE Academic, PTE Core, PTE Academic UKVI, and PTE Home all available, choosing the wrong test can cost you time, visa rejection, and thousands in rebooking fees. Here is the complete 2026 breakdown of differences in format, question tasks, scoring scales, CLB mapping, and country acceptance.'}
        </p>
      </header>

      <div className="pte-hero">
        <ArticleFigure src={articleImage(post, 'hero', `${IMG}/hero.webp`)} alt="Comparison chart of PTE Academic, PTE Core, PTE Academic UKVI and PTE Home test formats and acceptance" width={1200} height={630} priority />
      </div>

      <div className="ca-body">
        <ArticleInfoBox variant="tip" title="Quick Answer: Which PTE test do you need?" icon={<Lightbulb className="w-4 h-4" />}>
          <p>
            <strong>Choose PTE Academic</strong> if you are applying for universities worldwide (USA, UK, Australia, Canada, NZ, Europe) or Australian/NZ permanent migration.
            <br />
            <strong>Choose PTE Core</strong> if you are applying for Canadian Permanent Residency (Express Entry, PNP, CEC) or Canadian work permits under IRCC.
            <br />
            <strong>Choose PTE Academic UKVI</strong> if you need a SELT for UK work visas (Skilled Worker, Health & Care) or below-degree study.
            <br />
            <strong>Choose PTE Home (A1/A2/B1)</strong> for UK family, spouse, settlement (ILR), or citizenship visas.
          </p>
        </ArticleInfoBox>

        <TableOfContents scope=".ca-body" />

        <ScoreCards
          items={[
            { label: 'Total Duration', value: '2 Hours', sub: 'PTE Academic & Core' },
            { label: 'Score Scale', value: '10–90', sub: 'Granular 1-point scale' },
            { label: 'Results Speed', value: '48 Hours', sub: 'Typical AI turnaround' },
            { label: 'Score Validity', value: '2 Years', sub: 'Global recognition' },
          ]}
        />

        <h2 id="four-pte-types">Understanding the 4 Pearson PTE Test Types</h2>
        <p>
          Pearson Test of English (PTE) is a computer-delivered, 100% AI-scored English proficiency assessment. While all four variants share Pearson&rsquo;s automated scoring engine and state-of-the-art
          testing centre security, they serve completely different visa and academic requirements:
        </p>

        <div className="pte-grid">
          <div className="pte-test-card">
            <span className="pte-badge pte-badge--academic">Study Abroad & Global PR</span>
            <h3>PTE Academic</h3>
            <p>The flagship academic English exam. Evaluates higher-education English proficiency using university lectures, academic essays, and academic reading excerpts.</p>
            <div className="pte-card-meta">
              <span>Accepted: 3,300+ Uni & AUS/NZ/UK Visas</span>
              <span>4 Skills (2 hrs)</span>
            </div>
          </div>

          <div className="pte-test-card">
            <span className="pte-badge pte-badge--core">Canada Immigration</span>
            <h3>PTE Core</h3>
            <p>Pearson&rsquo;s newest test, approved by IRCC in 2024 for Canadian economic migration. Tests everyday, workplace-oriented English scenarios rather than university academia.</p>
            <div className="pte-card-meta">
              <span>Accepted: Canada PR (Express Entry)</span>
              <span>4 Skills (2 hrs)</span>
            </div>
          </div>

          <div className="pte-test-card">
            <span className="pte-badge pte-badge--ukvi">UK SELT Route</span>
            <h3>PTE Academic UKVI</h3>
            <p>The Secure English Language Test (SELT) version of PTE Academic approved by the UK Home Office. Generates a Unique Electronic Reference Number (UERN) required on UK visa forms.</p>
            <div className="pte-card-meta">
              <span>Accepted: UK Work & Student Visas</span>
              <span>4 Skills (2 hrs)</span>
            </div>
          </div>

          <div className="pte-test-card">
            <span className="pte-badge pte-badge--home">UK Settlement & Family</span>
            <h3>PTE Home (A1 / A2 / B1)</h3>
            <p>Short, conversational tests assessing only Speaking and Listening for UK family reunion, spouse visas, indefinite leave to remain (ILR), and British citizenship.</p>
            <div className="pte-card-meta">
              <span>Accepted: UK Home Office Only</span>
              <span>2 Skills (22–30 min)</span>
            </div>
          </div>
        </div>

        <h2 id="academic-vs-core">PTE Academic vs PTE Core: What Actually Changes?</h2>
        <p>
          Both PTE Academic and PTE Core take approximately <strong>2 hours</strong>, test all four language skills (Speaking, Writing, Reading, Listening), and are scored on the 10&ndash;90 Global Scale
          of English. However, the task types and prompt topics differ significantly:
        </p>

        <div className="pte-task-compare">
          <div className="pte-task-col">
            <h4>PTE Academic Tasks</h4>
            <ul>
              <li>
                <strong>Write Essay:</strong> 200&ndash;300 word formal argumentative essay on abstract/societal topics.
              </li>
              <li>
                <strong>Summarize Written Text:</strong> Condense academic passages into one single 5&ndash;75 word sentence.
              </li>
              <li>
                <strong>Re-tell Lecture:</strong> Listen to university professor lectures and summarize key academic arguments.
              </li>
              <li>
                <strong>Describe Image:</strong> Analyze complex charts, statistical graphs, scientific diagrams, and maps.
              </li>
            </ul>
          </div>
          <div className="pte-task-col">
            <h4>PTE Core Tasks</h4>
            <ul>
              <li>
                <strong>Write Email:</strong> 100-word functional email to a colleague, landlord, or supervisor (9 min).
              </li>
              <li>
                <strong>Summarize Written Text:</strong> Condense real-world texts in 25&ndash;50 words (multiple sentences allowed).
              </li>
              <li>
                <strong>Respond to a Situation:</strong> Listen to everyday scenarios (e.g. asking for leave) and reply verbally.
              </li>
              <li>
                <strong>Describe Image:</strong> Describe everyday infographics, process diagrams, or workplace illustrations.
              </li>
            </ul>
          </div>
        </div>

        <ArticleInfoBox variant="warning" title="Critical Note for Canada Applicants" icon={<TriangleAlert className="w-4 h-4" />}>
          <p>
            If you are preparing for <strong>Canada Express Entry, PNP, or Canadian Experience Class</strong>, you<strong> MUST take PTE Core</strong>, not PTE Academic. Submitting a PTE Academic score
            card for Express Entry will result in an immediate profile rejection.
          </p>
        </ArticleInfoBox>

        <h2 id="comparison-table">Master Comparison Table: All 4 PTE Tests Side-by-Side</h2>
        <p>Compare all key specifications across testing purpose, duration, scoring, visa eligibility, and recognition:</p>

        <ComparisonTable
          caption="Comprehensive 2026 feature comparison of Pearson PTE test variants."
          columns={['Feature', 'PTE Academic', 'PTE Core', 'PTE Academic UKVI', 'PTE Home (A1/A2/B1)']}
          rows={[
            ['Primary Purpose', 'Study Abroad & General Migration', 'Canada PR & Work Permits', 'UK Visas & Immigration (SELT)', 'UK Family & Settlement Visas'],
            ['Skills Tested', 'Speaking, Writing, Reading, Listening', 'Speaking, Writing, Reading, Listening', 'Speaking, Writing, Reading, Listening', 'Speaking & Listening only'],
            ['Total Duration', '2 Hours (~120 mins)', '2 Hours (~120 mins)', '2 Hours (~120 mins)', '22 to 30 Minutes'],
            ['Score Range', '10 – 90 Scale', '10 – 90 Scale (Mapped to CLB)', '10 – 90 Scale (Mapped to CEFR)', 'Pass / Fail result'],
            ['Result Turnaround', 'Typically within 48 Hours', 'Typically within 48 Hours', 'Typically within 48 Hours', 'Typically within 48 Hours'],
            ['Accepted in Canada', 'Study permits (SDS & Uni)', 'Economic PR (Express Entry / PNP)', 'Not applicable', 'Not applicable'],
            ['Accepted in Australia/NZ', 'All Student & PR Visas', 'Not accepted', 'Not accepted (standard accepted)', 'Not applicable'],
            ['Accepted in UK', 'Degree-level HEI Visas', 'Not accepted', 'All UK Student & Work Visas', 'Spouse, Settlement, Citizenship'],
            ['Accepted in USA', '3,000+ Colleges & Masters', 'Not accepted', 'Not accepted', 'Not applicable'],
            ['Score Validity', '2 Years (3 yrs for Aus PR)', '2 Years', '2 Years', '2 Years'],
          ]}
        />

        <ArticleFigure src={articleImage(post, 'pte-tests-comparison-chart', `${IMG}/pte-tests-comparison-chart.webp`)} alt="Visual comparison table infographic summarizing Pearson PTE test differences" width={1200} height={800} caption="Summary of Pearson PTE test variants and their official visa pathways." />

        <h2 id="ukvi-explained">PTE Academic UKVI vs Standard PTE Academic: What Is the Difference?</h2>
        <p>
          One of the most frequent points of confusion for students and professionals headed to the United Kingdom is whether to book <strong>PTE Academic</strong> or <strong>PTE Academic UKVI</strong>.
        </p>
        <p>
          Both exams test the <em>exact same 20 question types</em>, use identical questions from the same item bank, and share the same scoring algorithms. However, there are two legal differences:
        </p>
        <ul>
          <li>
            <strong>SELT Accreditation:</strong> PTE Academic UKVI is administered under strict UK Home Office guidelines at designated Secure English Language Testing (SELT) centres.
          </li>
          <li>
            <strong>Unique Electronic Reference Number (UERN):</strong> When you receive your PTE UKVI scorecard, it includes a UERN code. You must enter this code in your UK visa application form so UKVI
            can directly verify your score in the Home Office database.
          </li>
        </ul>

        <ArticleInfoBox variant="note" title="When can you use Standard PTE Academic for the UK?" icon={<ShieldCheck className="w-4 h-4" />}>
          <p>
            If you are studying at a <strong>Higher Education Institution (HEI)</strong> for a Bachelor&rsquo;s, Master&rsquo;s, or PhD programme, most UK universities are permitted to make their own
            language assessment and will accept standard PTE Academic. However, if your course is below degree level (foundation, pre-sessional, diploma) or you are applying for a{' '}
            <strong>Skilled Worker Visa</strong>, PTE Academic UKVI is legally required.
          </p>
        </ArticleInfoBox>

        <h2 id="pte-home">PTE Home Tests: A1, A2, and B1 for UK Settlement</h2>
        <p>
          Unlike the 4-skill academic and general exams, <strong>PTE Home</strong> is a family of simplified speaking and listening tests designed specifically for UK family migration and settlement:
        </p>
        <ul>
          <li>
            <strong>PTE Home A1 (22 mins):</strong> For UK Family and Spouse / Partner visas. Tests basic everyday conversational English.
          </li>
          <li>
            <strong>PTE Home A2 (25 mins):</strong> For UK Family and Spouse visa extensions (after 2.5 years of residence).
          </li>
          <li>
            <strong>PTE Home B1 (30 mins):</strong> For Indefinite Leave to Remain (Settlement / ILR) and British Citizenship applications.
          </li>
        </ul>
        <p>
          PTE Home tests are reported as a simple <strong>Pass or Fail</strong> based on whether you meet the Common European Framework of Reference (CEFR) standard for that level.
        </p>

        <h2 id="score-equivalency">Score Equivalency: PTE vs IELTS, CLB & CEFR</h2>
        <p>To understand where your score sits across international standards, use the official score concordances established by Pearson, IRCC, and the UK Home Office:</p>

        <ComparisonTable
          caption="Official score equivalency mapping across PTE, IELTS, Canadian CLB, and European CEFR levels."
          columns={['PTE Score Range', 'IELTS Equivalent', 'PTE Core → CLB Level', 'CEFR Level', 'Typical Requirement']}
          rows={[
            ['84 – 90', 'Band 8.5 – 9.0', 'CLB 10', 'C2 (Mastery)', 'Top Ivy League / Max CRS Points'],
            ['76 – 83', 'Band 7.5 – 8.0', 'CLB 9', 'C1 (Advanced)', 'Competitive Canada PR / Top Unis'],
            ['66 – 75', 'Band 7.0', 'CLB 8', 'C1 (Advanced)', 'Australian PR (Proficient English)'],
            ['58 – 65', 'Band 6.5', 'CLB 7', 'B2 (Upper Intermediate)', 'Standard University Masters / FSWP PR'],
            ['50 – 57', 'Band 6.0', 'CLB 6', 'B2 (Intermediate)', 'Undergraduate Entry / Competent English'],
            ['42 – 49', 'Band 5.5', 'CLB 5', 'B1 (Threshold)', 'Foundation Programmes / Trades PR'],
            ['30 – 41', 'Band 4.5 – 5.0', 'CLB 4', 'B1 / A2', 'Vocational / Diploma courses'],
          ]}
        />

        <ArticleFigure src={articleImage(post, 'pte-decision-flowchart', `${IMG}/pte-decision-flowchart.webp`)} alt="Flowchart guiding candidates on which PTE exam to select based on destination country and visa purpose" width={1200} height={800} caption="Decision flowchart: Pick the right test based on country, visa, and institution rules." />

        <h2 id="decision-guide">Which PTE Test Should You Book? (Decision Guide)</h2>
        <p>Follow this direct decision matrix to confirm the exact test you should register for:</p>

        <div className="pte-decision-list">
          <div className="pte-decision-item">
            <span className="pte-decision-pill pte-decision-pill--academic">PTE Academic</span>
            <div className="pte-decision-text">
              <strong>Applying to Universities in Australia, USA, UK, Canada, NZ, or Europe:</strong>
              <br />
              Universities need an academic assessment of lectures, essays, and seminars. Book PTE Academic.
            </div>
          </div>

          <div className="pte-decision-item">
            <span className="pte-decision-pill pte-decision-pill--academic">PTE Academic</span>
            <div className="pte-decision-text">
              <strong>Immigrating to Australia (189/190/491) or New Zealand (SMC):</strong>
              <br />
              Department of Home Affairs only accepts PTE Academic for points-based skilled migration.
            </div>
          </div>

          <div className="pte-decision-item">
            <span className="pte-decision-pill pte-decision-pill--core">PTE Core</span>
            <div className="pte-decision-text">
              <strong>Applying for Canada PR (Express Entry, FSW, CEC, PNP, or Agri-Food):</strong>
              <br />
              IRCC requires PTE Core. Do not book PTE Academic for Express Entry profiles.
            </div>
          </div>

          <div className="pte-decision-item">
            <span className="pte-decision-pill pte-decision-pill--ukvi">PTE UKVI</span>
            <div className="pte-decision-text">
              <strong>Applying for UK Skilled Worker Visa, Health & Care Visa, or Pre-sessional Study:</strong>
              <br />
              Requires a Home Office approved SELT with a verifiable UERN reference code.
            </div>
          </div>

          <div className="pte-decision-item">
            <span className="pte-decision-pill pte-decision-pill--home">PTE Home</span>
            <div className="pte-decision-text">
              <strong>Applying for UK Spouse, Family Extension, ILR, or British Citizenship:</strong>
              <br />
              Requires speaking and listening proficiency only (CEFR A1, A2, or B1).
            </div>
          </div>
        </div>

        <h2 id="voucher-savings">How to Save on Your PTE Test Booking</h2>
        <p>
          The standard test fee for PTE Academic and PTE Core in India is <strong>₹17,000+ (inclusive of 18% GST)</strong>. However, you do not need to pay full price at checkout on the Pearson website.
        </p>

        <ArticleInfoBox variant="tip" title="Apex Saver Tip: Save Up to ₹3,900 Instantly" icon={<Sparkles className="w-4 h-4" />}>
          <p>
            You can purchase an official <strong>PTE Academic Voucher</strong> or <strong>PTE Core Voucher</strong> through Apex Vouchers at exclusive student pricing. You will receive a genuine 100%
            official alphanumeric voucher code delivered instantly via email and WhatsApp. Enter the code at checkout on <em>mypte.pearsonpte.com</em> to reduce your test registration balance to ₹0.
          </p>
        </ArticleInfoBox>

        <div className="ca-cta" data-toc-ignore>
          <h3>Ready to Book Your PTE Exam?</h3>
          <p>Get authentic, discounted Pearson PTE vouchers with instant delivery and 24/7 booking support.</p>
          <Link href="/exam-booking">Browse PTE Exam Vouchers →</Link>
        </div>

        <h2 id="common-mistakes">5 Critical Mistakes Test-Takers Make When Booking PTE</h2>
        <ArticleInfoBox variant="warning" title="Avoid these costly errors" icon={<TriangleAlert className="w-4 h-4" />}>
          <p>Booking the wrong exam can result in rejected university applications, lost PR invitation deadlines, and forfeiture of non-refundable test fees.</p>
        </ArticleInfoBox>

        <ol>
          <li>
            <strong>Booking PTE Academic for Canadian PR:</strong> IRCC rejects PTE Academic for economic immigration. Always select <em>PTE Core</em> for Express Entry.
          </li>
          <li>
            <strong>Booking standard PTE Academic for UK Skilled Worker Visas:</strong> The UK Home Office requires a SELT Unique Reference Number (UERN). Without booking the <em>PTE Academic UKVI</em>{' '}
            version, your visa application will be invalidated.
          </li>
          <li>
            <strong>Practicing with Academic Templates for PTE Core:</strong> PTE Core asks for emails (not long essays) and conversational situational responses (not academic lecture retells). Practice
            with Core-specific materials.
          </li>
          <li>
            <strong>Ignoring Sectional Sub-score Requirements:</strong> Many institutions require <em>no subscore below 58</em> or <em>CLB 9 in all 4 abilities</em>. High overall scores cannot compensate
            for a low reading or speaking subscore.
          </li>
          <li>
            <strong>Booking Test Dates Too Close to Intake Deadlines:</strong> While results often arrive within 48 hours, occasional audit reviews take up to 5 business days. Always take your test at
            least 3&ndash;4 weeks before your deadline.
          </li>
        </ol>

        <aside className="ca-takeaways" id="takeaways">
          <h2>Key Takeaways</h2>
          <ul>
            <li>
              <strong>PTE Academic</strong> = Global study abroad (USA, UK, Canada, Australia) & Australia/NZ PR.
            </li>
            <li>
              <strong>PTE Core</strong> = Canada PR (Express Entry / PNP) & work permits under IRCC.
            </li>
            <li>
              <strong>PTE Academic UKVI</strong> = UK work visas & foundation study requiring a SELT UERN code.
            </li>
            <li>
              <strong>PTE Home</strong> = UK family, spouse, ILR settlement, and citizenship (Speaking & Listening only).
            </li>
            <li>All 4-skill PTE tests run for 2 hours with 100% AI-automated scoring.</li>
            <li>Save up to ₹3,900 on exam fees by purchasing official vouchers through Apex Vouchers before registering on Pearson.</li>
          </ul>
        </aside>

        <p>
          Related guides: <Link href="/blog?category=PTE">browse all PTE articles</Link>, read our <Link href="/blog/ielts-score-canada-8-7-7-7-rule-2026">IELTS Canada PR 8-7-7-7 guide</Link>, or check
          the <Link href="/blog">complete students diary</Link>.
        </p>

        {faqs && faqs.length > 0 && <FaqAccordion faqs={faqs} />}
        <RelatedArticles relatedPosts={relatedPosts} />
      </div>
    </article>
  );
}
