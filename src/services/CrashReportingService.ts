/**
 * Comprehensive crash reporting and error logging service
 * Handles all application errors with privacy-conscious logging
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrivacyService } from './PrivacyService';

export interface CrashReport {
  id: string;
  timestamp: Date;
  errorType: 'crash' | 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  userAgent?: string;
  appVersion: string;
  userId?: string;
  context?: Record<string, any>;
  isEmergencyRelated: boolean;
}

export interface ErrorMetrics {
  totalErrors: number;
  crashCount: number;
  errorsByType: Record<string, number>;
  lastCrashTime?: Date;
  emergencyErrors: number;
}

export class CrashReportingService {
  private static instance: CrashReportingService;
  private readonly STORAGE_KEY = 'crash_reports';
  private readonly MAX_REPORTS = 100;
  private readonly APP_VERSION = '1.0.0';
  private privacyService: PrivacyService;

  private constructor() {
    this.privacyService = PrivacyService.getInstance();
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): CrashReportingService {
    if (!CrashReportingService.instance) {
      CrashReportingService.instance = new CrashReportingService();
    }
    return CrashReportingService.instance;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.logCrash('Unhandled Promise Rejection', event.reason, {
          promise: 'Promise rejection not handled'
        });
      });

      // Handle JavaScript errors
      window.addEventListener('error', (event) => {
        this.logCrash('JavaScript Error', event.error, {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });
    }

    // React Native specific error handling
    if (typeof ErrorUtils !== 'undefined') {
      const originalHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        this.logCrash(
          isFatal ? 'Fatal Error' : 'Non-Fatal Error',
          error,
          { isFatal }
        );
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    }
  }

  public async logCrash(
    message: string,
    error?: Error | any,
    context?: Record<string, any>
  ): Promise<void> {
    try {
      const report: CrashReport = {
        id: this.generateReportId(),
        timestamp: new Date(),
        errorType: 'crash',
        message: this.sanitizeMessage(message),
        stack: error?.stack ? this.sanitizeStack(error.stack) : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        appVersion: this.APP_VERSION,
        userId: await this.getAnonymizedUserId(),
        context: this.sanitizeContext(context),
        isEmergencyRelated: this.isEmergencyError(message, context)
      };

      await this.saveReport(report);
      
      // If emergency-related, prioritize reporting
      if (report.isEmergencyRelated) {
        await this.handleEmergencyError(report);
      }

      console.error('Crash reported:', report);
    } catch (reportingError) {
      console.error('Failed to log crash:', reportingError);
    }
  }

  public async logError(
    message: string,
    error?: Error | any,
    context?: Record<string, any>
  ): Promise<void> {
    const report: CrashReport = {
      id: this.generateReportId(),
      timestamp: new Date(),
      errorType: 'error',
      message: this.sanitizeMessage(message),
      stack: error?.stack ? this.sanitizeStack(error.stack) : undefined,
      appVersion: this.APP_VERSION,
      userId: await this.getAnonymizedUserId(),
      context: this.sanitizeContext(context),
      isEmergencyRelated: this.isEmergencyError(message, context)
    };

    await this.saveReport(report);
  }

  public async logWarning(
    message: string,
    context?: Record<string, any>
  ): Promise<void> {
    const report: CrashReport = {
      id: this.generateReportId(),
      timestamp: new Date(),
      errorType: 'warning',
      message: this.sanitizeMessage(message),
      appVersion: this.APP_VERSION,
      userId: await this.getAnonymizedUserId(),
      context: this.sanitizeContext(context),
      isEmergencyRelated: false
    };

    await this.saveReport(report);
  }

  public async logInfo(
    message: string,
    context?: Record<string, any>
  ): Promise<void> {
    const report: CrashReport = {
      id: this.generateReportId(),
      timestamp: new Date(),
      errorType: 'info',
      message: this.sanitizeMessage(message),
      appVersion: this.APP_VERSION,
      userId: await this.getAnonymizedUserId(),
      context: this.sanitizeContext(context),
      isEmergencyRelated: false
    };

    await this.saveReport(report);
  }

  public async getErrorMetrics(): Promise<ErrorMetrics> {
    try {
      const reports = await this.getAllReports();
      
      const metrics: ErrorMetrics = {
        totalErrors: reports.length,
        crashCount: reports.filter(r => r.errorType === 'crash').length,
        errorsByType: {},
        emergencyErrors: reports.filter(r => r.isEmergencyRelated).length
      };

      // Count errors by type
      reports.forEach(report => {
        metrics.errorsByType[report.errorType] = 
          (metrics.errorsByType[report.errorType] || 0) + 1;
      });

      // Find last crash time
      const crashes = reports.filter(r => r.errorType === 'crash');
      if (crashes.length > 0) {
        metrics.lastCrashTime = new Date(Math.max(
          ...crashes.map(c => new Date(c.timestamp).getTime())
        ));
      }

      return metrics;
    } catch (error) {
      console.error('Failed to get error metrics:', error);
      return {
        totalErrors: 0,
        crashCount: 0,
        errorsByType: {},
        emergencyErrors: 0
      };
    }
  }

  public async exportReports(): Promise<CrashReport[]> {
    return await this.getAllReports();
  }

  public async clearReports(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear crash reports:', error);
    }
  }

  private async saveReport(report: CrashReport): Promise<void> {
    try {
      const existingReports = await this.getAllReports();
      const updatedReports = [report, ...existingReports].slice(0, this.MAX_REPORTS);
      
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(updatedReports)
      );
    } catch (error) {
      console.error('Failed to save crash report:', error);
    }
  }

  private async getAllReports(): Promise<CrashReport[]> {
    try {
      const reportsJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      return reportsJson ? JSON.parse(reportsJson) : [];
    } catch (error) {
      console.error('Failed to get crash reports:', error);
      return [];
    }
  }

  private generateReportId(): string {
    return `crash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeMessage(message: string): string {
    // Remove any potential PII from error messages
    return this.privacyService.sanitizeText(message);
  }

  private sanitizeStack(stack: string): string {
    // Remove file paths and other sensitive information
    return stack
      .replace(/\/.*?\//g, '/[path]/')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[ip]')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]');
  }

  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;

    const sanitized: Record<string, any> = {};
    
    Object.keys(context).forEach(key => {
      const value = context[key];
      if (typeof value === 'string') {
        sanitized[key] = this.privacyService.sanitizeText(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = '[object]';
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  private async getAnonymizedUserId(): Promise<string | undefined> {
    try {
      // Get anonymized user ID that doesn't reveal actual identity
      const userId = await AsyncStorage.getItem('user_id');
      return userId ? this.privacyService.hashValue(userId) : undefined;
    } catch {
      return undefined;
    }
  }

  private isEmergencyError(message: string, context?: Record<string, any>): boolean {
    const emergencyKeywords = [
      'emergency',
      'help',
      'contact',
      'location',
      'call',
      'medication',
      'critical'
    ];

    const messageContainsEmergencyKeyword = emergencyKeywords.some(keyword =>
      message.toLowerCase().includes(keyword)
    );

    const contextContainsEmergency = context && 
      Object.values(context).some(value =>
        typeof value === 'string' && 
        emergencyKeywords.some(keyword => 
          value.toLowerCase().includes(keyword)
        )
      );

    return messageContainsEmergencyKeyword || !!contextContainsEmergency;
  }

  private async handleEmergencyError(report: CrashReport): Promise<void> {
    try {
      // Log emergency error with high priority
      console.error('EMERGENCY ERROR DETECTED:', report);
      
      // Could integrate with emergency service to notify contacts
      // if the error is critical and affects emergency functionality
      if (report.message.toLowerCase().includes('emergency') ||
          report.message.toLowerCase().includes('critical')) {
        // Emergency service notification would go here
        console.warn('Critical emergency system error - manual intervention may be required');
      }
    } catch (error) {
      console.error('Failed to handle emergency error:', error);
    }
  }
}