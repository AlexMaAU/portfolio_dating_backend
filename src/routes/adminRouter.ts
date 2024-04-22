import express from 'express';
import adminAuthGuard from '../middlewares/adminAuthMiddleware';
import { getAllUsers, getUserById } from '../controllers/users';
import {
  adminLogin,
  adminSignup,
  updateAdminById,
} from '../controllers/admins';
import {
  getAllSessions,
  getAllSessionsByUserId,
} from '../controllers/sessions';
import { getAllPayments, getPaymentById } from '../controllers/payments';

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

adminRouter.get('/:adminId/sessions', adminAuthGuard, getAllSessions);

adminRouter.get('/:adminId/payments', adminAuthGuard, getAllPayments);

adminRouter.get(
  '/:adminId/payments/:paymentId',
  adminAuthGuard,
  getPaymentById,
);

export default adminRouter;

