import joi from 'joi';

//create message
export const createMessageSchemaValidate = joi.object({
  send_user: joi.string().optional(),
  receive_user: joi.string().optional(),
  content: joi.string().optional(),
});

