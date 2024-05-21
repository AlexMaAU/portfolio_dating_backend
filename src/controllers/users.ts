import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { JwtPayload } from 'jsonwebtoken';
import User from '../models/userModel';
import {
  newUserSchemaValidate,
  updateUserPasswordSchemaValidate,
  updateUserSchemaValidate,
} from '../validations/userValidate';
import { generateToken } from '../utils/jwt';
import { pageSize } from '../constants/settings';
import mongoose, { startSession } from 'mongoose';

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
      take_rest: newUser.take_rest,
      email: newUser.email,
      username: newUser.username,
      country: newUser.country,
      city: newUser.city,
      profile_photo: newUser.profile_photo,
      gallery_photos: newUser.gallery_photos,
      gender: newUser.gender,
      seek_gender: newUser.seek_gender,
      birthday: newUser.birthday,
      age: newUser.age,
      height: newUser.height,
      hasProperty: newUser.hasProperty,
      hasCar: newUser.hasCar,
      education: newUser.education,
      job_title: newUser.job_title,
      hobbies: newUser.hobbies,
      self_introduction: newUser.self_introduction,
      looking_for: newUser.looking_for,
      serious_dating: newUser.serious_dating,
      prefer_dating_type: newUser.prefer_dating_type,
      recommend_limit: newUser.recommend_limit,
      last_update_time: newUser.last_update_time,
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

    user.last_login = new Date();
    await user.save();

    const safeUser = {
      _id: user._id,
      active: user.active,
      take_rest: user.take_rest,
      email: user.email,
      username: user.username,
      country: user.country,
      city: user.city,
      profile_photo: user.profile_photo,
      gallery_photos: user.gallery_photos,
      gender: user.gender,
      seek_gender: user.seek_gender,
      birthday: user.birthday,
      age: user.age,
      height: user.height,
      hasProperty: user.hasProperty,
      hasCar: user.hasCar,
      education: user.education,
      job_title: user.job_title,
      hobbies: user.hobbies,
      self_introduction: user.self_introduction,
      looking_for: user.looking_for,
      serious_dating: user.serious_dating,
      prefer_dating_type: user.prefer_dating_type,
      recommend_limit: user.recommend_limit,
      last_update_time: user.last_update_time,
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

    const decodedToken = req.headers.user as JwtPayload;

    if (decodedToken.id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const validBody = await updateUserSchemaValidate.validateAsync(req.body, {
      allowUnknown: true,
      stripUnknown: true,
    });

    // calculate age based on birthday
    const { birthday } = validBody;
    const birthdayDate = new Date(birthday);
    const currentDate = new Date();
    const age = currentDate.getFullYear() - birthdayDate.getFullYear();
    validBody.age = age;

    // If user fills all required info，set profile_completed as true
    if (
      validBody.username &&
      validBody.country &&
      validBody.city &&
      validBody.profile_photo &&
      validBody.gender &&
      validBody.seek_gender &&
      validBody.birthday &&
      validBody.height &&
      validBody.job_title &&
      validBody.prefer_dating_type
    ) {
      validBody.profile_completed = true;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: validBody },
      {
        new: true,
      },
    )
      .select(
        '_id active take_rest email country username city profile_photo gallery_photos gender seek_gender birthday age height hasProperty hasCar education job_title hobbies self_introduction looking_for serious_dating prefer_dating_type recommend_limit last_update_time last_login profile_completed',
      )
      .exec();

    if (!updatedUser) {
      return res.status(403).json({ error: 'Update failed' });
    }

    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error('Error in updateUserById:', error);
    res.status(400).json({ error });
  }
};

// update password by user id
export const updateUserPassword = async (req: Request, res: Response) => {
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

    const validBody = await updateUserPasswordSchemaValidate.validateAsync(
      req.body,
      {
        allowUnknown: true,
        stripUnknown: true,
      },
    );

    const { old_password, new_password } = validBody;

    const user = await User.findById(userId).select('+password').exec();

    // check if user input old password is correct
    if (!user || !(await bcrypt.compare(old_password, user.password))) {
      return res.status(400).json({ error: 'incorrect old password' });
    }

    // update password
    if (new_password) {
      user.password = await bcrypt.hash(new_password, 10);
    }

    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Error in updateUserPassword:', error);
    res.status(400).json({ error });
  }
};

