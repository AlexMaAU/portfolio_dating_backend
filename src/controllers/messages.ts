import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Session from '../models/sessionModel';
import { pageSize } from '../constants/settings';
import Message from '../models/messageModel';
import { createMessageSchemaValidate } from '../validations/messageVlidate';

export const getAllMessagesOfSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ error: 'session ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const session = await Session.findById(sessionId).exec();
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { page } = req.query; // 获取请求中的页码参数
    const pageNumber = parseInt(page as string) || 1; // 将页码转换为数字，默认为第一页

    if (session.all_messages.length === 0) {
      return res.status(404).json({ error: 'Session has no message' });
    }

    const totalCount = session.all_messages.length; // 获取总数，用于计算总页数
    const totalPages = Math.ceil(totalCount / pageSize);

    if (pageNumber < 1 || pageNumber > totalPages) {
      return res.status(404).json([]);
    }

    const messages = await Message.find({ _id: { $in: session.all_messages } })
      .skip((pageNumber - 1) * pageSize) // 跳过前面的文档，实现分页
      .limit(pageSize) // 限制返回的文档数量
      .exec();

    res.status(200).json(messages);
  } catch (error: any) {
    console.error('Error in getAllMessagesOfSession:', error);
    res.status(500).json({ error });
  }
};

export const createMessageForSession = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ error: 'session ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const { latest_sender, latest_receiver, latest_message } = req.body;

    if (!latest_sender || !latest_receiver || !latest_message) {
      return res
        .status(400)
        .json({ error: 'latest_sender and latest_receiver ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(latest_sender)) {
      return res.status(400).json({ error: 'Invalid sender user ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(latest_receiver)) {
      return res.status(400).json({ error: 'Invalid receiver user ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const validBody = await createMessageSchemaValidate.validateAsync(
      {
        send_user: latest_sender,
        receive_user: latest_receiver,
        content: latest_message,
      },
      {
        allowUnknown: true,
        stripUnknown: true,
      },
    );

    // create new message
    const message = await new Message(validBody).save({ session });

    // update new message into session by sessionId
    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          //replace original value
          latest_sender: latest_sender,
          latest_receiver: latest_receiver,
          latest_message: latest_message,
          unread: true,
          timestamp: message.timestamp,
        },
        $push: {
          //insert new value to start of all_messages array
          all_messages: { $each: [message._id], $position: 0 },
        },
      },
      { new: true, session },
    ).exec();

    await session.commitTransaction();
    session.endSession();

    res.json(updatedSession);
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error in createMessageForSession:', error);
    res.status(500).json({ error });
  }
};

