import { Schema, model } from 'mongoose';

const adminSchema = new Schema({
  active: {
    type: Boolean,
    default: true,
  },
  username: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    default: null,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    default: null,
    required: true,
    select: false,
  },
});

const Admin = model('Admin', adminSchema);

export default Admin;

