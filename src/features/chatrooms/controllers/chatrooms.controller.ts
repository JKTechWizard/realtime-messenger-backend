// src/features/chatrooms/controllers/chatrooms.controller.ts
import { Response, NextFunction } from 'express';
import { chatroomsService } from '../services/chatrooms.service';
import { AuthenticatedRequest } from '../../../shared/types';
import { sendSuccess, sendCreated } from '../../../shared/utils/response';

export const chatroomsController = {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rooms = await chatroomsService.getAll();
      sendSuccess(res, rooms);
    } catch (err) { next(err); }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const room = await chatroomsService.getById(req.params.roomId);
      sendSuccess(res, room);
    } catch (err) { next(err); }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const room = await chatroomsService.create(req.user.userId, req.body);
      sendCreated(res, room, 'Room created successfully');
    } catch (err) { next(err); }
  },

  async join(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const room = await chatroomsService.join(req.user.userId, req.params.roomId);
      sendSuccess(res, room, 'Joined room successfully');
    } catch (err) { next(err); }
  },

  async leave(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await chatroomsService.leave(req.user.userId, req.params.roomId);
      sendSuccess(res, null, 'Left room successfully');
    } catch (err) { next(err); }
  },
};
