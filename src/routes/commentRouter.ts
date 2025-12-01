import { protect } from '@/controllers/authController';
import {
  createComment,
  deleteComment,
  getComments,
} from '@/controllers/commentController';
import { Router } from 'express';

const router = Router();

router.post('/blog/:id', protect, createComment);
router.get('/blog/:id', protect, getComments);
router.delete('/:id', protect, deleteComment);

export default router;
