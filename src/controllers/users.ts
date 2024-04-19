import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/userModel';
import {
  newUserSchemaValidate,
  updateUserSchemaValidate,
} from '../validations/userValidate';
import { generateToken } from '../utils/jwt';
import { pageSize } from '../constants/settings';
import mongoose from 'mongoose';

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
    const safeNewUser = {
      _id: newUser._id,
      active: newUser.active,
      is_vip: newUser.is_vip,
      email: newUser.email,
      username: newUser.username,
      country: newUser.country,
      city: newUser.city,
      visa_type: newUser.visa_type,
      profile_photo: newUser.profile_photo,
      gallery_photos: newUser.gallery_photos,
      gender: newUser.gender,
      seek_gender: newUser.seek_gender,
      birthday: newUser.birthday,
      age: newUser.age,
      height: newUser.height,
      body_type: newUser.body_type,
      income: newUser.income,
      education: newUser.education,
      school_name: newUser.school_name,
      industry: newUser.industry,
      hobbies: newUser.hobbies,
      self_introduction: newUser.self_introduction,
      looking_for: newUser.looking_for,
      serious_dating: newUser.serious_dating,
      recommend_limit: newUser.recommend_limit,
      liked: newUser.liked,
      liked_me: newUser.liked_me,
      matches: newUser.matches,
      mail_sessions: newUser.mail_sessions,
      last_login: newUser.last_login,
      profile_completed: newUser.profile_completed,
    };
    const token = generateToken({
      id: newUser._id,
      email: newUser.email,
      role: 'user',
    });
    res.status(201).json({ safeNewUser, token });
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

    // 更新最后登录时间
    user.last_login = new Date();
    await user.save();

    const safeUser = {
      _id: user._id,
      active: user.active,
      is_vip: user.is_vip,
      email: user.email,
      username: user.username,
      country: user.country,
      city: user.city,
      visa_type: user.visa_type,
      profile_photo: user.profile_photo,
      gallery_photos: user.gallery_photos,
      gender: user.gender,
      seek_gender: user.seek_gender,
      birthday: user.birthday,
      age: user.age,
      height: user.height,
      body_type: user.body_type,
      income: user.income,
      education: user.education,
      school_name: user.school_name,
      industry: user.industry,
      hobbies: user.hobbies,
      self_introduction: user.self_introduction,
      looking_for: user.looking_for,
      serious_dating: user.serious_dating,
      recommend_limit: user.recommend_limit,
      liked: user.liked,
      liked_me: user.liked_me,
      matches: user.matches,
      mail_sessions: user.mail_sessions,
      last_login: user.last_login,
      profile_completed: user.profile_completed,
    };

    res.status(200).json({ safeUser, token });
  } catch (error: any) {
    console.error('Error in userLogin:', error);
    res.status(400).json({ error });
  }
};

export const updateUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'user ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const validBody = await updateUserSchemaValidate.validateAsync(req.body, {
      allowUnknown: true,
      stripUnknown: true,
    });

    // 如果请求中包含密码，对密码进行哈希处理
    const { password } = validBody;
    if (validBody.password) {
      validBody.password = await bcrypt.hash(password, 10);
    }

    // 根据生日计算年龄
    const { birthday } = validBody;
    const birthdayDate = new Date(birthday);
    const currentDate = new Date();
    const age = currentDate.getFullYear() - birthdayDate.getFullYear();
    validBody.age = age;

    // 如果用户完善了基本信息，则profile_completed设为true
    if (
      validBody.username &&
      validBody.city &&
      validBody.visa_type &&
      validBody.profile_photo &&
      validBody.gender &&
      validBody.seek_gender &&
      validBody.birthday &&
      validBody.height &&
      validBody.body_type &&
      validBody.income &&
      validBody.industry
    ) {
      validBody.profile_completed = true;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, validBody, {
      new: true,
    })
      .select(
        '_id active is_vip email country username city visa_type profile_photo gallery_photos gender seek_gender birthday age height body_type income education school_name industry hobbies self_introduction looking_for serious_dating recommend_limit last_login profile_completed',
      )
      .exec();

    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error('Error in updateUserById:', error);
    res.status(400).json({ error });
  }
};

