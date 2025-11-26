import { Request, Response, NextFunction } from 'express';
import AppError from '@/utils/appError';

interface IError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  path?: string;
  value?: string;
  code?: number;
  errors?: any;
  errmsg?: string;
  name: string;
}

/* -------------------- ERROR HELPERS -------------------- */

const castErrorHandler = (err: IError) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const duplicateHandler = (err: IError) => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const validationHandler = (err: IError) => {
  const errors = Object.values(err.errors || {}).map((el: any) => el.message);
  const message = `Invalid input data: ${errors.join(', ')}`;
  return new AppError(message, 400);
};

/* -------------------- DEV MODE ERROR -------------------- */

const devError = (err: IError, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

/* -------------------- PROD MODE ERROR -------------------- */

const prodError = (err: IError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

/* -------------------- GLOBAL ERROR HANDLER -------------------- */

const globalErrorHandler = (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    devError(err, res);
  } else {
    let error: IError = { ...err, message: err.message };

    if (error.name === 'CastError') error = castErrorHandler(error);
    if (error.code === 11000) error = duplicateHandler(error);
    if (error.name === 'ValidationError') error = validationHandler(error);

    prodError(error, res);
  }
};

export default globalErrorHandler;
