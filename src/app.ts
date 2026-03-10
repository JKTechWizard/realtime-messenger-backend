import express from "express";
import cors from "cors";
import AppRouter from "./routes/auth.routes";
import MessageRouter from "./routes/message.routes";
import ChatRouter from "./routes/chatroom.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/", AppRouter);
app.use("/chatroom", ChatRouter);
app.use("/message", MessageRouter);

export default app;