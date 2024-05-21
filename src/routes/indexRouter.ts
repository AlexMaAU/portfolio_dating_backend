import express from 'express';
import healthCheckRouter from '../controllers/healthCheck';
import userRouter from './userRouter';
import adminRouter from './adminRouter';
import sessionRouter from './sessionRouter';
import userAuthGuard from '../middlewares/userAuthMiddleware';

const indexRouter = express.Router();

indexRouter.use('/health', userAuthGuard, healthCheckRouter);
indexRouter.use('/users', userRouter);
indexRouter.use('/sessions', userAuthGuard, sessionRouter);
indexRouter.use('/admin', adminRouter);

export default indexRouter;

