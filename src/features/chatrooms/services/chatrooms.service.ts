// src/features/chatrooms/services/chatrooms.service.ts
import { chatroomRepository } from '../repositories/chatroom.repository';
import { messageRepository } from '../../chat/repositories/message.repository';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../shared/utils/AppError';
import { CreateChatroomDto, ChatroomResponse } from '../types';
import { IChatroom } from '../models/Chatroom.model';
import logger from '../../../shared/utils/logger';

// ── Helper ────────────────────────────────────────────────

const toRoomResponse = async (room: IChatroom): Promise<ChatroomResponse> => {
  const lastMsg = await messageRepository.findLastByRoom(String(room._id));

  return {
    roomId:       String(room._id),
    roomName:     room.roomName,
    description:  room.description ?? null,
    createdBy:    String(room.createdBy),
    participants: room.participants.map(String),
    createdAt:    room.createdAt.toISOString(),
    ...(lastMsg && {
      lastMessage: {
        content:    lastMsg.content,
        timestamp:  lastMsg.createdAt.toISOString(),
        senderName: lastMsg.senderName,
      },
    }),
  };
};

// ── Service ───────────────────────────────────────────────

export const chatroomsService = {
  async getAll(): Promise<ChatroomResponse[]> {
    const rooms = await chatroomRepository.findAll();
    // Fetch last messages in parallel across all rooms
    return Promise.all(rooms.map(toRoomResponse));
  },

  async getById(roomId: string): Promise<ChatroomResponse> {
    const room = await chatroomRepository.findById(roomId);
    if (!room) throw new NotFoundError('Chatroom');
    return toRoomResponse(room);
  },

  async create(userId: string, dto: CreateChatroomDto): Promise<ChatroomResponse> {
    const existing = await chatroomRepository.findByNameInsensitive(dto.roomName);
    if (existing) throw new ConflictError(`A room named "${dto.roomName}" already exists`);

    const room = await chatroomRepository.create({
      roomName:           dto.roomName.trim(),
      description:        dto.description?.trim() ?? null,
      createdBy:          userId,
      firstParticipantId: userId, // creator auto-joins
    });

    logger.info('Chatroom created', { roomId: String(room._id), createdBy: userId });
    return toRoomResponse(room);
  },

  async join(userId: string, roomId: string): Promise<ChatroomResponse> {
    const room = await chatroomRepository.findById(roomId);
    if (!room) throw new NotFoundError('Chatroom');

    // $addToSet is idempotent — re-joining has no effect
    const updated = await chatroomRepository.addParticipant(roomId, userId);
    if (!updated) throw new NotFoundError('Chatroom');

    logger.info('User joined room', { userId, roomId });
    return toRoomResponse(updated);
  },

  async leave(userId: string, roomId: string): Promise<void> {
    const room = await chatroomRepository.findById(roomId);
    if (!room) throw new NotFoundError('Chatroom');

    const isCreator = String(room.createdBy) === userId;
    if (isCreator) {
      const count = await chatroomRepository.participantCount(roomId);
      if (count <= 1) {
        throw new ForbiddenError(
          'Room creator cannot leave as the last participant. Delete the room instead.'
        );
      }
    }

    await chatroomRepository.removeParticipant(roomId, userId);
    logger.info('User left room', { userId, roomId });
  },
};
