import express from 'express';
import dotenv from 'dotenv';
import connectToDB from './utils/db';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import indexRouter from './routes/indexRouter';
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 100, // Limit each IP to 100 requests per `window` (here, per minute).
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});
app.use(cors());
app.use(
  helmet({
    // add security policy in helmet to allow graphQL server
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production' ? undefined : false,
  }),
);
app.use(limiter);
app.use(express.json());
app.use('/v1', indexRouter);

// MONGODB
connectToDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server running at http:127.0.0.1:${PORT}`);
  });
});

