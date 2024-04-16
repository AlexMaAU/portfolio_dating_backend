import joi from 'joi';

export const newAdminSchemaValidate = joi.object({
  username: joi.string().optional(),
  email: joi.string().email().required(),
  password: joi.string().min(4).max(10).optional(),
});

export const updateAdminSchemaValidate = joi.object({
  active: joi.boolean().optional(),
  username: joi.string().optional(),
  email: joi.string().email().optional(),
  password: joi.string().min(4).max(10).optional(),
});

