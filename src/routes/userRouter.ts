import express from 'express';
import userAuthGuard from '../middlewares/userAuthMiddleware';
import {
  getActiveMyUser,
  getActiveUserById,
  getAllMatches,
  getFilteredUsers,
  getLikedMeUsers,
  getRandomUser,
  sendLike,
  updateUserById,
  updateUserPassword,
  userLogin,
  userSignup,
} from '../controllers/users';

const userRouter = express.Router();

// 用户邮箱密码注册
userRouter.post('/signup', userSignup);

// 用户邮箱密码登录
// TODO: Google和Facebook快捷登录
userRouter.post('/login', userLogin);

userRouter.put('/:userId', userAuthGuard, updateUserById);

// TODO: 用户更新密码
userRouter.put('/:userId/password', userAuthGuard, updateUserPassword);

// 用户资料完善，未完善资料的用户不会显示到展示列表
// 用户随即推荐和全部匹配用户列表都按照用户性取向匹配，支持LG匹配。默认同国家同城市范围。
userRouter.get('/:userId/all-users', userAuthGuard, getFilteredUsers);

// 用户资料完善，未完善资料的用户不会显示到展示列表
// 非VIP用户200次随机推荐，次数用完后再次点击推荐，提示后跳转到VIP购买页
// VIP用户无限随机推荐
// 匹配用户列表可以进一步筛选。
// 用户随即推荐和全部匹配用户列表都按照用户性取向匹配，支持LG匹配。默认同国家同城市范围。
// 用户随机匹配，服务端会返回10个随机匹配用户，前端分别展示完后再从后端获取10个新的，减少服务器请求次数
userRouter.get('/:userId/recommend', userAuthGuard, getRandomUser);

// 根据用户ID获取用户信息
userRouter.get('/:userId', userAuthGuard, getActiveUserById);

// 获取当前登录用户信息
userRouter.get('/:userId/me', userAuthGuard, getActiveMyUser);

// 所有用户可以查看喜欢了我的用户。
userRouter.get('/:userId/liked-me', userAuthGuard, getLikedMeUsers);

// 用户发送喜欢，添加到liked列表，如果对方已经在liked_me列表，添加到matches列表
// 如果用户喜欢了我，我也点击喜欢用户，则匹配成功，创建session。
userRouter.post('/:myId/send-like/:userId', userAuthGuard, sendLike);

// 查看匹配成功的用户
userRouter.get('/:userId/matches', userAuthGuard, getAllMatches);

export default userRouter;

