import { EventEmitter } from 'events';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetworkService from './NetworkService';
import ErrorHandlingService, { ErrorType } from './ErrorHandlingService';

export interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

export interface SyncStatus {
  isOnline: boolean;
  pendingOperations: number;
  lastSyncTime: Date | null;
  isSyncing: boolean;
}

export class DataSyncService extends EventEmitter {
  private static instance: DataSyncService;
  private syncQueue: SyncOperation[] = [];
  private isSyncing = false;
  private lastSyncTime: Date | null = null;
  private readonly SYNC_QUEUE_KEY = 'sync_queue';
  private readonly LAST_SYNC_KEY = 'last_sync_time';

  private constructor() {
    super();
    this.initialize();
  }

  public static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  private async initialize(): Promise<void> {
    // Load pending operations from storage
    await this.loadSyncQueue();
    await this.loadLastSyncTime();

    // Listen for network changes
    NetworkService.on('connectionRestored', () => {
      this.processSyncQueue();
    });

    // Process queue periodically when online
    setInterval(() => {
      if (NetworkService.isConnected() && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, 30000); // Every 30 seconds
  }

  public async queueOperation(
    type: SyncOperation['type'],
    entity: string,
    data: any,
    maxRetries: number = 3
  ): Promise<void> {
    const operation: SyncOperation = {
      id: this.generateOperationId(),
      type,
      entity,
      data,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries
    };

    this.syncQueue.push(operation);
    await this.saveSyncQueue();

    this.emit('operationQueued', operation);

    // Try to sync immediately if online
    if (NetworkService.isConnected()) {
      this.processSyncQueue();
    }
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0 || !NetworkService.isConnected()) {
      return;
    }

    this.isSyncing = true;
    this.emit('syncStarted');

    const operationsToProcess = [...this.syncQueue];
    const failedOperations: SyncOperation[] = [];

    for (const operation of operationsToProcess) {
      try {
        await this.executeOperation(operation);
        
        // Remove successful operation from queue
        this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
        this.emit('operationSynced', operation);
        
      } catch (error) {
        operation.retryCount++;
        
        if (operation.retryCount >= operation.maxRetries) {
          // Remove failed operation after max retries
          this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
          this.emit('operationFailed', operation, error);
          
          ErrorHandlingService.handleError(
            error as Error,
            ErrorType.DATA_SYNC,
            { operation }
          );
        } else {
          failedOperations.push(operation);
        }
      }
    }

    this.lastSyncTime = new Date();
    await this.saveSyncQueue();
    await this.saveLastSyncTime();

    this.isSyncing = false;
    this.emit('syncCompleted', {
      successful: operationsToProcess.length - failedOperations.length,
      failed: failedOperations.length
    });
  }

  private async executeOperation(operation: SyncOperation): Promise<void> {
    // This would typically make API calls to sync data
    // For now, we'll simulate the operation
    
    const delay = Math.random() * 1000 + 500; // 500-1500ms delay
    await new Promise(resolve => setTimeout(resolve, delay));

    // Simulate occasional failures for testing
    if (Math.random() < 0.1) { // 10% failure rate
      throw new Error(`Failed to sync ${operation.entity} operation`);
    }

    // In a real implementation, this would make actual API calls
    console.log(`Synced ${operation.type} operation for ${operation.entity}`);
  }

  public getSyncStatus(): SyncStatus {
    return {
      isOnline: NetworkService.isConnected(),
      pendingOperations: this.syncQueue.length,
      lastSyncTime: this.lastSyncTime,
      isSyncing: this.isSyncing
    };
  }

  public async forceSyncNow(): Promise<void> {
    if (NetworkService.isConnected()) {
      await this.processSyncQueue();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }

  public getPendingOperations(): SyncOperation[] {
    return [...this.syncQueue];
  }

  public async clearSyncQueue(): Promise<void> {
    this.syncQueue = [];
    await this.saveSyncQueue();
    this.emit('queueCleared');
  }

  private async loadSyncQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(this.SYNC_QUEUE_KEY);
      if (queueData) {
        this.syncQueue = JSON.parse(queueData).map((op: any) => ({
          ...op,
          timestamp: new Date(op.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  private async loadLastSyncTime(): Promise<void> {
    try {
      const syncTime = await AsyncStorage.getItem(this.LAST_SYNC_KEY);
      if (syncTime) {
        this.lastSyncTime = new Date(syncTime);
      }
    } catch (error) {
      console.error('Failed to load last sync time:', error);
    }
  }

  private async saveLastSyncTime(): Promise<void> {
    try {
      if (this.lastSyncTime) {
        await AsyncStorage.setItem(this.LAST_SYNC_KEY, this.lastSyncTime.toISOString());
      }
    } catch (error) {
      console.error('Failed to save last sync time:', error);
    }
  }

  private generateOperationId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public async startSync(): Promise<void> {
    console.log('DataSyncService: Starting sync');
    await this.processSyncQueue();
  }

  public async stopSync(): Promise<void> {
    console.log('DataSyncService: Stopping sync');
    this.isSyncing = false;
  }

  public async syncAll(): Promise<void> {
    console.log('DataSyncService: Syncing all data');
    await this.processSyncQueue();
  }

  public resumeSync(): void {
    console.log('DataSyncService: Resuming sync');
    if (NetworkService.isConnected()) {
      this.processSyncQueue();
    }
  }
}

export default DataSyncService.getInstance();