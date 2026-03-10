// src/shared/database/seed.ts
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from './connection';
import UserModel from '../../features/auth/models/User.model';
import ChatroomModel from '../../features/chatrooms/models/Chatroom.model';
import MessageModel from '../../features/chat/models/Message.model';
import config from '../config/env';

async function seed(): Promise<void> {
  console.log('🌱  Seeding MongoDB...');
  await connectDB();

  // ── Wipe existing seed data ───────────────────────────────
  await Promise.all([
    UserModel.deleteMany({ email: { $in: ['alice@demo.com', 'bob@demo.com'] } }),
    ChatroomModel.deleteMany({ roomName: { $in: ['general', 'design-team'] } }),
  ]);

  // ── Users ─────────────────────────────────────────────────
  const hash = await bcrypt.hash('Password123!', config.bcrypt.rounds);

  const [alice, bob] = await UserModel.insertMany([
    { firstName: 'Alice', lastName: 'Smith', email: 'alice@demo.com', password: hash },
    { firstName: 'Bob',   lastName: 'Jones', email: 'bob@demo.com',   password: hash },
  ]);

  // ── Chatrooms ─────────────────────────────────────────────
  const [general, design] = await ChatroomModel.insertMany([
    {
      roomName:     'general',
      description:  'General discussion for everyone',
      createdBy:    alice._id,
      participants: [alice._id, bob._id],
    },
    {
      roomName:     'design-team',
      description:  'Design discussions and mockup reviews',
      createdBy:    bob._id,
      participants: [bob._id],
    },
  ]);

  // ── Seed messages ─────────────────────────────────────────
  await MessageModel.insertMany([
    {
      roomId:     general._id,
      senderId:   alice._id,
      senderName: 'Alice Smith',
      content:    'Hey everyone, welcome to the general room! 👋',
    },
    {
      roomId:     general._id,
      senderId:   bob._id,
      senderName: 'Bob Jones',
      content:    'Thanks Alice! Great to be here.',
    },
    {
      roomId:     design._id,
      senderId:   bob._id,
      senderName: 'Bob Jones',
      content:    'First design review is scheduled for Friday.',
    },
  ]);

  console.log('✅  Seed complete!');
  console.log('   alice@demo.com  /  Password123!');
  console.log('   bob@demo.com    /  Password123!');
  console.log(`   Rooms: ${general.roomName}, ${design.roomName}`);
}

seed()
  .catch((err) => { console.error('Seed failed:', err); process.exit(1); })
  .finally(() => disconnectDB());
