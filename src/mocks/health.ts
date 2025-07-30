import { DailyCheckIn, MedicationSchedule, MedicationLog, HealthData } from '../types/health';

export const createMockDailyCheckIn = (overrides?: Partial<DailyCheckIn>): DailyCheckIn => ({
  id: crypto.randomUUID(),
  userId: crypto.randomUUID(),
  date: new Date(),
  mood: 4,
  energyLevel: 3,
  concerns: 'Feeling a bit tired today',
  notes: 'Had a good walk in the morning',
  completedAt: new Date(),
  ...overrides,
});

export const createMockMedicationSchedule = (overrides?: Partial<MedicationSchedule>): MedicationSchedule => ({
  id: crypto.randomUUID(),
  userId: crypto.randomUUID(),
  medicationName: 'Metformin',
  dosage: '500mg',
  frequency: 'Twice daily',
  times: ['08:00', '20:00'],
  photo: 'https://example.com/medication.jpg',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockMedicationLog = (overrides?: Partial<MedicationLog>): MedicationLog => ({
  id: crypto.randomUUID(),
  scheduleId: crypto.randomUUID(),
  scheduledTime: new Date(),
  takenAt: new Date(),
  status: 'taken',
  notes: 'Taken with breakfast',
  ...overrides,
});

export const createMockHealthData = (overrides?: Partial<HealthData>): HealthData => ({
  dailyCheckIns: [createMockDailyCheckIn()],
  medicationSchedules: [createMockMedicationSchedule()],
  medicationLogs: [createMockMedicationLog()],
  ...overrides,
});

export const createMockDailyCheckIns = (count: number, userId: string): DailyCheckIn[] => {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    return createMockDailyCheckIn({
      userId,
      date,
      mood: Math.floor(Math.random() * 5) + 1 as 1 | 2 | 3 | 4 | 5,
      energyLevel: Math.floor(Math.random() * 5) + 1 as 1 | 2 | 3 | 4 | 5,
    });
  });
};

export const createMockMedicationSchedules = (count: number, userId: string): MedicationSchedule[] => {
  const medications = ['Metformin', 'Lisinopril', 'Aspirin', 'Vitamin D', 'Omega-3'];
  return Array.from({ length: count }, (_, index) => 
    createMockMedicationSchedule({
      userId,
      medicationName: medications[index % medications.length],
      dosage: `${(index + 1) * 100}mg`,
    })
  );
};