import { EventEmitter } from 'events';

export interface AppError {
  id: string;
  type: ErrorType;
  message: string;
  userMessage: string;
  timestamp: Date;
  context?: any;
  isRecoverable: boolean;
  recoveryActions?: RecoveryAction[];
}

export enum ErrorType {
  NETWORK = 'network',
  EMERGENCY = 'emergency',
  MEDICATION = 'medication',
  DATA_SYNC = 'data_sync',
  AUTHENTICATION = 'authentication',
  STORAGE = 'storage',
  GENERAL = 'general'
}

export interface RecoveryAction {
  label: string;
  action: () => Promise<void> | void;
  isPrimary?: boolean;
}

export class ErrorHandlingService extends EventEmitter {
  private static instance: ErrorHandlingService;
  private errorLog: AppError[] = [];

  private constructor() {
    super();
  }

  public static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  public handleError(error: Error | string, type: ErrorType, context?: any): AppError {
    const appError: AppError = {
      id: this.generateErrorId(),
      type,
      message: typeof error === 'string' ? error : error.message,
      userMessage: this.getUserFriendlyMessage(type, error),
      timestamp: new Date(),
      context,
      isRecoverable: this.isRecoverableError(type),
      recoveryActions: this.getRecoveryActions(type)
    };

    this.errorLog.push(appError);
    this.emit('error', appError);

    // Keep only last 100 errors to prevent memory issues
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    return appError;
  }

  private getUserFriendlyMessage(type: ErrorType, error: Error | string): string {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    switch (type) {
      case ErrorType.NETWORK:
        return "I'm having trouble connecting to the internet. Let me try again in a moment.";
      
      case ErrorType.EMERGENCY:
        return "I couldn't reach emergency services right now. Please try calling directly or contact a family member.";
      
      case ErrorType.MEDICATION:
        return "I had trouble with your medication reminder. Please check your medications manually.";
      
      case ErrorType.DATA_SYNC:
        return "I'm having trouble saving your information. Don't worry, I'll keep trying.";
      
      case ErrorType.AUTHENTICATION:
        return "I need you to sign in again. This helps keep your information safe.";
      
      case ErrorType.STORAGE:
        return "I'm having trouble saving information on your device. Let me try a different way.";
      
      default:
        if (errorMessage.toLowerCase().includes('timeout')) {
          return "That took longer than expected. Let me try again.";
        }
        if (errorMessage.toLowerCase().includes('permission')) {
          return "I need permission to help you with that. Let's check your settings.";
        }
        return "Something didn't work as expected. Let me try to fix it.";
    }
  }

  private isRecoverableError(type: ErrorType): boolean {
    switch (type) {
      case ErrorType.NETWORK:
      case ErrorType.DATA_SYNC:
      case ErrorType.STORAGE:
        return true;
      case ErrorType.EMERGENCY:
      case ErrorType.MEDICATION:
        return false; // These need immediate attention
      default:
        return true;
    }
  }

  private getRecoveryActions(type: ErrorType): RecoveryAction[] {
    switch (type) {
      case ErrorType.NETWORK:
        return [
          {
            label: "Try Again",
            action: () => this.emit('retryRequested'),
            isPrimary: true
          },
          {
            label: "Work Offline",
            action: () => this.emit('offlineModeRequested')
          }
        ];
      
      case ErrorType.EMERGENCY:
        return [
          {
            label: "Call Emergency",
            action: () => this.emit('emergencyCallRequested'),
            isPrimary: true
          },
          {
            label: "Contact Family",
            action: () => this.emit('familyContactRequested')
          }
        ];
      
      case ErrorType.MEDICATION:
        return [
          {
            label: "Set Manual Reminder",
            action: () => this.emit('manualReminderRequested'),
            isPrimary: true
          }
        ];
      
      default:
        return [
          {
            label: "Try Again",
            action: () => this.emit('retryRequested'),
            isPrimary: true
          }
        ];
    }
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getRecentErrors(limit: number = 10): AppError[] {
    return this.errorLog.slice(-limit);
  }

  public clearErrorLog(): void {
    this.errorLog = [];
  }

  public async handleCriticalError(error: Error): Promise<void> {
    try {
      const appError = this.handleError(error, ErrorType.SYSTEM);
      console.error('Critical error handled:', appError);
      // Additional critical error handling can be added here
    } catch (handlingError) {
      console.error('Error while handling critical error:', handlingError);
    }
  }
}

export default ErrorHandlingService.getInstance();