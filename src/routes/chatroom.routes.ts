import { Router } from "express";

import { createChatRoom, getChatRoomById, getChatRooms, joinChatRoom } from "../controllers/chatroom.controller";
import { authMiddleware } from "../middleware/auth.middleware";
const router = Router();


router.post("/", authMiddleware, createChatRoom);
router.get("/", authMiddleware, getChatRooms);

router.post("/:roomId/join", authMiddleware, joinChatRoom);

router.get("/:id", authMiddleware, getChatRoomById);

export default router;





