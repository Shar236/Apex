/**
 * Blog content health report — read-only.
 *
 * Prints every BlogPost with the signals that matter for the
 * "Article = HTML + CSS + structured metadata" model: whether the stored HTML
 * still carries a <style> block / colgroup / redundant colspan, whether the CSS
 * field is populated, and how the article's <img> tags line up with the images
 * registry.
 *
 *   node backend/scripts/inspectBlogArticles.js            # summary table
 *   node backend/scripts/inspectBlogArticles.js <slug>     # + full HTML + CSS
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { BlogPost, BlogPostRevision } from '../models/index.js';
import { scopeCss, blogArticleScope } from '../utils/articleContent.js';

const run = async () => {
  await connectDB();
  const target = process.argv[2];

  const posts = await BlogPost.find({}).sort({ updatedAt: -1 }).lean();
  console.log(`\n${posts.length} blog posts\n${'='.repeat(70)}`);

  for (const p of posts) {
    const html = p.content || '';
    const css = p.css || '';
    const imgs = [...html.matchAll(/<img\b[^>]*src=("|')([^"']+)\1[^>]*>/gi)].map((m) => m[2]);
    const flags = [
      /<style/i.test(html) && 'HAS <style> IN HTML',
      /<colgroup/i.test(html) && 'HAS <colgroup>',
      /colspan=("|')?1\b/i.test(html) && 'redundant colspan="1"',
      /<!doctype|<html[\s>]/i.test(html) && 'FULL DOCUMENT',
    ].filter(Boolean);

    console.log(`\n${p.title}`);
    console.log(`  slug=${p.slug}  status=${p.status}  source=${p.contentSource}`);
    console.log(`  html=${html.length}b  css=${css.length}b  <img>=${imgs.length}  images[]=${(p.images || []).length}`);
    if (flags.length) console.log(`  ⚠  ${flags.join(' · ')}`);
    if (css) {
      const scoped = scopeCss(css, blogArticleScope(p._id));
      const leaks = scoped.split('\n').filter((l) => /^\s*(html|body|nav|header|footer|\*)\b/.test(l));
      console.log(`  css scopes cleanly: ${leaks.length === 0 ? 'yes' : `NO — ${leaks.length} suspicious line(s)`}`);
    }
    const regUrls = new Set((p.images || []).map((i) => i.url));
    const undetected = imgs.filter((s) => !regUrls.has(s));
    if (undetected.length) console.log(`  ${undetected.length} <img> not in images[] (auto-detected by the Images tab): ${undetected.slice(0, 3).join(', ')}`);

    if (target && p.slug === target) {
      console.log(`\n--- HTML (${p.slug}) ---\n${html}\n\n--- CSS ---\n${css || '(none)'}\n`);
    }
  }

  const revCount = await BlogPostRevision.estimatedDocumentCount();
  const withCss = await BlogPostRevision.countDocuments({ 'snapshot.css': { $exists: true, $ne: '' } });
  console.log(`\n${'='.repeat(70)}\nrevisions: ${revCount} total, ${withCss} carry a non-empty css snapshot`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((e) => { console.error(e); process.exit(1); });
