import { AsyncStorageWrapper, asyncStorage } from './AsyncStorageWrapper';
import { STORAGE_KEYS } from './DataAccessLayer';

/**
 * Migration interface for version-specific migrations
 */
export interface Migration {
  version: string;
  description: string;
  migrate: (storage: AsyncStorageWrapper) => Promise<void>;
}

/**
 * Data migration utilities for app updates
 */
export class DataMigration {
  private storage: AsyncStorageWrapper;
  private migrations: Migration[] = [];

  constructor(storage: AsyncStorageWrapper = asyncStorage) {
    this.storage = storage;
    this.initializeMigrations();
  }

  /**
   * Initialize all available migrations
   */
  private initializeMigrations(): void {
    this.migrations = [
      {
        version: '1.0.0',
        description: 'Initial data structure setup',
        migrate: async (storage: AsyncStorageWrapper) => {
          // Initial setup - no migration needed
          await storage.setItem('initial_setup', 'true');
        }
      },
      {
        version: '1.1.0',
        description: 'Add lastActive field to UserProfile',
        migrate: async (storage: AsyncStorageWrapper) => {
          const userProfile = await storage.getJSON(STORAGE_KEYS.USER_PROFILE, true);
          if (userProfile && !userProfile.lastActive) {
            userProfile.lastActive = new Date().toISOString();
            await storage.setJSON(STORAGE_KEYS.USER_PROFILE, userProfile, true);
          }
        }
      },
      {
        version: '1.2.0',
        description: 'Add createdAt and updatedAt to MedicationSchedule',
        migrate: async (storage: AsyncStorageWrapper) => {
          const healthData = await storage.getJSON(STORAGE_KEYS.HEALTH_DATA, true);
          if (healthData && healthData.medicationSchedules) {
            const now = new Date().toISOString();
            healthData.medicationSchedules = healthData.medicationSchedules.map((schedule: any) => ({
              ...schedule,
              createdAt: schedule.createdAt || now,
              updatedAt: schedule.updatedAt || now
            }));
            await storage.setJSON(STORAGE_KEYS.HEALTH_DATA, healthData, true);
          }
        }
      },
      {
        version: '1.3.0',
        description: 'Add voice message type to Communication',
        migrate: async (storage: AsyncStorageWrapper) => {
          const commData = await storage.getJSON(STORAGE_KEYS.COMMUNICATION_DATA, true);
          if (commData && commData.messages) {
            // No structural changes needed, just version bump
            // Voice type is already supported in the interface
          }
        }
      }
    ];
  }

  /**
   * Get current migration version from storage
   */
  async getCurrentVersion(): Promise<string> {
    const version = await this.storage.getItem(STORAGE_KEYS.MIGRATION_VERSION);
    return version || '0.0.0';
  }

  /**
   * Set migration version in storage
   */
  async setCurrentVersion(version: string): Promise<void> {
    await this.storage.setItem(STORAGE_KEYS.MIGRATION_VERSION, version);
  }

  /**
   * Get app version from storage
   */
  async getAppVersion(): Promise<string> {
    const version = await this.storage.getItem(STORAGE_KEYS.APP_VERSION);
    return version || '1.0.0';
  }

  /**
   * Set app version in storage
   */
  async setAppVersion(version: string): Promise<void> {
    await this.storage.setItem(STORAGE_KEYS.APP_VERSION, version);
  }

