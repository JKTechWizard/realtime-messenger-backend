import { Request, Response } from "express";
import mongoose from "mongoose";
import ChatroomModel from "../models/Chatroom.model";

/**
 * Create Chat Room
 */
export const createChatRoom = async (req: Request, res: Response) => {
  try {
    const { roomName } = req.body;

    const user = (req as any).user;
    const userId = user?.userId;

    if (!roomName) {
      return res.status(400).json({
        success: false,
        message: "Room name is required",
      });
    }

    const room = await ChatroomModel.create({
      roomName,
      createdBy: userId,
      participants: [userId],
    });

    return res.status(201).json({
      success: true,
      message: "Chat room created successfully",
      data: room,
    });
  } catch (error) {
    console.error("Create Chat Room Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create chat room",
    });
  }
};

/**
 * Get All Chat Rooms
 */
export const getChatRooms = async (req: Request, res: Response) => {
  try {
    const chatRooms = await ChatroomModel.find()
      .populate("createdBy", "firstName lastName")
      .populate("participants", "firstName lastName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: chatRooms.length,
      data: chatRooms,
    });
  } catch (error) {
    console.error("Get Chat Rooms Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat rooms",
    });
  }
};

/**
 * Get Single Chat Room
 */
export const getChatRoomById = async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat room ID",
      });
    }

    const chatRoom = await ChatroomModel.findById(id)
      .populate("createdBy", "firstName lastName")
      .populate("participants", "firstName lastName");

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: chatRoom,
    });
  } catch (error) {
    console.error("Get Chat Room Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat room",
    });
  }
};

/**
 * Join Chat Room
 */

export const joinChatRoom = async (req: Request, res: Response) => {
  try {
    const roomId = typeof req.params.roomId === "string" ? req.params.roomId : req.params.roomId?.[0];
    const user = (req as any).user;
    const userId = user?.userId;

    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room id",
      });
    }

    const chatRoom = await ChatroomModel.findById(roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    // Check if user already joined
   const updatedRoom = await ChatroomModel.findOneAndUpdate(
     { _id: roomId, participants: { $ne: userId } },
     { $addToSet: { participants: userId } },
     { new: true },
   );

   if (!updatedRoom) {
     return res.status(400).json({
       success: false,
       message: "User already joined this room",
     });
   }

    await ChatroomModel.findByIdAndUpdate(roomId, {
      $addToSet: { participants: userId },
    });

    return res.status(200).json({
      success: true,
      message: "Successfully joined the chat room",
    });
  } catch (error) {
    console.error("Join Chat Room Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to join chat room",
    });
  }
};
