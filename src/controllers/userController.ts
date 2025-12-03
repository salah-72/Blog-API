import { logger } from '@/lib/winston';
import User, { IUser } from '@/models/userModel';
import Blog from '@/models/blogModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import type { Request, Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';

export const GetCurrentUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.User) return next(new appError('User not authenticated', 401));

    const user = await User.findById(req.User._id).lean().exec();
    res.status(200).json({
      status: 'success',
      data: user,
    });
  },
);

export const UpdateCurrentUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.User) return next(new appError('User not authenticated', 401));
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      website,
      facebook,
      instagtam,
      linkedIn,
      x,
      youtube,
    } = req.body;
    const user = await User.findById(req.User._id);
    if (!user) return next(new appError('user not found', 404));
    if (email) user.email = email;
    if (username) user.username = username;
    if (password) user.password = password;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (!user.socialLinks) user.socialLinks = {};
    if (website) user.socialLinks.website = website;
    if (facebook) user.socialLinks.facebook = facebook;
    if (instagtam) user.socialLinks.instagtam = instagtam;
    if (linkedIn) user.socialLinks.linkedIn = linkedIn;
    if (x) user.socialLinks.x = x;
    if (youtube) user.socialLinks.youtube = youtube;

    await user.save();
    logger.info('user data updated');
    res.status(200).json({
      status: 'success',
      user,
    });
  },
);

export const deleteCurrentUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.User) return next(new appError('User not authenticated', 401));
    const blogs = Blog.find({ author: req.User._id })
      .select('banner.publicId')
      .lean()
      .exec();
    const publicIds = (await blogs).map(({ banner }) => banner.publicId);
    await cloudinary.api.delete_resources(publicIds);

    await User.findByIdAndDelete(req.User._id);
    res.status(204).json({
      status: 'success',
    });
  },
);

export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.User) return next(new appError('User not authenticated', 401));

    const all = await User.countDocuments();
    const limit = parseInt(req.query.limit as string);
    const offset = parseInt(req.query.offset as string);
    const page = Math.floor(offset / limit) + 1;

    const users = await User.find().limit(limit).skip(offset).lean().exec();
    res.status(200).json({
      status: 'success',
      data: {
        len: all,
        page,
        users,
      },
    });
  },
);

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.User) return next(new appError('User not authenticated', 401));

    const user = await User.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      user,
    });
  },
);

export const deletetUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const deluser = await User.findById(req.params.id);
    if (!req.User || !deluser) return next(new appError('User not found', 404));
    if (deluser.role === 'admin')
      return next(new appError('cannot delete admin', 401));
    await User.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
    });
  },
);
