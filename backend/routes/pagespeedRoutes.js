import { Router } from 'express';
import { getPageSpeed, runPageSpeedTest } from '../controllers/googleSeoController.js';
import { protectAdmin } from '../middleware/auth.js';

const r = Router();

r.use(protectAdmin);

r.get('/', getPageSpeed);
r.post('/test', runPageSpeedTest);

export default r;
