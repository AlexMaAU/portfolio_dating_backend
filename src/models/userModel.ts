import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  active: {
    type: Boolean,
    default: true,
    index: true,
  },
  take_rest: {
    type: Boolean,
    default: false,
    index: true,
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
    index: true,
  },
  username: {
    type: String,
    default: 'New User',
    index: true,
  },
  city: {
    type: String,
    default: null,
    index: true,
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
    index: true,
  },
  seek_gender: {
    type: String,
    default: null,
    index: true,
  },
  birthday: {
    type: String,
    default: null,
  },
  age: {
    type: Number,
    default: null,
    index: true,
  },
  height: {
    type: String,
    default: null,
    index: true,
  },
  hasProperty: {
    type: Boolean,
    default: false,
    index: true,
  },
  hasCar: {
    type: Boolean,
    default: false,
    index: true,
  },
  education: {
    type: String,
    default: null,
  },
  job_title: {
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
    index: true,
  },
  prefer_dating_type: {
    type: String,
    default: null,
    index: true,
  },
  recommend_limit: {
    type: Number,
    default: 15,
  },
  last_update_time: {
    type: Date,
    default: null,
  },
  recommended_users: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    default: [],
    index: true,
  },
  liked: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    default: [],
    index: true,
  },
  liked_me: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    default: [],
    index: true,
  },
  matches: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    default: [],
    index: true,
  },
  mail_sessions: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Session',
      },
    ],
    default: [],
    index: true,
  },
  profile_completed: {
    type: Boolean,
    default: false,
    index: true,
  },
  register_date: {
    type: Date,
    default: Date.now,
    index: -1,
  },
  last_login: {
    type: Date,
    default: null,
  },
  googleId: {
    type: String,
    default: null,
    index: true,
  },
});

const User = model('User', userSchema);

export default User;

