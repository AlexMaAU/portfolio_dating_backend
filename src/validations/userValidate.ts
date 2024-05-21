import joi from 'joi';

export const newUserSchemaValidate = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(4).max(10).required(),
  googleId: joi.string().optional(),
});

export const updateUserSchemaValidate = joi.object({
  active: joi.boolean().optional(),
  take_rest: joi.boolean().optional(),
  username: joi.string().min(2).max(14).optional(),
  country: joi.string().optional(),
  city: joi.string().optional(),
  profile_photo: joi.string().optional(),
  gallery_photos: joi.array().optional(),
  gender: joi.string().optional(),
  seek_gender: joi.string().optional(),
  birthday: joi.string().optional(),
  age: joi.number().optional(),
  height: joi.string().optional(),
  hasProperty: joi.boolean().optional(),
  hasCar: joi.boolean().optional(),
  education: joi.string().optional(),
  job_title: joi.string().optional(),
  hobbies: joi.array().optional(),
  self_introduction: joi.string().optional(),
  looking_for: joi.string().optional(),
  serious_dating: joi.boolean().optional(),
  prefer_dating_type: joi.string().optional(),
  recommend_limit: joi.number().optional(),
  last_update_time: joi.date().optional(),
  liked: joi.array().optional(),
  liked_me: joi.array().optional(),
  matches: joi.array().optional(),
  mail_sessions: joi.array().optional(),
  last_login: joi.date().optional(),
  googleId: joi.string().optional(),
});

export const updateUserPasswordSchemaValidate = joi.object({
  old_password: joi.string().min(4).max(10).required(),
  new_password: joi.string().min(4).max(10).required(),
});

