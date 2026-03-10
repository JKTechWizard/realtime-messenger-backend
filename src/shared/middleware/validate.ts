// src/shared/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ApiErrorResponse } from '../types';

export const validate = (chains: ValidationChain[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(chains.map((chain) => chain.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const grouped: Record<string, string[]> = {};
      errors.array().forEach((e) => {
        const field = 'path' in e ? (e.path as string) : 'general';
        if (!grouped[field]) grouped[field] = [];
        grouped[field].push(e.msg);
      });
      res.status(422).json({ success: false, message: 'Validation failed', errors: grouped } as ApiErrorResponse);
      return;
    }
    next();
  };
