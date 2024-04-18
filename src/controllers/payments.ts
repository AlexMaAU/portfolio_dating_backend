import { Request, Response } from 'express';
import Payment from '../models/paymentModel';
import { pageSize } from '../constants/settings';
import mongoose from 'mongoose';
import { newPaymentSchemaValidate } from '../validations/paymentValidate';

// 查看所有的支付记录
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const { page } = req.query; // 获取请求中的页码参数
    const pageNumber = parseInt(page as string) || 1; // 将页码转换为数字，默认为第一页

    const totalCount = await Payment.countDocuments(); // 获取用户总数，用于计算总页数
    const totalPages = Math.ceil(totalCount / pageSize);

    // 如果请求的页码超出了实际存在的页数，返回一个空数组
    if (pageNumber < 1 || pageNumber > totalPages) {
      return res.status(404).json([]);
    }

    const payments = await Payment.find()
      .sort({ payment_date: -1 }) // 按付款日期从新到旧排序
      .skip((pageNumber - 1) * pageSize) // 跳过前面的文档，实现分页
      .limit(pageSize) // 限制返回的文档数量
      .exec();

    res.status(200).json(payments);
  } catch (error: any) {
    console.error('Error in getAllPayments:', error);
    res.status(500).json({ error });
  }
};

// 查看某个支付记录
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    if (!paymentId) {
      return res.status(400).json({ error: 'payment ID required' });
    }
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }

    const payment = await Payment.findById(paymentId).exec();
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (error: any) {
    console.error('Error in getPaymentById:', error);
    res.status(500).json({ error });
  }
};

// 创建新的支付记录
export const createPayment = async (req: Request, res: Response) => {
  try {
    const validBody = await newPaymentSchemaValidate.validateAsync(req.body, {
      allowUnknown: true,
      stripUnknown: true,
    });

    const newPayment = await new Payment(validBody).save();

    res.status(201).json(newPayment);
  } catch (error: any) {
    console.error('Error in createPayment:', error);
    res.status(500).json({ error });
  }
};

