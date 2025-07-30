import { AsyncStorageWrapper, asyncStorage } from '../storage/AsyncStorageWrapper';

export interface DataSharingPermissions {
  healthData: boolean;
  locationData: boolean;
  communicationData: boolean;
  activityData: boolean;
  emergencyData: boolean;
}

export interface FamilyAccessPermission {
  contactId: string;
  contactName: string;
  permissions: DataSharingPermissions;
  grantedAt: Date;
  lastAccessed?: Date;
}

export interface PrivacySettings {
  dataRetentionDays: number;
  shareAnonymousUsageData: boolean;
  allowEmergencyDataSharing: boolean;
  familyAccessPermissions: FamilyAccessPermission[];
  encryptionEnabled: boolean;
  biometricAuthRequired: boolean;
}

/**
 * Privacy Service for managing data sharing permissions and privacy settings
 */
export class PrivacyService {
  private static instance: PrivacyService;
  private storage: AsyncStorageWrapper;
  private readonly PRIVACY_SETTINGS_KEY = 'privacy_settings';
  private readonly DATA_SHARING_LOG_KEY = 'data_sharing_log';

  private constructor(storage: AsyncStorageWrapper = asyncStorage) {
    this.storage = storage;
  }

  public static getInstance(): PrivacyService {
    if (!PrivacyService.instance) {
      PrivacyService.instance = new PrivacyService();
    }
    return PrivacyService.instance;
  }

  /**
   * Get current privacy settings with defaults
   */
  async getPrivacySettings(): Promise<PrivacySettings> {
    try {
      const settings = await this.storage.getJSON<PrivacySettings>(this.PRIVACY_SETTINGS_KEY, true);
      return settings || this.getDefaultPrivacySettings();
    } catch (error) {
      console.error('Error getting privacy settings:', error);
      return this.getDefaultPrivacySettings();
    }
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(updates: Partial<PrivacySettings>): Promise<PrivacySettings> {
    try {
      const currentSettings = await this.getPrivacySettings();
      const updatedSettings = { ...currentSettings, ...updates };
      await this.storage.setJSON(this.PRIVACY_SETTINGS_KEY, updatedSettings, true);
      return updatedSettings;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw new Error('Failed to update privacy settings');
    }
  }

  /**
   * Grant data access permission to a family member
   */
  async grantFamilyAccess(
    contactId: string,
    contactName: string,
    permissions: Partial<DataSharingPermissions>
  ): Promise<void> {
    try {
      const settings = await this.getPrivacySettings();
      
      // Remove existing permission for this contact
      settings.familyAccessPermissions = settings.familyAccessPermissions.filter(
        p => p.contactId !== contactId
      );

      // Add new permission
      const newPermission: FamilyAccessPermission = {
        contactId,
        contactName,
        permissions: { ...this.getDefaultDataSharingPermissions(), ...permissions },
        grantedAt: new Date()
      };

      settings.familyAccessPermissions.push(newPermission);
      await this.storage.setJSON(this.PRIVACY_SETTINGS_KEY, settings, true);

      // Log the permission grant
      await this.logDataSharingEvent('permission_granted', contactId, Object.keys(permissions));
    } catch (error) {
      console.error('Error granting family access:', error);
      throw new Error('Failed to grant family access');
    }
  }

  /**
   * Revoke data access permission from a family member
   */
  async revokeFamilyAccess(contactId: string): Promise<void> {
    try {
      const settings = await this.getPrivacySettings();
      const originalLength = settings.familyAccessPermissions.length;
      
      settings.familyAccessPermissions = settings.familyAccessPermissions.filter(
        p => p.contactId !== contactId
      );

      if (settings.familyAccessPermissions.length < originalLength) {
        await this.storage.setJSON(this.PRIVACY_SETTINGS_KEY, settings, true);
        await this.logDataSharingEvent('permission_revoked', contactId, []);
      }
    } catch (error) {
      console.error('Error revoking family access:', error);
      throw new Error('Failed to revoke family access');
    }
  }

  /**
   * Check if a family member has permission to access specific data type
   */
  async checkFamilyPermission(contactId: string, dataType: keyof DataSharingPermissions): Promise<boolean> {
    try {
      const settings = await this.getPrivacySettings();
      const permission = settings.familyAccessPermissions.find(p => p.contactId === contactId);
      
      if (!permission) {
        return false;
      }

      // Update last accessed time
      permission.lastAccessed = new Date();
      await this.storage.setJSON(this.PRIVACY_SETTINGS_KEY, settings, true);

      return permission.permissions[dataType];
    } catch (error) {
      console.error('Error checking family permission:', error);
      return false;
    }
  }

  /**
   * Get all family access permissions
   */
  async getFamilyAccessPermissions(): Promise<FamilyAccessPermission[]> {
    try {
      const settings = await this.getPrivacySettings();
      return settings.familyAccessPermissions;
    } catch (error) {
      console.error('Error getting family access permissions:', error);
      return [];
    }
  }

  /**
   * Update specific permission for a family member
   */
  async updateFamilyPermission(
    contactId: string,
    dataType: keyof DataSharingPermissions,
    allowed: boolean
  ): Promise<void> {
    try {
      const settings = await this.getPrivacySettings();
      const permission = settings.familyAccessPermissions.find(p => p.contactId === contactId);
      
      if (!permission) {
        throw new Error('Family member not found in permissions');
      }

      permission.permissions[dataType] = allowed;
      await this.storage.setJSON(this.PRIVACY_SETTINGS_KEY, settings, true);

      await this.logDataSharingEvent(
        allowed ? 'permission_enabled' : 'permission_disabled',
        contactId,
        [dataType]
      );
    } catch (error) {
      console.error('Error updating family permission:', error);
      throw new Error('Failed to update family permission');
    }
  }

  /**
   * Get data sharing activity log
   */
  async getDataSharingLog(): Promise<DataSharingLogEntry[]> {
    try {
      const log = await this.storage.getJSON<DataSharingLogEntry[]>(this.DATA_SHARING_LOG_KEY, true);
      return log || [];
    } catch (error) {
      console.error('Error getting data sharing log:', error);
      return [];
    }
  }

  /**
   * Clear old data based on retention policy
   */
  async cleanupOldData(): Promise<void> {
    try {
      const settings = await this.getPrivacySettings();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - settings.dataRetentionDays);

      // Clean up data sharing log
      const log = await this.getDataSharingLog();
      const filteredLog = log.filter(entry => new Date(entry.timestamp) > cutoffDate);
      await this.storage.setJSON(this.DATA_SHARING_LOG_KEY, filteredLog, true);

      console.log(`Cleaned up data older than ${settings.dataRetentionDays} days`);
    } catch (error) {
      console.error('Error cleaning up old data:', error);
    }
  }

