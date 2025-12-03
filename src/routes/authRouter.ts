import {
  register,
  login,
  logout,
  protect,
  googleAuthCallback,
} from '@/controllers/authController';
import { Router } from 'express';
import passport from 'passport';
const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);
router.get('/google/callback', googleAuthCallback);
export default router;
