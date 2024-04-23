import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';
import {
  newAdminSchemaValidate,
  updateAdminSchemaValidate,
} from '../validations/adminValidate';
import Admin from '../models/adminModel';
import mongoose from 'mongoose';
import User from '../models/userModel';

export const adminSignup = async (req: Request, res: Response) => {
  try {
    const validBody = await newAdminSchemaValidate.validateAsync(req.body, {
      allowUnknown: true,
      stripUnknown: true,
    });
    const { email, password } = validBody;
    const existingAdmin = await Admin.findOne({ email }).exec();
    if (existingAdmin) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    validBody.password = await bcrypt.hash(password, 10);
    const newAdmin = await new Admin(validBody).save();
    const token = generateToken({
      id: newAdmin._id,
      email: newAdmin.email,
      role: 'admin',
    });

    res.status(201).json({ newAdmin, token });
  } catch (error: any) {
    console.error('Error in adminSignup:', error);
    res.status(400).json({ error });
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const validBody = await newAdminSchemaValidate.validateAsync(req.body, {
      allowUnknown: true,
      stripUnknown: true,
    });
    const { email, password } = validBody;
    const admin = await Admin.findOne({ email: email, active: true })
      .select('+password')
      .exec();
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const token = generateToken({
      id: admin._id,
      email: admin.email,
      role: 'admin',
    });

    res.status(200).json({ admin, token });
  } catch (error: any) {
    console.error('Error in adminLogin:', error);
    res.status(400).json({ error });
  }
};

export const updateAdminById = async (req: Request, res: Response) => {
  try {
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

    const validBody = await updateAdminSchemaValidate.validateAsync(req.body, {
      allowUnknown: true,
      stripUnknown: true,
    });

    // 如果请求中包含密码，对密码进行哈希处理
    const { password } = validBody;
    if (validBody.password) {
      validBody.password = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { $set: validBody },
      {
        new: true,
      },
    ).exec();

    res.status(200).json(updatedAdmin);
  } catch (error: any) {
    console.error('Error in updateAdminById:', error);
    res.status(400).json({ error });
  }
};

// 给所有用户的recommend_limit字段增加addLimit
export const addRecommendLimitToAllUsers = async (
  req: Request,
  res: Response,
) => {
  try {
    const { adminId } = req.params;
    const { addLimit } = req.body;
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

    if (!addLimit) {
      return res.status(400).json({ error: 'addLimit required' });
    }

    const addLimitNumber = Number(addLimit);
    if (isNaN(addLimitNumber)) {
      return res.status(400).json({ error: 'Invalid addLimit value' });
    }

    // 给所有用户的recommend_limit字段增加addLimit
    await User.updateMany({}, { $inc: { recommend_limit: addLimitNumber } });

    res
      .status(200)
      .json({ message: 'Recommend limit updated successfully for all users' });
  } catch (error: any) {
    console.error('Error in addRecommendLimitToAllUsers:', error);
    res.status(400).json({ error });
  }
};
