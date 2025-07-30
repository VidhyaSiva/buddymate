import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types/user';
import { DailyCheckIn, MedicationSchedule, MedicationLog } from '../types/health';
import { Contact, Message } from '../types/communication';
import { CommunityResource, Activity } from '../types/community';
import DataSyncService from './DataSyncService';
import ErrorHandlingService, { ErrorType } from './ErrorHandlingService';

export class OfflineDataService {
  private static instance: OfflineDataService;
  
  // Storage keys
  private readonly KEYS = {
    USER_PROFILE: 'offline_user_profile',
    DAILY_CHECKINS: 'offline_daily_checkins',
    MEDICATION_SCHEDULES: 'offline_medication_schedules',
    MEDICATION_LOGS: 'offline_medication_logs',
    CONTACTS: 'offline_contacts',
    MESSAGES: 'offline_messages',
    COMMUNITY_RESOURCES: 'offline_community_resources',
    ACTIVITIES: 'offline_activities',
    EMERGENCY_CONTACTS: 'offline_emergency_contacts'
  };

  private constructor() {}

  public static getInstance(): OfflineDataService {
    if (!OfflineDataService.instance) {
      OfflineDataService.instance = new OfflineDataService();
    }
    return OfflineDataService.instance;
  }

  public async initialize(): Promise<void> {
    console.log('OfflineDataService initialized');
  }

