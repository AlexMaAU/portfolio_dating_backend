import joi from 'joi';

//create session
export const createSessionSchemaValidate = joi.object({
  latest_sender: joi.string().required(),
  latest_receiver: joi.string().required(),
});

//update session
export const updateSessionSchemaValidate = joi.object({
  latest_sender: joi.string().optional(),
  latest_receiver: joi.string().optional(),
  latest_message: joi.string().optional(),
  timestamp: joi.date().optional(),
  all_messages: joi.array().optional(),
});

// update session status
export const updateSessionStatusSchemaValidate = joi.object({
  unread: joi.boolean().optional(),
  banned: joi.boolean().optional(),
});

