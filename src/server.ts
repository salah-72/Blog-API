import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import config from '@/Config';
import { logger } from '@/lib/winston';
import type { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import userRoute from '@/routes/userRoute';
import authRouter from '@/routes/authRouter';
import blogRouter from '@/routes/blogRouter';
import globalErrorHandler from './lib/globalErrorHandler';
const app = express();

mongoose
  .connect(config.DB_PASSWORD as string)
  .then(() => {
    logger.info('good connection to DB');
  })
  .catch((err) => {
    logger.error('failed to connect DB', err);
  });

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === 'development' ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(
        new Error(`CORS error: ${origin} is not allowed by CORS`),
        false,
      );
      logger.warn(`CORS error: ${origin} is not allowed by CORS`);
    }
  },
};

const limiter = rateLimit({
  windowMs: 60000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'too many requests from same ip, try again later',
  },
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression({ threshold: 1024 }));
app.use(helmet());
app.use(limiter);

(async () => {
  try {
    app.get('/api/v1', (req, res) => {
      res.status(200).json({
        status: 'success',
        message: 'hi from server',
      });
    });

    app.listen(config.PORT, () => {
      logger.info(`we are listenning at port ${config.PORT}`);
    });
  } catch (err) {
    logger.error('failed ro start the server', err);
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();
app.use('/api/v1/users', userRoute);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/blogs', blogRouter);

app.use(globalErrorHandler);

const handleServerShutdown = async () => {
  try {
    logger.warn('Server SHUTDOWN');
    process.exit(0);
  } catch (err) {
    logger.error('Error during server shutdown', err);
  }
};

process.on('SIGTERM', handleServerShutdown);
process.on('SIGINT', handleServerShutdown);
