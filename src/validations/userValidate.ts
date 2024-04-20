import joi from 'joi';

export const newUserSchemaValidate = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(4).max(10).required(),
});

export const updateUserSchemaValidate = joi.object({
  is_vip: joi.boolean().optional(),
  active: joi.boolean().optional(),
  password: joi.string().min(4).max(10).optional(),
  username: joi.string().min(2).max(14).optional(),
  city: joi.string().optional(),
  visa_type: joi.string().optional(),
  profile_photo: joi.string().optional(),
  gallery_photos: joi.array().optional(),
  gender: joi.string().optional(),
  seek_gender: joi.string().optional(),
  birthday: joi.string().optional(),
  age: joi.string().optional(),
  height: joi.string().optional(),
  income: joi.string().optional(),
  education: joi.string().optional(),
  job_title: joi.string().optional(),
  hobbies: joi.array().optional(),
  self_introduction: joi.string().optional(),
  looking_for: joi.string().optional(),
  serious_dating: joi.boolean().optional(),
  recommend_limit: joi.number().optional(),
  liked: joi.array().optional(),
  liked_me: joi.array().optional(),
  matches: joi.array().optional(),
  mail_sessions: joi.array().optional(),
  last_login: joi.date().optional(),
});

