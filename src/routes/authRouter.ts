import { register, login, logout, protect } from '@/controllers/authController';
import { Router } from 'express';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);

export default router;
