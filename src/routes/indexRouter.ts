import express from 'express';
import healthCheckRouter from '../controllers/healthCheck';

const indexRouter = express.Router();

indexRouter.use('/health', healthCheckRouter);

export default indexRouter;

