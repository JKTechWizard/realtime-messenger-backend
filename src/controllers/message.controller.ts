import { Response } from "express";
import * as messageService from "../services/message.service";
import { AuthRequest } from "../middleware/auth.middleware";


export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.user?.userId;
    const { roomId, content } = req.body;

    if (!senderId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const message = await messageService.createMessage(
      senderId,
      roomId,
      content,
    );

    res.status(201).json({
      success: true,
      message: "Message sent",
      data: message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await messageService.getRoomMessages(
      Array.isArray(roomId) ? roomId[0] : roomId,
      Number(page),
      Number(limit),
    );

    res.json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
