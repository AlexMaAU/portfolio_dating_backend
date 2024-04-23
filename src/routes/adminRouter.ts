import express from 'express';
import adminAuthGuard from '../middlewares/adminAuthMiddleware';
import { getAllUsers, getUserById } from '../controllers/users';
import {
  addRecommendLimitToAllUsers,
  adminLogin,
  adminSignup,
  updateAdminById,
} from '../controllers/admins';
import {
  getAllSessions,
  getAllSessionsByUserId,
} from '../controllers/sessions';
import { getAllPayments, getPaymentById } from '../controllers/payments';
import {
  getAllBanners,
  getBannerById,
  updateBannerById,
} from '../controllers/banners';

const adminRouter = express.Router();

adminRouter.post('/signup', adminSignup);

adminRouter.post('/login', adminLogin);

adminRouter.put('/:adminId', adminAuthGuard, updateAdminById);

adminRouter.get('/:adminId/users', adminAuthGuard, getAllUsers);

adminRouter.get('/:adminId/users/:userId', adminAuthGuard, getUserById);

adminRouter.get(
  '/:adminId/users/:userId/sessions',
  adminAuthGuard,
  getAllSessionsByUserId,
);

adminRouter.put(
  '/:adminId/users/add-limits',
  adminAuthGuard,
  addRecommendLimitToAllUsers,
);

adminRouter.get('/:adminId/sessions', adminAuthGuard, getAllSessions);

adminRouter.get('/:adminId/payments', adminAuthGuard, getAllPayments);

adminRouter.get(
  '/:adminId/payments/:paymentId',
  adminAuthGuard,
  getPaymentById,
);

adminRouter.get('/:adminId/banners', adminAuthGuard, getAllBanners);

adminRouter.get('/:adminId/banners/:bannerId', adminAuthGuard, getBannerById);

adminRouter.put(
  '/:adminId/banners/:bannerId',
  adminAuthGuard,
  updateBannerById,
);

export default adminRouter;

