/**
 * Central integration layer for BuddyMate application
 * Manages data flow between all core features and ensures seamless operation
 */

import { ErrorHandlingService, ErrorType } from '../services/ErrorHandlingService';
import { NotificationService } from '../services/NotificationService';
import { DataSyncService } from '../services/DataSyncService';
import { OfflineDataService } from '../services/OfflineDataService';
import { VoiceService } from '../services/VoiceService';
import { EmergencyService } from '../services/EmergencyService';
import { MedicationReminderService } from '../services/MedicationReminderService';
import { CommunicationService } from '../services/CommunicationService';
import { CheckInService } from '../services/CheckInService';
import { ActivitiesService } from '../services/ActivitiesService';
import { CommunityService } from '../services/CommunityService';
import { AuthenticationService } from '../services/AuthenticationService';
import { PrivacyService } from '../services/PrivacyService';
import { CrashReportingService } from '../services/CrashReportingService';

export interface AppState {
  isInitialized: boolean;
  isOnline: boolean;
  currentUser: any | null;
  emergencyMode: boolean;
  lastSyncTime: Date | null;
}

export class AppIntegration {
  private static instance: AppIntegration;
  private appState: AppState;
  private services: Map<string, any>;

  private constructor() {
    this.appState = {
      isInitialized: false,
      isOnline: true,
      currentUser: null,
      emergencyMode: false,
      lastSyncTime: null,
    };
    this.services = new Map();
    this.initializeServices();
  }

  public static getInstance(): AppIntegration {
    if (!AppIntegration.instance) {
      AppIntegration.instance = new AppIntegration();
    }
    return AppIntegration.instance;
  }

  private initializeServices(): void {
    // Initialize all core services
    this.services.set('error', ErrorHandlingService.getInstance());
    this.services.set('notification', NotificationService.getInstance());
    this.services.set('dataSync', DataSyncService.getInstance());
    this.services.set('offline', OfflineDataService.getInstance());
    this.services.set('voice', VoiceService.getInstance());
    this.services.set('emergency', EmergencyService.getInstance());
    this.services.set('medication', MedicationReminderService.getInstance());
    this.services.set('communication', CommunicationService.getInstance());
    this.services.set('checkIn', CheckInService.getInstance());
    this.services.set('activities', ActivitiesService.getInstance());
    this.services.set('community', CommunityService.getInstance());
    this.services.set('auth', AuthenticationService.getInstance());
    this.services.set('privacy', PrivacyService.getInstance());
  }

  public async initializeApp(): Promise<void> {
    try {
      // Initialize authentication first
      const authService = this.services.get('auth');
      await authService.initialize();

      // Initialize offline data service
      const offlineService = this.services.get('offline');
      await offlineService.initialize();

      // Initialize notification service
      const notificationService = this.services.get('notification');
      await notificationService.initialize();

      // Initialize voice service
      const voiceService = this.services.get('voice');
      await voiceService.initialize();

      // Initialize emergency service
      const emergencyService = this.services.get('emergency');
      await emergencyService.initialize();

      // Initialize medication reminder service
      const medicationService = this.services.get('medication');
      await medicationService.initialize();

      // Start data synchronization
      const dataSyncService = this.services.get('dataSync');
      await dataSyncService.startSync();

      this.appState.isInitialized = true;
      this.appState.lastSyncTime = new Date();

      // Log successful initialization
      const crashReporting = CrashReportingService.getInstance();
      await crashReporting.logInfo('App initialization completed successfully');

    } catch (error) {
      const errorService = this.services.get('error');
      errorService.handleError(error as Error, ErrorType.SYSTEM);
      throw error;
    }
  }

  public getService<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service as T;
  }

  public getAppState(): AppState {
    return { ...this.appState };
  }

  public setOnlineStatus(isOnline: boolean): void {
    this.appState.isOnline = isOnline;
    
    // Notify relevant services about connectivity change
    const dataSyncService = this.services.get('dataSync');
    const offlineService = this.services.get('offline');
    
    if (isOnline) {
      dataSyncService.resumeSync();
    } else {
      offlineService.enableOfflineMode();
    }
  }

  public async enterEmergencyMode(): Promise<void> {
    this.appState.emergencyMode = true;
    
    // Notify emergency service
    const emergencyService = this.services.get('emergency');
    await emergencyService.activateEmergencyMode();
    
    // Disable non-essential services to preserve battery
    const voiceService = this.services.get('voice');
    voiceService.setLowPowerMode(true);
  }

  public exitEmergencyMode(): void {
    this.appState.emergencyMode = false;
    
    // Re-enable all services
    const voiceService = this.services.get('voice');
    voiceService.setLowPowerMode(false);
  }

  public async syncAllData(): Promise<void> {
    try {
      const dataSyncService = this.services.get('dataSync');
      await dataSyncService.syncAll();
      this.appState.lastSyncTime = new Date();
    } catch (error) {
      const errorService = this.services.get('error');
      errorService.logError('Data sync failed', error);
      throw error;
    }
  }

  public async handleCriticalError(error: Error): Promise<void> {
    const errorService = this.services.get('error');
    await errorService.handleCriticalError(error);
    
    // If in emergency mode, ensure emergency contacts are notified
    if (this.appState.emergencyMode) {
      const emergencyService = this.services.get('emergency');
      await emergencyService.notifyEmergencyContacts('App critical error occurred');
    }
  }

  public async shutdown(): Promise<void> {
    try {
      // Stop all services gracefully
      const dataSyncService = this.services.get('dataSync');
      await dataSyncService.stopSync();

      const notificationService = this.services.get('notification');
      await notificationService.cleanup();

      const voiceService = this.services.get('voice');
      await voiceService.cleanup();

      this.appState.isInitialized = false;
    } catch (error) {
      const errorService = this.services.get('error');
      errorService.handleError(error as Error, ErrorType.SYSTEM);
    }
  }
}