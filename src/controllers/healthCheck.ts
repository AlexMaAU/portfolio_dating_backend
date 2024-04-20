import express from 'express';

const healthCheckRouter = express.Router();

healthCheckRouter.get('/', (req, res) => {
  const decodedToken = req.headers.user;
  console.log(decodedToken);

  res.send('healthCheckRouter is working');
});

export default healthCheckRouter;

