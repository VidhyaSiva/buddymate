import { AsyncStorageWrapper, asyncStorage } from './AsyncStorageWrapper';
import { UserProfile } from '../types/user';
import { HealthData, DailyCheckIn, MedicationSchedule, MedicationLog } from '../types/health';
import { Communication, Contact, Message, VideoCall } from '../types/communication';
import { Community, CommunityResource, Activity, CommunityEvent } from '../types/community';

/**
 * Storage keys for different data types
 */
export const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  HEALTH_DATA: 'health_data',
  COMMUNICATION_DATA: 'communication_data',
  COMMUNITY_DATA: 'community_data',
  APP_VERSION: 'app_version',
  MIGRATION_VERSION: 'migration_version',
} as const;

/**
 * Data Access Layer providing CRUD operations for all data models
 */
export class DataAccessLayer {
  private storage: AsyncStorageWrapper;

  constructor(storage: AsyncStorageWrapper = asyncStorage) {
    this.storage = storage;
  }

  // ===== USER PROFILE OPERATIONS =====

  async saveUserProfile(profile: UserProfile): Promise<void> {
    await this.storage.setJSON(STORAGE_KEYS.USER_PROFILE, profile, true);
  }

  async getUserProfile(): Promise<UserProfile | null> {
    return await this.storage.getJSON<UserProfile>(STORAGE_KEYS.USER_PROFILE, true);
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const existingProfile = await this.getUserProfile();
    if (!existingProfile) return null;

    const updatedProfile = { ...existingProfile, ...updates, lastActive: new Date() };
    await this.saveUserProfile(updatedProfile);
    return updatedProfile;
  }

  async deleteUserProfile(): Promise<void> {
    await this.storage.removeItem(STORAGE_KEYS.USER_PROFILE);
  }

  // ===== HEALTH DATA OPERATIONS =====

  async saveHealthData(healthData: HealthData): Promise<void> {
    await this.storage.setJSON(STORAGE_KEYS.HEALTH_DATA, healthData, true);
  }

  async getHealthData(): Promise<HealthData | null> {
    return await this.storage.getJSON<HealthData>(STORAGE_KEYS.HEALTH_DATA, true);
  }

  async addDailyCheckIn(checkIn: DailyCheckIn): Promise<void> {
    const healthData = await this.getHealthData() || { dailyCheckIns: [], medicationSchedules: [], medicationLogs: [] };
    healthData.dailyCheckIns.push(checkIn);
    await this.saveHealthData(healthData);
  }

  async getDailyCheckIns(userId: string, limit?: number): Promise<DailyCheckIn[]> {
    const healthData = await this.getHealthData();
    if (!healthData) return [];

    let checkIns = healthData.dailyCheckIns
      .filter(checkIn => checkIn.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (limit) {
      checkIns = checkIns.slice(0, limit);
    }

    return checkIns;
  }

  async addMedicationSchedule(schedule: MedicationSchedule): Promise<void> {
    console.log('DataAccessLayer.addMedicationSchedule called with:', schedule);
    
    try {
      const healthData = await this.getHealthData() || { dailyCheckIns: [], medicationSchedules: [], medicationLogs: [] };
      console.log('Retrieved health data:', healthData);
      
      healthData.medicationSchedules.push(schedule);
      console.log('Added schedule to health data, now has', healthData.medicationSchedules.length, 'schedules');
      
      await this.saveHealthData(healthData);
      console.log('Successfully saved health data');
    } catch (error) {
      console.error('Error in addMedicationSchedule:', error);
      throw error;
    }
  }

  async updateMedicationSchedule(scheduleId: string, updates: Partial<MedicationSchedule>): Promise<MedicationSchedule | null> {
    const healthData = await this.getHealthData();
    if (!healthData) return null;

    const scheduleIndex = healthData.medicationSchedules.findIndex(s => s.id === scheduleId);
    if (scheduleIndex === -1) return null;

    healthData.medicationSchedules[scheduleIndex] = {
      ...healthData.medicationSchedules[scheduleIndex],
      ...updates,
      updatedAt: new Date()
    };

    await this.saveHealthData(healthData);
    return healthData.medicationSchedules[scheduleIndex];
  }

  async deleteMedicationSchedule(scheduleId: string): Promise<boolean> {
    console.log('DataAccessLayer.deleteMedicationSchedule called with:', scheduleId);
    
    try {
      const healthData = await this.getHealthData();
      if (!healthData) {
        console.log('No health data found');
        return false;
      }

      const initialLength = healthData.medicationSchedules.length;
      healthData.medicationSchedules = healthData.medicationSchedules.filter(s => s.id !== scheduleId);
      
      console.log(`Removed medication schedule. Before: ${initialLength}, After: ${healthData.medicationSchedules.length}`);
      
      if (healthData.medicationSchedules.length < initialLength) {
        await this.saveHealthData(healthData);
        console.log('Successfully saved updated health data');
        return true;
      }
      
      console.log('No medication schedule found with that ID');
      return false;
    } catch (error) {
      console.error('Error in deleteMedicationSchedule:', error);
      throw error;
    }
  }

  async getMedicationSchedules(userId: string): Promise<MedicationSchedule[]> {
    const healthData = await this.getHealthData();
    if (!healthData) return [];

    return healthData.medicationSchedules.filter(schedule => schedule.userId === userId);
  }

  async addMedicationLog(log: MedicationLog): Promise<void> {
    const healthData = await this.getHealthData() || { dailyCheckIns: [], medicationSchedules: [], medicationLogs: [] };
    healthData.medicationLogs.push(log);
    await this.saveHealthData(healthData);
  }

  async getMedicationLogs(scheduleId: string, limit?: number): Promise<MedicationLog[]> {
    const healthData = await this.getHealthData();
    if (!healthData) return [];

    let logs = healthData.medicationLogs
      .filter(log => log.scheduleId === scheduleId)
      .sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime());

    if (limit) {
      logs = logs.slice(0, limit);
    }

    return logs;
  }

