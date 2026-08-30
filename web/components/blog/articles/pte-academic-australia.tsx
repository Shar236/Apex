import Link from 'next/link';
import { Lightbulb, TriangleAlert } from 'lucide-react';
import { ArticleInfoBox } from '@/components/blog/article-info-box';
import { ComparisonTable } from '@/components/blog/comparison-table';
import { FaqAccordion } from '@/components/blog/faq-accordion';
import { RelatedArticles } from '@/components/blog/related-articles';
import { TableOfContents } from '@/components/blog/table-of-contents';
import type { BlogPost } from '@/lib/blog-types';
import './ielts-canada.css';

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null);

export function PteAcademicAustralia({ post, relatedPosts = [] }: { post: BlogPost; relatedPosts?: BlogPost[] }) {
  const title = post.title || 'PTE Academic Score for Australia PR & University Cutoffs 2026';
  const published = fmtDate(post.publishedAt || post.createdAt);
  const updated = fmtDate(post.updatedAt);
  const showUpdated = updated && post.updatedAt && post.publishedAt && new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > 86400000;

  return (
    <article className="blog-article blog-pte-australia">
      <header className="ca-header">
        <span className="ca-eyebrow">{post.category || 'PTE'} · Australia PR &amp; Study</span>
        <h1 className="ca-title">{title}</h1>
        <div className="ca-meta">
          <span>By {post.author || 'Apex Vouchers Editorial Team'}</span>
          {published ? <span>Published {published}</span> : null}
          {showUpdated ? <span>Updated {updated}</span> : null}
          {post.readingTime ? <span>{post.readingTime} min read</span> : null}
        </div>
        <p className="ca-lede">
          {post.excerpt ||
            'Planning to study or settle in Australia? Your PTE Academic score is measured against three separate bars — the Department of Home Affairs’ student visa minimum, your university’s admission cutoff, and the Competent/Proficient/Superior levels that add real points to a PR application. Here’s the full 2026 breakdown for all three, plus a score-validity trap that catches even well-prepared applicants.'}
        </p>
      </header>

      <div className="ca-body">
        <ArticleInfoBox variant="tip" title="Quick answer" icon={<Lightbulb className="w-4 h-4" />}>
          <p>
            You need <strong>47 overall</strong> for a direct-entry Student visa (Subclass 500), typically <strong>58&ndash;79 overall</strong> for university admission depending on the course and
            institution, and component-specific scores for PR points: Competent (0 points), Proficient (10 points, L58/R59/W69/S76) or Superior (20 points, L69/R70/W85/S88). These are three different
            requirements, not one number that covers everything.
          </p>
        </ArticleInfoBox>

        <TableOfContents scope=".ca-body" />

        <h2 id="three-bars">The Three PTE Score Bars in Australia</h2>
        <p>&ldquo;What PTE score do I need for Australia?&rdquo; doesn&rsquo;t have one answer, because Australia asks three different questions of your score, each with its own bar to clear:</p>
        <ul>
          <li>
            <strong>The visa floor</strong> &mdash; the Department of Home Affairs&rsquo; minimum for your Student visa (Subclass 500) to be granted at all.
          </li>
          <li>
            <strong>The university bar</strong> &mdash; the score your chosen institution requires for a Confirmation of Enrolment, which is almost always higher than the visa floor.
          </li>
          <li>
            <strong>The PR points bar</strong> &mdash; the Competent, Proficient or Superior English level that adds 0, 10 or 20 points to a skilled migration application (Subclass 189, 190 or 491).
          </li>
        </ul>
        <p>A score of 47 clears the first bar. It won&rsquo;t clear the second or third.</p>

        <h2 id="pte-pr">PTE Score for Australia PR: Competent, Proficient, Superior (2026)</h2>
        <p>
          Since <strong>7 August 2025</strong>, the Department of Home Affairs scores PTE Academic for PR purposes using a minimum in <em>each</em> of the four skills &mdash; there is no overall-average
          shortcut and no compensating a weak skill with a strong one.
        </p>
        <ComparisonTable
          caption="PTE Academic thresholds for PR points, for tests taken on or after 7 August 2025. Source: Department of Home Affairs."
          columns={['English level', 'Listening', 'Reading', 'Writing', 'Speaking', 'PR points', 'IELTS equivalent']}
          rows={[
            ['Competent', '47', '48', '51', '54', '0', '6.0 each'],
            ['Proficient', '58', '59', '69', '76', '10', '7.0 each'],
            ['Superior', '69', '70', '85', '88', '20', '8.0 each'],
          ]}
        />
        <ArticleInfoBox variant="warning" title="The old flat 65 / 79 thresholds no longer apply" icon={<TriangleAlert className="w-4 h-4" />}>
          <p>
            Before 7 August 2025, Proficient meant a flat 65 in every skill and Superior meant a flat 79. Under the current rules, Writing and Speaking need noticeably higher scores than Listening and
            Reading &mdash; an 85 overall with Speaking at 82 does <strong>not</strong> qualify as Superior. Tests sat on or before 6 August 2025 are still judged against the old flat thresholds, within
            their validity window.
          </p>
        </ArticleInfoBox>
        <p>
          Superior English is the ceiling for PR points &mdash; 20 points is the maximum English can contribute, and for many applicants in competitive rounds it&rsquo;s the single biggest lever left to
          pull once education and work experience are locked in.
        </p>

        <h2 id="pte-university">PTE Score for University Admission</h2>
        <p>
          University admission is a separate hurdle from the visa, and it&rsquo;s set by the institution, not the government. Treat the ranges below as a starting point, not a guarantee &mdash; always
          confirm the exact figure on your target course&rsquo;s admissions page before you book your test.
        </p>
        <ComparisonTable
          caption="Typical PTE Academic requirements by study level. Individual courses and intakes vary, and many set a minimum per section, not just an overall score."
          columns={['Study level', 'Typical PTE score', 'Group of Eight (top-tier)']}
          rows={[
            ['Diploma / Foundation', '42 – 55', '—'],
            ["Undergraduate (Bachelor's)", '50 – 65', '58 – 65'],
            ["Postgraduate (Master's)", '58 – 79', '65 – 79'],
            ['Nursing & allied health (AHPRA-regulated)', '65 in every section', '65 in every section'],
          ]}
        />
        <p>
          Nursing, medicine and other AHPRA-regulated programs are the strictest: a 65 overall with one section at 58 typically won&rsquo;t clear registration requirements, because these bodies check each
          section individually, the same way the PR points system does.
        </p>

        <h2 id="pte-student-visa">PTE Score for the Student Visa (Subclass 500)</h2>
        <p>The visa minimum is separate from &mdash; and lower than &mdash; what your university asks for. As of the 7 August 2025 update, the direct-entry threshold rose from 42 to 47 overall:</p>
        <ComparisonTable
          caption="Subclass 500 Student visa PTE Academic minimums, for tests taken on or after 7 August 2025."
          columns={['Pathway', 'PTE Academic score needed']}
          rows={[
            ['Direct entry (no ELICOS)', '47 overall'],
            ['Packaged with 10+ weeks ELICOS, Foundation or Pathway', '39 overall'],
            ['Packaged with 20+ weeks ELICOS', '31 overall'],
          ]}
        />
        <p>
          A score of 47 gets you the visa. It rarely gets you into the course itself &mdash; aim for your university&rsquo;s published requirement first, and treat 47 only as the government floor
          underneath it.
        </p>
        <ArticleInfoBox variant="tip" title="Apex saver tip" icon={<Lightbulb className="w-4 h-4" />}>
          <p>
            PTE Academic costs ₹18,900 in India (inclusive of GST, as of March 2026). If you&rsquo;re retaking to clear a university or PR threshold, book with an official{' '}
            <Link href="/exam-booking">Apex exam voucher</Link> to save on the fee before you sit again.
          </p>
        </ArticleInfoBox>

        <h2 id="score-validity">How Long Is Your PTE Score Valid?</h2>
        <p>
          Two different validity windows apply, and mixing them up catches people out. Pearson keeps your official score report accessible in your account for <strong>2 years</strong> from your test date
          &mdash; after that, you can&rsquo;t log in and send a fresh copy anywhere. The Department of Home Affairs, however, accepts PTE Academic results for Australian visa purposes (including PR) for up
          to <strong>3 years</strong> from the test date.
        </p>
        <p>
          In practice: download and save your PDF score report the moment it&rsquo;s issued, because you may still need it in year three &mdash; well after Pearson&rsquo;s own access window has closed.
          Most university admissions offices want a result under 2 years old at the time you apply, regardless of the DHA rule, so don&rsquo;t assume a 3-year-old score works everywhere just because
          it&rsquo;s valid for PR.
        </p>

        <div className="ca-cta" data-toc-ignore>
          <h3>Booking PTE Academic for Australia?</h3>
          <p>Save on your exam fee with an official Apex voucher &mdash; genuine codes, instant delivery.</p>
          <Link href="/exam-booking">Browse exam vouchers &rarr;</Link>
        </div>

        <h2 id="mistakes">Common PTE Score Mistakes That Cost Applicants</h2>
        <ul>
          <li>Assuming the old flat 65 (Proficient) or 79 (Superior) thresholds still apply to a recent test &mdash; since 7 August 2025, each skill needs its own minimum.</li>
          <li>Clearing the DHA&rsquo;s 47-overall visa minimum and assuming that&rsquo;s enough for university admission &mdash; it almost never is.</li>
          <li>Letting Pearson&rsquo;s 2-year online access lapse without saving a PDF copy, even though DHA can still use the result for a third year.</li>
          <li>Booking a nursing or allied-health pathway without checking the regulator&rsquo;s own sectional minimum, which is stricter than most standard degree programs.</li>
        </ul>

        <aside className="ca-takeaways">
          <h2>Key Takeaways</h2>
          <ul>
            <li>Three separate bars: student visa (47), university admission (50&ndash;79+), and PR points (Competent/Proficient/Superior).</li>
            <li>Since 7 August 2025, PR levels use per-skill minimums, not one overall number.</li>
            <li>Superior English (L69/R70/W85/S88) is worth 20 PR points &mdash; the maximum English can contribute.</li>
            <li>DHA accepts PTE results for 3 years, but Pearson&rsquo;s own access window is only 2 &mdash; save your PDF.</li>
            <li>Nursing and allied-health pathways usually require 65 in every section, not just overall.</li>
          </ul>
        </aside>

        <p>
          More guides: <Link href="/blog?category=PTE">browse all PTE articles</Link>, or read our <Link href="/blog">full students diary</Link>.
        </p>

        {post.faqs && post.faqs.length > 0 && <FaqAccordion faqs={post.faqs} />}
        <RelatedArticles relatedPosts={relatedPosts} />
      </div>
    </article>
  );
}
