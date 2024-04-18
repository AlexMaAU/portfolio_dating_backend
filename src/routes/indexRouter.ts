import express from 'express';
import healthCheckRouter from '../controllers/healthCheck';
import userRouter from './userRouter';
import adminRouter from './adminRouter';

const indexRouter = express.Router();

indexRouter.use('/health', healthCheckRouter);
indexRouter.use('/users', userRouter);


indexRouter.use('/admin', adminRouter);

export default indexRouter;

