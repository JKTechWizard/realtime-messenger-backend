import bcrypt from "bcrypt";
import { signupSchema, loginSchema } from "../validators/auth.validators";
import { env } from "../config/env";
import UserModel from "../models/User.model";
import jwt, { SignOptions } from "jsonwebtoken";

 export const signup = async (req: any, res: any) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const { firstName, lastName, email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
  
    const token = jwt.sign({ userId: user._id.toString() }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
    });

    res.status(201).json({
      message: "User created",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error });
  }
};

 export const login = async (req: any, res: any) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const { email, password } = req.body;

    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id.toString() }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
    });

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};


