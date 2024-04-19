import { Schema, model } from 'mongoose';

const paymentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    required: true,
  },
  payment_date: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: String,
    default: null,
    required: true,
  },
});

const Payment = model('Payment', paymentSchema);

export default Payment;

