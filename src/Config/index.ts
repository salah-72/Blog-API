import dotenv from 'dotenv';
import ms from 'ms';
dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  DB_PASSWORD: process.env.DB_PASSWORD,
  NODE_ENV: process.env.NODE_ENV,
  WHITELIST_ORIGINS: ['https://docs-api.codewithsadee.com'],
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  JWT_KEY: process.env.JWT_KEY as ms.StringValue,
  EXPIRED_IN: process.env.EXPIRED_IN as ms.StringValue,
  ADMINS_EMAIL: ['meda5103@gmail.com', 'a7med11salah@gmail.com'],
};

export default config;
