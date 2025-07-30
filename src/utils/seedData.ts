import { DataAccessLayer } from '../storage/DataAccessLayer';
import { createMockContacts, createMockMessages } from '../mocks/communication';
import { MedicationSchedule, MedicationLog } from '../types/health';
import { 
  createMockRoutineItems, 
  createMockAchievements, 
  createMockActivities 
} from '../mocks/activities';
import { 
  createMockCommunityResources, 
  createMockCommunityEvent 
} from '../mocks/community';

// Create mock medication schedules
const createMockMedicationSchedules = (userId: string): MedicationSchedule[] => {
  const now = new Date();
  
  return [
    {
      id: 'med-schedule-1',
      userId,
      medicationName: 'Lisinopril',
      dosage: '10mg',
      frequency: 'daily',
      times: ['08:00', '20:00'],
      photo: undefined,
      isActive: true,
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'med-schedule-2',
      userId,
      medicationName: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'daily',
      times: ['08:00'],
      photo: undefined,
      isActive: true,
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      updatedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'med-schedule-3',
      userId,
      medicationName: 'Aspirin',
      dosage: '81mg',
      frequency: 'daily',
      times: ['12:00'],
      photo: undefined,
      isActive: true,
      createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      updatedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
    },
  ];
};

// Create mock medication logs
const createMockMedicationLogs = (schedules: MedicationSchedule[]): MedicationLog[] => {
  const logs: MedicationLog[] = [];
  const now = new Date();
  
  // Create logs for the past 7 days
  for (let i = 0; i < 7; i++) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    
    schedules.forEach(schedule => {
      schedule.times.forEach(timeStr => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const scheduledTime = new Date(day);
        scheduledTime.setHours(hours, minutes, 0, 0);
        
        // Only create logs for times in the past
        if (scheduledTime < now) {
          // Randomly determine if medication was taken, missed, or skipped
          const rand = Math.random();
          let status: 'taken' | 'missed' | 'skipped';
          let takenAt: Date | undefined;
          
          if (rand < 0.8) { // 80% chance of taking medication
            status = 'taken';
            takenAt = new Date(scheduledTime.getTime() + Math.floor(Math.random() * 30) * 60 * 1000); // 0-30 minutes after scheduled time
          } else if (rand < 0.9) { // 10% chance of missing medication
            status = 'missed';
          } else { // 10% chance of skipping medication
            status = 'skipped';
          }
          
          logs.push({
            id: `log-${schedule.id}-${scheduledTime.toISOString()}`,
            scheduleId: schedule.id,
            scheduledTime,
            takenAt,
            status,
            notes: status === 'taken' ? 'Taken as scheduled' : 
                   status === 'skipped' ? 'Skipped - feeling unwell' : undefined,
          });
        }
      });
    });
  }
  
  return logs;
};

export const seedCommunicationData = async () => {
  console.log('Starting to seed communication data...');
  const dataAccess = new DataAccessLayer();
  
  try {
    // Check if data already exists
    console.log('Checking for existing data...');
    const existingData = await dataAccess.getCommunicationData();
    console.log('Existing data:', existingData);
    
    if (existingData && existingData.contacts.length > 0) {
      console.log('Communication data already exists, skipping seed');
      return;
    }

    // Create mock contacts
    console.log('Creating mock contacts...');
    const contacts = createMockContacts(5);
    console.log('Created contacts:', contacts);
    
    // Create mock messages for the first contact
    const messages = contacts.length > 0 ? 
      createMockMessages(8, contacts[0].id, 'current-user') : [];
    console.log('Created messages:', messages);

    // Save the data
    console.log('Saving communication data...');
    await dataAccess.saveCommunicationData({
      contacts,
      messages,
      videoCalls: [],
    });

    console.log('Communication data seeded successfully');
  } catch (error) {
    console.error('Error seeding communication data:', error);
  }
};

export const seedHealthData = async () => {
  console.log('Starting to seed health data...');
  const dataAccess = new DataAccessLayer();
  const userId = 'demo-user-123'; // Use a consistent user ID
  
  try {
    // Check if data already exists
    console.log('Checking for existing health data...');
    const existingData = await dataAccess.getHealthData();
    
    if (existingData && existingData.medicationSchedules.length > 0) {
      console.log('Health data already exists, skipping seed');
      return;
    }

    // Create mock medication schedules
    console.log('Creating mock medication schedules...');
    const medicationSchedules = createMockMedicationSchedules(userId);
    
    // Create mock medication logs
    console.log('Creating mock medication logs...');
    const medicationLogs = createMockMedicationLogs(medicationSchedules);

    // Save the data
    console.log('Saving health data...');
    await dataAccess.saveHealthData({
      dailyCheckIns: [],
      medicationSchedules,
      medicationLogs,
    });

    console.log('Health data seeded successfully');
    console.log(`Created ${medicationSchedules.length} medication schedules`);
    console.log(`Created ${medicationLogs.length} medication logs`);
  } catch (error) {
    console.error('Error seeding health data:', error);
  }
};

export const clearCommunicationData = async () => {
  const dataAccess = new DataAccessLayer();
  
  try {
    await dataAccess.saveCommunicationData({
      contacts: [],
      messages: [],
      videoCalls: [],
    });
    console.log('Communication data cleared');
  } catch (error) {
    console.error('Error clearing communication data:', error);
  }
};

export const clearHealthData = async () => {
  const dataAccess = new DataAccessLayer();
  
  try {
    await dataAccess.saveHealthData({
      dailyCheckIns: [],
      medicationSchedules: [],
      medicationLogs: [],
    });
    console.log('Health data cleared');
  } catch (error) {
    console.error('Error clearing health data:', error);
  }
};

