import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
import {
  newBannerSchemaValidate,
  updateBannerSchemaValidate,
} from '../validations/bannerValidate';
import Banner from '../models/bannerModel';
import { pageSize } from '../constants/settings';

// 用户创建广告
export const createBanner = async (req: Request, res: Response) => {
  try {
    const validBody = await newBannerSchemaValidate.validateAsync(req.body, {
      allowUnknown: true,
      stripUnknown: true,
    });

    const { user } = validBody;

    if (!user) {
      return res.status(400).json({ error: 'user ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const decodedToken = req.headers.user as JwtPayload;

    if (decodedToken.id !== user) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const newBanner = await new Banner(validBody).save();

    res.status(201).json(newBanner);
  } catch (error: any) {
    console.error('Error in createBanner:', error);
    res.status(400).json({ error });
  }
};

// 获取未过期的同城广告
export const getActiveBannersOfCity = async (req: Request, res: Response) => {};

// 获取所有广告 - admin
export const getAllBanners = async (req: Request, res: Response) => {
  try {
    const { adminId } = req.params;
    const { page } = req.query; // 获取请求中的页码参数
    const {
      country, // 默认值，从user中获得，不需要选择
      city,
    } = req.body;

    if (!adminId) {
      return res.status(400).json({ error: 'user ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ error: 'Invalid admin ID' });
    }

    const decodedToken = req.headers.user as JwtPayload;

    if (decodedToken.id !== adminId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const pageNumber = parseInt(page as string) || 1; // 将页码转换为数字，默认为第一页

    const totalCount = await Banner.countDocuments(); // 获取用户总数，用于计算总页数
    const totalPages = Math.ceil(totalCount / pageSize);

    // 如果请求的页码超出了实际存在的页数，返回一个空数组
    if (pageNumber < 1 || pageNumber > totalPages) {
      return res.status(404).json([]);
    }

    let queryConditions: any = {};
    if (country) {
      queryConditions.country = country;
    }
    if (city) {
      queryConditions.city = city;
    }

    const banners = await Banner.find(queryConditions)
      .populate('user', 'username email') // 填充 user 字段，只返回 username 和 email
      .sort({ payment_date: -1 }) // 按付款日期从新到旧排序
      .skip((pageNumber - 1) * pageSize) // 跳过前面的文档，实现分页
      .limit(pageSize) // 限制返回的文档数量
      .exec();

    res.status(200).json(banners);
  } catch (error: any) {
    console.error('Error in getAllBanners:', error);
    res.status(400).json({ error });
  }
};

// 获取指定 ID 的广告 - admin
export const getBannerById = async (req: Request, res: Response) => {
  try {
    const { bannerId, adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({ error: 'user ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ error: 'Invalid admin ID' });
    }

    const decodedToken = req.headers.user as JwtPayload;

    if (decodedToken.id !== adminId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!bannerId) {
      return res.status(400).json({ error: 'banner ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(bannerId)) {
      return res.status(400).json({ error: 'Invalid banner ID' });
    }

    const banner = await Banner.findById(bannerId)
      .populate('user', 'username email') // 填充 user 字段，只返回 username 和 email
      .exec();

    res.status(200).json(banner);
  } catch (error: any) {
    console.error('Error in getBannerById:', error);
    res.status(400).json({ error });
  }
};

// 更新指定 ID 的广告 - admin
export const updateBannerById = async (req: Request, res: Response) => {
  try {
    const { bannerId, adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({ error: 'user ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ error: 'Invalid admin ID' });
    }

    const decodedToken = req.headers.user as JwtPayload;

    if (decodedToken.id !== adminId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!bannerId) {
      return res.status(400).json({ error: 'banner ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(bannerId)) {
      return res.status(400).json({ error: 'Invalid banner ID' });
    }

    const validBody = await updateBannerSchemaValidate.validateAsync(req.body, {
      allowUnknown: true,
      stripUnknown: true,
    });

    const updatedBanner = await Banner.findByIdAndUpdate(
      bannerId,
      { $set: validBody },
      {
        new: true,
      },
    ).exec();

    res.status(200).json(updatedBanner);
  } catch (error: any) {
    console.error('Error in updateBannerById:', error);
    res.status(400).json({ error });
  }
};

