import { UserProfile } from '../types/user';
import { MedicationSchedule } from '../types/health';
import { DataAccessLayer } from '../storage/DataAccessLayer';
import { PushNotificationService, PushNotificationPayload } from './PushNotificationService';

export interface NotificationPreferences {
  medicationReminders: boolean;
  dailyCheckInReminders: boolean;
  appointmentReminders: boolean;
  familyConnectionSuggestions: boolean;
  reminderSound: boolean;
  reminderVibration: boolean;
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string; // "08:00"
}

export interface ScheduledNotification {
  id: string;
  type: 'medication' | 'checkIn' | 'appointment' | 'familyConnection';
  title: string;
  body: string;
  scheduledTime: Date;
  data?: any;
  isRecurring: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface AppointmentReminder {
  id: string;
  title: string;
  description?: string;
  appointmentTime: Date;
  location?: string;
  reminderTimes: Date[]; // 24h and 1h before
}

export class NotificationService {
  private static instance: NotificationService;
  private dataLayer: DataAccessLayer;
  private pushService: PushNotificationService;
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();

  private constructor() {
    this.dataLayer = new DataAccessLayer();
    this.pushService = new PushNotificationService();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification service and set up recurring reminders
   */
  async initialize(): Promise<void> {
    await this.pushService.initialize();
    await this.loadScheduledNotifications();
    await this.setupRecurringReminders();
  }

  /**
   * Get user's notification preferences
   */
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    const user = await this.dataLayer.getUserProfile();
    if (!user) {
      return this.getDefaultPreferences();
    }

    // Get stored preferences or use defaults
    const storedPrefs = await this.dataLayer.getItem(`notification_prefs_${userId}`);
    return storedPrefs || this.getDefaultPreferences();
  }

  /**
   * Update user's notification preferences
   */
  async updateNotificationPreferences(userId: string, preferences: NotificationPreferences): Promise<void> {
    await this.dataLayer.setItem(`notification_prefs_${userId}`, preferences);
    
    // Reschedule notifications based on new preferences
    await this.rescheduleAllNotifications(userId);
  }

  /**
   * Schedule medication reminders based on medication schedules
   */
  async scheduleMedicationReminders(userId: string): Promise<void> {
    const preferences = await this.getNotificationPreferences(userId);
    if (!preferences.medicationReminders) return;

    const healthData = await this.dataLayer.getHealthData();
    if (!healthData?.medicationSchedules) return;

    const activeSchedules = healthData.medicationSchedules.filter(schedule => schedule.isActive);

    for (const schedule of activeSchedules) {
      await this.createMedicationReminders(schedule, preferences);
    }
  }

  /**
   * Schedule daily check-in reminders
   */
  async scheduleDailyCheckInReminders(userId: string): Promise<void> {
    const preferences = await this.getNotificationPreferences(userId);
    if (!preferences.dailyCheckInReminders) return;

    const user = await this.dataLayer.getUserProfile();
    if (!user) return;

    // Schedule daily reminder based on user's reminder frequency
    const reminderTime = this.calculateCheckInReminderTime(user.preferences.reminderFrequency);
    
    const notification: ScheduledNotification = {
      id: `daily_checkin_${userId}`,
      type: 'checkIn',
      title: 'Daily Check-in',
      body: 'How are you feeling today? Take a moment to check in with yourself.',
      scheduledTime: reminderTime,
      isRecurring: true,
      isActive: true,
      createdAt: new Date()
    };

    await this.scheduleNotification(notification);
  }

