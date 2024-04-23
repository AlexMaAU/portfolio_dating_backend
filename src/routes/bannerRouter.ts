import express from 'express';
import { createBanner, getActiveBannersOfCity } from '../controllers/banners';

const bannerRouter = express.Router();

// 用户创建广告
bannerRouter.post('/', createBanner);

// 获取未过期的同城广告
bannerRouter.get('/', getActiveBannersOfCity);

export default bannerRouter;
