export interface DailyCheckIn {
  id: string;
  userId: string;
  date: Date;
  mood: 1 | 2 | 3 | 4 | 5; // 1=very sad, 5=very happy
  energyLevel: 1 | 2 | 3 | 4 | 5;
  concerns?: string;
  notes?: string;
  completedAt: Date;
}

export interface MedicationSchedule {
  id: string;
  userId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  times: string[]; // ["08:00", "20:00"]
  photo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationLog {
  id: string;
  scheduleId: string;
  scheduledTime: Date;
  takenAt?: Date;
  status: 'taken' | 'missed' | 'skipped';
  notes?: string;
}

export interface HealthData {
  dailyCheckIns: DailyCheckIn[];
  medicationSchedules: MedicationSchedule[];
  medicationLogs: MedicationLog[];
}