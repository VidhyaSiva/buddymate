/**
 * Example usage of the BuddyMate storage layer
 * This file demonstrates how to use the AsyncStorageWrapper, DataAccessLayer, and DataMigration
 */

import { asyncStorage } from './AsyncStorageWrapper';
import { dataAccessLayer } from './DataAccessLayer';
import { dataMigration } from './DataMigration';
import { UserProfile } from '../types/user';
import { DailyCheckIn, MedicationSchedule } from '../types/health';
import { Contact } from '../types/communication';

/**
 * Example: Initialize the app with migration support
 */
export async function initializeApp(): Promise<void> {
  console.log('Initializing BuddyMate app...');
  
  try {
    // Initialize app with current version and run any pending migrations
    await dataMigration.initializeApp('1.3.0');
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    throw error;
  }
}

/**
 * Example: Create and save a user profile
 */
export async function createUserProfile(): Promise<UserProfile> {
  const userProfile: UserProfile = {
    id: 'user-001',
    name: 'Margaret Johnson',
    dateOfBirth: new Date('1945-03-15'),
    profilePhoto: 'profile-photo-url',
    emergencyContacts: [],
    preferences: {
      fontSize: 'extra-large',
      highContrast: true,
      voiceEnabled: true,
      reminderFrequency: 'high',
      preferredContactMethod: 'call'
    },
    healthInfo: {
      conditions: ['hypertension', 'diabetes type 2'],
      allergies: ['penicillin', 'shellfish'],
      medications: ['lisinopril', 'metformin'],
      emergencyMedicalInfo: 'Diabetic, carries glucose tablets'
    },
    createdAt: new Date(),
    lastActive: new Date()
  };

  await dataAccessLayer.saveUserProfile(userProfile);
  console.log('User profile created and saved');
  return userProfile;
}

/**
 * Example: Add emergency contacts
 */
export async function addEmergencyContacts(): Promise<void> {
  const contacts: Contact[] = [
    {
      id: 'contact-001',
      name: 'Sarah Johnson',
      relationship: 'daughter',
      phoneNumber: '+1-555-0123',
      email: 'sarah.johnson@email.com',
      photo: 'sarah-photo-url',
      isEmergencyContact: true,
      canViewHealthStatus: true,
      createdAt: new Date()
    },
    {
      id: 'contact-002',
      name: 'Dr. Smith',
      relationship: 'primary care physician',
      phoneNumber: '+1-555-0456',
      email: 'dr.smith@clinic.com',
      isEmergencyContact: true,
      canViewHealthStatus: true,
      createdAt: new Date()
    }
  ];

  for (const contact of contacts) {
    await dataAccessLayer.addContact(contact);
  }
  
  console.log('Emergency contacts added');
}

/**
 * Example: Set up medication schedules
 */
export async function setupMedicationSchedules(): Promise<void> {
  const medications: MedicationSchedule[] = [
    {
      id: 'med-001',
      userId: 'user-001',
      medicationName: 'Lisinopril',
      dosage: '10mg',
      frequency: 'once daily',
      times: ['08:00'],
      photo: 'lisinopril-photo-url',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'med-002',
      userId: 'user-001',
      medicationName: 'Metformin',
      dosage: '500mg',
      frequency: 'twice daily',
      times: ['08:00', '20:00'],
      photo: 'metformin-photo-url',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  for (const medication of medications) {
    await dataAccessLayer.addMedicationSchedule(medication);
  }
  
  console.log('Medication schedules set up');
}

/**
 * Example: Record daily check-ins
 */
export async function recordDailyCheckIn(): Promise<void> {
  const checkIn: DailyCheckIn = {
    id: `checkin-${Date.now()}`,
    userId: 'user-001',
    date: new Date(),
    mood: 4, // Happy
    energyLevel: 3, // Moderate
    concerns: 'Feeling good today, took my morning walk',
    notes: 'Remembered to take all medications',
    completedAt: new Date()
  };

  await dataAccessLayer.addDailyCheckIn(checkIn);
  console.log('Daily check-in recorded');
}

/**
 * Example: Retrieve user data
 */
export async function getUserData(): Promise<void> {
  // Get user profile
  const profile = await dataAccessLayer.getUserProfile();
  console.log('User profile:', profile?.name);

  // Get recent check-ins
  const checkIns = await dataAccessLayer.getDailyCheckIns('user-001', 7);
  console.log(`Recent check-ins: ${checkIns.length} entries`);

  // Get medication schedules
  const medications = await dataAccessLayer.getMedicationSchedules('user-001');
  console.log(`Active medications: ${medications.filter(m => m.isActive).length}`);

  // Get contacts
  const contacts = await dataAccessLayer.getContacts();
  const emergencyContacts = contacts.filter(c => c.isEmergencyContact);
  console.log(`Emergency contacts: ${emergencyContacts.length}`);
}

/**
 * Example: Backup and restore data
 */
export async function backupAndRestore(): Promise<void> {
  console.log('Creating backup...');
  const backupKey = await dataMigration.createBackup();
  
  console.log('Listing available backups...');
  const backups = await dataMigration.listBackups();
  console.log(`Available backups: ${backups.length}`);
  
  // In a real scenario, you might restore from backup after data corruption
  // await dataMigration.restoreFromBackup(backupKey);
  
  console.log('Cleaning up old backups...');
  await dataMigration.cleanupBackups(5);
}

/**
 * Example: Direct storage operations with encryption
 */
export async function directStorageExample(): Promise<void> {
  // Store sensitive data with encryption
  await asyncStorage.setItem('sensitive-key', 'sensitive-value', true);
  const decryptedValue = await asyncStorage.getItem('sensitive-key', true);
  console.log('Decrypted value:', decryptedValue);

  // Store regular data without encryption
  await asyncStorage.setJSON('app-settings', { theme: 'dark', notifications: true });
  const settings = await asyncStorage.getJSON('app-settings');
  console.log('App settings:', settings);
}

/**
 * Run all examples
 */
export async function runAllExamples(): Promise<void> {
  try {
    console.log('=== BuddyMate Storage Layer Examples ===\n');
    
    await initializeApp();
    console.log('');
    
    await createUserProfile();
    await addEmergencyContacts();
    await setupMedicationSchedules();
    await recordDailyCheckIn();
    console.log('');
    
    await getUserData();
    console.log('');
    
    await backupAndRestore();
    console.log('');
    
    await directStorageExample();
    console.log('');
    
    console.log('=== All examples completed successfully ===');
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Uncomment to run examples
// runAllExamples();