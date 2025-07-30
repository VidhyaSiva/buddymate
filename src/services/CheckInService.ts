import { DailyCheckIn } from '../types/health';
import { dataAccessLayer } from '../storage/DataAccessLayer';

export interface CheckInSummary {
  totalCheckIns: number;
  averageMood: number;
  averageEnergy: number;
  recentTrend: 'improving' | 'stable' | 'declining';
  lastCheckIn: Date | null;
}

export interface VoiceNote {
  id: string;
  checkInId: string;
  audioUri: string;
  duration: number;
  transcription?: string;
  createdAt: Date;
}

export class CheckInService {
  private static instance: CheckInService;

  private constructor() {}

  public static getInstance(): CheckInService {
    if (!CheckInService.instance) {
      CheckInService.instance = new CheckInService();
    }
    return CheckInService.instance;
  }

  /**
   * Check if user has completed check-in today
   */
  async hasCompletedTodayCheckIn(userId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkIns = await dataAccessLayer.getDailyCheckIns(userId, 1);
    
    if (checkIns.length === 0) return false;
    
    const lastCheckIn = new Date(checkIns[0].date);
    lastCheckIn.setHours(0, 0, 0, 0);
    
    return lastCheckIn.getTime() === today.getTime();
  }

  /**
   * Get check-in summary for the user
   */
  async getCheckInSummary(userId: string, days: number = 7): Promise<CheckInSummary> {
    const checkIns = await dataAccessLayer.getDailyCheckIns(userId, days);
    
    if (checkIns.length === 0) {
      return {
        totalCheckIns: 0,
        averageMood: 0,
        averageEnergy: 0,
        recentTrend: 'stable',
        lastCheckIn: null,
      };
    }

    const totalMood = checkIns.reduce((sum, checkIn) => sum + checkIn.mood, 0);
    const totalEnergy = checkIns.reduce((sum, checkIn) => sum + checkIn.energyLevel, 0);
    
    const averageMood = totalMood / checkIns.length;
    const averageEnergy = totalEnergy / checkIns.length;
    
    // Calculate trend (compare first half vs second half)
    const midPoint = Math.floor(checkIns.length / 2);
    const recentCheckIns = checkIns.slice(0, midPoint);
    const olderCheckIns = checkIns.slice(midPoint);
    
    let recentTrend: 'improving' | 'stable' | 'declining' = 'stable';
    
    if (recentCheckIns.length > 0 && olderCheckIns.length > 0) {
      const recentAvg = recentCheckIns.reduce((sum, c) => sum + c.mood + c.energyLevel, 0) / (recentCheckIns.length * 2);
      const olderAvg = olderCheckIns.reduce((sum, c) => sum + c.mood + c.energyLevel, 0) / (olderCheckIns.length * 2);
      
      const difference = recentAvg - olderAvg;
      if (difference > 0.5) recentTrend = 'improving';
      else if (difference < -0.5) recentTrend = 'declining';
    }

    return {
      totalCheckIns: checkIns.length,
      averageMood,
      averageEnergy,
      recentTrend,
      lastCheckIn: new Date(checkIns[0].date),
    };
  }

  /**
   * Get wellness insights based on check-in history
   */
  async getWellnessInsights(userId: string): Promise<string[]> {
    const checkIns = await dataAccessLayer.getDailyCheckIns(userId, 14);
    const insights: string[] = [];

    if (checkIns.length === 0) {
      insights.push("Start your wellness journey with daily check-ins!");
      return insights;
    }

    // Consistency insight
    if (checkIns.length >= 7) {
      insights.push("Great job staying consistent with your check-ins!");
    } else if (checkIns.length >= 3) {
      insights.push("You're building a good check-in habit. Keep it up!");
    }

    // Mood insights
    const averageMood = checkIns.reduce((sum, c) => sum + c.mood, 0) / checkIns.length;
    if (averageMood >= 4) {
      insights.push("Your mood has been consistently positive lately!");
    } else if (averageMood <= 2) {
      insights.push("Consider reaching out to family or friends for support.");
    }

    // Energy insights
    const averageEnergy = checkIns.reduce((sum, c) => sum + c.energyLevel, 0) / checkIns.length;
    if (averageEnergy <= 2) {
      insights.push("Your energy levels seem low. Make sure you're getting enough rest.");
    } else if (averageEnergy >= 4) {
      insights.push("Your energy levels are great! Keep up the good habits.");
    }

    // Concerns insight
    const recentConcerns = checkIns.slice(0, 3).filter(c => c.concerns && c.concerns.length > 0);
    if (recentConcerns.length >= 2) {
      insights.push("You've mentioned some concerns recently. Consider talking to someone you trust.");
    }

    return insights;
  }