  /**
   * Export privacy settings for user review
   */
  async exportPrivacySettings(): Promise<string> {
    try {
      const settings = await this.getPrivacySettings();
      const log = await this.getDataSharingLog();
      
      const exportData = {
        settings,
        dataSharingLog: log,
        exportedAt: new Date().toISOString()
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting privacy settings:', error);
      throw new Error('Failed to export privacy settings');
    }
  }

  /**
   * Reset all privacy settings to defaults
   */
  async resetPrivacySettings(): Promise<void> {
    try {
      const defaultSettings = this.getDefaultPrivacySettings();
      await this.storage.setJSON(this.PRIVACY_SETTINGS_KEY, defaultSettings, true);
      await this.storage.removeItem(this.DATA_SHARING_LOG_KEY);
    } catch (error) {
      console.error('Error resetting privacy settings:', error);
      throw new Error('Failed to reset privacy settings');
    }
  }

  /**
   * Get default privacy settings
   */
  private getDefaultPrivacySettings(): PrivacySettings {
    return {
      dataRetentionDays: 365, // 1 year
      shareAnonymousUsageData: false,
      allowEmergencyDataSharing: true,
      familyAccessPermissions: [],
      encryptionEnabled: true,
      biometricAuthRequired: false
    };
  }

  /**
   * Get default data sharing permissions (all disabled by default)
   */
  private getDefaultDataSharingPermissions(): DataSharingPermissions {
    return {
      healthData: false,
      locationData: false,
      communicationData: false,
      activityData: false,
      emergencyData: true // Emergency data sharing enabled by default
    };
  }

  /**
   * Log data sharing events
   */
  private async logDataSharingEvent(
    action: string,
    contactId: string,
    dataTypes: string[]
  ): Promise<void> {
    try {
      const log = await this.getDataSharingLog();
      const entry: DataSharingLogEntry = {
        id: `log_${Date.now()}`,
        action,
        contactId,
        dataTypes,
        timestamp: new Date()
      };

      log.push(entry);
      
      // Keep only last 1000 entries
      if (log.length > 1000) {
        log.splice(0, log.length - 1000);
      }

      await this.storage.setJSON(this.DATA_SHARING_LOG_KEY, log, true);
    } catch (error) {
      console.error('Error logging data sharing event:', error);
    }
  }

  /**
   * Sanitize text by removing potential PII
   */
  public sanitizeText(text: string): string {
    if (!text) return text;
    
    // Remove email addresses
    text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]');
    
    // Remove phone numbers
    text = text.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[phone]');
    
    // Remove potential SSN patterns
    text = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[ssn]');
    
    // Remove credit card patterns
    text = text.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[card]');
    
    return text;
  }

  /**
   * Hash a value for anonymization
   */
  public hashValue(value: string): string {
    // Simple hash function for anonymization
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

export interface DataSharingLogEntry {
  id: string;
  action: string;
  contactId: string;
  dataTypes: string[];
  timestamp: Date;
}

// Singleton instance
export const privacyService = new PrivacyService();