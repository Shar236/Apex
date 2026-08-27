import { Router } from 'express';
import { listPublicBlogs, getPublicBlog, listBlogCategories } from '../controllers/blogController.js';

const r = Router();

r.get('/categories', listBlogCategories);
r.get('/', listPublicBlogs);
r.get('/:slug', getPublicBlog);

export default r;
