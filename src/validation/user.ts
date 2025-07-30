import { z } from 'zod';

export const EmergencyContactSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phoneNumber: z.string().regex(/^\+?[\d\s\-\(\)\.]+$/, 'Invalid phone number format'),
  email: z.string().email().optional(),
  photo: z.string().url().optional(),
  isPrimary: z.boolean(),
});

export const UserPreferencesSchema = z.object({
  fontSize: z.enum(['large', 'extra-large']),
  highContrast: z.boolean(),
  voiceEnabled: z.boolean(),
  reminderFrequency: z.enum(['low', 'normal', 'high']),
  preferredContactMethod: z.enum(['call', 'video', 'message']),
});

export const HealthInformationSchema = z.object({
  conditions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  emergencyMedicalInfo: z.string().optional(),
});

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  dateOfBirth: z.date(),
  profilePhoto: z.string().url().optional(),
  emergencyContacts: z.array(EmergencyContactSchema),
  preferences: UserPreferencesSchema,
  healthInfo: HealthInformationSchema,
  createdAt: z.date(),
  lastActive: z.date(),
});

export const validateUserProfile = (data: unknown) => {
  return UserProfileSchema.parse(data);
};

export const validateEmergencyContact = (data: unknown) => {
  return EmergencyContactSchema.parse(data);
};

export const validateUserPreferences = (data: unknown) => {
  return UserPreferencesSchema.parse(data);
};