import type { Request, Response, NextFunction } from 'express';
import config from '@/Config';
import type { IUser } from '@/models/userModel';
import User from '@/models/userModel';
import { genUsername } from '@/utils/gen_username';
import jwt from 'jsonwebtoken';
import catchAsync from '@/utils/catchAsync';
import appError from '@/utils/appError';
import { Types } from 'mongoose';
import { logger } from '@/lib/winston';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const gen_token = (_id: Types.ObjectId): string => {
  return jwt.sign({ _id }, config.JWT_KEY, { expiresIn: config.EXPIRED_IN });
};

// pick only email, password , role from IUser
type UserData = Pick<IUser, 'email' | 'password' | 'role'>;

export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password, role } = req.body as UserData;
    if (role === 'admin' && !config.ADMINS_EMAIL.includes(email)) {
      return next(new appError('you have no access to be admin', 403));
    }

    const username = genUsername();
    const user = await User.create({
      username,
      email,
      password,
      role,
    });

    const token: string = gen_token(user._id);
    res.cookie('jwt', token, {
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
  },
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username, email, password } = req.body;
    if (!(username || email) || !password)
      return next(new appError('missing values', 404));

    let user = await User.findOne({ email }).select('+password');
    user = user || (await User.findOne({ username }).select('+password'));

    if (!user) return next(new appError('email or username is invalid', 400));
    if (!(await bcrypt.compare(password, user.password)))
      return next(new appError('password is incorrect', 400));

    const token: string = gen_token(user._id);
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(200).json({
      status: 'success',
      data: {
        user,
        token,
      },
    });
  },
);

export const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(204).json({
      status: 'success',
    });
    logger.info('user logged out', req.User?.username);
  },
);

interface ITokenPayload extends jwt.JwtPayload {
  _id: string;
}

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token = req.cookies.jwt;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = token || req.headers.authorization.split(' ')[1];
    }
    if (!token) return next(new appError('User not authenticated', 401));

    const decode_jwt = (await jwt.verify(
      token,
      config.JWT_KEY,
    )) as ITokenPayload;
    const user = await User.findById(decode_jwt._id);
    if (!user) return next(new appError('User no longer exists', 404));

    req.User = user;
    next();
  },
);

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.User) return next(new appError('User not authenticated', 401));
    if (!roles.includes(req.User.role))
      return next(
        new appError('you have no permission to do this action', 403),
      );
    next();
  };
};

passport.use(
  new GoogleStrategy(
    {
      clientSecret: config.CLIENT_SECRET!,
      clientID: config.CLIENT_ID!,
      callbackURL: 'http://localhost:3000/api/v1/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile._json.email });
        if (!user) {
          const username = genUsername();
          const password = Math.random().toString(36).slice(2);
          user = await User.create({
            email: profile._json.email,
            firstName: profile._json.given_name,
            lastName: profile._json.family_name,
            username,
            password,
          });
        }
        done(null, user);
      } catch (err) {
        console.log(err);
        done(err);
      }
    },
  ),
);

export const googleAuthCallback = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user)
      return res.status(401).json({ message: 'Auth failed', err });

    const token: string = gen_token(user._id);
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    // res.status(200).json({
    //   status: 'success',
    //   data: {
    //     user,
    //     token,
    //   },
    // });
    res.redirect('/api/v1/');
  })(req, res, next);
};
