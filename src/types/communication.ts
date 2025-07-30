export interface Contact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  photo?: string;
  isEmergencyContact: boolean;
  canViewHealthStatus: boolean;
  createdAt: Date;
  lastContactedAt?: Date;
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  type: 'text' | 'photo' | 'video' | 'voice';
  sentAt: Date;
  readAt?: Date;
  attachmentUrl?: string;
}

export interface VideoCall {
  id: string;
  initiatorId: string;
  recipientId: string;
  startedAt: Date;
  endedAt?: Date;
  duration?: number; // in seconds
  status: 'initiated' | 'connected' | 'ended' | 'missed';
}

export interface Communication {
  contacts: Contact[];
  messages: Message[];
  videoCalls: VideoCall[];
}