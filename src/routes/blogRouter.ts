import multer from 'multer';
import { protect, restrictTo } from '@/controllers/authController';
import { createBlog } from '@/controllers/blogController';
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

export default router;
