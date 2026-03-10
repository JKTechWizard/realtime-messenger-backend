import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { createMessage } from "../services/message.service";

export const initializeSocket = (server: any) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };

      (socket as any).user = decoded;

      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;

    console.log("User connected:", user.userId);

    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
    });

    socket.on("send_message", async ({ roomId, content }) => {
      const senderId = user.userId;

      const message = await createMessage(senderId, roomId, content);

      io.to(roomId).emit("receive_message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};
