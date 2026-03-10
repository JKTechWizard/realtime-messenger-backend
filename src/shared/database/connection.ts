// src/shared/database/connection.ts
import mongoose from 'mongoose';
import config from '../config/env';
import logger from '../utils/logger';

const RECONNECT_DELAY_MS = 5000;

export const connectDB = async (): Promise<void> => {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () =>
    logger.info('MongoDB connected', { uri: sanitizeUri(config.db.uri) })
  );
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB connection error', { error: err.message }));
  mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));

  try {
    await mongoose.connect(config.db.uri, {
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      maxPoolSize: 20,
    });
  } catch (err) {
    logger.error('Initial MongoDB connection failed', { error: (err as Error).message });
    logger.info(`Retrying in ${RECONNECT_DELAY_MS / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY_MS));
    await connectDB();
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
};

// Strip credentials from URI for safe logging
const sanitizeUri = (uri: string): string => uri.replace(/:\/\/[^@]+@/, '://***:***@');
