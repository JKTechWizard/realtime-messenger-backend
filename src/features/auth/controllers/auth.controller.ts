// src/features/auth/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest } from '../../../shared/types';
import { sendSuccess, sendCreated } from '../../../shared/utils/response';

export const authController = {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.signup(req.body);
      sendCreated(res, result, 'Account created successfully');
    } catch (err) { next(err); }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, 'Logged in successfully');
    } catch (err) { next(err); }
  },

  logout(_req: Request, res: Response): void {
    // JWT is stateless — client discards token
    sendSuccess(res, null, 'Logged out successfully');
  },

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await authService.getProfile(req.user.userId);
      sendSuccess(res, profile);
    } catch (err) { next(err); }
  },
};
