import { createUser } from '@/controllers/userController';
import { Router } from 'express';

const router = Router();
router.post('/', createUser);

export default router;
