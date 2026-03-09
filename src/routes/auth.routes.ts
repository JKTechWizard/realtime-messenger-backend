import { Router } from "express";
import bcrypt from "bcrypt";
import UserModel from "../models/User.model";
const router = Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
});

// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await UserModel.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     } 
//    const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }   
//     res.json({ message: "Login successful", user });
//   } catch (error) {
//     res.status(500).json({ message: "Error logging in", error });
//   }
// });



router.get("/users", async (req, res) => {
  const users = await UserModel.find();
  res.json(users);
});

export default router;
