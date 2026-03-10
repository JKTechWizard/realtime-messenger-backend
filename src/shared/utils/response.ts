// src/shared/utils/response.ts
import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response => {
  const body: ApiResponse<T> = { success: true, data, ...(message && { message }) };
  return res.status(statusCode).json(body);
};

export const sendCreated = <T>(res: Response, data: T, message?: string): Response =>
  sendSuccess(res, data, message, 201);
