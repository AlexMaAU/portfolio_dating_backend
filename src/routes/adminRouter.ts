import express from 'express';
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

adminRouter.put('/:adminId', updateAdminById);

adminRouter.get('/users', getAllUsers);

adminRouter.get('/users/:userId', getUserById);

adminRouter.get('/sessions/:userId', getAllSessionsByUserId);

adminRouter.get('/sessions', getAllSessions);

export default adminRouter;

