import { Router } from 'express';
import { listProducts, getProduct, getWebsiteConfig } from '../controllers/productController.js';

const r = Router();

r.get('/', listProducts);
r.get('/website-config', getWebsiteConfig);
r.get('/:id', getProduct);

export default r;
