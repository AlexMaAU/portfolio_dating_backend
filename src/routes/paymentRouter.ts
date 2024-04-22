import express from 'express';
import { createPayment } from '../controllers/payments';

const paymentRouter = express.Router();

paymentRouter.post('/', createPayment);

export default paymentRouter;

