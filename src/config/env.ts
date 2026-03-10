import dotenv from "dotenv";
dotenv.config()

export const env = {
  jwtSecret: (process.env.JWT_SECRET as string),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN as string,
};
