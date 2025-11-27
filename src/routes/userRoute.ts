import { protect, restrictTo } from '@/controllers/authController';
import { param } from 'express-validator';
import {
  deleteCurrentUser,
  getAllUsers,
  GetCurrentUser,
  getUser,
  deletetUser,
  UpdateCurrentUser,
} from '@/controllers/userController';
import { Router } from 'express';

const router = Router();
router.get('/getMe', protect, GetCurrentUser);
router.patch('/updateMe', protect, UpdateCurrentUser);
router.delete('/deleteMe', protect, deleteCurrentUser);
router.get('/getUsers', protect, restrictTo('admin'), getAllUsers);
router.get(
  '/getUser/:id',
  protect,
  restrictTo('admin'),
  param('id').notEmpty().isMongoId().withMessage('invalid Id'),
  getUser,
);
router.delete('/deleteUser/:id', protect, restrictTo('admin'), deletetUser);

export default router;