  // User Profile Operations
  public async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.USER_PROFILE, JSON.stringify(profile));
      
      // Queue for sync when online
      await DataSyncService.queueOperation('UPDATE', 'user_profile', profile);
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.STORAGE, { operation: 'saveUserProfile' });
      throw error;
    }
  }

  public async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.STORAGE, { operation: 'getUserProfile' });
      return null;
    }
  }

  // Daily Check-in Operations
  public async saveDailyCheckIn(checkIn: DailyCheckIn): Promise<void> {
    try {
      const existingData = await this.getDailyCheckIns();
      const updatedData = existingData.filter(item => item.id !== checkIn.id);
      updatedData.push(checkIn);
      
      await AsyncStorage.setItem(this.KEYS.DAILY_CHECKINS, JSON.stringify(updatedData));
      
      // Queue for sync when online
      await DataSyncService.queueOperation('CREATE', 'daily_checkin', checkIn);
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.STORAGE, { operation: 'saveDailyCheckIn' });
      throw error;
    }
  }

  public async getDailyCheckIns(): Promise<DailyCheckIn[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.DAILY_CHECKINS);
      return data ? JSON.parse(data).map((item: any) => ({
        ...item,
        date: new Date(item.date),
        completedAt: new Date(item.completedAt)
      })) : [];
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.STORAGE, { operation: 'getDailyCheckIns' });
      return [];
    }
  }

  public async getTodaysCheckIn(): Promise<DailyCheckIn | null> {
    const checkIns = await this.getDailyCheckIns();
    const today = new Date().toDateString();
    return checkIns.find(checkIn => checkIn.date.toDateString() === today) || null;
  }

  // Medication Operations
  public async saveMedicationSchedule(schedule: MedicationSchedule): Promise<void> {
    try {
      const existingData = await this.getMedicationSchedules();
      const updatedData = existingData.filter(item => item.id !== schedule.id);
      updatedData.push(schedule);
      
      await AsyncStorage.setItem(this.KEYS.MEDICATION_SCHEDULES, JSON.stringify(updatedData));
      
      // Queue for sync when online
      await DataSyncService.queueOperation('UPDATE', 'medication_schedule', schedule);
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.STORAGE, { operation: 'saveMedicationSchedule' });
      throw error;
    }
  }

  public async getMedicationSchedules(): Promise<MedicationSchedule[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.MEDICATION_SCHEDULES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.STORAGE, { operation: 'getMedicationSchedules' });
      return [];
    }
  }

  public async logMedicationTaken(log: MedicationLog): Promise<void> {
    try {
      const existingLogs = await this.getMedicationLogs();
      existingLogs.push(log);
      
      await AsyncStorage.setItem(this.KEYS.MEDICATION_LOGS, JSON.stringify(existingLogs));
      
      // Queue for sync when online
      await DataSyncService.queueOperation('CREATE', 'medication_log', log);
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.MEDICATION, { operation: 'logMedicationTaken' });
      throw error;
    }
  }

  public async getMedicationLogs(): Promise<MedicationLog[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.MEDICATION_LOGS);
      return data ? JSON.parse(data).map((item: any) => ({
        ...item,
        scheduledTime: new Date(item.scheduledTime),
        takenAt: item.takenAt ? new Date(item.takenAt) : undefined
      })) : [];
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.STORAGE, { operation: 'getMedicationLogs' });
      return [];
    }
  }

  // Contact Operations
  public async saveContacts(contacts: Contact[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.CONTACTS, JSON.stringify(contacts));
      
      // Queue for sync when online
      await DataSyncService.queueOperation('UPDATE', 'contacts', contacts);
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.STORAGE, { operation: 'saveContacts' });
      throw error;
    }
  }

  public async getContacts(): Promise<Contact[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.CONTACTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.STORAGE, { operation: 'getContacts' });
      return [];
    }
  }

  public async getEmergencyContacts(): Promise<Contact[]> {
    const contacts = await this.getContacts();
    return contacts.filter(contact => contact.isEmergencyContact);
  }

  // Message Operations (for offline viewing)
  public async saveMessage(message: Message): Promise<void> {
    try {
      const existingMessages = await this.getMessages();
      existingMessages.push(message);
      
      // Keep only last 100 messages to prevent storage bloat
      const recentMessages = existingMessages.slice(-100);
      
      await AsyncStorage.setItem(this.KEYS.MESSAGES, JSON.stringify(recentMessages));
      
      // Queue for sync when online
      await DataSyncService.queueOperation('CREATE', 'message', message);
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.STORAGE, { operation: 'saveMessage' });
      throw error;
    }
  }

  public async getMessages(): Promise<Message[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.MESSAGES);
      return data ? JSON.parse(data).map((item: any) => ({
        ...item,
        sentAt: new Date(item.sentAt),
        readAt: item.readAt ? new Date(item.readAt) : undefined
      })) : [];
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.STORAGE, { operation: 'getMessages' });
      return [];
    }
  }

  // Community Resources (cached for offline access)
  public async saveCommunityResources(resources: CommunityResource[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.COMMUNITY_RESOURCES, JSON.stringify(resources));
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.STORAGE, { operation: 'saveCommunityResources' });
      throw error;
    }
  }

  public async getCommunityResources(): Promise<CommunityResource[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.COMMUNITY_RESOURCES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.STORAGE, { operation: 'getCommunityResources' });
      return [];
    }
  }

  // Activities (cached for offline access)
  public async saveActivities(activities: Activity[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.ACTIVITIES, JSON.stringify(activities));
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.STORAGE, { operation: 'saveActivities' });
      throw error;
    }
  }

  public async getActivities(): Promise<Activity[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.ACTIVITIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.STORAGE, { operation: 'getActivities' });
      return [];
    }
  }

  // Utility Methods
  public async clearAllOfflineData(): Promise<void> {
    try {
      const keys = Object.values(this.KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.STORAGE, { operation: 'clearAllOfflineData' });
      throw error;
    }
  }

  public async getStorageInfo(): Promise<{ totalKeys: number; estimatedSize: string }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const offlineKeys = keys.filter(key => key.startsWith('offline_'));
      
      // Rough estimation of storage size
      let totalSize = 0;
      for (const key of offlineKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      }
      
      const sizeInKB = (totalSize / 1024).toFixed(2);
      
      return {
        totalKeys: offlineKeys.length,
        estimatedSize: `${sizeInKB} KB`
      };
    } catch (error) {
      ErrorHandlingService.handleError(error as Error, ErrorType.STORAGE, { operation: 'getStorageInfo' });
      return { totalKeys: 0, estimatedSize: '0 KB' };
    }
  }

  public enableOfflineMode(): void {
    console.log('OfflineDataService: Offline mode enabled');
    // Additional offline mode setup can be added here
  }
}

export default OfflineDataService.getInstance();