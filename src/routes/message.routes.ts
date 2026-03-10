import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/message.controller";
import { authMiddleware } from "../middleware/auth.middleware";


const router = Router();

/*
POST /api/messages
Send a new message
*/
router.post("/", authMiddleware, sendMessage);

/*
GET /api/messages/:roomId
Fetch chat history
*/
router.get("/:roomId", authMiddleware, getMessages);

export default router;
