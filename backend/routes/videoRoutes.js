import { Router } from 'express';
import { listPublicVideos, incrementVideoView, streamVideoFile } from '../controllers/videoController.js';

const r = Router();

r.get('/', listPublicVideos);
r.get('/stream/:filename', streamVideoFile);
r.post('/:id/view', incrementVideoView);

export default r;
