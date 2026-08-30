import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { BlogPost } from '../models/index.js';
import { prepareIncomingArticle } from '../utils/articleContent.js';

/**
 * migrateBlogArticleContent
 * ─────────────────────────
 * Brings every existing BlogPost up to the "Article = HTML + CSS" model:
 *   - any <style> block still embedded in `content` is moved into `css`
 *   - a stored full `<!DOCTYPE html>` document collapses to its body fragment
 *   - editor table artifacts (colgroup, colspan="1", min-width) are normalized
 *   - `css` is sanitized (expression() / javascript: / @import removed)
 *
 *   node scripts/migrateBlogArticleContent.js            → DRY RUN (report only)
 *   node scripts/migrateBlogArticleContent.js --commit   → write the changes
 *
 * GUARANTEES
 *  - Only `content` and `css` are ever touched. No other field is read or written.
 *  - Idempotent: a second run reports "no change" for every article.
 *  - `css: ''` stays the default for articles that never had any CSS.
 *  - Uses updateOne with $set (no full re-validate, no revision, no slug redirect).
 */

const COMMIT = process.argv.includes('--commit');

const run = async () => {
  await connectDB();
  const posts = await BlogPost.find({}).select('title slug content css').lean();
  console.log(`\n${COMMIT ? 'COMMIT' : 'DRY RUN'} — ${posts.length} articles\n${'='.repeat(64)}`);

  let changed = 0;
  for (const p of posts) {
    const prepared = prepareIncomingArticle(p.content || '', p.css || '');
    const nextContent = prepared.html;
    const nextCss = prepared.css;
    const contentChanged = nextContent !== (p.content || '');
    const cssChanged = nextCss !== (p.css || '');
    if (!contentChanged && !cssChanged) continue;

    changed += 1;
    console.log(`\n• ${p.title}  (${p.slug})`);
    if (contentChanged) console.log(`  content: ${p.content?.length || 0}b → ${nextContent.length}b`);
    if (cssChanged) console.log(`  css:     ${(p.css || '').length}b → ${nextCss.length}b${!p.css ? '  (extracted from HTML)' : ''}`);

    if (COMMIT) {
      await BlogPost.updateOne({ _id: p._id }, { $set: { content: nextContent, css: nextCss } });
      console.log('  ✓ written');
    }
  }

  console.log(`\n${'='.repeat(64)}\n${changed} article(s) ${COMMIT ? 'updated' : 'would change'}. ${changed === 0 ? 'Everything already normalized.' : (COMMIT ? '' : 'Re-run with --commit to apply.')}`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((e) => { console.error(e); process.exit(1); });
