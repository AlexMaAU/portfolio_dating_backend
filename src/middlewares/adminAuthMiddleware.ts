import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../utils/jwt';

const adminAuthGuard = (req: any, res: Response, next: NextFunction) => {
  const authorization = req.header('Authorization');

  if (!authorization) {
    return res.status(401).send('Unauthorized');
  }

  const tokenArray = authorization.split(' ');

  if (tokenArray.length !== 2 || tokenArray[0] !== 'Bearer') {
    console.error('Invalid authorization header format');
    return res.sendStatus(401);
  }

  const decodedToken = validateToken(tokenArray[1]);

  if (decodedToken && decodedToken.role === 'admin') {
    req.headers.user = decodedToken;
    next();
  } else {
    return res.status(401).send('Unauthorized'); // 如果身份验证失败，则直接返回未经授权的状态码
  }
};

export default adminAuthGuard;
