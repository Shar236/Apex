import Link from 'next/link';
import { Lightbulb, TriangleAlert } from 'lucide-react';
import { ArticleFigure } from '@/components/blog/article-figure';
import { ArticleInfoBox } from '@/components/blog/article-info-box';
import { ScoreCards } from '@/components/blog/score-cards';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqAccordion } from '@/components/blog/faq-accordion';
import { RelatedArticles } from '@/components/blog/related-articles';
import { TableOfContents } from '@/components/blog/table-of-contents';
import { articleImage } from '@/lib/article-image';
import type { BlogPost } from '@/lib/blog-types';
import './ielts-canada.css';

const IMG = '/images/blogs/ielts-canada';

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null);

export function IeltsCanada2026({ post, relatedPosts = [] }: { post: BlogPost; relatedPosts?: BlogPost[] }) {
  const title = post.title || 'IELTS Score for Canada PR: The 8-7-7-7 Rule Explained (CLB 9 Guide, 2026)';
  const published = fmtDate(post.publishedAt || post.createdAt);
  const updated = fmtDate(post.updatedAt);
  const showUpdated = updated && post.updatedAt && post.publishedAt && new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > 86400000;

  return (
    <article className="blog-article blog-ielts-canada">
      <header className="ca-header">
        <span className="ca-eyebrow">{post.category || 'IELTS'} · Canada PR</span>
        <h1 className="ca-title">{title}</h1>
        <div className="ca-meta">
          <span>By {post.author || 'Apex Vouchers Editorial Team'}</span>
          {published ? <span>Published {published}</span> : null}
          {showUpdated ? <span>Updated {updated}</span> : null}
          {post.readingTime ? <span>{post.readingTime} min read</span> : null}
        </div>
        <p className="ca-lede">
          {post.excerpt ||
            'Wondering what IELTS score you need for Canada PR? The 8-7-7-7 rule is the IELTS General Training result — Listening 8.0, Reading 7.0, Writing 7.0, Speaking 7.0 — that converts to CLB 9, the benchmark that unlocks the biggest jump in Express Entry CRS points. Here’s the full IELTS-to-CLB chart, the PTE Core equivalent, and the mistakes that quietly cost applicants points.'}
        </p>
      </header>

      <div className="ic-hero">
        <ArticleFigure src={articleImage(post, 'hero', `${IMG}/hero.webp`)} alt="IELTS 8-7-7-7 score requirements for Canada Express Entry mapped to CLB 9" width={1200} height={630} priority />
      </div>

      <div className="ca-body">
        <ArticleInfoBox variant="tip" title="Quick answer" icon={<Lightbulb className="w-4 h-4" />}>
          <p>
            The 8-7-7-7 rule means IELTS General Training bands of Listening 8.0, Reading 7.0, Writing 7.0 and Speaking 7.0 — the minimum in every skill to reach <strong>CLB 9</strong>, the Canadian
            Language Benchmark that maximizes your Express Entry language points. Your overall band score is not used: IRCC converts each of the four skills separately and takes your <strong>lowest</strong>{' '}
            result.
          </p>
        </ArticleInfoBox>

        <TableOfContents scope=".ca-body" />

        <h2 id="what-is-8777">What Is the IELTS 8-7-7-7 Rule for Canada PR?</h2>
        <p>
          If you&rsquo;re immigrating to Canada through Express Entry — the Federal Skilled Worker Program, Canadian Experience Class, or a linked Provincial Nominee Program — reaching Canadian Language
          Benchmark (CLB) 9 is one of the single most rewarding moves for your CRS score. &ldquo;8-7-7-7&rdquo; is shorthand for the IELTS General Training band scores that map to CLB 9 in every ability:
        </p>
        <ScoreCards
          items={[
            { label: 'Listening', value: '8.0', sub: 'CLB 9' },
            { label: 'Reading', value: '7.0', sub: 'CLB 9' },
            { label: 'Writing', value: '7.0', sub: 'CLB 9' },
            { label: 'Speaking', value: '7.0', sub: 'CLB 9' },
          ]}
        />

        <h3 id="gt-vs-academic">IELTS General Training vs Academic: Which One Do You Need?</h3>
        <p>
          IRCC accepts <strong>IELTS General Training</strong>, not Academic, for permanent residence under Express Entry and for almost every Provincial Nominee Program stream. IELTS Academic is for study
          permits and university admissions only — book the wrong module and your result can&rsquo;t be used for your PR application at all.
        </p>

        <h2 id="ielts-clb-chart">IELTS to CLB Conversion Chart (2026)</h2>
        <p>IRCC doesn&rsquo;t read your overall IELTS band. Each of the four skills converts to a CLB level on its own, using the official equivalency table below.</p>
        <ComparisonTable
          caption="IRCC IELTS (General Training) to CLB mapping for the four abilities."
          columns={['CLB level', 'Listening', 'Reading', 'Writing', 'Speaking']}
          rows={[
            ['CLB 10', '8.5', '8.0', '7.5', '7.5'],
            ['CLB 9', '8.0', '7.0', '7.0', '7.0'],
            ['CLB 8', '7.5', '6.5', '6.5', '6.5'],
            ['CLB 7', '6.0', '6.0', '6.0', '6.0'],
          ]}
        />
        <ArticleFigure
          src={articleImage(post, 'ielts-clb-chart', `${IMG}/ielts-clb-chart.webp`)}
          alt="Chart mapping IELTS band scores to Canadian Language Benchmark levels 7, 8 and 9"
          width={1200}
          height={800}
          caption="Note the quirk: CLB 9 needs a full 8.0 in Listening but only 7.0 in the other three abilities."
        />
        <ArticleInfoBox variant="warning" title="Your CLB is your lowest skill — not the average" icon={<TriangleAlert className="w-4 h-4" />}>
          <p>
            IRCC converts each skill separately and takes the <strong>lowest</strong> of the four as your overall CLB. Score CLB 10 in Listening, Reading and Speaking but CLB 8 in Writing, and your
            application is assessed at CLB 8 — not an average of the four.
          </p>
        </ArticleInfoBox>

        <h2 id="why-clb9-matters">Why CLB 9 Matters for Your CRS Score</h2>
        <p>
          CLB 9 is the realistic ceiling most competitive applicants aim for. CLB 10 and above score only slightly higher in the core language factor, but typically requires bands of 7.5&ndash;8.5 across
          all four skills — near-native territory few test-takers reach. Moving from CLB 8 to CLB 9 across all four skills lifts your core language points on its own, and combined with your education or
          foreign/Canadian work experience, CLB 9 can unlock <strong>up to 50 additional points</strong> under the skill-transferability factors — often enough to be the difference between an Invitation
          to Apply and another wait.
        </p>
        <ArticleFigure
          src={articleImage(post, 'canada-pr-score', `${IMG}/canada-pr-score.webp`)}
          alt="Comparison of CRS points awarded at CLB 7, CLB 8 and CLB 9 for a single applicant"
          width={1200}
          height={800}
          caption="Illustrative CRS points by CLB level for a single applicant with a Canadian degree."
        />
        <ArticleInfoBox variant="tip" title="Apex saver tip" icon={<Lightbulb className="w-4 h-4" />}>
          <p>
            If your Listening is stuck at 7.5, re-sitting one test is usually cheaper and faster than losing a PR draw. Book with an official <Link href="/exam-booking">Apex exam voucher</Link> and keep
            your prep receipts.
          </p>
        </ArticleInfoBox>

        <h2 id="clb-by-program">CLB Requirements by Express Entry Program</h2>
        <p>Not every route needs CLB 9 — or even CLB 7. Check which minimum actually applies to your program before you over-prepare (or under-prepare):</p>
        <ComparisonTable
          caption="Minimum CLB needed per skill for major Express Entry streams. Confirm current figures on the official IRCC or PNP page before booking your test."
          columns={['Program', 'Minimum CLB (all four skills)', 'IELTS GT equivalent']}
          rows={[
            ['Federal Skilled Worker (FSW)', 'CLB 7', '6.0 in each skill'],
            ['Canadian Experience Class — TEER 0/1 jobs', 'CLB 7', '6.0 in each skill'],
            ['Canadian Experience Class — TEER 2/3 jobs', 'CLB 5', 'S/L/W 5.0 · Reading 4.0'],
            ['Federal Skilled Trades (FSTP)', 'CLB 5 (S/L), CLB 4 (R/W)', 'S/L 5.0 · Reading 3.5 · Writing 4.0'],
            ['PNP streams linked to Express Entry', 'Varies, commonly CLB 5–9', 'Check your specific stream'],
          ]}
        />

        <h2 id="pte-core">PTE Core: The Accepted Alternative to IELTS</h2>
        <p>
          Since 2024, IRCC also accepts <strong>PTE Core</strong> for Canadian PR, and it follows the same lowest-skill rule as IELTS — there&rsquo;s no averaging here either. The approximate PTE Core
          range equivalent to CLB 9 is:
        </p>
        <div className="ic-dual">
          <div>
            <h3>IELTS (CLB 9)</h3>
            <p>Listening 8.0 · Reading 7.0 · Writing 7.0 · Speaking 7.0</p>
          </div>
          <div>
            <h3>PTE Core (CLB 9)</h3>
            <p>Listening 82&ndash;88 · Reading 78&ndash;87 · Writing 88&ndash;89 · Speaking 84&ndash;88</p>
          </div>
        </div>
        <ArticleFigure
          src={articleImage(post, 'express-entry', `${IMG}/express-entry.webp`)}
          alt="Express Entry pipeline showing where a language test result feeds into the CRS calculation"
          width={1200}
          height={800}
          caption="Where your language result sits in the Express Entry pipeline."
        />

        <div className="ca-cta" data-toc-ignore>
          <h3>Booking IELTS or PTE Core for Canada PR?</h3>
          <p>Save on your exam fee with an official Apex voucher — genuine codes, instant delivery.</p>
          <Link href="/exam-booking">Browse exam vouchers →</Link>
        </div>

        <h2 id="score-validity">How Long Is Your IELTS or PTE Core Score Valid for Canada PR?</h2>
        <p>
          Both IELTS and PTE Core results are valid for <strong>two years</strong> from your test date for any IRCC application, including an active Express Entry profile. If your result expires while
          you&rsquo;re still sitting in the pool, your profile can no longer be considered in a draw — so plan your test date around your expected Invitation to Apply, not just around when you submit your
          profile.
        </p>

        <h2 id="mistakes">Common IELTS-to-CLB Mistakes That Cost Applicants Points</h2>
        <ArticleInfoBox variant="warning" title="Watch out" icon={<TriangleAlert className="w-4 h-4" />}>
          <p>
            Your <strong>overall</strong> band is irrelevant for Express Entry — IRCC only reads the four sectional scores. An 8.0 overall with 6.5 Writing is still only CLB 8.
          </p>
        </ArticleInfoBox>
        <p>Other frequent errors that quietly cost applicants CRS points:</p>
        <ul>
          <li>Booking IELTS Academic when Express Entry needs General Training.</li>
          <li>
            Letting a result expire before PR is granted — see <a href="#score-validity">score validity</a> above.
          </li>
          <li>Not re-checking the CLB table, which IRCC updates periodically.</li>
          <li>
            Chasing CLB 9 in every skill when your actual program only needs CLB 5 or CLB 7 — or the reverse, assuming CLB 7 is competitive in a busy draw. See{' '}
            <a href="#clb-by-program">CLB requirements by program</a> above.
          </li>
        </ul>

        <aside className="ca-takeaways">
          <h2>Key Takeaways</h2>
          <ul>
            <li>8-7-7-7 = CLB 9 in all four abilities; Listening needs the full 8.0.</li>
            <li>Your CLB is set by your lowest skill, never an average.</li>
            <li>CLB 9 can be worth 50+ CRS points versus CLB 8 once skill transferability is included.</li>
            <li>PTE Core is an accepted alternative to IELTS for Canada PR, with its own lowest-skill rule.</li>
            <li>Minimum CLB needed ranges from CLB 4&ndash;5 (FSTP) to CLB 7&ndash;9, depending on your program.</li>
            <li>Both tests are valid for two years — time your booking around your expected ITA.</li>
          </ul>
        </aside>

        <p>
          More guides: <Link href="/blog?category=IELTS">browse all IELTS articles</Link>, or read our <Link href="/blog">full students diary</Link>.
        </p>

        {post.faqs && post.faqs.length > 0 && <FaqAccordion faqs={post.faqs} />}
        <RelatedArticles relatedPosts={relatedPosts} />
      </div>
    </article>
  );
}
