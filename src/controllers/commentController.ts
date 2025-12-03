import { logger } from '@/lib/winston';
import Blog from '@/models/blogModel';
import Comment from '@/models/commentModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { IComment } from '@/models/commentModel';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

type commentData = Pick<IComment, 'content'>;
export const createComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(new appError('blog not found', 404));
    console.log(req.body);

    let { content } = req.body as commentData;
    content = purify.sanitize(content);

    const comment = await Comment.create({
      user: req.User?._id,
      blog: blog._id,
      content,
    });
    blog.commentsCount++;
    await blog.save();
    res.status(201).json({
      status: 'success',
      comment,
    });
    logger.info(
      `${req.User?._id} make comment (${content}) at blog ${blog.title}`,
    );
  },
);

export const deleteComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const comment = await Comment.findOne({ _id: req.params.id });
    if (!comment) return next(new appError('comment not found', 404));

    const blogId = comment?.blog;
    const blog = await Blog.findById(blogId);
    if (!blog) return next(new appError('blog not found', 404));

    if (req.User?._id !== comment.user && req.User?.role !== 'admin') {
      logger.warn('regular user tried to delete comment');
      return next(
        new appError('you have no permission to delete this comment', 404),
      );
    }
    blog.commentsCount--;
    await blog.save();

    await comment.deleteOne({ _id: comment._id });
    res.status(204).json({
      status: 'success',
    });
    logger.info(`${req.User?._id} delete his comment at ${blog.title} blog`);
  },
);

export const getComments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string);
    const offset = parseInt(req.query.offset as string);
    const comments = await Comment.find({ blog: req.params.id })
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      len: comments.length,
      comments,
    });
  },
);
