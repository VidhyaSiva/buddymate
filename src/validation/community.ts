import { z } from 'zod';

export const CommunityResourceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['healthcare', 'transportation', 'social', 'emergency']),
  description: z.string().min(1, 'Description is required'),
  address: z.string().min(1, 'Address is required'),
  phoneNumber: z.string().regex(/^\+?[\d\s\-\(\)\.]+$/, 'Invalid phone number format'),
  website: z.string().url().optional(),
  hours: z.string().min(1, 'Hours are required'),
  distance: z.number().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  isVerified: z.boolean(),
});

export const ActivitySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['exercise', 'social', 'educational', 'creative']),
  difficulty: z.enum(['easy', 'moderate']),
  estimatedDuration: z.number().int().min(1),
  instructions: z.array(z.string().min(1)),
  isCompleted: z.boolean(),
  completedAt: z.date().optional(),
  userId: z.string().uuid(),
});

export const CommunityEventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  startTime: z.date(),
  endTime: z.date(),
  category: z.enum(['social', 'educational', 'health', 'recreational']),
  maxParticipants: z.number().int().min(1).optional(),
  currentParticipants: z.number().int().min(0),
  isRegistered: z.boolean(),
});

export const CommunitySchema = z.object({
  resources: z.array(CommunityResourceSchema),
  activities: z.array(ActivitySchema),
  events: z.array(CommunityEventSchema),
});

export const validateCommunityResource = (data: unknown) => {
  return CommunityResourceSchema.parse(data);
};

export const validateActivity = (data: unknown) => {
  return ActivitySchema.parse(data);
};

export const validateCommunityEvent = (data: unknown) => {
  return CommunityEventSchema.parse(data);
};

export const validateCommunity = (data: unknown) => {
  return CommunitySchema.parse(data);
};