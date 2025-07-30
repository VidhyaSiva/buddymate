import { UserProfile, EmergencyContact, UserPreferences, HealthInformation } from '../types/user';

export const createMockEmergencyContact = (overrides?: Partial<EmergencyContact>): EmergencyContact => ({
  id: crypto.randomUUID(),
  name: 'John Doe',
  relationship: 'Son',
  phoneNumber: '+1-555-123-4567',
  email: 'john.doe@email.com',
  photo: 'https://example.com/photo.jpg',
  isPrimary: true,
  ...overrides,
});

export const createMockUserPreferences = (overrides?: Partial<UserPreferences>): UserPreferences => ({
  fontSize: 'large',
  highContrast: false,
  voiceEnabled: true,
  reminderFrequency: 'normal',
  preferredContactMethod: 'call',
  ...overrides,
});

export const createMockHealthInformation = (overrides?: Partial<HealthInformation>): HealthInformation => ({
  conditions: ['Hypertension', 'Diabetes Type 2'],
  allergies: ['Penicillin'],
  medications: ['Metformin', 'Lisinopril'],
  emergencyMedicalInfo: 'Diabetic, carries glucose tablets',
  ...overrides,
});

export const createMockUserProfile = (overrides?: Partial<UserProfile>): UserProfile => ({
  id: crypto.randomUUID(),
  name: 'Jane Smith',
  dateOfBirth: new Date('1945-06-15'),
  profilePhoto: 'https://example.com/profile.jpg',
  emergencyContacts: [createMockEmergencyContact()],
  preferences: createMockUserPreferences(),
  healthInfo: createMockHealthInformation(),
  createdAt: new Date('2024-01-01'),
  lastActive: new Date(),
  ...overrides,
});

export const createMockUserProfiles = (count: number): UserProfile[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockUserProfile({
      name: `User ${index + 1}`,
      id: crypto.randomUUID(),
    })
  );
};