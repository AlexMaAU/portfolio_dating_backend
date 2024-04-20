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

const adminRouter = express.Router();

adminRouter.post('/signup', adminSignup);

adminRouter.post('/login', adminLogin);

adminRouter.put('/:adminId', adminAuthGuard, updateAdminById);

adminRouter.get('/users', adminAuthGuard, getAllUsers);

adminRouter.get('/users/:userId', adminAuthGuard, getUserById);

adminRouter.get('/sessions/:userId', adminAuthGuard, getAllSessionsByUserId);

adminRouter.get('/sessions', adminAuthGuard, getAllSessions);

export default adminRouter;

