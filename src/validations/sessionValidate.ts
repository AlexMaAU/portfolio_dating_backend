import joi from 'joi';

//create session
export const createSessionSchemaValidate = joi.object({
  latest_sender: joi.string().required(),
  latest_receiver: joi.string().required(),
});

//update session
export const updateSessionSchemaValidate = joi.object({
  unread: joi.boolean().optional(),
  banned: joi.boolean().optional(),
});

