import express from "express";
import cors from "cors";
import  AppRouter from "./routes/auth.routes";

const app = express();

app.use(cors());
app.use("/", AppRouter);
app.use(express.json());

export default app;