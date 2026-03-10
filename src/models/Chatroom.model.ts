 import mongoose from "mongoose";
const chatRoomSchema = new mongoose.Schema(
  {
    roomName:{
        type: String,
        required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("ChatRoom", chatRoomSchema);
