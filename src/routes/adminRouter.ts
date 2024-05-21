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


export default adminRouter;

