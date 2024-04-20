import express from 'express';
import userAuthGuard from '../middlewares/userAuthMiddleware';
import {
  getActiveUserById,
  getFilteredUsers,
  getRandomUser,
  updateUserById,
  userLogin,
  userSignup,
} from '../controllers/users';

const userRouter = express.Router();

userRouter.post('/signup', userSignup);

userRouter.post('/login', userLogin);

userRouter.put('/:userId', userAuthGuard, updateUserById);

userRouter.get('/', userAuthGuard, getFilteredUsers);

userRouter.get('/recommend', userAuthGuard, getRandomUser);

userRouter.get('/:userId', userAuthGuard, getActiveUserById);

export default userRouter;

