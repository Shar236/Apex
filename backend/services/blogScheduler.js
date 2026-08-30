import { BlogPost, AuditLog } from '../models/index.js';

const CHECK_INTERVAL_MS = 60 * 1000;
let intervalHandle = null;

const publishDuePosts = async () => {
  try {
    const due = await BlogPost.find({ status: 'scheduled', scheduledAt: { $lte: new Date() } });
    for (const post of due) {
      post.status = 'published';
      post.publishedAt = new Date();
      await post.save();
      AuditLog.create({
        adminEmail: 'system@apexvouchers.in',
        action: 'BLOG_AUTO_PUBLISHED',
        resourceType: 'BlogPost',
        resourceId: String(post._id),
        details: { title: post.title, scheduledAt: post.scheduledAt },
      }).catch(() => {});
    }
  } catch (err) {
    console.error('[blogScheduler] error publishing due posts:', err.message);
  }
};

export const startBlogScheduler = () => {
  if (intervalHandle) return;
  intervalHandle = setInterval(publishDuePosts, CHECK_INTERVAL_MS);
  publishDuePosts();
};

export const stopBlogScheduler = () => {
  if (intervalHandle) clearInterval(intervalHandle);
  intervalHandle = null;
};