// get all users with pagination
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { adminId } = req.params;
    const { page } = req.query; // request page number
    const { username } = req.body;

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

    const pageNumber = parseInt(page as string) || 1;

    const totalCount = await User.countDocuments();
    const totalPages = Math.ceil(totalCount / pageSize);

    // if request page number exceeds total page number, returns empty array
    if (pageNumber < 1 || pageNumber > totalPages) {
      return res.status(404).json([]);
    }

    let queryConditions: any = {};
    if (username) {
      queryConditions.username = { $regex: username, $options: 'i' };
    }

    const users = await User.find(queryConditions)
      .select(
        '_id active take_rest email country username city profile_photo gender seek_gender recommend_limit last_update_time last_login register_date profile_completed',
      )
      .sort({ register_date: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    res.status(200).json({ users, totalCount, totalPages });
  } catch (error: any) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// get all active users by country, city, keyword with pagination
// filter by country, city, gender, age, height, income, hasProperty, hasCar, visa_type, serious_dating
export const getFilteredUsers = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page } = req.query;
    const {
      country, // default value, determined by user IP when register
      city, // default value, set by user profile
      minAge,
      maxAge,
      gender, // default value, set by user profile
      seek_gender, // default value, set by user profile
      minHeight,
      maxHeight,
      hasProperty,
      hasCar,
      serious_dating,
      prefer_dating_type,
    } = req.body;

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

    const pageNumber = parseInt(page as string) || 1;

    const totalCount = await User.countDocuments();
    const totalPages = Math.ceil(totalCount / pageSize);

    if (pageNumber < 1 || pageNumber > totalPages) {
      return res.status(404).json([]);
    }

    let queryConditions: any = {
      active: true,
      take_rest: false,
      profile_completed: true,
      _id: { $ne: userId },
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
    if (hasProperty) {
      queryConditions.hasProperty = hasProperty;
    }
    if (hasCar) {
      queryConditions.hasCar = hasCar;
    }
    if (serious_dating) {
      queryConditions.serious_dating = serious_dating;
    }
    if (prefer_dating_type) {
      queryConditions.prefer_dating_type = prefer_dating_type;
    }

    // match user based on their seeking gender reference
    if (gender && gender === 'male') {
      if (seek_gender === 'female') {
        queryConditions.gender = 'female';
        queryConditions.seek_gender = 'male';
      } else if (seek_gender === 'male') {
        queryConditions.gender = 'male';
        queryConditions.seek_gender = 'male';
      }
    } else if (gender && gender === 'female') {
      if (seek_gender === 'male') {
        queryConditions.gender = 'male';
        queryConditions.seek_gender = 'female';
      } else if (seek_gender === 'female') {
        queryConditions.gender = 'female';
        queryConditions.seek_gender = 'female';
      }
    }

    const users = await User.find(queryConditions)
      .select(
        '_id active take_rest country username city profile_photo gender seek_gender age height hasProperty hasCar education job_title hobbies serious_dating prefer_dating_type last_login profile_completed',
      )
      .sort({ register_date: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
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
    const { country, city, gender, seek_gender } = req.body;

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

    // check if there are 24 hours since last_update_time
    if (user.last_update_time) {
      const today = new Date();
      const timeDiff = today.getTime() - user.last_update_time.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);
      if (hoursDiff >= 24) {
        user.recommend_limit = 15;
        await user.save();
      }
    }

    // if reached daily recommend limit
    if (user.recommend_limit <= 0) {
      return res.status(403).json({ error: 'Daily Recommend limit reached' });
    }

    // reduce daily recommend limit by 1
    user.recommend_limit -= 1;
    await user.save();

    let queryConditions: any = {
      active: true,
      take_rest: false,
      profile_completed: true,
      _id: { $ne: userId },
    };
    if (country) {
      queryConditions.country = country;
    }
    if (city) {
      queryConditions.city = city;
    }
    if (user.age) {
      queryConditions.age = {
        $gte: user.age - 15,
        $lte: user.age + 15,
      };
    }

    // match user based on their seeking gender reference
    if (gender && gender === 'male') {
      if (seek_gender === 'female') {
        queryConditions.gender = 'female';
        queryConditions.seek_gender = 'male';
      } else if (seek_gender === 'male') {
        queryConditions.gender = 'male';
        queryConditions.seek_gender = 'male';
      }
    } else if (gender && gender === 'female') {
      if (seek_gender === 'male') {
        queryConditions.gender = 'male';
        queryConditions.seek_gender = 'female';
      } else if (seek_gender === 'female') {
        queryConditions.gender = 'female';
        queryConditions.seek_gender = 'female';
      }
    }

    const users = await User.find(queryConditions).select('_id').exec();

    // if no recommendation matched
    if (users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    let randomIndex;
    let selectedUser;
    let selectedUsers = [];
    let recommendTimes = 0;

    // loop until find 15 recommended users
    do {
      const recommendedUsers = user.recommended_users || [];
      randomIndex = Math.floor(Math.random() * users.length);
      selectedUser = users[randomIndex]._id;

      // check if selected user has been recommended before
      const alreadyRecommended = recommendedUsers.includes(selectedUser);

      if (!alreadyRecommended) {
        user.recommended_users = [...recommendedUsers, selectedUser];
        selectedUsers.push(selectedUser);
        await user.save();
        recommendTimes++;
      }
      // if all users haven been recommended, break out loop
      if (recommendedUsers.length === users.length) {
        break;
      }
    } while (selectedUsers.length < 15 && recommendTimes !== users.length);

    // if no recommendation available, won't reduce recommend limit
    if (selectedUsers.length === 0) {
      user.recommend_limit += 1;
      await user.save();
    }

    const selectedUserObjects = await User.find({
      _id: { $in: selectedUsers },
    })
      .select(
        '_id active take_rest email country username city profile_photo gallery_photos gender seek_gender birthday age height hasProperty hasCar education job_title hobbies self_introduction looking_for serious_dating prefer_dating_type recommend_limit liked liked_me matches mail_sessions last_login profile_completed',
      )
      .exec();

    res.status(200).json(selectedUserObjects);
  } catch (error: any) {
    console.error('Error in getRandomUser:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// get selected user by id
export const getUserById = async (req: Request, res: Response) => {
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

    const user = await User.findById(userId)
      .select(
        '_id active take_rest email country username city profile_photo gallery_photos gender seek_gender birthday age height hasProperty hasCar education job_title hobbies self_introduction looking_for serious_dating prefer_dating_type recommend_limit last_update_time liked liked_me matches mail_sessions last_login profile_completed',
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
      take_rest: false,
      profile_completed: true,
    })
      .select(
        '_id active take_rest email country username city profile_photo gallery_photos gender seek_gender birthday age height hasProperty hasCar education job_title hobbies self_introduction looking_for serious_dating prefer_dating_type recommend_limit last_update_time last_login profile_completed',
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

// get user self info by id
export const getActiveMyUser = async (req: Request, res: Response) => {
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

    const user = await User.findOne({
      _id: userId,
      active: true,
    })
      .select(
        '_id active take_rest email country username city profile_photo gallery_photos gender seek_gender birthday age height hasProperty hasCar education job_title hobbies self_introduction looking_for serious_dating prefer_dating_type recommend_limit last_update_time liked liked_me matches mail_sessions last_login profile_completed',
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

// get all liked me users
export const getLikedMeUsers = async (req: Request, res: Response) => {
  try {
    const { page } = req.query;
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

    const pageNumber = parseInt(page as string) || 1;

    const totalCount = user.liked_me.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    if (pageNumber < 1 || pageNumber > totalPages) {
      return res.status(404).json([]);
    }

    const likedMeUsers = await User.find({
      _id: { $in: user.liked_me },
      active: true,
      take_rest: false,
      profile_completed: true,
    })
      .select(
        '_id active take_rest country username city profile_photo gender age height serious_dating prefer_dating_type',
      )
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    res.status(200).json(likedMeUsers);
  } catch (error: any) {
    console.error('Error in getLikedMeUsers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// send like to user, add to liked list, if the other user is in liked_me list, add to matches list
export const sendLike = async (req: Request, res: Response) => {
  const session = await startSession();
  session.startTransaction();

  try {
    const { userId, myId } = req.params;

    if (!userId || !myId) {
      return res.status(400).json({ error: 'user ID required' });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(myId)
    ) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const myIdObject = mongoose.Types.ObjectId.createFromHexString(myId);
    const userIdObject = mongoose.Types.ObjectId.createFromHexString(userId);

    const decodedToken = req.headers.user as JwtPayload;

    if (decodedToken.id !== myId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const me = await User.findById(myId).session(session).exec();

    if (!me) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otherUser = await User.findById(userId).session(session).exec();

    if (!otherUser) {
      return res.status(404).json({ error: 'Other user not found' });
    }

    // 将对方用户添加到当前用户的喜欢列表中，如果对方不在当前用户的喜欢列表中
    if (!me.liked.includes(userIdObject)) {
      me.liked.unshift(userIdObject);
    }

    // 将当前用户添加到对方用户的喜欢我列表中，如果当前用户不在对方用户的喜欢我列表中
    if (!otherUser.liked_me.includes(myIdObject)) {
      otherUser.liked_me.unshift(myIdObject);
    }

    // 如果对方已经在当前用户的喜欢列表中，那么将两个用户添加到匹配列表中
    if (
      me.liked_me.includes(userIdObject) &&
      otherUser.liked_me.includes(myIdObject) &&
      !me.matches.includes(userIdObject) &&
      !otherUser.matches.includes(myIdObject)
    ) {
      // 更新当前用户的匹配列表
      me.matches.unshift(userIdObject);

      // 更新对方用户的匹配列表
      otherUser.matches.unshift(myIdObject);
    }

    await me.save();
    await otherUser.save();
    await session.commitTransaction();
    session.endSession();

    if (
      me.liked_me.includes(userIdObject) &&
      otherUser.liked_me.includes(myIdObject)
    ) {
      return res.status(200).json({
        message: 'user matched',
        sender: myIdObject,
        receiver: userIdObject,
      });
    } else {
      return res.status(200).json({ message: 'Like sent successfully' });
    }
  } catch (error: any) {
    console.error('Error in sendLike:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// get all matches by user id
export const getAllMatches = async (req: Request, res: Response) => {
  try {
    const { page } = req.query;
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

    const pageNumber = parseInt(page as string) || 1;

    const totalCount = user.matches.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    if (pageNumber < 1 || pageNumber > totalPages) {
      return res.status(404).json([]);
    }

    const matches = await User.find({
      _id: { $in: user.matches },
      active: true,
      take_rest: false,
      profile_completed: true,
    })
      .select(
        '_id active take_rest country username city profile_photo gender age height serious_dating prefer_dating_type',
      )
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    res.status(200).json(matches);
  } catch (error: any) {
    console.error('Error in getAllMatches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
