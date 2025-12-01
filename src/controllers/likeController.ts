import { logger } from '@/lib/winston';
import Blog from '@/models/blogModel';
import Like from '@/models/likeModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const likeBlog = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(new appError('blog not found', 404));

    const isLiked = await Like.findOne({
      blog: req.params.id,
      user: req.user?._id,
    });
    if (isLiked) return next(new appError('you liked this blog before', 400));

    const like = await Like.create({
      user: req.user?._id,
      blog: blog._id,
    });
    blog.likesCount++;
    await blog.save();
    res.status(201).json({
      status: 'success',
      like,
    });
    logger.info(`${req.user?._id} likes blog ${blog.title}`);
  },
);

export const unlikeBlog = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(new appError('blog not found', 404));

    const isLiked = await Like.findOne({
      blog: req.params.id,
      user: req.user?._id,
    });
    if (!isLiked)
      return next(
        new appError(
          'you not allowed to unlike this blog untill you liked it',
          400,
        ),
      );
    await Like.deleteOne({
      blog: req.params.id,
      user: req.user?._id,
    });
    blog.likesCount--;
    await blog.save();
    res.status(204).json({
      status: 'success',
    });
    logger.info(`${req.user?._id} unlikes ${blog.title} blog`);
  },
);
