import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION;

const connectToDB = async () => {
  if (!DB_CONNECTION) {
    console.log('CONNECTION_STRING is empty');
    process.exit(1);
  }
  mongoose.connect(DB_CONNECTION);
  mongoose.connection.on('connected', async () => {
    console.log('MongoDB connected');
    try {
      // 创建 register_date 字段的降序索引
      await mongoose.connection.db
        .collection('users')
        .createIndex({ register_date: -1 });

      // 创建 payment_date 字段的降序索引
      await mongoose.connection.db
        .collection('payments')
        .createIndex({ payment_date: -1 });

      // 创建 country 字段的索引
      await mongoose.connection.db
        .collection('users')
        .createIndex({ country: 1 });

      // 创建 city 字段的索引
      await mongoose.connection.db.collection('users').createIndex({ city: 1 });

      // 创建 age 字段的索引
      await mongoose.connection.db.collection('users').createIndex({ age: 1 });

      // 创建 height 字段的索引
      await mongoose.connection.db
        .collection('users')
        .createIndex({ height: 1 });

      // 创建 gender 字段的索引
      await mongoose.connection.db
        .collection('users')
        .createIndex({ gender: 1 });

      // 创建 income 字段的索引
      await mongoose.connection.db
        .collection('users')
        .createIndex({ income: 1 });

      // 创建 visa_type 字段的索引
      await mongoose.connection.db
        .collection('users')
        .createIndex({ visa_type: 1 });

      // 创建 serious_dating 字段的索引
      await mongoose.connection.db
        .collection('users')
        .createIndex({ serious_dating: 1 });

      // 创建 username 字段的索引
      await mongoose.connection.db
        .collection('users')
        .createIndex({ username: 1 });

      // 创建 mail_sessions 字段的索引
      await mongoose.connection.db
        .collection('users')
        .createIndex({ mail_sessions: 1 });

      // 创建 email 字段的索引
      await mongoose.connection.db
        .collection('users')
        .createIndex({ email: 1 });

      // 创建 all_messages 字段的索引
      await mongoose.connection.db
        .collection('sessions')
        .createIndex({ all_messages: 1 });

      console.log('Index created successfully');
    } catch (error) {
      console.error('Error creating index:', error);
    }
  });
  mongoose.connection.on('error', () => {
    console.log('MongoDB connect error');
    process.exit(2);
  });
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    process.exit(3);
  });
};

export default connectToDB;

