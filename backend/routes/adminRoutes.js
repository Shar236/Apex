import { Router } from 'express';
import {
  dashboardOverview,
  listUsers,
  getUser,
  setUserStatus,
  listAdminProducts,
  getAdminProduct,
  createProduct,
  updateProduct,
  quickUpdatePrice,
  quickUpdateStatus,
  quickUpdateFeatured,
  deleteProduct,
  getProductInventory,
  listVouchers,
  addVouchers,
  updateVoucher,
  listOrdersAdmin,
  updateOrderStatus,
  resendOrderEmail,
  listCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  toggleCampaignStatus,
  getWebsiteSettings,
  updateWebsiteSettings,
  listPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  listAuditLogs,
  exportCSV,
  listAdminVideos,
  createVideo,
  updateVideo,
  quickToggleFeaturedVideo,
  quickTogglePublishVideo,
  deleteVideo,
  updateVideoSettings,
  uploadMedia,
} from '../controllers/adminController.js';
import { getOrderByIdAdmin } from '../controllers/orderController.js';
import { protectAdmin } from '../middleware/auth.js';
import { mediaUpload } from '../middleware/upload.js';

const r = Router();

r.use(protectAdmin);

r.get('/dashboard', dashboardOverview);

r.get('/users', listUsers);
r.get('/users/:id', getUser);
r.patch('/users/:id/status', setUserStatus);

r.get('/products', listAdminProducts);
r.get('/products/:id', getAdminProduct);
r.post('/products', createProduct);
r.patch('/products/:id', updateProduct);
r.patch('/products/:id/price', quickUpdatePrice);
r.patch('/products/:id/status', quickUpdateStatus);
r.patch('/products/:id/featured', quickUpdateFeatured);
r.delete('/products/:id', deleteProduct);
r.get('/products/:id/inventory', getProductInventory);

r.get('/vouchers', listVouchers);
r.post('/vouchers', addVouchers);
r.post('/vouchers/bulk', addVouchers);
r.patch('/vouchers/:id', updateVoucher);

r.get('/orders', listOrdersAdmin);
r.get('/orders/:id', getOrderByIdAdmin);
r.patch('/orders/:id/status', updateOrderStatus);
r.post('/orders/:id/resend-email', resendOrderEmail);

r.get('/promotions', listPromotions);
r.post('/promotions', createPromotion);
r.patch('/promotions/:id', updatePromotion);
r.delete('/promotions/:id', deletePromotion);

r.get('/campaigns', listCampaigns);
r.post('/campaigns', createCampaign);
r.patch('/campaigns/:id', updateCampaign);
r.delete('/campaigns/:id', deleteCampaign);
r.post('/campaigns/:id/toggle', toggleCampaignStatus);

r.get('/website-settings', getWebsiteSettings);
r.patch('/website-settings', updateWebsiteSettings);

r.get('/videos', listAdminVideos);
r.post('/videos', createVideo);
r.post('/videos/upload', mediaUpload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), uploadMedia);
r.patch('/videos/settings', updateVideoSettings);
r.patch('/videos/:id', updateVideo);
r.patch('/videos/:id/featured', quickToggleFeaturedVideo);
r.patch('/videos/:id/publish', quickTogglePublishVideo);
r.delete('/videos/:id', deleteVideo);

r.get('/audit-logs', listAuditLogs);
r.get('/export/:resource', exportCSV);

export default r;
