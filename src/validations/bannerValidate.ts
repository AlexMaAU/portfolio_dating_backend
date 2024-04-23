import joi from 'joi';

export const newBannerSchemaValidate = joi.object({
  user: joi.string().required(),
  country: joi.string().required(),
  city: joi.string().required(),
  amount: joi.string().required(),
  expire_date: joi.date().required(),
  vertical_image: joi.string().required(),
  horizontal_image: joi.string().required(),
  website: joi.string().required(),
});

export const updateBannerSchemaValidate = joi.object({
  active: joi.boolean().optional(),
  city: joi.string().optional(),
  vertical_image: joi.string().optional(),
  horizontal_image: joi.string().optional(),
  website: joi.string().optional(),
});

