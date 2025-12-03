import { logger } from '@/lib/winston';
import Blog from '@/models/blogModel';
import DOMPurify from 'dompurify';
import { v2 as cloudinary } from 'cloudinary';
import { JSDOM } from 'jsdom';
import { IBlog } from '@/models/blogModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction, response } from 'express';
import User from '@/models/userModel';
import appError from '@/utils/appError';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

type blogData = Pick<IBlog, 'title' | 'content' | 'banner' | 'status'>;
export const createBlog = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, content, banner, status } = req.body as blogData;
    const author = req.User?._id;
    const cleanContent = purify.sanitize(content);

    const blog = await Blog.create({
      title,
      content: cleanContent,
      banner,
      status,
      author,
    });
    res.status(201).json({
      status: 'success',
      data: blog,
    });
    logger.info('blog created successfully');
  },
);

interface QueryType {
  status?: 'draft' | 'published';
}

export const GetAllBlogs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string);
    const offset = parseInt(req.query.offset as string);
    const query: QueryType = {};

    const user = await User.findById(req.User?._id).select('role');
    if (!user || user.role === 'user') {
      query.status = 'published';
    }

    const length = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .select('-banner.publicId -__v')
      .populate('author', 'firstName lastName username email')
      .limit(limit)
      .skip(offset)
      .sort({ publishedAt: 'desc' })
      .lean()
      .exec();

    res.status(200).json({
      length,
      blogs,
    });
  },
);

// blogs/user/:userid
export const GetUserBlogs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string);
    const offset = parseInt(req.query.offset as string);
    const query: QueryType = {};

    const wantedUser = req.params.id;
    const user = await User.findById(req.User?._id).select('role');
    if (!user || user.role === 'user') {
      query.status = 'published';
    }

    const length = await Blog.countDocuments({ author: wantedUser, ...query });
    const blogs = await Blog.find({ author: wantedUser, ...query })
      .select('-banner.publicId -__v')
      .populate('author', 'firstName lastName username email')
      .limit(limit)
      .skip(offset)
      .sort({ publishedAt: 'desc' })
      .lean()
      .exec();

    res.status(200).json({
      length,
      blogs,
    });
  },
);

export const GetBlogBySlug = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.User?._id).select('role');
    const blog = await Blog.findOne({ slug: req.params.slug })
      .select('-banner.publicId -__v')
      .populate('author', 'firstName lastName username email')
      .lean()
      .exec();

    if (!blog || !user)
      return next(new appError('blog or user is not found', 404));
    if (user.role === 'user' && blog.status === 'draft')
      return next(new appError('you have no access to see this blog', 404));

    res.status(200).json({
      status: 'success',
      blog,
    });
  },
);

type bloggData = Partial<
  Pick<IBlog, 'title' | 'content' | 'banner' | 'status'>
>;

export const updateBlog = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let blog = await Blog.findById(req.params.id);
    if (!blog) return next(new appError('blog is not found', 404));

    const userID = req.User?._id;
    if (!blog.author.equals(userID)) {
      logger.warn('user tried to update blog without permission', {
        userID,
        blog,
      });
      return next(
        new appError('You have no permission to update this blog', 401),
      );
    }

    const { title, content, banner, status } = req.body as bloggData;
    if (title) blog.title = title;
    if (content) blog.content = purify.sanitize(content);
    if (banner) blog.banner = banner;
    if (status) blog.status = status;

    await blog.save();
    logger.info('blog updated', { blog });

    res.status(200).json({
      status: 'success',
      data: blog,
    });
  },
);

export const deleteBlog = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(new appError('blog is not found', 404));

    const userID = req.User?._id;
    console.log(userID, blog.author);
    if (!blog.author.equals(userID)) {
      logger.warn('user tried to delete blog without permission', {
        userID,
        blog,
      });
      return next(
        new appError('You have no permission to delete this blog', 401),
      );
    }

    await cloudinary.uploader.destroy(blog.banner.publicId);
    await Blog.deleteOne({ _id: blog._id });
    logger.info('blog deleted', { blog });

    res.status(204).json({
      status: 'success',
    });
  },
);
