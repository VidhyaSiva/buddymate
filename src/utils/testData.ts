import { medicationReminderService } from '../services/MedicationReminderService';

/**
 * Add test medications for testing functionality
 */
export const addTestMedications = async (userId: string): Promise<void> => {
  try {
    console.log('Adding test medications...');
    
    // Add some test medications
    const testMedications = [
      {
        medicationName: 'Aspirin',
        dosage: '100mg',
        frequency: 'Daily',
        times: ['08:00'],
        isCritical: false
      },
      {
        medicationName: 'Vitamin D',
        dosage: '1000 IU',
        frequency: 'Daily',
        times: ['09:00'],
        isCritical: false
      },
      {
        medicationName: 'Blood Pressure Med',
        dosage: '10mg',
        frequency: 'Twice Daily',
        times: ['08:00', '20:00'],
        isCritical: true
      }
    ];
    
    for (const med of testMedications) {
      try {
        await medicationReminderService.createMedicationSchedule(
          userId,
          med.medicationName,
          med.dosage,
          med.frequency,
          med.times,
          undefined,
          med.isCritical
        );
        console.log(`Added test medication: ${med.medicationName}`);
      } catch (error) {
        console.error(`Failed to add ${med.medicationName}:`, error);
      }
    }
    
    console.log('Test medications added successfully');
  } catch (error) {
    console.error('Failed to add test medications:', error);
    throw error;
  }
};

/**
 * Clear all test medications
 */
export const clearTestMedications = async (userId: string): Promise<void> => {
  try {
    console.log('Clearing test medications...');
    
    const schedules = await medicationReminderService.getMedicationSchedules(userId);
    console.log(`Found ${schedules.length} medications to clear`);
    
    let deletedCount = 0;
    for (const schedule of schedules) {
      try {
        console.log(`Attempting to delete: ${schedule.medicationName} (${schedule.id})`);
        const result = await medicationReminderService.deleteMedicationSchedule(schedule.id);
        if (result) {
          console.log(`Successfully deleted: ${schedule.medicationName}`);
          deletedCount++;
        } else {
          console.log(`Failed to delete: ${schedule.medicationName}`);
        }
      } catch (error) {
        console.error(`Failed to remove ${schedule.medicationName}:`, error);
      }
    }
    
    console.log(`Test medications cleared successfully. Deleted ${deletedCount} out of ${schedules.length} medications.`);
  } catch (error) {
    console.error('Failed to clear test medications:', error);
    throw error;
  }
};

/**
 * Clear all data from storage (nuclear option)
 */
export const clearAllStorageData = async (): Promise<void> => {
  try {
    console.log('Clearing all storage data...');
    
    // Import dataAccessLayer here to avoid circular dependencies
    const { dataAccessLayer } = await import('../storage/DataAccessLayer');
    
    // Clear all data
    await dataAccessLayer.clearAllData();
    console.log('All storage data cleared successfully');
  } catch (error) {
    console.error('Failed to clear all storage data:', error);
    throw error;
  }
}; 