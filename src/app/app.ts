// src/app/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from '../shared/config/env';
import logger from '../shared/utils/logger';
import authRoutes from '../features/auth/routes/auth.routes';
import chatroomsRoutes from '../features/chatrooms/routes/chatrooms.routes';
import { errorHandler, notFoundHandler } from '../shared/middleware/errorHandler';

export const createApp = (): Application => {
  const app = express();

  // ── Security ──────────────────────────────────────────────
  app.use(helmet());
  app.set('trust proxy', 1);

  // ── CORS ──────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (config.cors.origins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS policy: ${origin} is not allowed`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ── Body parsing ──────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── Request logging ───────────────────────────────────────
  if (config.server.isDev) {
    app.use(morgan('dev'));
  } else {
    app.use(
      morgan('combined', {
        stream: { write: (msg) => logger.info(msg.trim()) },
      })
    );
  }

  // ── Global rate limiter ───────────────────────────────────
  app.use(
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many requests, please slow down' },
    })
  );

  // ── Health check ──────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      data: { status: 'ok', timestamp: new Date().toISOString() },
    });
  });

  // ── API routes ────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/chatrooms', chatroomsRoutes);

  // ── 404 + error handlers (must be last) ───────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
