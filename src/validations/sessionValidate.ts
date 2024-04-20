import joi from 'joi';

//create session
export const createSessionSchemaValidate = joi.object({
  latest_sender: joi.string().required(),
  latest_receiver: joi.string().required(),
  latest_message: joi.string().optional(),
  timestamp: joi.date().optional(),
  unread: joi.boolean().optional(),
  banned: joi.boolean().optional(),
});

//update session
export const updateSessionStatusSchemaValidate = joi.object({
  banned: joi.boolean().optional(),
});

