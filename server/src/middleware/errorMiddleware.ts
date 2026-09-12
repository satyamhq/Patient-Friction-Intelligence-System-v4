import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

export interface AppError extends Error {
  statusCode?: number;
  errors?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[PFIS Error] [${req.method}] ${req.url} -> Status: ${statusCode}`, err);

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
  });
};
