import { MessageModel } from "../models/message.model";
import mongoose from "mongoose";

export const createMessage = async (
  senderId: string,
  roomId: string,
  content: string,
) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new Error("Invalid roomId");
    }

    if (!content || content.trim().length === 0) {
      throw new Error("Message content cannot be empty");
    }

    const message = await MessageModel.create({
      senderId,
      roomId,
      content,
    });

    return message;
  } catch (error: any) {
    throw new Error(`Message creation failed: ${error.message}`);
  }
};

export const getRoomMessages = async (roomId: string, page = 1, limit = 50) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new Error("Invalid roomId");
    }

    const skip = (page - 1) * limit;

    const messages = await MessageModel.find({ roomId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("senderId", "firstName lastName");

    return messages;
  } catch (error: any) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }
};
