// src/features/auth/types/index.ts

import mongoose from "mongoose";

export interface SignupDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export interface AuthTokenResponse {
  user: UserResponse;
  token: string;
}

export interface IUserLean {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}
