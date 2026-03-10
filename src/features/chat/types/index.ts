// src/features/chat/types/index.ts

export interface MessageResponse {
  messageId:  string;
  senderId:   string;
  senderName: string;
  roomId:     string;
  content:    string;
  timestamp:  string;
}

export interface SendMessageDto {
  roomId:  string;
  content: string;
}

// ── Socket event payloads ─────────────────────────────────

export interface JoinRoomPayload  { roomId: string; }
export interface LeaveRoomPayload { roomId: string; }
export interface SendMessagePayload { roomId: string; content: string; }
export interface TypingPayload { roomId: string; userId: string; userName: string; }
