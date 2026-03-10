import express from "express";
import cors from "cors";
import  AppRouter from "./routes/auth.routes";
import ChatRouter from "./routes/chatroom.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/", AppRouter);
app.use("/chat",ChatRouter)

export default app;