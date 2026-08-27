import { Router } from 'express';
import {
  getStatus, connect, callback, disconnect,
  getProperties, setProperty,
  getPerformance, getQueries, getPages, getCountries, getDevices, getOpportunities,
  sync,
} from '../controllers/googleSeoController.js';
import { protectAdmin } from '../middleware/auth.js';

const r = Router();

// Google redirects the bare browser here — no Bearer header will be present.
// This route authenticates itself via the signed `state` JWT instead.
r.get('/callback', callback);

r.use(protectAdmin);

r.get('/status', getStatus);
r.get('/connect', connect);
r.post('/disconnect', disconnect);

r.get('/properties', getProperties);
r.post('/property', setProperty);

r.get('/performance', getPerformance);
r.get('/queries', getQueries);
r.get('/pages', getPages);
r.get('/countries', getCountries);
r.get('/devices', getDevices);
r.get('/opportunities', getOpportunities);

r.post('/sync', sync);

export default r;
