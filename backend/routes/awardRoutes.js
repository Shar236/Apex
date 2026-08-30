import { Router } from 'express';
import { listPublicAwards, getPublicAward } from '../controllers/awardController.js';

const r = Router();

// Public Awards & Achievements
r.get('/', listPublicAwards);
r.get('/:id', getPublicAward);

export default r;