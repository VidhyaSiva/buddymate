import { seedCommunicationData, seedHealthData, seedActivitiesData, seedCommunityData } from './seedData';

/**
 * Initialize the app with sample data
 * This should be called when the app starts
 */
export const initializeApp = async () => {
  console.log('Initializing app...');
  
  try {
    // Seed communication data (contacts, messages)
    await seedCommunicationData();
    
    // Seed health data (medication schedules, logs)
    await seedHealthData();
    
    // Seed activities data (routines, achievements, activities)
    await seedActivitiesData();
    
    // Seed community data (resources, events)
    await seedCommunityData();
    
    console.log('App initialization complete');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
};