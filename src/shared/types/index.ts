// src/shared/types/index.ts
import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export interface SocketUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
}
