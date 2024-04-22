import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import Session from '../models/sessionModel';
import { pageSize } from '../constants/settings';
import User from '../models/userModel';
import mongoose from 'mongoose';
import {
  createSessionSchemaValidate,
  updateSessionSchemaValidate,
} from '../validations/sessionValidate';
import SessionModel from '../interfaces/SessionModel';

// 这个意义不大，要查看聊天session应该是通过用户id来查看的 - admin
export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const { page } = req.query; // 获取请求中的页码参数
    const { adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({ error: 'admin ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ error: 'Invalid admin ID' });
    }

    const decodedToken = req.headers.user as JwtPayload;

    if (decodedToken.id !== adminId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const pageNumber = parseInt(page as string) || 1; // 将页码转换为数字，默认为第一页

    const totalCount = await Session.countDocuments(); // 获取总数，用于计算总页数
    const totalPages = Math.ceil(totalCount / pageSize);

    if (pageNumber < 1 || pageNumber > totalPages) {
      return res.status(404).json([]);
    }

    const sessions = await Session.find()
      .select(
        '_id latest_sender latest_receiver latest_message timestamp unread banned',
      )
      .skip((pageNumber - 1) * pageSize) // 跳过前面的文档，实现分页
      .limit(pageSize) // 限制返回的文档数量
      .exec();

    res.status(200).json(sessions);
  } catch (error: any) {
    console.error('Error in getAllSessions:', error);
    res.status(500).json({ error });
  }
};

// 获取用户的聊天session - admin
export const getAllSessionsByUserId = async (req: Request, res: Response) => {
  try {
    const { adminId, userId } = req.params;

    if (!adminId) {
      return res.status(400).json({ error: 'admin ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ error: 'Invalid admin ID' });
    }

    const decodedToken = req.headers.user as JwtPayload;

    if (decodedToken.id !== adminId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'user ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { page } = req.query; // 获取请求中的页码参数
    const pageNumber = parseInt(page as string) || 1; // 将页码转换为数字，默认为第一页

    if (user.mail_sessions.length === 0) {
      return res.status(404).json({ error: 'User has no session' });
    }

    const totalCount = user.mail_sessions.length; // 获取总数，用于计算总页数
    const totalPages = Math.ceil(totalCount / pageSize);

    if (pageNumber < 1 || pageNumber > totalPages) {
      return res.status(404).json([]);
    }

    // 分页返回user中的mail_sessions
    const sessions = await Session.find({ _id: { $in: user.mail_sessions } })
      .select(
        '_id latest_sender latest_receiver latest_message timestamp banned',
      )
      .skip((pageNumber - 1) * pageSize) // 跳过前面的文档，实现分页
      .limit(pageSize) // 限制返回的文档数量
      .exec();

    res.status(200).json(sessions);
  } catch (error: any) {
    console.error('Error in getAllSessionsByUserId:', error);
    res.status(500).json({ error });
  }
};

// 获取状态是unbanned用户的聊天session
export const getAllActiveSessionsByUserId = async (
  req: Request,
  res: Response,
) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'user ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const decodedToken = req.headers.user as JwtPayload;

    if (decodedToken.id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { page } = req.query; // 获取请求中的页码参数
    const pageNumber = parseInt(page as string) || 1; // 将页码转换为数字，默认为第一页

    if (user.mail_sessions.length === 0) {
      return res.status(404).json([]);
    }

    const totalCount = user.mail_sessions.length; // 获取总数，用于计算总页数
    const totalPages = Math.ceil(totalCount / pageSize);

    if (pageNumber < 1 || pageNumber > totalPages) {
      return res.status(404).json([]);
    }

    // 分页返回user中的mail_sessions
    const sessions = await Session.find({
      _id: { $in: user.mail_sessions },
      banned: false, // 确保会话未被封禁
    })
      .select(
        '_id latest_sender latest_receiver latest_message timestamp unread banned',
      )
      .populate({
        path: 'latest_sender',
        select: '_id username profile_photo gender',
      })
      .populate({
        path: 'latest_receiver',
        select: '_id username profile_photo gender',
      })
      .skip((pageNumber - 1) * pageSize) // 跳过前面的文档，实现分页
      .limit(pageSize) // 限制返回的文档数量
      .exec();

    res.status(200).json(sessions);
  } catch (error: any) {
    console.error('Error in getAllSessionsByUserId:', error);
    res.status(500).json({ error });
  }
};

// 创建新的聊天session
export const createSession = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { latest_sender, latest_receiver } = req.body;
    if (!latest_sender || !latest_receiver) {
      return res.status(400).json({
        error: 'latest sender user ID and latest receiver ID required',
      });
    }
    if (
      !mongoose.Types.ObjectId.isValid(latest_sender) &&
      !mongoose.Types.ObjectId.isValid(latest_receiver)
    ) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const decodedToken = req.headers.user as JwtPayload;

    // CreateSession的逻辑，是用户从liked_me数组中进行匹配，如果也喜欢了对方，则创建session。所以CreateSession的token验证只需要token.id === latest_sender。该用户就是latest_sender。
    if (decodedToken.id !== latest_sender) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const latest_sender_obj =
      mongoose.Types.ObjectId.createFromHexString(latest_sender);
    const latest_receiver_obj =
      mongoose.Types.ObjectId.createFromHexString(latest_receiver);

    // check userId of receive user if existed in session.contact_a or session.contact_b in my user.mail_sessions
    const user = await User.findById(latest_sender)
      .select('_id mail_sessions')
      .populate('mail_sessions')
      .session(session) // Ensure the session is passed to the query
      .exec();

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const foundSession = user.mail_sessions.find(
      (session: SessionModel['_id']) => {
        if (session.banned) {
          // if session.banned === true, then return session is banned
          return res.status(400).json({ error: 'session is banned' });
        }
        return (
          session.latest_sender.equals(latest_receiver_obj) ||
          session.latest_receiver.equals(latest_receiver_obj)
        );
      },
    );

    if (foundSession) {
      // Session already exists, no need to create a new one
      return res.status(200).json(foundSession);
    }

    // if session not found, create new session
    const validBody = await createSessionSchemaValidate.validateAsync({
      latest_sender,
      latest_receiver,
    });
    const newSession = await new Session(validBody).save({ session });

    // Update session.id to send user and receive user's user.mail_sessions
    await User.findByIdAndUpdate(
      latest_sender,
      {
        $push: { mail_sessions: { $each: [newSession._id], $position: 0 } },
      },
      { new: true, session },
    ).exec();

    await User.findByIdAndUpdate(
      latest_receiver,
      {
        $push: { mail_sessions: { $each: [newSession._id], $position: 0 } },
      },
      { new: true, session },
    ).exec();

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(newSession);
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error in createSession:', error);
    res.status(500).json({ error });
  }
};

// 根据sessionId更新session status
export const updateSessionStatusById = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'session ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'user ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const decodedToken = req.headers.user as JwtPayload;

    if (decodedToken.id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const validBody = await updateSessionSchemaValidate.validateAsync(
      req.body,
      {
        allowUnknown: true,
        stripUnknown: true,
      },
    );
    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      validBody,
      {
        new: true,
      },
    ).exec();
    res.status(200).json(updatedSession);
  } catch (error: any) {
    console.error('Error in updateSessionById:', error);
    res.status(500).json({ error });
  }
};

