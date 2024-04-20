import express from 'express';
import healthCheckRouter from '../controllers/healthCheck';
import userRouter from './userRouter';
import adminRouter from './adminRouter';
import sessionRouter from './sessionRouter';
import paymentRouter from './paymentRouter';
import userAuthGuard from '../middlewares/userAuthMiddleware';

const indexRouter = express.Router();

indexRouter.use('/health', healthCheckRouter);
indexRouter.use('/users', userRouter);
indexRouter.use('/sessions', userAuthGuard, sessionRouter);
indexRouter.use('/payments', userAuthGuard, paymentRouter);

indexRouter.use('/admin', adminRouter);

export default indexRouter;

