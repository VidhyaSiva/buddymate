export interface UserProfile {
  id: string;
  name: string;
  dateOfBirth: Date;
  profilePhoto?: string;
  emergencyContacts: EmergencyContact[];
  preferences: UserPreferences;
  healthInfo: HealthInformation;
  createdAt: Date;
  lastActive: Date;
}

export interface UserPreferences {
  fontSize: 'large' | 'extra-large';
  highContrast: boolean;
  voiceEnabled: boolean;
  reminderFrequency: 'low' | 'normal' | 'high';
  preferredContactMethod: 'call' | 'video' | 'message';
}

export interface HealthInformation {
  conditions?: string[];
  allergies?: string[];
  medications?: string[];
  emergencyMedicalInfo?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  photo?: string;
  isPrimary: boolean;
}