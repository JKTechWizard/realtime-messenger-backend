// src/index.ts
import 'dotenv/config';
import http from 'http';
import { createApp } from './app/app';
import { initSocketGateway } from './features/chat/gateway/socket.gateway';
import { connectDB, disconnectDB } from './shared/database/connection';
import config from './shared/config/env';
import logger from './shared/utils/logger';

async function bootstrap(): Promise<void> {
  // ── Connect to MongoDB ────────────────────────────────────
  await connectDB();

  // ── Create HTTP server ────────────────────────────────────
  const app = createApp();
  const httpServer = http.createServer(app);

  // ── Attach Socket.IO ──────────────────────────────────────
  initSocketGateway(httpServer);

  // ── Start listening ───────────────────────────────────────
  httpServer.listen(config.server.port, () => {
    logger.info(`🚀 Server running`, {
      port: config.server.port,
      env: config.server.nodeEnv,
    });
  });

  // ── Graceful shutdown ─────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal} — shutting down gracefully`);
    httpServer.close(async () => {
      await disconnectDB();
      logger.info('Server closed, database disconnected');
      process.exit(0);
    });
    // Force exit after 10 s if something hangs
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason });
  });

  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught exception', { message: err.message, stack: err.stack });
    process.exit(1);
  });
}

bootstrap();
