import express from 'express';
import {
  createPayment,
  getAllPayments,
  getPaymentById,
} from '../controllers/payments';

const paymentRouter = express.Router();

paymentRouter.post('/', createPayment);

paymentRouter.get('/', getAllPayments);

paymentRouter.get('/:paymentId', getPaymentById);

export default paymentRouter;
