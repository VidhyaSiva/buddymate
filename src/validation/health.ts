import { z } from 'zod';

export const DailyCheckInSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  date: z.date(),
  mood: z.number().int().min(1).max(5),
  energyLevel: z.number().int().min(1).max(5),
  concerns: z.string().optional(),
  notes: z.string().optional(),
  completedAt: z.date(),
});

export const MedicationScheduleSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  medicationName: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  times: z.array(z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')),
  photo: z.string().url().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const MedicationLogSchema = z.object({
  id: z.string().uuid(),
  scheduleId: z.string().uuid(),
  scheduledTime: z.date(),
  takenAt: z.date().optional(),
  status: z.enum(['taken', 'missed', 'skipped']),
  notes: z.string().optional(),
});

export const HealthDataSchema = z.object({
  dailyCheckIns: z.array(DailyCheckInSchema),
  medicationSchedules: z.array(MedicationScheduleSchema),
  medicationLogs: z.array(MedicationLogSchema),
});

export const validateDailyCheckIn = (data: unknown) => {
  return DailyCheckInSchema.parse(data);
};

export const validateMedicationSchedule = (data: unknown) => {
  return MedicationScheduleSchema.parse(data);
};

export const validateMedicationLog = (data: unknown) => {
  return MedicationLogSchema.parse(data);
};

export const validateHealthData = (data: unknown) => {
  return HealthDataSchema.parse(data);
};