  /**
   * Schedule appointment reminders
   */
  async scheduleAppointmentReminders(appointment: AppointmentReminder): Promise<void> {
    const user = await this.dataLayer.getUserProfile();
    if (!user) return;

    const preferences = await this.getNotificationPreferences(user.id);
    if (!preferences.appointmentReminders) return;

    // Schedule 24-hour reminder
    const twentyFourHourReminder: ScheduledNotification = {
      id: `appointment_24h_${appointment.id}`,
      type: 'appointment',
      title: 'Appointment Tomorrow',
      body: `You have "${appointment.title}" scheduled for tomorrow at ${this.formatTime(appointment.appointmentTime)}.`,
      scheduledTime: new Date(appointment.appointmentTime.getTime() - 24 * 60 * 60 * 1000),
      data: { appointmentId: appointment.id, reminderType: '24h' },
      isRecurring: false,
      isActive: true,
      createdAt: new Date()
    };

    // Schedule 1-hour reminder
    const oneHourReminder: ScheduledNotification = {
      id: `appointment_1h_${appointment.id}`,
      type: 'appointment',
      title: 'Appointment Soon',
      body: `Your appointment "${appointment.title}" is in 1 hour at ${this.formatTime(appointment.appointmentTime)}.`,
      scheduledTime: new Date(appointment.appointmentTime.getTime() - 60 * 60 * 1000),
      data: { appointmentId: appointment.id, reminderType: '1h' },
      isRecurring: false,
      isActive: true,
      createdAt: new Date()
    };

    await this.scheduleNotification(twentyFourHourReminder);
    await this.scheduleNotification(oneHourReminder);
  }

  /**
   * Schedule family connection suggestions
   */
  async scheduleFamilyConnectionSuggestions(userId: string): Promise<void> {
    const preferences = await this.getNotificationPreferences(userId);
    if (!preferences.familyConnectionSuggestions) return;

    const lastConnectionTime = await this.getLastFamilyConnectionTime(userId);
    const daysSinceLastConnection = this.getDaysSince(lastConnectionTime);

    // Suggest connection if it's been more than 3 days
    if (daysSinceLastConnection >= 3) {
      const suggestion: ScheduledNotification = {
        id: `family_connection_${userId}_${Date.now()}`,
        type: 'familyConnection',
        title: 'Stay Connected',
        body: "It's been a while since you connected with family. Would you like to reach out?",
        scheduledTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        isRecurring: false,
        isActive: true,
        createdAt: new Date()
      };

      await this.scheduleNotification(suggestion);
    }
  }

  /**
   * Check if user should receive notification based on quiet hours
   */
  private isWithinQuietHours(time: Date, preferences: NotificationPreferences): boolean {
    if (!preferences.quietHoursStart || !preferences.quietHoursEnd) return false;

    const hour = time.getHours();
    const minute = time.getMinutes();
    const currentTime = hour * 60 + minute;

    const [startHour, startMinute] = preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMinute] = preferences.quietHoursEnd.split(':').map(Number);
    
    const quietStart = startHour * 60 + startMinute;
    const quietEnd = endHour * 60 + endMinute;

    if (quietStart < quietEnd) {
      return currentTime >= quietStart && currentTime <= quietEnd;
    } else {
      // Quiet hours span midnight
      return currentTime >= quietStart || currentTime <= quietEnd;
    }
  }

