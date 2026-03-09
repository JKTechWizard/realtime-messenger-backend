import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
export const connectDB = async () => {
 try {
    console.log(process.env.MONGO_URI,"mongoURI-----------")
   await mongoose.connect(process.env.MONGO_URI!);
   console.log("MongoDB connected");
 } catch (error) {
   console.error("DB connection error", error);
   process.exit(1);
 }
};