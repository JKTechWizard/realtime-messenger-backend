// src/features/chatrooms/repositories/chatroom.repository.ts
import mongoose from 'mongoose';
import ChatroomModel, { IChatroom } from '../models/Chatroom.model';

export const chatroomRepository = {
  async findAll(): Promise<IChatroom[]> {
    return ChatroomModel.find()
      .sort({ createdAt: -1 })
      .lean<IChatroom[]>()
      .exec();
  },

  async findById(roomId: string): Promise<IChatroom | null> {
    return ChatroomModel.findById(roomId).lean<IChatroom>().exec();
  },

  async findByNameInsensitive(roomName: string): Promise<IChatroom | null> {
    // Uses the collation index defined on the schema
    return ChatroomModel.findOne({ roomName: roomName.trim() })
      .collation({ locale: 'en', strength: 2 })
      .lean<IChatroom>()
      .exec();
  },

  async create(data: {
    roomName: string;
    description?: string | null;
    createdBy: string;
    firstParticipantId: string;
  }): Promise<IChatroom> {
    const room = await ChatroomModel.create({
      roomName: data.roomName,
      description: data.description ?? null,
      createdBy: new mongoose.Types.ObjectId(data.createdBy),
      participants: [new mongoose.Types.ObjectId(data.firstParticipantId)],
    });
    return room.toObject() as IChatroom;
  },

  async addParticipant(roomId: string, userId: string): Promise<IChatroom | null> {
    return ChatroomModel.findByIdAndUpdate(
      roomId,
      { $addToSet: { participants: new mongoose.Types.ObjectId(userId) } },
      { new: true }
    )
      .lean<IChatroom>()
      .exec();
  },

  async removeParticipant(roomId: string, userId: string): Promise<IChatroom | null> {
    return ChatroomModel.findByIdAndUpdate(
      roomId,
      { $pull: { participants: new mongoose.Types.ObjectId(userId) } },
      { new: true }
    )
      .lean<IChatroom>()
      .exec();
  },

  async isParticipant(roomId: string, userId: string): Promise<boolean> {
    return !!(await ChatroomModel.exists({
      _id: roomId,
      participants: new mongoose.Types.ObjectId(userId),
    }));
  },

  async participantCount(roomId: string): Promise<number> {
    const room = await ChatroomModel.findById(roomId).select('participants').lean().exec();
    return (room?.participants as unknown[])?.length ?? 0;
  },
};
