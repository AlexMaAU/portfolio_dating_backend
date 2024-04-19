import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  active: {
    type: Boolean,
    default: true,
  },
  is_vip: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    default: null,
    required: true,
    index: true,
  },
  password: {
    type: String,
    default: null,
    required: true,
    select: false,
  },
  country: {
    type: String,
    default: 'Australia',
  },
  username: {
    type: String,
    default: 'New User',
  },
  city: {
    type: String,
    default: null,
  },
  visa_type: {
    type: String,
    default: null,
  },
  profile_photo: {
    type: String,
    default: null,
  },
  gallery_photos: {
    type: [
      {
        type: String,
        default: null,
      },
    ],
    default: [],
  },
  gender: {
    type: String,
    default: null,
  },
  seek_gender: {
    type: String,
    default: null,
  },
  birthday: {
    type: String,
    default: null,
  },
  age: {
    type: String,
    default: null,
  },
  height: {
    type: String,
    default: null,
  },
  income: {
    type: String,
    default: null,
  },
  education: {
    type: String,
    default: null,
  },
  school_name: {
    type: String,
    default: null,
  },
  industry: {
    type: String,
    default: null,
  },
  hobbies: {
    type: [
      {
        type: String,
        default: null,
      },
    ],
    default: [],
  },
  self_introduction: {
    type: String,
    default: null,
  },
  looking_for: {
    type: String,
    default: null,
  },
  serious_dating: {
    type: Boolean,
    default: false,
  },
  recommend_limit: {
    type: Number,
    default: 100,
  },
  liked: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    default: [],
  },
  liked_me: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    default: [],
  },
  matches: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    default: [],
  },
  mail_sessions: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Session',
      },
    ],
    default: [],
  },
  profile_completed: {
    type: Boolean,
    default: false,
  },
  register_date: {
    type: Date,
    default: Date.now,
  },
  last_login: {
    type: Date,
    default: null,
  },
});

const User = model('User', userSchema);

export default User;

