import joi from 'joi';

export const newAdminSchemaValidate = joi.object({
  username: joi.string().optional(),
  email: joi.string().email().required(),
  password: joi.string().min(4).max(10).required(),
});

export const updateAdminSchemaValidate = joi.object({
  active: joi.boolean().optional(),
  username: joi.string().optional(),
  password: joi.string().min(4).max(10).optional(),
});

