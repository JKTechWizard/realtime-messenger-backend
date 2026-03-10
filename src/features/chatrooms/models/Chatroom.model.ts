// src/features/chatrooms/models/Chatroom.model.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

// ── Interface ─────────────────────────────────────────────

export interface IChatroom extends Document {
  _id: mongoose.Types.ObjectId;
  roomName: string;
  description: string | null;
  createdBy: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ────────────────────────────────────────────────

const ChatroomSchema = new Schema<IChatroom>(
  {
    roomName: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      minlength: [3, 'Room name must be at least 3 characters'],
      maxlength: [60, 'Room name cannot exceed 60 characters'],
    },
    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Participants stored as an array of ObjectIds on the document.
    // This is idiomatic MongoDB — avoids a separate join collection.
    // For rooms with thousands of participants a separate collection
    // would be more appropriate, but for chat rooms this is perfectly fine.
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Case-insensitive index so "General" and "general" are treated as the same room
ChatroomSchema.index({ roomName: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
ChatroomSchema.index({ createdBy: 1 });
ChatroomSchema.index({ participants: 1 });

// ── Model ─────────────────────────────────────────────────

const ChatroomModel: Model<IChatroom> = mongoose.model<IChatroom>('Chatroom', ChatroomSchema);
export default ChatroomModel;
