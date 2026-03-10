// src/shared/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { AppError } from '../utils/AppError';
import { ApiErrorResponse } from '../types';
import logger from '../utils/logger';
import config from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Known operational errors
  if (err instanceof AppError) {
    logger.warn(`[${err.statusCode}] ${err.message}`, { path: req.path, method: req.method });
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(config.server.isDev && { stack: err.stack }),
    } as ApiErrorResponse);
    return;
  }

  // Mongoose duplicate key (email already exists, etc.)
  if ((err as { code?: number }).code === 11000) {
    const field = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue ?? {})[0] ?? 'field';
    res.status(409).json({ success: false, message: `${field} already exists` } as ApiErrorResponse);
    return;
  }

  // Mongoose validation error
  if (err instanceof MongooseError.ValidationError) {
    const errors: Record<string, string[]> = {};
    Object.entries(err.errors).forEach(([key, val]) => {
      errors[key] = [val.message];
    });
    res.status(422).json({ success: false, message: 'Validation failed', errors } as ApiErrorResponse);
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err instanceof MongooseError.CastError) {
    res.status(400).json({ success: false, message: `Invalid value for field: ${err.path}` } as ApiErrorResponse);
    return;
  }

  // Unknown errors
  logger.error('Unhandled error', { error: err.message, stack: err.stack, path: req.path });
  res.status(500).json({
    success: false,
    message: config.server.isDev ? err.message : 'Internal server error',
    ...(config.server.isDev && { stack: err.stack }),
  } as ApiErrorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  } as ApiErrorResponse);
};
