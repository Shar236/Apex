import { Router } from 'express';
import { listPublicVideos, getPublicVideo, incrementVideoView, streamVideoFile } from '../controllers/videoController.js';

const r = Router();

r.get('/', listPublicVideos);
r.get('/stream/:filename', streamVideoFile);
r.get('/:id', getPublicVideo);
r.post('/:id/view', incrementVideoView);

export default r;