export const seedActivitiesData = async () => {
  console.log('Starting to seed activities data...');
  const dataAccess = new DataAccessLayer();
  const userId = 'demo-user-123'; // Use a consistent user ID
  
  try {
    // Check if data already exists
    console.log('Checking for existing community data...');
    const existingData = await dataAccess.getCommunityData();
    
    if (existingData && existingData.activities.length > 5) {
      console.log('Activities data already exists, skipping seed');
      return;
    }

    // Create mock activities
    console.log('Creating mock activities...');
    const activities = createMockActivities(10, userId);
    
    // Create mock achievements (stored as special activities)
    console.log('Creating mock achievements...');
    const achievements = createMockAchievements(5, userId);
    
    // Convert achievements to activities for storage
    const achievementActivities = achievements.map(achievement => ({
      id: achievement.id,
      title: `Achievement: ${achievement.title}`,
      description: achievement.description,
      category: 'social' as const,
      difficulty: 'easy' as const,
      estimatedDuration: 0,
      instructions: [],
      isCompleted: achievement.isEarned,
      userId: achievement.userId,
      // Store the actual achievement data
      achievementData: JSON.stringify(achievement)
    }));
    
    // Create mock routine items
    console.log('Creating mock routine items...');
    const routineItems = createMockRoutineItems(5, userId);
    
    // Convert routine items to activities for storage
    const routineActivities = routineItems.map(item => ({
      id: item.id,
      title: `Routine: ${item.title}`,
      description: item.description || '',
      category: 'exercise' as const,
      difficulty: 'easy' as const,
      estimatedDuration: 0,
      instructions: [],
      isCompleted: item.isCompleted,
      userId: item.userId
    }));

    // Get existing community data or create new
    const communityData = existingData || {
      resources: [],
      activities: [],
      events: []
    };
    
    // Add our new activities
    communityData.activities = [
      ...communityData.activities,
      ...activities,
      ...achievementActivities,
      ...routineActivities
    ];

    // Save the data
    console.log('Saving activities data...');
    await dataAccess.saveCommunityData(communityData);

    console.log('Activities data seeded successfully');
    console.log(`Created ${activities.length} activities`);
    console.log(`Created ${achievements.length} achievements`);
    console.log(`Created ${routineItems.length} routine items`);
  } catch (error) {
    console.error('Error seeding activities data:', error);
  }
};

export const clearActivitiesData = async () => {
  const dataAccess = new DataAccessLayer();
  
  try {
    const communityData = await dataAccess.getCommunityData() || {
      resources: [],
      activities: [],
      events: []
    };
    
    // Remove activities but keep resources and events
    communityData.activities = [];
    
    await dataAccess.saveCommunityData(communityData);
    console.log('Activities data cleared');
  } catch (error) {
    console.error('Error clearing activities data:', error);
  }
};

export const seedCommunityData = async () => {
  console.log('Starting to seed community data...');
  const dataAccess = new DataAccessLayer();
  const userId = 'demo-user-123'; // Use a consistent user ID
  
  try {
    // Check if data already exists
    console.log('Checking for existing community data...');
    const existingData = await dataAccess.getCommunityData();
    
    if (existingData && existingData.resources.length > 0 && existingData.events.length > 0) {
      console.log('Community data already exists, skipping seed');
      return;
    }

    // Get existing community data or create new
    const communityData = existingData || {
      resources: [],
      activities: [],
      events: []
    };
    
    // Create mock resources if needed
    if (communityData.resources.length === 0) {
      console.log('Creating mock community resources...');
      communityData.resources = createMockCommunityResources(12);
    }
    
    // Create mock events if needed
    if (communityData.events.length === 0) {
      console.log('Creating mock community events...');
      
      // Create events for different categories
      const eventCategories = ['social', 'educational', 'health', 'recreational'] as const;
      const eventTitles = [
        'Senior Book Club',
        'Technology Workshop',
        'Health Screening Day',
        'Community Garden Project',
        'Movie Night',
        'Gentle Yoga Class',
        'Art & Crafts Workshop',
        'Memory Improvement Seminar'
      ];
      
      // Create events for the next 30 days
      const now = new Date();
      const events = [];
      
      for (let i = 0; i < 8; i++) {
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) + 1); // 1-30 days from now
        startDate.setHours(10 + Math.floor(Math.random() * 8), 0, 0, 0); // Between 10 AM and 6 PM
        
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1 + Math.floor(Math.random() * 2)); // 1-3 hours long
        
        const event = createMockCommunityEvent({
          title: eventTitles[i],
          category: eventCategories[i % eventCategories.length],
          startTime: startDate,
          endTime: endDate,
          isRegistered: Math.random() > 0.7, // 30% chance of being registered
        });
        
        events.push(event);
      }
      
      communityData.events = events;
    }

    // Save the data
    console.log('Saving community data...');
    await dataAccess.saveCommunityData(communityData);

    console.log('Community data seeded successfully');
    console.log(`Created ${communityData.resources.length} community resources`);
    console.log(`Created ${communityData.events.length} community events`);
  } catch (error) {
    console.error('Error seeding community data:', error);
  }
};

export const clearCommunityData = async () => {
  const dataAccess = new DataAccessLayer();
  
  try {
    const communityData = await dataAccess.getCommunityData() || {
      resources: [],
      activities: [],
      events: []
    };
    
    // Clear resources and events but keep activities
    communityData.resources = [];
    communityData.events = [];
    
    await dataAccess.saveCommunityData(communityData);
    console.log('Community resources and events cleared');
  } catch (error) {
    console.error('Error clearing community data:', error);
  }
};