  // ===== COMMUNICATION DATA OPERATIONS =====

  async saveCommunicationData(communicationData: Communication): Promise<void> {
    await this.storage.setJSON(STORAGE_KEYS.COMMUNICATION_DATA, communicationData, true);
  }

  async getCommunicationData(): Promise<Communication | null> {
    console.log('DataAccessLayer: Getting communication data from storage...');
    const data = await this.storage.getJSON<Communication>(STORAGE_KEYS.COMMUNICATION_DATA, true);
    console.log('DataAccessLayer: Raw communication data from storage:', data);
    return data;
  }

  async addContact(contact: Contact): Promise<void> {
    const commData = await this.getCommunicationData() || { contacts: [], messages: [], videoCalls: [] };
    commData.contacts.push(contact);
    await this.saveCommunicationData(commData);
  }

  async updateContact(contactId: string, updates: Partial<Contact>): Promise<Contact | null> {
    const commData = await this.getCommunicationData();
    if (!commData) return null;

    const contactIndex = commData.contacts.findIndex(c => c.id === contactId);
    if (contactIndex === -1) return null;

    commData.contacts[contactIndex] = { ...commData.contacts[contactIndex], ...updates };
    await this.saveCommunicationData(commData);
    return commData.contacts[contactIndex];
  }

  async getContacts(): Promise<Contact[]> {
    console.log('DataAccessLayer: Getting contacts...');
    const commData = await this.getCommunicationData();
    console.log('DataAccessLayer: Communication data:', commData);
    const contacts = commData?.contacts || [];
    console.log('DataAccessLayer: Returning contacts:', contacts);
    return contacts;
  }

  async deleteContact(contactId: string): Promise<boolean> {
    const commData = await this.getCommunicationData();
    if (!commData) return false;

    const initialLength = commData.contacts.length;
    commData.contacts = commData.contacts.filter(c => c.id !== contactId);
    
    if (commData.contacts.length < initialLength) {
      await this.saveCommunicationData(commData);
      return true;
    }
    return false;
  }

  async addMessage(message: Message): Promise<void> {
    const commData = await this.getCommunicationData() || { contacts: [], messages: [], videoCalls: [] };
    commData.messages.push(message);
    await this.saveCommunicationData(commData);
  }

  async getMessages(): Promise<Message[]> {
    const commData = await this.getCommunicationData();
    return commData?.messages || [];
  }

  async getContact(contactId: string): Promise<Contact | null> {
    const commData = await this.getCommunicationData();
    if (!commData) return null;
    return commData.contacts.find(c => c.id === contactId) || null;
  }

