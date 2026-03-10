// src/features/chatrooms/types/index.ts

export interface CreateChatroomDto {
  roomName: string;
  description?: string;
}

export interface ChatroomResponse {
  roomId: string;
  roomName: string;
  description: string | null;
  createdBy: string;
  participants: string[];
  createdAt: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    senderName: string;
  };
}
