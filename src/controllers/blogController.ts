import { logger } from '@/lib/winston';
import Blog from '@/models/blogModel';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { IBlog } from '@/models/blogModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

type blogData = Pick<IBlog, 'title' | 'content' | 'banner' | 'status'>;
export const createBlog = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, content, banner, status } = req.body as blogData;
    const author = req.user?._id;
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
