import express from 'express';
import {
  getActiveUserById,
  getAllUsers,
  getFilteredUsers,
  getRandomUser,
  getUserById,
  updateUserById,
  userLogin,
  userSignup,
} from '../controllers/users';

const userRouter = express.Router();

userRouter.post('/', userSignup);

userRouter.post('/login', userLogin);

userRouter.post('/:userId', updateUserById);

userRouter.get('/', getFilteredUsers);

userRouter.get('/recommend', getRandomUser);

userRouter.get('/:userId', getActiveUserById);

export default userRouter;

