
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'admin' | 'system' | 'telegram';
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface ChatSession {
  id: string;
  userId?: string;
  userName: string;
  userContact?: string;
  status: 'active' | 'closed' | 'pending';
  lastActivity: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isMinimized: boolean;
}
