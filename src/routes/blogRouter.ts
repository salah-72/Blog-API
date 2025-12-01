import multer from 'multer';
import { protect, restrictTo } from '@/controllers/authController';
import {
  createBlog,
  GetAllBlogs,
  GetUserBlogs,
  GetBlogBySlug,
  updateBlog,
  deleteBlog,
} from '@/controllers/blogController';
import { Router } from 'express';
import { uploadBlogBanner } from '@/middleware/uploadBlogBanner';

const router = Router();
const upload = multer();

router.post(
  '/',
  protect,
  restrictTo('admin'),
  upload.single('banner-image'),
  uploadBlogBanner('post'),
  createBlog,
);

router.get('/', protect, GetAllBlogs);
router.get('/user/:id', protect, GetUserBlogs);
router.get('/:slug', protect, GetBlogBySlug);
router.patch(
  '/:id',
  protect,
  restrictTo('admin'),
  upload.single('banner-image'),
  uploadBlogBanner('patch'),
  updateBlog,
);

router.delete('/:id', protect, restrictTo('admin'), deleteBlog);
export default router;
