import { MedicationSchedule, MedicationLog } from '../types/health';
import { dataAccessLayer } from '../storage/DataAccessLayer';
import { Contact } from '../types/communication';
import { NotificationService } from './NotificationService';

export interface MedicationReminder {
  id: string;
  scheduleId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: Date;
  isActive: boolean;
  isCritical: boolean;
}

export interface WeeklyAdherence {
  scheduleId: string;
  medicationName: string;
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  skippedDoses: number;
  adherencePercentage: number;
  weekStart: Date;
  weekEnd: Date;
}

export interface MissedMedicationAlert {
  scheduleId: string;
  medicationName: string;
  missedTime: Date;
  consecutiveMisses: number;
  shouldEscalate: boolean;
}

export class MedicationReminderService {
  private static instance: MedicationReminderService;
  private activeReminders: Map<string, NodeJS.Timeout> = new Map();
  private reminderCallbacks: Map<string, (reminder: MedicationReminder) => void> = new Map();
  private notificationService: NotificationService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): MedicationReminderService {
    if (!MedicationReminderService.instance) {
      MedicationReminderService.instance = new MedicationReminderService();
    }
    return MedicationReminderService.instance;
  }

  public async initialize(): Promise<void> {
    console.log('MedicationReminderService initialized');
  }

  /**
   * Set up medication schedule with reminders
   */
  async createMedicationSchedule(
    userId: string,
    medicationName: string,
    dosage: string,
    frequency: string,
    times: string[],
    photo?: string,
    isCritical: boolean = false
  ): Promise<MedicationSchedule> {
    console.log('MedicationReminderService.createMedicationSchedule called with:', {
      userId, medicationName, dosage, frequency, times, photo, isCritical
    });
    
    const schedule: MedicationSchedule = {
      id: crypto.randomUUID(),
      userId,
      medicationName,
      dosage,
      frequency,
      times,
      photo,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Created schedule object:', schedule);
    console.log('Attempting to save to dataAccessLayer...');
    
    try {
      await dataAccessLayer.addMedicationSchedule(schedule);
      console.log('Successfully saved to dataAccessLayer');
    } catch (error) {
      console.error('Error saving to dataAccessLayer:', error);
      throw error;
    }
    
    try {
      await this.scheduleReminders(schedule, isCritical);
      console.log('Successfully scheduled reminders');
    } catch (error) {
      console.error('Error scheduling reminders:', error);
      // Don't throw here, as the schedule was saved
    }
    
    try {
      // Schedule notifications through NotificationService
      await this.notificationService.scheduleMedicationReminders(userId);
      console.log('Successfully scheduled notifications');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      // Don't throw here, as the schedule was saved
    }
    
    console.log('Returning schedule:', schedule);
    return schedule;
  }

  /**
   * Update existing medication schedule
   */
  async updateMedicationSchedule(
    scheduleId: string,
    updates: Partial<MedicationSchedule>,
    isCritical: boolean = false
  ): Promise<MedicationSchedule | null> {
    const updatedSchedule = await dataAccessLayer.updateMedicationSchedule(scheduleId, updates);
    
    if (updatedSchedule) {
      // Clear existing reminders and reschedule
      this.clearReminders(scheduleId);
      if (updatedSchedule.isActive) {
        await this.scheduleReminders(updatedSchedule, isCritical);
        // Reschedule notifications through NotificationService
        await this.notificationService.scheduleMedicationReminders(updatedSchedule.userId);
      }
    }
    
    return updatedSchedule;
  }

  /**
   * Get all medication schedules for user
   */
  async getMedicationSchedules(userId: string): Promise<MedicationSchedule[]> {
    return await dataAccessLayer.getMedicationSchedules(userId);
  }

  /**
   * Schedule reminders for a medication
   */
  private async scheduleReminders(schedule: MedicationSchedule, isCritical: boolean = false): Promise<void> {
    const now = new Date();
    
    for (const timeStr of schedule.times) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // Schedule for today if time hasn't passed, otherwise tomorrow
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);
      
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const reminder: MedicationReminder = {
        id: crypto.randomUUID(),
        scheduleId: schedule.id,
        medicationName: schedule.medicationName,
        dosage: schedule.dosage,
        scheduledTime: reminderTime,
        isActive: true,
        isCritical,
      };

      this.scheduleReminder(reminder);
    }
  }

  /**
   * Schedule a single reminder
   */
  private scheduleReminder(reminder: MedicationReminder): void {
    const now = new Date();
    const delay = reminder.scheduledTime.getTime() - now.getTime();
    
    if (delay > 0) {
      const timeoutId = setTimeout(() => {
        this.triggerReminder(reminder);
      }, delay);
      
      this.activeReminders.set(reminder.id, timeoutId);
    }
  }

  /**
   * Trigger a medication reminder
   */
  private async triggerReminder(reminder: MedicationReminder): Promise<void> {
    console.log(`Medication reminder: ${reminder.medicationName} - ${reminder.dosage}`);
    
    // Call registered callback if exists
    const callback = this.reminderCallbacks.get(reminder.scheduleId);
    if (callback) {
      callback(reminder);
    }

    // Schedule next reminder (24 hours later)
    const nextReminder = {
      ...reminder,
      id: crypto.randomUUID(),
      scheduledTime: new Date(reminder.scheduledTime.getTime() + 24 * 60 * 60 * 1000),
    };
    
    this.scheduleReminder(nextReminder);
    
    // Clean up current reminder
    this.activeReminders.delete(reminder.id);
  }

  /**
   * Register callback for medication reminders
   */
  onMedicationReminder(scheduleId: string, callback: (reminder: MedicationReminder) => void): void {
    this.reminderCallbacks.set(scheduleId, callback);
  }

  /**
   * Log medication as taken
   */
  async logMedicationTaken(scheduleId: string, scheduledTime: Date, notes?: string): Promise<MedicationLog> {
    const log: MedicationLog = {
      id: crypto.randomUUID(),
      scheduleId,
      scheduledTime,
      takenAt: new Date(),
      status: 'taken',
      notes,
    };

    await dataAccessLayer.addMedicationLog(log);
    return log;
  }

  /**
   * Log medication as skipped
   */
  async logMedicationSkipped(scheduleId: string, scheduledTime: Date, notes?: string): Promise<MedicationLog> {
    const log: MedicationLog = {
      id: crypto.randomUUID(),
      scheduleId,
      scheduledTime,
      status: 'skipped',
      notes,
    };

    await dataAccessLayer.addMedicationLog(log);
    return log;
  }

  /**
   * Log medication as missed (automatically when reminder expires)
   */
  async logMedicationMissed(scheduleId: string, scheduledTime: Date): Promise<MedicationLog> {
    const log: MedicationLog = {
      id: crypto.randomUUID(),
      scheduleId,
      scheduledTime,
      status: 'missed',
    };

    await dataAccessLayer.addMedicationLog(log);
    
    // Check if we need to escalate to emergency contacts
    await this.checkForEscalation(scheduleId);
    
    return log;
  }

  /**
   * Get weekly adherence summary
   */
  async getWeeklyAdherence(userId: string, weekStart?: Date): Promise<WeeklyAdherence[]> {
    const schedules = await this.getMedicationSchedules(userId);
    const adherenceSummaries: WeeklyAdherence[] = [];
    
    const startDate = weekStart || this.getWeekStart(new Date());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    for (const schedule of schedules) {
      const logs = await dataAccessLayer.getMedicationLogs(schedule.id);
      
      // Filter logs for the specified week
      const weekLogs = logs.filter(log => {
        const logDate = new Date(log.scheduledTime);
        return logDate >= startDate && logDate <= endDate;
      });

      // Calculate expected doses for the week
      const daysInWeek = 7;
      const dailyDoses = schedule.times.length;
      const totalExpectedDoses = daysInWeek * dailyDoses;

      const takenDoses = weekLogs.filter(log => log.status === 'taken').length;
      const missedDoses = weekLogs.filter(log => log.status === 'missed').length;
      const skippedDoses = weekLogs.filter(log => log.status === 'skipped').length;

      const adherencePercentage = totalExpectedDoses > 0 
        ? Math.round((takenDoses / totalExpectedDoses) * 100)
        : 0;

      adherenceSummaries.push({
        scheduleId: schedule.id,
        medicationName: schedule.medicationName,
        totalDoses: totalExpectedDoses,
        takenDoses,
        missedDoses,
        skippedDoses,
        adherencePercentage,
        weekStart: startDate,
        weekEnd: endDate,
      });
    }

    return adherenceSummaries;
  }

  /**
   * Check for missed medication escalation
   */
  private async checkForEscalation(scheduleId: string): Promise<void> {
    const logs = await dataAccessLayer.getMedicationLogs(scheduleId, 10);
    const recentMissed = logs.filter(log => log.status === 'missed');
    
    // Check for consecutive misses in the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMissedIn24h = recentMissed.filter(log => 
      new Date(log.scheduledTime) >= last24Hours
    );

    if (recentMissedIn24h.length >= 2) {
      // Get medication schedule to check if it's critical
      const healthData = await dataAccessLayer.getHealthData();
      const schedule = healthData?.medicationSchedules.find(s => s.id === scheduleId);
      
      if (schedule) {
        const alert: MissedMedicationAlert = {
          scheduleId,
          medicationName: schedule.medicationName,
          missedTime: new Date(recentMissedIn24h[0].scheduledTime),
          consecutiveMisses: recentMissedIn24h.length,
          shouldEscalate: true,
        };

        await this.escalateToEmergencyContacts(alert);
      }
    }
  }

  /**
   * Escalate missed critical medication to emergency contacts
   */
  private async escalateToEmergencyContacts(alert: MissedMedicationAlert): Promise<void> {
    try {
      const commData = await dataAccessLayer.getCommunicationData();
      const emergencyContacts = commData?.contacts.filter(c => c.isEmergencyContact) || [];

      if (emergencyContacts.length > 0) {
        console.log(`Escalating missed medication alert for ${alert.medicationName} to emergency contacts:`, 
          emergencyContacts.map(c => c.name));
        
        // In a real implementation, this would send SMS/call emergency contacts
        // For now, we'll just log the escalation
        for (const contact of emergencyContacts) {
          console.log(`Notifying ${contact.name} (${contact.phoneNumber}) about missed medication: ${alert.medicationName}`);
        }
      }
    } catch (error) {
      console.error('Failed to escalate to emergency contacts:', error);
    }
  }

  /**
   * Get upcoming medication reminders for today
   */
  async getTodayReminders(userId: string): Promise<MedicationReminder[]> {
    const schedules = await this.getMedicationSchedules(userId);
    const today = new Date();
    const reminders: MedicationReminder[] = [];

    for (const schedule of schedules.filter(s => s.isActive)) {
      for (const timeStr of schedule.times) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);

        reminders.push({
          id: crypto.randomUUID(),
          scheduleId: schedule.id,
          medicationName: schedule.medicationName,
          dosage: schedule.dosage,
          scheduledTime: reminderTime,
          isActive: true,
          isCritical: false, // This would be determined by medication type
        });
      }
    }

    return reminders.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  }

  /**
   * Clear all reminders for a schedule
   */
  private clearReminders(scheduleId: string): void {
    for (const [reminderId, timeoutId] of this.activeReminders.entries()) {
      // In a real implementation, we'd need to track which reminders belong to which schedule
      clearTimeout(timeoutId);
      this.activeReminders.delete(reminderId);
    }
    this.reminderCallbacks.delete(scheduleId);
  }

  /**
   * Get start of week (Sunday)
   */
  private getWeekStart(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  /**
   * Deactivate medication schedule
   */
  async deactivateMedicationSchedule(scheduleId: string): Promise<boolean> {
    const updated = await dataAccessLayer.updateMedicationSchedule(scheduleId, { 
      isActive: false,
      updatedAt: new Date()
    });
    
    if (updated) {
      this.clearReminders(scheduleId);
      return true;
    }
    
    return false;
  }

  /**
   * Delete medication schedule completely
   */
  async deleteMedicationSchedule(scheduleId: string): Promise<boolean> {
    console.log('MedicationReminderService.deleteMedicationSchedule called with:', scheduleId);
    
    try {
      // Clear any active reminders for this schedule
      this.clearReminders(scheduleId);
      
      // Delete from storage
      const result = await dataAccessLayer.deleteMedicationSchedule(scheduleId);
      console.log('Delete result:', result);
      
      return result;
    } catch (error) {
      console.error('Failed to delete medication schedule:', error);
      throw error;
    }
  }

  /**
   * Get medication adherence insights
   */
  async getAdherenceInsights(userId: string): Promise<string[]> {
    const adherence = await this.getWeeklyAdherence(userId);
    const insights: string[] = [];

    if (adherence.length === 0) {
      insights.push("Set up your medication schedule to track adherence.");
      return insights;
    }

    const averageAdherence = adherence.reduce((sum, a) => sum + a.adherencePercentage, 0) / adherence.length;

    if (averageAdherence >= 90) {
      insights.push("Excellent medication adherence! Keep up the great work! 🌟");
    } else if (averageAdherence >= 75) {
      insights.push("Good medication adherence. Try to maintain consistency.");
    } else if (averageAdherence >= 50) {
      insights.push("Your medication adherence could improve. Consider setting more reminders.");
    } else {
      insights.push("Let's work on improving your medication routine. Consider talking to your doctor.");
    }

    // Check for specific medications with low adherence
    const lowAdherence = adherence.filter(a => a.adherencePercentage < 70);
    if (lowAdherence.length > 0) {
      insights.push(`Pay special attention to: ${lowAdherence.map(a => a.medicationName).join(', ')}`);
    }

    return insights;
  }
}

// Singleton instance
export const medicationReminderService = new MedicationReminderService();