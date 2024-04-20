import express from 'express';
import {
  createSession,
  getAllActiveSessionsByUserId,
  updateSessionStatusById,
} from '../controllers/sessions';
import {
  createMessageForSession,
  getAllMessagesOfSession,
} from '../controllers/messages';

const sessionRouter = express.Router();

sessionRouter.get('/:userId', getAllActiveSessionsByUserId);

sessionRouter.post('/', createSession);

sessionRouter.put('/:sessionId', updateSessionStatusById);

sessionRouter.post('/:sessionId', createMessageForSession);

sessionRouter.get('/:sessionId/messages', getAllMessagesOfSession);

export default sessionRouter;

