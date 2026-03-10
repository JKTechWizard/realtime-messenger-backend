// src/features/chat/models/Message.model.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

// ── Attachment subdocument — ready for future use ─────────
// Adding new attachment types (video, audio, etc.) requires zero migration.
// Existing messages without attachments simply have an empty array.

export interface IAttachment {
  type: 'image' | 'video' | 'file' | 'audio';
  url: string;
  name: string;
  size: number;       // bytes
  mimeType: string;
  // Image / video specific
  width?: number;
  height?: number;
  // Audio / video specific
  duration?: number;  // seconds
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    type:     { type: String, enum: ['image', 'video', 'file', 'audio'], required: true },
    url:      { type: String, required: true },
    name:     { type: String, required: true },
    size:     { type: Number, required: true },
    mimeType: { type: String, required: true },
    width:    { type: Number },
    height:   { type: Number },
    duration: { type: Number },
  },
  { _id: false } // subdocuments don't need their own _id
);

// ── Reaction subdocument — also ready for future use ──────

export interface IReaction {
  emoji: string;
  userId: mongoose.Types.ObjectId;
}

const ReactionSchema = new Schema<IReaction>(
  {
    emoji:  { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { _id: false }
);

// ── Main message interface ────────────────────────────────

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  // Denormalized for fast reads — no JOIN needed when listing messages
  senderName: string;
  content: string;
  attachments: IAttachment[];
  reactions: IReaction[];
  // For threaded replies (future)
  replyTo: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ────────────────────────────────────────────────

const MessageSchema = new Schema<IMessage>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Chatroom',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    reactions: {
      type: [ReactionSchema],
      default: [],
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index for efficient paginated message fetching per room
MessageSchema.index({ roomId: 1, createdAt: 1 });
MessageSchema.index({ senderId: 1 });

// ── Model ─────────────────────────────────────────────────

const MessageModel: Model<IMessage> = mongoose.model<IMessage>('Message', MessageSchema);
export default MessageModel;
