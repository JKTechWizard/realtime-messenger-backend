// src/features/auth/models/User.model.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

// ── Interface (TypeScript shape) ─────────────────────────

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Must be a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      // Never return password in queries by default
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for fast email lookups
UserSchema.index({ email: 1 });

// ── Model ─────────────────────────────────────────────────

const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default UserModel;
