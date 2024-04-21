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

// 拉黑后不能再发送信息，也不会再显示在消息页中。
sessionRouter.get('/user/:userId', getAllActiveSessionsByUserId);

// 拉黑后不能再发送信息，也不会再显示在消息页中。
sessionRouter.post('/', createSession);

// 用户可以拉黑session。
sessionRouter.put('/:sessionId', updateSessionStatusById);

// 拉黑后不能再发送信息，也不会再显示在消息页中。
sessionRouter.post('/:sessionId', createMessageForSession);

sessionRouter.get('/:sessionId/messages', getAllMessagesOfSession);

export default sessionRouter;

