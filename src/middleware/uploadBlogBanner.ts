import uploadToCloudinary from '@/lib/cloudinaty';
import { logger } from '@/lib/winston';
import Blog from '@/models/blogModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

const maxFileSize = 2 * 1024 * 1024;
export const uploadBlogBanner = (method: 'post' | 'patch') => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (method === 'patch' && !req.file) {
      next();
      return;
    }
    if (!req.file)
      return next(new appError('upload the blog banner image', 400));

    if (req.file.size > maxFileSize)
      return next(new appError('image is larger than 2MB', 413));

    const blog = await Blog.findById(req.params.id)
      .select('banner.publicId')
      .exec();
    const data = await uploadToCloudinary(
      req.file.buffer,
      blog?.banner.publicId.replace('blog-API/', ''),
    );
    if (!data) {
      logger.error('uploading photo failed');
      return next(new appError('uploading photo failed', 500));
    }

    const newBanner = {
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      url: data.url,
    };
    logger.info('blog banner uploaded');

    req.body.banner = newBanner;
    next();
  });
};

// 3: 58