  async saveContact(contact: Contact): Promise<void> {
    const commData = await this.getCommunicationData() || { contacts: [], messages: [], videoCalls: [] };
    const existingIndex = commData.contacts.findIndex(c => c.id === contact.id);
    
    if (existingIndex >= 0) {
      commData.contacts[existingIndex] = contact;
    } else {
      commData.contacts.push(contact);
    }
    
    await this.saveCommunicationData(commData);
  }

  async saveMessage(message: Message): Promise<void> {
    const commData = await this.getCommunicationData() || { contacts: [], messages: [], videoCalls: [] };
    const existingIndex = commData.messages.findIndex(m => m.id === message.id);
    
    if (existingIndex >= 0) {
      commData.messages[existingIndex] = message;
    } else {
      commData.messages.push(message);
    }
    
    await this.saveCommunicationData(commData);
  }

  async getMessage(messageId: string): Promise<Message | null> {
    const commData = await this.getCommunicationData();
    if (!commData) return null;
    return commData.messages.find(m => m.id === messageId) || null;
  }

  async saveVideoCall(videoCall: VideoCall): Promise<void> {
    const commData = await this.getCommunicationData() || { contacts: [], messages: [], videoCalls: [] };
    const existingIndex = commData.videoCalls.findIndex(vc => vc.id === videoCall.id);
    
    if (existingIndex >= 0) {
      commData.videoCalls[existingIndex] = videoCall;
    } else {
      commData.videoCalls.push(videoCall);
    }
    
    await this.saveCommunicationData(commData);
  }

  async getVideoCall(callId: string): Promise<VideoCall | null> {
    const commData = await this.getCommunicationData();
    if (!commData) return null;
    return commData.videoCalls.find(vc => vc.id === callId) || null;
  }

  // ===== COMMUNITY DATA OPERATIONS =====

  async saveCommunityData(communityData: Community): Promise<void> {
    await this.storage.setJSON(STORAGE_KEYS.COMMUNITY_DATA, communityData, false);
  }

  async getCommunityData(): Promise<Community | null> {
    return await this.storage.getJSON<Community>(STORAGE_KEYS.COMMUNITY_DATA, false);
  }

  async getCommunityResources(category?: string): Promise<CommunityResource[]> {
    const communityData = await this.getCommunityData();
    if (!communityData) return [];

    if (category) {
      return communityData.resources.filter(resource => resource.category === category);
    }
    return communityData.resources;
  }

  async addActivity(activity: Activity): Promise<void> {
    const communityData = await this.getCommunityData() || { resources: [], activities: [], events: [] };
    communityData.activities.push(activity);
    await this.saveCommunityData(communityData);
  }

  async updateActivity(activityId: string, updates: Partial<Activity>): Promise<Activity | null> {
    const communityData = await this.getCommunityData();
    if (!communityData) return null;

    const activityIndex = communityData.activities.findIndex(a => a.id === activityId);
    if (activityIndex === -1) return null;

    communityData.activities[activityIndex] = { ...communityData.activities[activityIndex], ...updates };
    await this.saveCommunityData(communityData);
    return communityData.activities[activityIndex];
  }

  async getUserActivities(userId: string): Promise<Activity[]> {
    const communityData = await this.getCommunityData();
    if (!communityData) return [];

    return communityData.activities.filter(activity => activity.userId === userId);
  }

  // ===== UTILITY OPERATIONS =====

  async clearAllData(): Promise<void> {
    await this.storage.clear();
  }

  async getStorageInfo(): Promise<{ keys: string[], hasData: boolean }> {
    const keys = await this.storage.getAllKeys();
    return {
      keys,
      hasData: keys.length > 0
    };
  }

  async exportData(): Promise<Record<string, any>> {
    const data: Record<string, any> = {};
    const keys = await this.storage.getAllKeys();
    
    for (const key of keys) {
      const isEncrypted = key === STORAGE_KEYS.USER_PROFILE || 
                         key === STORAGE_KEYS.HEALTH_DATA || 
                         key === STORAGE_KEYS.COMMUNICATION_DATA;
      data[key] = await this.storage.getJSON(key, isEncrypted);
    }
    
    return data;
  }

  // Generic storage methods for notification service
  async getItem(key: string): Promise<any> {
    try {
      return await this.storage.getJSON(key, false);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  async setItem(key: string, value: any): Promise<void> {
    try {
      await this.storage.setJSON(key, value, false);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  }
}

// Singleton instance
export const dataAccessLayer = new DataAccessLayer();