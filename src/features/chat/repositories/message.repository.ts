// src/features/chat/repositories/message.repository.ts
import mongoose from 'mongoose';
import MessageModel, { IMessage } from '../models/Message.model';

export const messageRepository = {
  /**
   * Fetch messages for a room in ascending order (oldest first).
   * Supports cursor-based pagination via `before` (ISO timestamp).
   */
  async findByRoom(
    roomId: string,
    limit = 100,
    before?: string
  ): Promise<IMessage[]> {
    const query: Record<string, unknown> = {
      roomId: new mongoose.Types.ObjectId(roomId),
    };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    return MessageModel.find(query)
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean<IMessage[]>()
      .exec();
  },

  /**
   * Fetch the single most recent message in a room.
   * Used to populate the "last message" preview in the chatroom list.
   */
  async findLastByRoom(roomId: string): Promise<IMessage | null> {
    return MessageModel.findOne({ roomId: new mongoose.Types.ObjectId(roomId) })
      .sort({ createdAt: -1 })
      .lean<IMessage>()
      .exec();
  },

  async create(data: {
    roomId: string;
    senderId: string;
    senderName: string;
    content: string;
  }): Promise<IMessage> {
    const message = await MessageModel.create({
      roomId:     new mongoose.Types.ObjectId(data.roomId),
      senderId:   new mongoose.Types.ObjectId(data.senderId),
      senderName: data.senderName,
      content:    data.content.trim(),
      attachments: [],
      reactions:   [],
      replyTo:    null,
    });
    return message.toObject() as IMessage;
  },
};
