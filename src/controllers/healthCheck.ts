import express from 'express';
const healthCheckRouter = express.Router();

healthCheckRouter.get('/', (req, res) => {
  res.send('healthCheckRouter is working');
});

export default healthCheckRouter;
