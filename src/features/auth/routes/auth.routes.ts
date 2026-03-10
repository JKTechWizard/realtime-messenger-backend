// src/features/auth/routes/auth.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../../../shared/middleware/validate';
import { signupValidators, loginValidators } from '../controllers/auth.validators';
import { AuthenticatedRequest } from '../../../shared/types';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const auth = (req: Request, res: Response, next: NextFunction) =>
  authenticate(req as AuthenticatedRequest, res, next);

router.post('/signup', authLimiter, validate(signupValidators), authController.signup);
router.post('/login',  authLimiter, validate(loginValidators),  authController.login);
router.post('/logout', authController.logout);
router.get(
  '/me',
  auth,
  (req: Request, res: Response, next: NextFunction) =>
    authController.getProfile(req as AuthenticatedRequest, res, next)
);

export default router;