  /**
   * Create a daily check-in
   */
  async createCheckIn(checkIn: Omit<DailyCheckIn, 'id' | 'completedAt'>): Promise<DailyCheckIn> {
    const newCheckIn: DailyCheckIn = {
      ...checkIn,
      id: crypto.randomUUID(),
      completedAt: new Date(),
    };

    await dataAccessLayer.addDailyCheckIn(newCheckIn);
    return newCheckIn;
  }

  /**
   * Get check-in history for display
   */
  async getCheckInHistory(userId: string, limit: number = 30): Promise<DailyCheckIn[]> {
    return await dataAccessLayer.getDailyCheckIns(userId, limit);
  }

  /**
   * Check if user needs a gentle reminder
   */
  async needsCheckInReminder(userId: string): Promise<boolean> {
    const hasCompletedToday = await this.hasCompletedTodayCheckIn(userId);
    if (hasCompletedToday) return false;

    // Check if it's been more than 24 hours since last check-in
    const checkIns = await dataAccessLayer.getDailyCheckIns(userId, 1);
    if (checkIns.length === 0) return true;

    const lastCheckIn = new Date(checkIns[0].date);
    const now = new Date();
    const hoursSinceLastCheckIn = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastCheckIn >= 24;
  }

  /**
   * Get encouraging message based on mood and energy
   */
  getEncouragingMessage(mood: number, energy: number): string {
    if (mood >= 4 && energy >= 4) {
      return "You're having a wonderful day! Keep that positive energy flowing! ✨";
    } else if (mood >= 3 && energy >= 3) {
      return "You're doing great today! Remember to take care of yourself. 🌟";
    } else if (mood <= 2 || energy <= 2) {
      return "Thank you for sharing how you're feeling. Remember, it's okay to have difficult days. You're not alone. 💙";
    } else {
      return "Thank you for checking in today. Every day is a new opportunity to feel better. 🌈";
    }
  }

  /**
   * Determine if emergency contacts should be notified
   */
  shouldNotifyEmergencyContacts(checkIn: DailyCheckIn, recentCheckIns: DailyCheckIn[]): boolean {
    // Notify if mood is very low for multiple days
    const lowMoodDays = recentCheckIns.filter(c => c.mood <= 2).length;
    if (checkIn.mood <= 2 && lowMoodDays >= 2) {
      return true;
    }

    // Notify if there are concerning patterns
    const concerningConcerns = [
      'pain', 'chest pain', 'breathing', 'dizzy', 'fall', 'emergency'
    ];
    
    if (checkIn.concerns) {
      const lowerConcerns = checkIn.concerns.toLowerCase();
      return concerningConcerns.some(concern => lowerConcerns.includes(concern));
    }

    return false;
  }
}

// Voice recording service (placeholder for actual implementation)
export class VoiceRecordingService {
  private isRecording = false;
  private recordingStartTime: Date | null = null;

  /**
   * Start recording voice note
   */
  async startRecording(): Promise<void> {
    if (this.isRecording) {
      throw new Error('Already recording');
    }

    // In a real implementation, this would use react-native-audio-recorder-player
    // or similar library to start audio recording
    this.isRecording = true;
    this.recordingStartTime = new Date();
    
    console.log('Voice recording started');
  }

  /**
   * Stop recording and return audio URI
   */
  async stopRecording(): Promise<{ uri: string; duration: number }> {
    if (!this.isRecording || !this.recordingStartTime) {
      throw new Error('Not currently recording');
    }

    const duration = Date.now() - this.recordingStartTime.getTime();
    this.isRecording = false;
    this.recordingStartTime = null;

    // In a real implementation, this would return the actual audio file URI
    const mockUri = `file://recordings/voice_note_${Date.now()}.m4a`;
    
    console.log('Voice recording stopped', { uri: mockUri, duration });
    
    return {
      uri: mockUri,
      duration: Math.floor(duration / 1000), // Convert to seconds
    };
  }

  /**
   * Play recorded voice note
   */
  async playRecording(uri: string): Promise<void> {
    // In a real implementation, this would use an audio player
    console.log('Playing voice note:', uri);
  }

  /**
   * Get recording status
   */
  getRecordingStatus(): { isRecording: boolean; duration: number } {
    const duration = this.recordingStartTime 
      ? Date.now() - this.recordingStartTime.getTime()
      : 0;

    return {
      isRecording: this.isRecording,
      duration: Math.floor(duration / 1000),
    };
  }
}

// Singleton instances
export const checkInService = new CheckInService();
export const voiceRecordingService = new VoiceRecordingService();