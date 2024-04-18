import express from 'express';
import { getAllUsers, getUserById } from '../controllers/users';

const adminRouter = express.Router();

adminRouter.get('/users', getAllUsers);

adminRouter.get('/users/:userId', getUserById);

export default adminRouter;
