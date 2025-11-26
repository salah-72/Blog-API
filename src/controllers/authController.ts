import type { Request, Response } from 'express';
import config from '@/Config';
import type { IUser } from '@/models/userModel';
import User from '@/models/userModel';
import { genUsername } from '@/utils/gen_username';
import jwt from 'jsonwebtoken';

import { Types } from 'mongoose';
import { logger } from '@/lib/winston';

const gen_token = (_id: Types.ObjectId): string => {
  return jwt.sign({ _id }, config.JWT_KEY, { expiresIn: config.EXPIRED_IN });
};

// pick only email, password , role from IUser
type UserData = Pick<IUser, 'email' | 'password' | 'role'>;

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, role } = req.body as UserData;
  if (role === 'admin' && !config.ADMINS_EMAIL.includes(email)) {
    res.status(403).json({
      status: 'failed',
      message: 'you have no access to be admin',
    });
    logger.warn(`user with email: ${email} tried to be admin`);
    return;
  }
  try {
    const username = genUsername();
    const user = await User.create({
      username,
      email,
      password,
      role,
    });

    const token: string = gen_token(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(201).json({
      status: 'success',
      message: 'user created',
      data: {
        user,
        token,
      },
    });
    logger.info('user created successfully', {
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'failed',
      message: 'internal server error',
      error: err,
    });
  }
};
