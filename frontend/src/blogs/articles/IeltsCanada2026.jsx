import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, TriangleAlert } from 'lucide-react';
import {
  ArticleFigure,
  ArticleInfoBox,
  ScoreCards,
  ComparisonTable,
  FaqAccordion,
  RelatedArticles,
} from '../components';
import '../styles/article-shared.css';
import '../styles/articles/ielts-canada.css';

/**
 * Code-based article for the EXISTING blog slug:
 *   ielts-score-canada-8-7-7-7-rule-2026
 *
 * The CMS still owns every piece of metadata (title, slug, category, excerpt,
 * author, reviewer, featured image, tags, publish status, dates, SEO title,
 * meta description, canonical, OG, FAQ, related posts). Those arrive here as
 * `post` / `relatedPosts` props from the existing public blog API, and SEO +
 * schema are applied by BlogPostPage. This file only controls the article body
 * and its custom design.
 *
 * Images: frontend/public/images/blogs/ielts-canada/
 */

const IMG = '/images/blogs/ielts-canada';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

export default function IeltsCanada2026({ post = {}, relatedPosts = [] }) {
  const title = post.title || 'IELTS Score for Canada: The 8-7-7-7 Rule for PR 2026';
  const published = fmtDate(post.publishedAt || post.createdAt);
  const updated = fmtDate(post.updatedAt);
  const showUpdated =
    updated && post.updatedAt && post.publishedAt &&
    new Date(post.updatedAt) - new Date(post.publishedAt) > 86400000;

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
            'The IELTS score for Canada is not just about your overall band. IRCC converts each IELTS skill score into a CLB level — and hitting CLB 9, the 8-7-7-7 rule, is the single biggest boost to your Express Entry CRS score.'}
        </p>
      </header>

      <div className="ic-hero">
        <ArticleFigure
          src={`${IMG}/hero.webp`}
          alt="IELTS score requirements for Canada Express Entry and the 8-7-7-7 CLB 9 benchmark"
          width={1200}
          height={630}
          priority
        />
      </div>

      <div className="ca-body">
        <h2>What is the 8-7-7-7 rule?</h2>
        <p>
          If you are immigrating to Canada under the Federal Skilled Worker Program through Express
          Entry, reaching Canadian Language Benchmark (CLB) Level 9 is the most rewarding single move
          for your CRS score. &ldquo;8-7-7-7&rdquo; is the set of IELTS band scores that maps to
          CLB 9 in every ability:
        </p>
        <ScoreCards
          items={[
            { label: 'Listening', value: '8.0', sub: 'CLB 9' },
            { label: 'Reading', value: '7.0', sub: 'CLB 9' },
            { label: 'Writing', value: '7.0', sub: 'CLB 9' },
            { label: 'Speaking', value: '7.0', sub: 'CLB 9' },
          ]}
        />

        <h3>IELTS General Training vs Academic for PR</h3>
        <p>
          IRCC accepts <strong>IELTS General Training</strong> for permanent residence under Express
          Entry and most Provincial Nominee Programs. Academic IELTS is only needed for study
          permits, so make sure you book the right module.
        </p>

        <h2>IELTS band to CLB conversion</h2>
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
          src={`${IMG}/ielts-clb-chart.webp`}
          alt="Chart mapping IELTS band scores to Canadian Language Benchmark levels 7, 8 and 9"
          width={1200}
          height={800}
          caption="Note the quirk: CLB 9 needs a full 8.0 in Listening but only 7.0 in the other abilities."
        />

        <h2>Why CLB 9 matters for your CRS score</h2>
        <p>
          CLB 9 unlocks the maximum points under both the core language factor and the
          skill-transferability factors. For many candidates that is a swing of{' '}
          <strong>50+ CRS points</strong> versus CLB 8 — often the difference between receiving an
          Invitation to Apply and waiting another year.
        </p>
        <ArticleFigure
          src={`${IMG}/canada-pr-score.webp`}
          alt="Comparison of CRS points awarded at CLB 7, CLB 8 and CLB 9 for a single applicant"
          width={1200}
          height={800}
          caption="Illustrative CRS points by CLB level for a single applicant with a Canadian degree."
        />
        <ArticleInfoBox variant="tip" title="Apex saver tip" icon={<Lightbulb className="w-4 h-4" />}>
          <p>
            If your Listening is stuck at 7.5, re-sitting one test is usually cheaper and faster than
            losing a PR draw. Book with an official{' '}
            <Link to="/exam-booking">Apex exam voucher</Link> and keep your prep receipts.
          </p>
        </ArticleInfoBox>

        <h2>PTE Core: the accepted alternative</h2>
        <p>
          Since 2024, IRCC also accepts <strong>PTE Core</strong> for Canadian PR. The approximate
          PTE Core score range equivalent to CLB 9 is:
        </p>
        <div className="ic-dual">
          <div>
            <h3>IELTS (CLB 9)</h3>
            <p>Listening 8.0 · Reading 7.0 · Writing 7.0 · Speaking 7.0</p>
          </div>
          <div>
            <h3>PTE Core (CLB 9)</h3>
            <p>Listening 84–88 · Reading 78–87 · Writing 88–89 · Speaking 84–88</p>
          </div>
        </div>
        <ArticleFigure
          src={`${IMG}/express-entry.webp`}
          alt="Express Entry pipeline showing where a language test result feeds into the CRS calculation"
          width={1200}
          height={800}
          caption="Where your language result sits in the Express Entry pipeline."
        />

        <div className="ca-cta">
          <h3>Booking IELTS or PTE Core for Canada PR?</h3>
          <p>Save on your exam fee with an official Apex voucher — genuine codes, instant delivery.</p>
          <Link to="/exam-booking">Browse exam vouchers →</Link>
        </div>

        <h2>Common mistakes to avoid</h2>
        <ArticleInfoBox variant="warning" title="Watch out" icon={<TriangleAlert className="w-4 h-4" />}>
          <p>
            Your <strong>overall</strong> band is irrelevant for Express Entry — IRCC only reads the
            four sectional scores. An 8.0 overall with 6.5 Writing is still only CLB 8.
          </p>
        </ArticleInfoBox>
        <p>
          Other frequent errors: booking IELTS Academic when Express Entry wants General Training,
          letting your result expire before PR is granted (valid two years for Express Entry), and
          not re-checking the CLB table, which IRCC updates periodically.
        </p>

        <aside className="ca-takeaways">
          <h2>Key takeaways</h2>
          <ul>
            <li>8-7-7-7 = CLB 9 in all four abilities; Listening needs the full 8.0.</li>
            <li>CLB 9 can be worth 50+ CRS points versus CLB 8.</li>
            <li>PTE Core is an accepted alternative to IELTS for Canada PR.</li>
            <li>Only sectional scores count — Express Entry ignores the overall band.</li>
          </ul>
        </aside>

        <p>
          More guides:{' '}
          <Link to="/blog?category=IELTS">browse all IELTS articles</Link>, or read our{' '}
          <Link to="/blog">full students diary</Link>.
        </p>

        {post.faqs && post.faqs.length > 0 && <FaqAccordion faqs={post.faqs} />}
        <RelatedArticles relatedPosts={relatedPosts} />
      </div>
    </article>
  );
}