  /**
   * Compare version strings (semantic versioning)
   */
  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }
    
    return 0;
  }

  /**
   * Get pending migrations that need to be run
   */
  async getPendingMigrations(): Promise<Migration[]> {
    const currentVersion = await this.getCurrentVersion();
    
    return this.migrations.filter(migration => 
      this.compareVersions(currentVersion, migration.version) < 0
    ).sort((a, b) => this.compareVersions(a.version, b.version));
  }

  /**
   * Run a specific migration
   */
  async runMigration(migration: Migration): Promise<void> {
    try {
      console.log(`Running migration ${migration.version}: ${migration.description}`);
      await migration.migrate(this.storage);
      await this.setCurrentVersion(migration.version);
      console.log(`Migration ${migration.version} completed successfully`);
    } catch (error) {
      console.error(`Migration ${migration.version} failed:`, error);
      throw new Error(`Migration ${migration.version} failed: ${error}`);
    }
  }

  /**
   * Run all pending migrations
   */
  async runPendingMigrations(): Promise<void> {
    const pendingMigrations = await this.getPendingMigrations();
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return;
    }

    console.log(`Running ${pendingMigrations.length} pending migrations`);
    
    for (const migration of pendingMigrations) {
      await this.runMigration(migration);
    }
    
    console.log('All migrations completed successfully');
  }

  /**
   * Check if migrations are needed
   */
  async needsMigration(): Promise<boolean> {
    const pendingMigrations = await this.getPendingMigrations();
    return pendingMigrations.length > 0;
  }

  /**
   * Create a backup of current data before migration
   */
  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupKey = `backup_${timestamp}`;
    
    try {
      const allKeys = await this.storage.getAllKeys();
      const backupData: Record<string, any> = {};
      
      for (const key of allKeys) {
        if (!key.startsWith('backup_')) {
          const isEncrypted = key === STORAGE_KEYS.USER_PROFILE || 
                             key === STORAGE_KEYS.HEALTH_DATA || 
                             key === STORAGE_KEYS.COMMUNICATION_DATA;
          try {
            backupData[key] = await this.storage.getJSON(key, isEncrypted);
          } catch (error) {
            // If JSON parsing fails, store as raw string
            backupData[key] = await this.storage.getItem(key, isEncrypted);
          }
        }
      }
      
      await this.storage.setJSON(backupKey, backupData);
      console.log(`Backup created with key: ${backupKey}`);
      return backupKey;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error(`Backup creation failed: ${error}`);
    }
  }

  /**
   * Restore data from backup
   */
  async restoreFromBackup(backupKey: string): Promise<void> {
    try {
      const backupData = await this.storage.getJSON(backupKey);
      if (!backupData) {
        throw new Error(`Backup not found: ${backupKey}`);
      }
      
      // Clear current data (except backups)
      const allKeys = await this.storage.getAllKeys();
      for (const key of allKeys) {
        if (!key.startsWith('backup_')) {
          await this.storage.removeItem(key);
        }
      }
      
      // Restore data
      for (const [key, value] of Object.entries(backupData)) {
        const isEncrypted = key === STORAGE_KEYS.USER_PROFILE || 
                           key === STORAGE_KEYS.HEALTH_DATA || 
                           key === STORAGE_KEYS.COMMUNICATION_DATA;
        
        if (typeof value === 'string') {
          await this.storage.setItem(key, value, isEncrypted);
        } else {
          await this.storage.setJSON(key, value, isEncrypted);
        }
      }
      
      console.log(`Data restored from backup: ${backupKey}`);
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      throw new Error(`Backup restoration failed: ${error}`);
    }
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<string[]> {
    const allKeys = await this.storage.getAllKeys();
    return allKeys.filter(key => key.startsWith('backup_')).sort().reverse();
  }

  /**
   * Delete old backups (keep only the most recent N backups)
   */
  async cleanupBackups(keepCount: number = 5): Promise<void> {
    const backups = await this.listBackups();
    const backupsToDelete = backups.slice(keepCount);
    
    for (const backup of backupsToDelete) {
      await this.storage.removeItem(backup);
    }
    
    if (backupsToDelete.length > 0) {
      console.log(`Cleaned up ${backupsToDelete.length} old backups`);
    }
  }

  /**
   * Initialize app with migration check
   */
  async initializeApp(currentAppVersion: string): Promise<void> {
    try {
      // Set current app version
      await this.setAppVersion(currentAppVersion);
      
      // Check if migration is needed
      const needsMigration = await this.needsMigration();
      
      if (needsMigration) {
        console.log('Migrations needed, creating backup...');
        await this.createBackup();
        
        console.log('Running pending migrations...');
        await this.runPendingMigrations();
        
        console.log('Cleaning up old backups...');
        await this.cleanupBackups();
      }
      
      console.log('App initialization completed');
    } catch (error) {
      console.error('App initialization failed:', error);
      throw error;
    }
  }
}

// Singleton instance
export const dataMigration = new DataMigration();