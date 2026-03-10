// src/features/chatrooms/routes/chatrooms.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { chatroomsController } from '../controllers/chatrooms.controller';
import { messagesController } from '../../chat/controllers/messages.controller';
import { authenticate } from '../../auth/middleware/authenticate';
import { validate } from '../../../shared/middleware/validate';
import { AuthenticatedRequest } from '../../../shared/types';

const router = Router();

// ── Middleware helpers ────────────────────────────────────

const auth = (req: Request, res: Response, next: NextFunction) =>
  authenticate(req as AuthenticatedRequest, res, next);

const asAuth = (
  fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) =>
  fn(req as AuthenticatedRequest, res, next);

// ── Validators ────────────────────────────────────────────

// MongoDB ObjectId validation — replaces the Prisma UUID validator
const roomIdValidator = [
  param('roomId').isMongoId().withMessage('Invalid room ID'),
];

const createRoomValidators = [
  body('roomName').trim().notEmpty().withMessage('Room name is required')
    .isLength({ min: 3, max: 60 }).withMessage('Room name must be 3–60 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/).withMessage('Only letters, numbers, spaces, hyphens and underscores'),
  body('description').optional().trim()
    .isLength({ max: 200 }).withMessage('Description must be 200 characters or less'),
];

// ── Routes ────────────────────────────────────────────────

router.get('/',                 auth, asAuth(chatroomsController.getAll));
router.post('/',                auth, validate(createRoomValidators), asAuth(chatroomsController.create));
router.get('/:roomId',          auth, validate(roomIdValidator), asAuth(chatroomsController.getById));
router.post('/:roomId/join',    auth, validate(roomIdValidator), asAuth(chatroomsController.join));
router.post('/:roomId/leave',   auth, validate(roomIdValidator), asAuth(chatroomsController.leave));
router.get('/:roomId/messages', auth, validate(roomIdValidator), asAuth(messagesController.getMessages));

export default router;