// get all users with pagination
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page } = req.query; // 获取请求中的页码参数
    const { username } = req.body;
    const pageNumber = parseInt(page as string) || 1; // 将页码转换为数字，默认为第一页

    const totalCount = await User.countDocuments(); // 获取用户总数，用于计算总页数
    const totalPages = Math.ceil(totalCount / pageSize);

    // 如果请求的页码超出了实际存在的页数，返回一个空数组
    if (pageNumber < 1 || pageNumber > totalPages) {
      return res.status(404).json([]);
    }

    let queryConditions: any = {};
    if (username) {
      queryConditions.username = { $regex: username, $options: 'i' };
    }

    const users = await User.find(queryConditions)
      .select(
        '_id active is_vip email country username city profile_photo gender seek_gender recommend_limit last_login register_date profile_completed',
      )
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
      userId,
      country, // 默认值，从user中获得，不需要选择
      city,
      minAge,
      maxAge,
      gender, // 默认值，从user中获得，不需要选择
      seek_gender, // 默认值，从user中获得，不需要选择
      minHeight,
      maxHeight,
      body_type,
      income,
      visa_type,
      serious_dating,
    } = req.body;
    const pageNumber = parseInt(page as string) || 1; // 将页码转换为数字，默认为第一页

    const totalCount = await User.countDocuments(); // 获取用户总数，用于计算总页数
    const totalPages = Math.ceil(totalCount / pageSize);

    if (pageNumber < 1 || pageNumber > totalPages) {
      return res.status(404).json([]);
    }

    let queryConditions: any = {
      active: true,
      profile_completed: true,
      _id: { $ne: userId }, // 排除当前用户
    };
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
    if (body_type) {
      queryConditions.body_type = body_type;
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

    // 根据用户的性别和期望的匹配性别动态设置查询条件
    // 如果用户是男性
    if (gender && gender === 'male') {
      // 如果期望的匹配性别是女性
      if (seek_gender === 'female') {
        // 查询条件中设置用户性别为女性，期望匹配性别为男性
        queryConditions.gender = 'female';
        queryConditions.seek_gender = 'male';
      } else if (seek_gender === 'male') {
        // 如果期望的匹配性别是男性
        queryConditions.gender = 'male'; // 查询条件中设置用户性别为男性，期望匹配性别为男性
        queryConditions.seek_gender = 'male';
      }
    } else if (gender && gender === 'female') {
      // 如果用户是女性
      // 如果期望的匹配性别是男性
      if (seek_gender === 'male') {
        // 查询条件中设置用户性别为男性，期望匹配性别为女性
        queryConditions.gender = 'male';
        queryConditions.seek_gender = 'female';
      } else if (seek_gender === 'female') {
        // 如果期望的匹配性别是女性
        queryConditions.gender = 'female'; // 查询条件中设置用户性别为女性，期望匹配性别为女性
        queryConditions.seek_gender = 'female';
      }
    }

    const users = await User.find(queryConditions)
      .select(
        '_id active is_vip country username city visa_type profile_photo gender seek_gender age height body_type income education industry hobbies serious_dating last_login profile_completed',
      )
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
    const { userId, country, city, gender, seek_gender } = req.body;

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

    // 如果用户不是VIP并且推荐次数已经用完，返回错误
    if (!user.is_vip && user.recommend_limit <= 0) {
      return res.status(403).json({ error: 'Recommend limit reached' });
    }

    // 更新 recommend_limit, 随机筛选用户次数减一
    user.recommend_limit -= 1;
    await user.save();

    let queryConditions: any = {
      active: true,
      profile_completed: true,
      _id: { $ne: userId }, // 排除当前用户
    };
    if (country) {
      queryConditions.country = country;
    }
    if (city) {
      queryConditions.city = city;
    }

    // 根据用户的性别和期望的匹配性别动态设置查询条件
    // 如果用户是男性
    if (gender && gender === 'male') {
      // 如果期望的匹配性别是女性
      if (seek_gender === 'female') {
        // 查询条件中设置用户性别为女性，期望匹配性别为男性
        queryConditions.gender = 'female';
        queryConditions.seek_gender = 'male';
      } else if (seek_gender === 'male') {
        // 如果期望的匹配性别是男性
        queryConditions.gender = 'male'; // 查询条件中设置用户性别为男性，期望匹配性别为男性
        queryConditions.seek_gender = 'male';
      }
    } else if (gender && gender === 'female') {
      // 如果用户是女性
      // 如果期望的匹配性别是男性
      if (seek_gender === 'male') {
        // 查询条件中设置用户性别为男性，期望匹配性别为女性
        queryConditions.gender = 'male';
        queryConditions.seek_gender = 'female';
      } else if (seek_gender === 'female') {
        // 如果期望的匹配性别是女性
        queryConditions.gender = 'female'; // 查询条件中设置用户性别为女性，期望匹配性别为女性
        queryConditions.seek_gender = 'female';
      }
    }

    const users = await User.find(queryConditions)
      .select(
        '_id active is_vip email country username city visa_type profile_photo gallery_photos gender seek_gender birthday age height body_type income education school_name industry hobbies self_introduction looking_for serious_dating recommend_limit liked liked_me matches mail_sessions last_login profile_completed',
      )
      .exec();

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
      return res.status(400).json({ error: 'user ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(userId)
      .select(
        '_id active is_vip email country username city visa_type profile_photo gallery_photos gender seek_gender birthday age height body_type income education school_name industry hobbies self_introduction looking_for serious_dating recommend_limit liked liked_me matches mail_sessions last_login profile_completed',
      )
      .exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error: any) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// get active user by id
export const getActiveUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'user ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findOne({
      _id: userId,
      active: true,
      profile_completed: true,
    })
      .select(
        '_id active is_vip email country username city visa_type profile_photo gallery_photos gender seek_gender birthday age height body_type income education school_name industry hobbies self_introduction looking_for serious_dating recommend_limit liked liked_me matches mail_sessions last_login profile_completed',
      )
      .exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error: any) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

