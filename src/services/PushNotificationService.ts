import { NotificationPreferences } from './NotificationService';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  vibration?: boolean;
  badge?: number;
  priority?: 'high' | 'normal';
  category?: string;
}

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  provisional?: boolean;
}

export interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  userId: string;
  createdAt: Date;
  isActive: boolean;
}

export class PushNotificationService {
  private tokens: Map<string, PushNotificationToken> = new Map();
  private permissionStatus: NotificationPermission = { granted: false, denied: false };

  /**
   * Initialize push notification service
   */
  async initialize(): Promise<void> {
    await this.requestPermissions();
    await this.loadStoredTokens();
  }

  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<NotificationPermission> {
    try {
      // In a real React Native app, this would use react-native-push-notification
      // or @react-native-async-storage/async-storage with platform-specific APIs
      
      // For web environment, use Notification API
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        this.permissionStatus = {
          granted: permission === 'granted',
          denied: permission === 'denied',
          provisional: permission === 'default'
        };
      } else {
        // Mock permissions for testing/development
        this.permissionStatus = { granted: true, denied: false };
      }

      return this.permissionStatus;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      this.permissionStatus = { granted: false, denied: true };
      return this.permissionStatus;
    }
  }

  /**
   * Register device for push notifications
   */
  async registerDevice(userId: string): Promise<string | null> {
    if (!this.permissionStatus.granted) {
      console.warn('Push notifications not permitted');
      return null;
    }

    try {
      // In a real app, this would get the actual device token
      // For now, generate a mock token
      const token = this.generateMockToken();
      const platform = this.detectPlatform();

      const pushToken: PushNotificationToken = {
        token,
        platform,
        userId,
        createdAt: new Date(),
        isActive: true
      };

      this.tokens.set(userId, pushToken);
      await this.saveTokens();

      console.log(`Device registered for push notifications: ${token}`);
      return token;
    } catch (error) {
      console.error('Error registering device for push notifications:', error);
      // Remove the token from memory if saving failed
      this.tokens.delete(userId);
      return null;
    }
  }

  /**
   * Send push notification
   */
  async sendNotification(
    userId: string, 
    payload: PushNotificationPayload,
    preferences?: NotificationPreferences
  ): Promise<boolean> {
    if (!this.permissionStatus.granted) {
      console.warn('Cannot send notification: permissions not granted');
      return false;
    }

    const token = this.tokens.get(userId);
    if (!token || !token.isActive) {
      console.warn(`No active push token found for user: ${userId}`);
      return false;
    }

    try {
      // Apply user preferences to notification
      const finalPayload = this.applyPreferences(payload, preferences);
      
      // Check quiet hours
      if (preferences && this.isWithinQuietHours(new Date(), preferences)) {
        console.log('Notification suppressed due to quiet hours');
        return false;
      }

      // In a real app, this would send to FCM/APNS
      // For now, simulate sending and show browser notification if available
      await this.deliverNotification(finalPayload);

      console.log(`Push notification sent to ${userId}:`, finalPayload);
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  /**
   * Schedule a push notification for later delivery
   */
  async scheduleNotification(
    userId: string,
    payload: PushNotificationPayload,
    scheduledTime: Date,
    preferences?: NotificationPreferences
  ): Promise<string | null> {
    const notificationId = crypto.randomUUID();
    const delay = scheduledTime.getTime() - Date.now();

    if (delay <= 0) {
      // Send immediately if time has passed
      const sent = await this.sendNotification(userId, payload, preferences);
      return sent ? notificationId : null;
    }

    // Schedule for later
    setTimeout(async () => {
      await this.sendNotification(userId, payload, preferences);
    }, delay);

    console.log(`Notification scheduled for ${scheduledTime.toISOString()}: ${payload.title}`);
    return notificationId;
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelScheduledNotification(notificationId: string): Promise<boolean> {
    // In a real implementation, we'd track scheduled notifications
    // and be able to cancel them before delivery
    console.log(`Cancelled scheduled notification: ${notificationId}`);
    return true;
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    return this.permissionStatus;
  }

  /**
   * Unregister device from push notifications
   */
  async unregisterDevice(userId: string): Promise<boolean> {
    const token = this.tokens.get(userId);
    if (token) {
      token.isActive = false;
      await this.saveTokens();
      console.log(`Device unregistered from push notifications: ${userId}`);
      return true;
    }
    return false;
  }

  /**
   * Get active push token for user
   */
  getActiveToken(userId: string): PushNotificationToken | null {
    const token = this.tokens.get(userId);
    return token && token.isActive ? token : null;
  }

  /**
   * Apply user preferences to notification payload
   */
  private applyPreferences(
    payload: PushNotificationPayload, 
    preferences?: NotificationPreferences
  ): PushNotificationPayload {
    if (!preferences) return payload;

    return {
      ...payload,
      sound: preferences.reminderSound && payload.sound !== false,
      vibration: preferences.reminderVibration && payload.vibration !== false
    };
  }

  /**
   * Check if current time is within user's quiet hours
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

  /**
   * Actually deliver the notification (platform-specific)
   */
  private async deliverNotification(payload: PushNotificationPayload): Promise<void> {
    // For web environment, show browser notification
    if (typeof window !== 'undefined' && 'Notification' in window && this.permissionStatus.granted) {
      new Notification(payload.title, {
        body: payload.body,
        icon: '/icon-192x192.png', // App icon
        badge: '/badge-72x72.png',
        tag: payload.category || 'buddy-mate',
        requireInteraction: payload.priority === 'high',
        silent: !payload.sound
      });
    }

    // In a real React Native app, this would use:
    // - Firebase Cloud Messaging (FCM) for Android
    // - Apple Push Notification Service (APNS) for iOS
    // - Local notifications for immediate delivery
  }

  /**
   * Generate a mock push token for development
   */
  private generateMockToken(): string {
    return `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Detect the current platform
   */
  private detectPlatform(): 'ios' | 'android' | 'web' {
    // In a real React Native app, use Platform.OS
    if (typeof window !== 'undefined') {
      return 'web';
    }
    // Mock detection for development
    return 'android';
  }

  /**
   * Load stored tokens from persistent storage
   */
  private async loadStoredTokens(): Promise<void> {
    try {
      // In a real app, load from AsyncStorage or secure storage
      const stored = localStorage.getItem('push_tokens');
      if (stored) {
        const tokenData = JSON.parse(stored);
        this.tokens = new Map(Object.entries(tokenData));
      }
    } catch (error) {
      console.error('Error loading stored push tokens:', error);
    }
  }

  /**
   * Save tokens to persistent storage
   */
  private async saveTokens(): Promise<void> {
    try {
      // In a real app, save to AsyncStorage or secure storage
      const tokenData = Object.fromEntries(this.tokens);
      localStorage.setItem('push_tokens', JSON.stringify(tokenData));
    } catch (error) {
      console.error('Error saving push tokens:', error);
    }
  }

  /**
   * Handle notification tap/click events
   */
  onNotificationTap(callback: (data: any) => void): void {
    // In a real app, this would set up listeners for notification interactions
    console.log('Notification tap handler registered');
  }

  /**
   * Get notification delivery statistics
   */
  async getDeliveryStats(userId: string): Promise<{
    sent: number;
    delivered: number;
    failed: number;
  }> {
    // In a real implementation, track delivery statistics
    return {
      sent: 0,
      delivered: 0,
      failed: 0
    };
  }
}

// Singleton instance
export const pushNotificationService = new PushNotificationService();