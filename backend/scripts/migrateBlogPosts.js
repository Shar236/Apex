import { BlogPost } from '../models/index.js';
import { countWords, stripHtml } from '../utils/seo.js';

/**
 * Idempotent, startup-safe migration: brings legacy BlogPost documents (boolean
 * `published`) up to the new `status` enum without touching content, slugs,
 * images, or any other existing field. Safe to re-run — only touches documents
 * that don't already have a `status` set.
 *
 * Uses raw collection reads (lean) rather than hydrated documents, since
 * `published` is now a virtual on the schema (derived from `status`) and would
 * otherwise shadow the legacy stored boolean value on old documents.
 */
export const migrateBlogPosts = async () => {
  try {
    const legacyPosts = await BlogPost.collection
      .find({ status: { $exists: false } })
      .toArray();

    for (const raw of legacyPosts) {
      const status = raw.published === true ? 'published' : 'draft';
      const words = countWords(stripHtml(raw.content || ''));
      const set = {
        status,
        readingTime: Math.max(1, Math.round(words / 200)),
      };
      if (status === 'published' && !raw.publishedAt) {
        set.publishedAt = raw.createdAt || new Date();
      }
      if (!raw.seo) set.seo = { noindex: false, nofollow: false };
      else {
        if (raw.seo.noindex === undefined) set['seo.noindex'] = false;
        if (raw.seo.nofollow === undefined) set['seo.nofollow'] = false;
      }
      await BlogPost.collection.updateOne({ _id: raw._id }, { $set: set });
    }

    if (legacyPosts.length > 0) {
      console.log(`[migrateBlogPosts] migrated ${legacyPosts.length} legacy blog post(s) to the new status field`);
    }
  } catch (err) {
    console.error('[migrateBlogPosts] error:', err.message);
  }
};
