import { Router } from "express";
import UserModel from "../models/User.model";
import { login, signup } from "../controllers/auth.controller";
const router = Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.post("/signup", signup);

router.post("/login",login);

router.get("/users", async (req, res) => {
  const users = await UserModel.find();
  res.json(users);
});

export default router;
