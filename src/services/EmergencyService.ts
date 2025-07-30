import { EmergencyContact } from '../types/user';
import { Contact } from '../types/communication';
import { dataAccessLayer } from '../storage/DataAccessLayer';

export interface EmergencyAlert {
  id: string;
  userId: string;
  type: 'emergency_call' | 'help_me' | 'medical_emergency';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: Date;
  contacts: EmergencyContact[];
  message?: string;
  resolved: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

/**
 * Emergency Service for handling emergency contacts and safety features
 */
export class EmergencyService {
  private static instance: EmergencyService;
  private currentLocation: LocationData | null = null;

  private constructor() {}

  public static getInstance(): EmergencyService {
    if (!EmergencyService.instance) {
      EmergencyService.instance = new EmergencyService();
    }
    return EmergencyService.instance;
  }

  /**
   * Get current user location (mock implementation for testing)
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      // Mock location for testing - in real app would use geolocation API
      this.currentLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        address: "New York, NY",
        accuracy: 10
      };
      return this.currentLocation;
    } catch (error) {
      console.error('Failed to get location:', error);
      return null;
    }
  }

  /**
   * Get emergency contacts from user profile
   */
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      const userProfile = await dataAccessLayer.getUserProfile();
      return userProfile?.emergencyContacts || [];
    } catch (error) {
      console.error('Failed to get emergency contacts:', error);
      return [];
    }
  }

  /**
   * Add or update emergency contact
   */
  async saveEmergencyContact(contact: EmergencyContact): Promise<void> {
    try {
      const userProfile = await dataAccessLayer.getUserProfile();
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const existingIndex = userProfile.emergencyContacts.findIndex(c => c.id === contact.id);
      if (existingIndex >= 0) {
        userProfile.emergencyContacts[existingIndex] = contact;
      } else {
        userProfile.emergencyContacts.push(contact);
      }

      await dataAccessLayer.saveUserProfile(userProfile);
    } catch (error) {
      console.error('Failed to save emergency contact:', error);
      throw error;
    }
  }

  /**
   * Remove emergency contact
   */
  async removeEmergencyContact(contactId: string): Promise<void> {
    try {
      const userProfile = await dataAccessLayer.getUserProfile();
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      userProfile.emergencyContacts = userProfile.emergencyContacts.filter(c => c.id !== contactId);
      await dataAccessLayer.saveUserProfile(userProfile);
    } catch (error) {
      console.error('Failed to remove emergency contact:', error);
      throw error;
    }
  }

  /**
   * Initiate emergency call (mock implementation)
   */
  async initiateEmergencyCall(): Promise<EmergencyAlert> {
    try {
      const location = await this.getCurrentLocation();
      const emergencyContacts = await this.getEmergencyContacts();
      
      const alert: EmergencyAlert = {
        id: `emergency_${Date.now()}`,
        userId: 'current_user', // In real app, get from auth context
        type: 'emergency_call',
        location: location || undefined,
        timestamp: new Date(),
        contacts: emergencyContacts,
        resolved: false
      };

      // Mock emergency services call
      console.log('🚨 EMERGENCY CALL INITIATED');
      console.log('Location:', location);
      console.log('Emergency contacts notified:', emergencyContacts.length);

      // Notify emergency contacts
      await this.notifyEmergencyContacts(alert);

      return alert;
    } catch (error) {
      console.error('Failed to initiate emergency call:', error);
      throw error;
    }
  }

  /**
   * Trigger "Help Me" button functionality
   */
  async triggerHelpMe(message?: string): Promise<EmergencyAlert> {
    try {
      const location = await this.getCurrentLocation();
      const emergencyContacts = await this.getEmergencyContacts();
      
      const alert: EmergencyAlert = {
        id: `help_${Date.now()}`,
        userId: 'current_user',
        type: 'help_me',
        location: location || undefined,
        timestamp: new Date(),
        contacts: emergencyContacts,
        message: message || 'User requested help',
        resolved: false
      };

      // Notify emergency contacts
      await this.notifyEmergencyContacts(alert);

      return alert;
    } catch (error) {
      console.error('Failed to trigger help me:', error);
      throw error;
    }
  }

  /**
   * Notify emergency contacts via SMS/call (mock implementation)
   */
  private async notifyEmergencyContacts(alert: EmergencyAlert): Promise<void> {
    try {
      for (const contact of alert.contacts) {
        // Mock SMS notification
        const smsMessage = this.createEmergencyMessage(alert, contact);
        await this.sendSMS(contact.phoneNumber, smsMessage);

        // If primary contact, also initiate call
        if (contact.isPrimary) {
          await this.initiateCall(contact.phoneNumber);
        }
      }
    } catch (error) {
      console.error('Failed to notify emergency contacts:', error);
      throw error;
    }
  }

  /**
   * Create emergency message text
   */
  private createEmergencyMessage(alert: EmergencyAlert, contact: EmergencyContact): string {
    const userProfile = 'BuddyMate User'; // In real app, get from user profile
    let message = `🚨 EMERGENCY ALERT from ${userProfile}\n\n`;

    if (alert.type === 'emergency_call') {
      message += 'Emergency services have been contacted.\n';
    } else if (alert.type === 'help_me') {
      message += 'User has requested help.\n';
    }

    if (alert.message) {
      message += `Message: ${alert.message}\n`;
    }

    if (alert.location) {
      message += `Location: ${alert.location.address || `${alert.location.latitude}, ${alert.location.longitude}`}\n`;
    }

    message += `Time: ${alert.timestamp.toLocaleString()}\n\n`;
    message += 'Please check on them immediately.';

    return message;
  }

  /**
   * Send SMS (mock implementation)
   */
  private async sendSMS(phoneNumber: string, message: string): Promise<void> {
    // Mock SMS sending
    console.log(`📱 SMS sent to ${phoneNumber}:`);
    console.log(message);
    console.log('---');
  }

  /**
   * Initiate phone call (mock implementation)
   */
  private async initiateCall(phoneNumber: string): Promise<void> {
    // Mock phone call
    console.log(`📞 Calling ${phoneNumber}...`);
  }

  /**
   * Get emergency services number based on location
   */
  getEmergencyServicesNumber(): string {
    // In real app, this would be location-based
    return '911'; // US emergency number
  }

  /**
   * Check if emergency contacts are configured
   */
  async hasEmergencyContacts(): Promise<boolean> {
    const contacts = await this.getEmergencyContacts();
    return contacts.length > 0;
  }

  /**
   * Validate emergency contact data
   */
  validateEmergencyContact(contact: Partial<EmergencyContact>): string[] {
    const errors: string[] = [];

    if (!contact.name || contact.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!contact.phoneNumber || contact.phoneNumber.trim().length === 0) {
      errors.push('Phone number is required');
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(contact.phoneNumber)) {
      errors.push('Invalid phone number format');
    }

    if (!contact.relationship || contact.relationship.trim().length === 0) {
      errors.push('Relationship is required');
    }

    return errors;
  }

  public async initialize(): Promise<void> {
    console.log('EmergencyService initialized');
  }

  public async activateEmergencyMode(): Promise<void> {
    console.log('EmergencyService: Emergency mode activated');
    // Additional emergency mode setup can be added here
  }

  public async notifyEmergencyContacts(message: string): Promise<void> {
    try {
      const contacts = await this.getEmergencyContacts();
      for (const contact of contacts) {
        console.log(`Notifying emergency contact: ${contact.name} - ${message}`);
        // In a real implementation, this would send actual notifications
      }
    } catch (error) {
      console.error('Failed to notify emergency contacts:', error);
      throw error;
    }
  }
}

// Singleton instance
export const emergencyService = new EmergencyService();