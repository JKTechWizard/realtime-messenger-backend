import { Response, NextFunction } from 'express';
import { messagesService } from '../services/messages.service';
import { AuthenticatedRequest } from '../../../shared/types';
import { sendSuccess } from '../../../shared/utils/response';

export const messagesController = {
  async getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const roomId = req.params.roomId as string;
      const limit  = req.query.limit  ? parseInt(req.query.limit  as string, 10) : 100;
      const before = req.query.before as string | undefined;
      const messages = await messagesService.getMessages(req.user.userId, roomId, limit, before);
      sendSuccess(res, messages);
    } catch (err) { next(err); }
  },
};