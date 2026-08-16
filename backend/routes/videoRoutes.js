import { Router } from 'express';
import { listPublicVideos, incrementVideoView } from '../controllers/videoController.js';

const r = Router();

r.get('/', listPublicVideos);
r.post('/:id/view', incrementVideoView);

export default r;