  private async createMedicationReminders(schedule: MedicationSchedule, preferences: NotificationPreferences): Promise<void> {
    for (const timeString of schedule.times) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (reminderTime <= new Date()) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const notification: ScheduledNotification = {
        id: `medication_${schedule.id}_${timeString}`,
        type: 'medication',
        title: 'Medication Reminder',
        body: `Time to take your ${schedule.medicationName} (${schedule.dosage})`,
        scheduledTime: reminderTime,
        data: { scheduleId: schedule.id, medicationName: schedule.medicationName },
        isRecurring: true,
        isActive: true,
        createdAt: new Date()
      };

      await this.scheduleNotification(notification);
    }
  }

  private async scheduleNotification(notification: ScheduledNotification): Promise<void> {
    // Store notification
    this.scheduledNotifications.set(notification.id, notification);
    await this.saveScheduledNotifications();

    // Get user for push notification
    const user = await this.dataLayer.getUserProfile();
    if (!user) return;

    // Get user preferences
    const preferences = await this.getNotificationPreferences(user.id);

    // Create push notification payload
    const payload: PushNotificationPayload = {
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: preferences.reminderSound,
      vibration: preferences.reminderVibration,
      priority: notification.type === 'medication' ? 'high' : 'normal',
      category: notification.type
    };

    // Schedule push notification
    await this.pushService.scheduleNotification(
      user.id,
      payload,
      notification.scheduledTime,
      preferences
    );

    console.log(`Scheduled notification: ${notification.title} at ${notification.scheduledTime}`);
  }

  private calculateCheckInReminderTime(frequency: 'low' | 'normal' | 'high'): Date {
    const now = new Date();
    const reminderTime = new Date();
    
    // Set reminder for 9 AM by default
    reminderTime.setHours(9, 0, 0, 0);
    
    // If it's already past 9 AM today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    return reminderTime;
  }

  private async getLastFamilyConnectionTime(userId: string): Promise<Date> {
    const commData = await this.dataLayer.getCommunicationData();
    if (!commData?.messages?.length && !commData?.videoCalls?.length) {
      return new Date(0); // Very old date if no connections
    }

    const lastMessage = commData.messages?.reduce((latest, msg) => 
      msg.sentAt > latest ? msg.sentAt : latest, new Date(0)) || new Date(0);
    
    const lastCall = commData.videoCalls?.reduce((latest, call) => 
      call.startTime > latest ? call.startTime : latest, new Date(0)) || new Date(0);

    return lastMessage > lastCall ? lastMessage : lastCall;
  }

  private getDaysSince(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      medicationReminders: true,
      dailyCheckInReminders: true,
      appointmentReminders: true,
      familyConnectionSuggestions: true,
      reminderSound: true,
      reminderVibration: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00'
    };
  }

  private async loadScheduledNotifications(): Promise<void> {
    const stored = await this.dataLayer.getItem('scheduled_notifications');
    if (stored) {
      this.scheduledNotifications = new Map(Object.entries(stored));
    }
  }

  private async saveScheduledNotifications(): Promise<void> {
    const notificationsObj = Object.fromEntries(this.scheduledNotifications);
    await this.dataLayer.setItem('scheduled_notifications', notificationsObj);
  }

  private async setupRecurringReminders(): Promise<void> {
    const user = await this.dataLayer.getUserProfile();
    if (!user) return;

    await this.scheduleMedicationReminders(user.id);
    await this.scheduleDailyCheckInReminders(user.id);
    await this.scheduleFamilyConnectionSuggestions(user.id);
  }

  private async rescheduleAllNotifications(userId: string): Promise<void> {
    // Clear existing notifications
    this.scheduledNotifications.clear();
    
    // Reschedule based on new preferences
    await this.setupRecurringReminders();
  }

  /**
   * Cancel a specific notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    this.scheduledNotifications.delete(notificationId);
    await this.saveScheduledNotifications();
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    return Array.from(this.scheduledNotifications.values());
  }

  /**
   * Mark notification as delivered
   */
  async markNotificationDelivered(notificationId: string): Promise<void> {
    const notification = this.scheduledNotifications.get(notificationId);
    if (notification && !notification.isRecurring) {
      // Remove one-time notifications after delivery
      this.scheduledNotifications.delete(notificationId);
      await this.saveScheduledNotifications();
    }
  }

  /**
   * Register user device for push notifications
   */
  async registerForPushNotifications(userId: string): Promise<string | null> {
    return await this.pushService.registerDevice(userId);
  }

  /**
   * Unregister user device from push notifications
   */
  async unregisterFromPushNotifications(userId: string): Promise<boolean> {
    return await this.pushService.unregisterDevice(userId);
  }

  /**
   * Send immediate notification (bypassing scheduling)
   */
  async sendImmediateNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ): Promise<boolean> {
    const preferences = await this.getNotificationPreferences(userId);
    
    const payload: PushNotificationPayload = {
      title,
      body,
      data,
      sound: preferences.reminderSound,
      vibration: preferences.reminderVibration,
      priority: 'high',
      category: 'immediate'
    };

    return await this.pushService.sendNotification(userId, payload, preferences);
  }

  /**
   * Get push notification permission status
   */
  getPushNotificationPermissions() {
    return this.pushService.getPermissionStatus();
  }

  async cleanup(): Promise<void> {
    console.log('NotificationService: Cleaning up');
    // Cancel all scheduled notifications
    this.scheduledNotifications.clear();
    await this.saveScheduledNotifications();
  }
}