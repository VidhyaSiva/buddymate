import { medicationReminderService } from '../services/MedicationReminderService';
import { dataAccessLayer } from '../storage/DataAccessLayer';
import { MedicationSchedule } from '../types/health';

/**
 * Clean up duplicate medication entries
 * Keeps the most recent entry for each medication name and deactivates duplicates
 */
export const cleanupDuplicateMedications = async (userId: string): Promise<{
  totalMedications: number;
  duplicatesRemoved: number;
  activeMedications: number;
}> => {
  try {
    console.log('Starting duplicate medication cleanup...');
    
    // Get all medication schedules
    const schedules = await medicationReminderService.getMedicationSchedules(userId);
    console.log('Total schedules found:', schedules.length);
    
    // Group by medication name
    const medicationGroups = new Map<string, MedicationSchedule[]>();
    
    schedules.forEach(schedule => {
      const key = schedule.medicationName.toLowerCase().trim();
      if (!medicationGroups.has(key)) {
        medicationGroups.set(key, []);
      }
      medicationGroups.get(key)!.push(schedule);
    });
    
    console.log('Medication groups:', Array.from(medicationGroups.entries()).map(([name, group]) => ({ name, count: group.length })));
    
    let duplicatesRemoved = 0;
    let activeMedications = 0;
    
    // Process each group
    for (const [medicationName, group] of medicationGroups) {
      if (group.length > 1) {
        console.log(`Found ${group.length} entries for "${medicationName}"`);
        
        // Sort by creation date (newest first)
        group.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Keep the first (most recent) one active, deactivate the rest
        const [keepActive, ...duplicates] = group;
        
        console.log(`Keeping most recent entry active, deactivating ${duplicates.length} duplicates`);
        
        // Delete duplicates
        for (const duplicate of duplicates) {
          try {
            const result = await medicationReminderService.deleteMedicationSchedule(duplicate.id);
            console.log(`Deleted ${duplicate.medicationName} (${duplicate.id}):`, result);
            if (result) {
              duplicatesRemoved++;
            }
          } catch (deleteError) {
            console.error(`Failed to delete ${duplicate.medicationName}:`, deleteError);
          }
        }
        
        activeMedications++;
      } else {
        // Single entry, keep it active
        activeMedications++;
      }
    }
    
    console.log(`Cleanup complete: ${duplicatesRemoved} duplicates removed, ${activeMedications} active medications`);
    
    return {
      totalMedications: schedules.length,
      duplicatesRemoved,
      activeMedications
    };
  } catch (error) {
    console.error('Failed to cleanup duplicate medications:', error);
    throw error;
  }
};

/**
 * Get a summary of medication duplicates
 */
export const getDuplicateSummary = async (userId: string): Promise<{
  totalMedications: number;
  uniqueMedications: number;
  duplicates: number;
  duplicateGroups: Array<{
    medicationName: string;
    count: number;
    entries: MedicationSchedule[];
  }>;
}> => {
  try {
    const schedules = await medicationReminderService.getMedicationSchedules(userId);
    
    // Group by medication name
    const medicationGroups = new Map<string, MedicationSchedule[]>();
    
    schedules.forEach(schedule => {
      const key = schedule.medicationName.toLowerCase().trim();
      if (!medicationGroups.has(key)) {
        medicationGroups.set(key, []);
      }
      medicationGroups.get(key)!.push(schedule);
    });
    
    const duplicateGroups = Array.from(medicationGroups.entries())
      .filter(([_, group]) => group.length > 1)
      .map(([medicationName, group]) => ({
        medicationName,
        count: group.length,
        entries: group.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }));
    
    const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + group.count - 1, 0);
    
    return {
      totalMedications: schedules.length,
      uniqueMedications: medicationGroups.size,
      duplicates: totalDuplicates,
      duplicateGroups
    };
  } catch (error) {
    console.error('Failed to get duplicate summary:', error);
    throw error;
  }
}; 