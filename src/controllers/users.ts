import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/userModel';
import {
  newUserSchemaValidate,
  updateUserPasswordSchemaValidate,
  updateUserSchemaValidate,
  updateUserStatusSchemaValidate,
} from '../validations/userValidate';
import { generateToken } from '../utils/jwt';
import { pageSize } from '../constants/settings';

export const userSignup = async (req: Request, res: Response) => {
  try {
    const validBody = await newUserSchemaValidate.validateAsync(req.body, {
      allowUnknown: true,
      stripUnknown: true,
    });
    const { email, password } = validBody;
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    validBody.password = await bcrypt.hash(password, 10);
    const newUser = await new User(validBody).save();
    const token = generateToken({
      id: newUser._id,
      email: newUser.email,
      role: 'user',
    });
    res.status(201).json({ newUser, token });
  } catch (error: any) {
    console.error('Error in userSignup:', error);
    res.status(400).json({ error });
  }
};

export const userLogin = async (req: Request, res: Response) => {
  try {
    const validBody = await newUserSchemaValidate.validateAsync(req.body, {
      allowUnknown: true,
      stripUnknown: true,
    });
    const { email, password } = validBody;
    const user = await User.findOne({ email: email, active: true })
      .select('+password')
      .exec();
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: 'user',
    });

    // 如果距离上次登录24小时，则自动更新用户的recommend_limit记录到15，然后更新用户的最后登录时间到最新记录
    if (user.last_login) {
      const lastLogin = new Date(user.last_login); // 将用户最后登录时间解析为日期对象
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      if (lastLogin < twentyFourHoursAgo) {
        user.recommend_limit = 15; // 更新 recommend_limit
      }
    }

    // 更新最后登录时间
    user.last_login = new Date().toISOString();
    await user.save();

    res.status(200).json({ user, token });
  } catch (error: any) {
    console.error('Error in userLogin:', error);
    res.status(400).json({ error });
  }
};

export const updateUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const validBody = await updateUserSchemaValidate.validateAsync(req.body, {
      allowUnknown: true,
      stripUnknown: true,
    });

    // 根据生日计算年龄
    const { birthday } = validBody;
    const birthdayDate = new Date(birthday);
    const currentDate = new Date();
    const age = currentDate.getFullYear() - birthdayDate.getFullYear();
    validBody.age = age;

    const updatedUser = await User.findByIdAndUpdate(userId, validBody, {
      new: true,
    }).exec();
    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error('Error in updateUserById:', error);
    res.status(400).json({ error });
  }
};

export const updateUserPasswordById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const validBody = await updateUserPasswordSchemaValidate.validateAsync(
      req.body,
      {
        allowUnknown: true,
        stripUnknown: true,
      },
    );
    const { password } = validBody;
    if (password) {
      validBody.password = await bcrypt.hash(password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(userId, validBody, {
      new: true,
    }).exec();
    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error('Error in updateUserPasswordById:', error);
    res.status(400).json({ error });
  }
};

export const updateUserStatusById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const validBody = await updateUserStatusSchemaValidate.validateAsync(
      req.body,
      {
        allowUnknown: true,
        stripUnknown: true,
      },
    );
    const updatedUser = await User.findByIdAndUpdate(userId, validBody, {
      new: true,
    }).exec();
    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error('Error in updateUserStatusById:', error);
    res.status(400).json({ error });
  }
};

// get all users with pagination
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page, username } = req.query; // 获取请求中的页码参数
    const pageNumber = parseInt(page as string) || 1; // 将页码转换为数字，默认为第一页

    const totalCount = await User.countDocuments(); // 获取用户总数，用于计算总页数
    const totalPages = Math.ceil(totalCount / pageSize);

    if (pageNumber < 1 || pageNumber > totalPages) {
      return res.status(400).json({ error: 'Invalid page number' });
    }

    let queryConditions: any = {};
    if (username) {
      queryConditions.username = { $regex: username, $options: 'i' };
    }

    const users = await User.find(queryConditions)
      .sort({ register_date: -1 }) // 按注册日期从新到旧排序
      .skip((pageNumber - 1) * pageSize) // 跳过前面的文档，实现分页
      .limit(pageSize) // 限制返回的文档数量
      .exec();
    res.status(200).json(users);
  } catch (error: any) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// get all active users by country, city, keyword with pagination
// filter by country, city, gender, age, height, income, visa_type, serious_dating
export const getFilteredUsers = async (req: Request, res: Response) => {
  try {
    const { page } = req.query; // 获取请求中的页码参数
    const {
      country,
      city,
      minAge,
      maxAge,
      gender,
      minHeight,
      maxHeight,
      income,
      visa_type,
      serious_dating,
    } = req.body;
    const pageNumber = parseInt(page as string) || 1; // 将页码转换为数字，默认为第一页

    const totalCount = await User.countDocuments(); // 获取用户总数，用于计算总页数
    const totalPages = Math.ceil(totalCount / pageSize);

    if (pageNumber < 1 || pageNumber > totalPages) {
      return res.status(400).json({ error: 'Invalid page number' });
    }

    let queryConditions: any = { active: true };
    if (country) {
      queryConditions.country = country;
    }
    if (city) {
      queryConditions.city = city;
    }
    if (minAge && maxAge) {
      queryConditions.age = { $gte: minAge, $lte: maxAge };
    }
    if (gender) {
      queryConditions.gender = gender;
    }
    if (minHeight && maxHeight) {
      queryConditions.height = { $gte: minHeight, $lte: maxHeight };
    }
    if (income && income.length > 0) {
      queryConditions.income = { $in: income };
    }
    if (visa_type && visa_type.length > 0) {
      queryConditions.visa_type = { $in: visa_type };
    }
    if (serious_dating) {
      queryConditions.serious_dating = serious_dating;
    }

    const users = await User.find(queryConditions)
      .sort({ register_date: -1 }) // 按注册日期从新到旧排序
      .skip((pageNumber - 1) * pageSize) // 跳过前面的文档，实现分页
      .limit(pageSize) // 限制返回的文档数量
      .exec();
    res.status(200).json(users);
  } catch (error: any) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// get random active user by country and city
export const getRandomUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const user = await User.findById(userId).exec();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 如果用户不是VIP并且推荐次数已经用完，返回错误
    if (!user.is_vip && user.recommend_limit <= 0) {
      return res.status(403).json({ error: 'Recommend limit reached' });
    }

    // 更新 recommend_limit, 随机筛选用户次数减一
    user.recommend_limit -= 1;
    await user.save();

    const { country, city } = req.body;
    let queryConditions: any = { active: true };
    if (country) {
      queryConditions.country = country;
    }
    if (city) {
      queryConditions.city = city;
    }
    const users = await User.find(queryConditions).exec();

    // 如果没有找到用户，返回空数组
    if (users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    // 生成随机索引
    const randomIndex = Math.floor(Math.random() * users.length);

    // 返回随机选择的用户
    res.status(200).json(users[randomIndex]);
  } catch (error: any) {
    console.error('Error in getRandomUser:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// get selected user by id
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error: any) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

