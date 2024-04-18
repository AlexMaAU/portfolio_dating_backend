import express from 'express';
import { getAllUsers, getUserById } from '../controllers/users';
import {
  adminLogin,
  adminSignup,
  updateAdminById,
} from '../controllers/admins';

const adminRouter = express.Router();

adminRouter.post('/signup', adminSignup);

adminRouter.post('/login', adminLogin);

adminRouter.put('/:adminId', updateAdminById);

adminRouter.get('/users', getAllUsers);

adminRouter.get('/users/:userId', getUserById);

export default adminRouter;

