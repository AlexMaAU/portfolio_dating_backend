import { Schema, model } from 'mongoose';

const bannerSchema = new Schema({
  active: {
    type: Boolean,
    default: true,
    index: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  country: {
    type: String,
    default: 'Australia',
    index: true,
  },
  city: {
    type: String,
    default: null,
    index: true,
  },
  payment_date: {
    type: Date,
    default: Date.now,
    index: -1,
  },
  amount: {
    type: String,
    default: null,
    required: true,
  },
  expire_date: {
    type: Date,
    default: null,
  },
  vertical_image: {
    type: String,
    default: null,
  },
  horizontal_image: {
    type: String,
    default: null,
  },
  website: {
    type: String,
    default: null,
  },
});

const Banner = model('Banner', bannerSchema);

export default Banner;

