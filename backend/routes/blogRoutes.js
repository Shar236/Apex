import { Router } from 'express';
import {
  listAdminBlogs,
  getAdminBlog,
  createBlog,
  updateBlog,
  trashBlog,
  publishBlog,
  unpublishBlog,
  scheduleBlog,
  duplicateBlog,
  restoreBlog,
  permanentlyDeleteBlog,
  listRevisions,
  restoreRevision,
  previewBlog,
  analyzeBlogSeoEndpoint,
  improveArticleSeo,
  internalLinkSuggestions,
  uploadBlogImageHandler,
} from '../controllers/blogController.js';
import { protectAdmin } from '../middleware/auth.js';
import { blogImageUpload } from '../middleware/upload.js';

const r = Router();

r.use(protectAdmin);

r.get('/internal-link-suggestions', internalLinkSuggestions);
r.post('/upload-image', blogImageUpload.single('image'), uploadBlogImageHandler);

r.get('/', listAdminBlogs);
r.post('/', createBlog);
r.get('/:id', getAdminBlog);
r.put('/:id', updateBlog);
r.delete('/:id', trashBlog);

r.post('/:id/publish', publishBlog);
r.post('/:id/unpublish', unpublishBlog);
r.post('/:id/schedule', scheduleBlog);
r.post('/:id/duplicate', duplicateBlog);
r.post('/:id/restore', restoreBlog);
r.delete('/:id/permanent', permanentlyDeleteBlog);

r.get('/:id/revisions', listRevisions);
r.post('/:id/revisions/:revisionId/restore', restoreRevision);

r.get('/:id/preview', previewBlog);
r.get('/:id/seo-analysis', analyzeBlogSeoEndpoint);
r.post('/:id/improve-seo', improveArticleSeo);

export default r;
