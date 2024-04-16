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
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
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

