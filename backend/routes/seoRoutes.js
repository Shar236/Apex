import { Router } from 'express';
import {
  seoOverview,
  analyzeProductSEO,
  analyzeSEOInline,
  updateProductSEO,
  listPagesSEO,
  getPageSEO,
  updatePageSEO,
  listRedirects,
  createRedirect,
  updateRedirect,
  deleteRedirect,
  getGlobalSEOSettings,
  updateGlobalSEOSettings,
} from '../controllers/seoController.js';
import { protectAdmin } from '../middleware/auth.js';

const r = Router();

r.use(protectAdmin);

r.get('/overview', seoOverview);

r.post('/analyze', analyzeSEOInline);
r.get('/analyze/product/:id', analyzeProductSEO);

r.patch('/products/:id/seo', updateProductSEO);

r.get('/pages', listPagesSEO);
r.get('/pages/:pageKey', getPageSEO);
r.patch('/pages/:pageKey', updatePageSEO);

r.get('/redirects', listRedirects);
r.post('/redirects', createRedirect);
r.patch('/redirects/:id', updateRedirect);
r.delete('/redirects/:id', deleteRedirect);

// Blog CRUD moved to /api/admin/blogs (routes/blogRoutes.js)

r.get('/global-settings', getGlobalSEOSettings);
r.patch('/global-settings', updateGlobalSEOSettings);

export default r;
