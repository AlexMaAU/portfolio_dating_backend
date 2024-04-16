import joi from 'joi';

export const newPaymentSchemaValidate = joi.object({
  user: joi.string().required(),
  amount: joi.string().required(),
});
