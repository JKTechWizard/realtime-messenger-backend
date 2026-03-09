import express from "express";
import cors from "cors";
import  AppRouter from "./routes/auth.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/", AppRouter);

export default app;