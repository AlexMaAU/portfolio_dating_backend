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

// 对方用户资料页下点击发送消息按钮，如果没有session则创建一个新的session并返回session_id, 如果有session则返回已有的session_id。
// 前端根据session_id打开对应的聊天窗口。
// 拉黑后不能再发送信息，也不会再显示在消息页中。
sessionRouter.post('/', createSession);

// 用户可以拉黑session。
sessionRouter.put('/:sessionId', updateSessionStatusById);

// 拉黑后不能再发送信息，也不会再显示在消息页中。
sessionRouter.post('/:sessionId', createMessageForSession);

sessionRouter.get('/:sessionId/messages', getAllMessagesOfSession);

export default sessionRouter;

