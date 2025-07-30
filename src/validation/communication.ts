import { z } from 'zod';

export const ContactSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phoneNumber: z.string().regex(/^\+?[\d\s\-\(\)\.]+$/, 'Invalid phone number format'),
  email: z.string().email().optional(),
  photo: z.string().url().optional(),
  isEmergencyContact: z.boolean(),
  canViewHealthStatus: z.boolean(),
  createdAt: z.date(),
  lastContactedAt: z.date().optional(),
});

export const MessageSchema = z.object({
  id: z.string().uuid(),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  content: z.string().min(1, 'Message content is required'),
  type: z.enum(['text', 'photo', 'video', 'voice']),
  sentAt: z.date(),
  readAt: z.date().optional(),
  attachmentUrl: z.string().url().optional(),
});

export const VideoCallSchema = z.object({
  id: z.string().uuid(),
  initiatorId: z.string().uuid(),
  recipientId: z.string().uuid(),
  startedAt: z.date(),
  endedAt: z.date().optional(),
  duration: z.number().int().min(0).optional(),
  status: z.enum(['initiated', 'connected', 'ended', 'missed']),
});

export const CommunicationSchema = z.object({
  contacts: z.array(ContactSchema),
  messages: z.array(MessageSchema),
  videoCalls: z.array(VideoCallSchema),
});

export const validateContact = (data: unknown) => {
  return ContactSchema.parse(data);
};

export const validateMessage = (data: unknown) => {
  return MessageSchema.parse(data);
};

export const validateVideoCall = (data: unknown) => {
  return VideoCallSchema.parse(data);
};

export const validateCommunication = (data: unknown) => {
  return CommunicationSchema.parse(data);
};