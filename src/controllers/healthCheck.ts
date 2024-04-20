import express from 'express';
import { JwtPayload } from 'jsonwebtoken';

const healthCheckRouter = express.Router();

healthCheckRouter.get('/', (req, res) => {
  const decodedToken = req.headers.user as JwtPayload;
  console.log(decodedToken.id);

  res.send('healthCheckRouter is working');
});

export default healthCheckRouter;

