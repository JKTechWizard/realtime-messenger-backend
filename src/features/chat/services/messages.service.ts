// src/features/chat/services/messages.service.ts
import { messageRepository } from '../repositories/message.repository';
import { chatroomRepository } from '../../chatrooms/repositories/chatroom.repository';
import { userRepository } from '../../auth/repositories/user.repository';
import { ForbiddenError, NotFoundError } from '../../../shared/utils/AppError';
import { MessageResponse } from '../types';
import { IMessage } from '../models/Message.model';


export const toMessageResponse = (msg: IMessage): MessageResponse => ({
  messageId:  String(msg._id),
  senderId:   String(msg.senderId),
  senderName: msg.senderName,
  roomId:     String(msg.roomId),
  content:    msg.content,
  timestamp:  msg.createdAt.toISOString(),
});

//  Service layer for messages, handling business logic and data transformations

export const messagesService = {
  async getMessages(
    userId: string,
    roomId: string,
    limit = 100,
    before?: string
  ): Promise<MessageResponse[]> {
    const room = await chatroomRepository.findById(roomId);
    if (!room) throw new NotFoundError('Chatroom');

    const isParticipant = await chatroomRepository.isParticipant(roomId, userId);
    if (!isParticipant) throw new ForbiddenError('You are not a participant of this room');

    const messages = await messageRepository.findByRoom(roomId, limit, before);
    return messages.map(toMessageResponse);
  },

  async createMessage(
    userId: string,
    roomId: string,
    content: string
  ): Promise<MessageResponse> {
    const room = await chatroomRepository.findById(roomId);
    if (!room) throw new NotFoundError('Chatroom');

    const isParticipant = await chatroomRepository.isParticipant(roomId, userId);
    if (!isParticipant) throw new ForbiddenError('You must join the room before sending messages');

    // Fetch the sender's name — already denormalized into the message document
    // so future reads never need a JOIN/populate
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
    const senderName = `${user.firstName} ${user.lastName}`;

    const message = await messageRepository.create({ roomId, senderId: userId, senderName, content });
    return toMessageResponse(message);
  },
};
