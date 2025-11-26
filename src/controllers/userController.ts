import User from '@/models/userModel';
import type { Request, Response } from 'express';

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = await User.create(req.body);
  res.status(200).json({
    status: 'success',
    data: user,
  });
};
