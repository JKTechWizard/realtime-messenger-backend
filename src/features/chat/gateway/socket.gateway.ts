// src/features/chat/gateway/socket.gateway.ts
import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { userRepository } from '../../auth/repositories/user.repository';
import { chatroomRepository } from '../../chatrooms/repositories/chatroom.repository';
import { messagesService } from '../services/messages.service';
import { JwtPayload, SocketUser } from '../../../shared/types';
import { JoinRoomPayload, LeaveRoomPayload, SendMessagePayload, TypingPayload } from '../types';
import config from '../../../shared/config/env';
import logger from '../../../shared/utils/logger';

// ── Typed socket ──────────────────────────────────────────

interface AuthenticatedSocket extends Socket {
  user: SocketUser;
}

// ── JWT verification for socket handshake ─────────────────

const authenticateSocket = async (socket: Socket): Promise<SocketUser> => {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token) throw new Error('No authentication token provided');

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch {
    throw new Error('Invalid or expired token');
  }

  const user = await userRepository.findById(payload.userId);
  if (!user) throw new Error('User not found');

  return {
    userId:    String(user._id),
    email:     user.email,
    firstName: user.firstName,
    lastName:  user.lastName,
    fullName:  `${user.firstName} ${user.lastName}`,
  };
};

// ── Gateway ───────────────────────────────────────────────

export const initSocketGateway = (httpServer: HttpServer): SocketServer => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: config.cors.origins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60_000,
    pingInterval: 25_000,
  });

  // Auth middleware — runs once per connection
  io.use(async (socket, next) => {
    try {
      const user = await authenticateSocket(socket);
      (socket as AuthenticatedSocket).user = user;
      next();
    } catch (err) {
      logger.warn('Socket auth failed', { error: (err as Error).message, socketId: socket.id });
      next(new Error((err as Error).message));
    }
  });

  io.on('connection', (rawSocket: Socket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const { user } = socket;

    logger.info('Socket connected', { userId: user.userId, socketId: socket.id });

    // ── join_room ──────────────────────────────────────────
    socket.on('join_room', async (payload: JoinRoomPayload) => {
      try {
        const { roomId } = payload;
        if (!roomId) return;

        const room = await chatroomRepository.findById(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        await socket.join(roomId);
        logger.debug('User joined socket room', { userId: user.userId, roomId });
      } catch (err) {
        logger.error('join_room error', { error: (err as Error).message, userId: user.userId });
      }
    });

    // ── leave_room ─────────────────────────────────────────
    socket.on('leave_room', (payload: LeaveRoomPayload) => {
      const { roomId } = payload;
      if (!roomId) return;
      socket.leave(roomId);
      logger.debug('User left socket room', { userId: user.userId, roomId });
    });

    // ── send_message ───────────────────────────────────────
    socket.on('send_message', async (payload: SendMessagePayload) => {
      try {
        const { roomId, content } = payload;

        if (!roomId || !content?.trim()) {
          socket.emit('error', { message: 'roomId and content are required' });
          return;
        }

        if (content.trim().length > 5000) {
          socket.emit('error', { message: 'Message too long (max 5000 characters)' });
          return;
        }

        // Persist via service (applies business rules + repo)
        const message = await messagesService.createMessage(user.userId, roomId, content);

        // Broadcast to all participants in the room, including sender
        io.to(roomId).emit('receive_message', message);

        logger.debug('Message broadcast', {
          userId: user.userId,
          roomId,
          messageId: message.messageId,
        });
      } catch (err) {
        const errMsg = (err as Error).message;
        logger.error('send_message error', { error: errMsg, userId: user.userId });
        socket.emit('error', { message: errMsg });
      }
    });

    // ── user_typing ────────────────────────────────────────
    socket.on('user_typing', (payload: TypingPayload) => {
      const { roomId } = payload;
      if (!roomId) return;
      socket.to(roomId).emit('user_typing', {
        roomId,
        userId:   user.userId,
        userName: user.fullName,
      });
    });

    // ── user_stopped_typing ────────────────────────────────
    socket.on('user_stopped_typing', (payload: TypingPayload) => {
      const { roomId } = payload;
      if (!roomId) return;
      socket.to(roomId).emit('user_stopped_typing', {
        roomId,
        userId:   user.userId,
        userName: user.fullName,
      });
    });

    // ── disconnect ─────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected', { userId: user.userId, socketId: socket.id, reason });
    });

    socket.on('error', (err) => {
      logger.error('Socket error', { userId: user.userId, error: err.message });
    });
  });

  logger.info('Socket.IO gateway initialized');
  return io;
};
