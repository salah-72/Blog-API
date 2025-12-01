import { protect } from '@/controllers/authController';
import { likeBlog, unlikeBlog } from '@/controllers/likeController';
import { Router } from 'express';

const router = Router();

router.post('/blog/:id', protect, likeBlog);
router.delete('/blog/:id', protect, unlikeBlog);

export default router;
