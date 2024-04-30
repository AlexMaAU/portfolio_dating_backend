import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken';

const JWT_KEY = process.env.JWT_KEY || 'chinese_dating';

// 生成JWT令牌
export const generateToken = (payload: object) => {
  const token = jwt.sign(payload, JWT_KEY, { expiresIn: '30d' });
  return token;
};

// 验证JWT令牌
export const validateToken = (token: string) => {
  try {
    const decodedToken = jwt.verify(token, JWT_KEY) as JwtPayload;
    return decodedToken;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      console.log('Token has expired');
    } else {
      console.error('Token verification failed:', error);
    }
  }
};

