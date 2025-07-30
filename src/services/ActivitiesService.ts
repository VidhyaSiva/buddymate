import { dataAccessLayer } from '../storage/DataAccessLayer';
import { 
  RoutineItem, 
  DailyRoutine, 
  Achievement, 
  ActivitySuggestion,
  ActivityStep,
  ActivityProgress
} from '../types/activities';
import { Activity } from '../types/community';
// Using native Date methods instead of date-fns for better compatibility
const formatDate = (date: Date, formatStr: string): string => {
  if (formatStr === 'yyyy-MM-dd') {
    return date.toISOString().split('T')[0];
  }
  return date.toLocaleDateString();
};

/**
 * Service for managing daily routines, activities, and achievements
 */
export class ActivitiesService {
  private static instance: ActivitiesService;

  private constructor() {}

  public static getInstance(): ActivitiesService {
    if (!ActivitiesService.instance) {
      ActivitiesService.instance = new ActivitiesService();
    }
    return ActivitiesService.instance;
  }

  /**
   * Creates a new daily routine for a user
   */
  async createDailyRoutine(userId: string, date: Date = new Date()): Promise<DailyRoutine> {
    // Get user's routine template items
    const templateItems = await this.getRoutineTemplateItems(userId);
    
    // Create a new daily routine
    const routine: DailyRoutine = {
      id: `routine-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      date,
      items: templateItems.map(item => ({
        ...item,
        isCompleted: false,
        completedAt: undefined
      })),
      completedCount: 0,
      totalCount: templateItems.length
    };
    
    // Save the routine
    await this.saveDailyRoutine(routine);
    return routine;
  }
  
  /**
   * Gets the user's routine template items (recurring items)
   */
  async getRoutineTemplateItems(userId: string): Promise<RoutineItem[]> {
    const communityData = await dataAccessLayer.getCommunityData();
    if (!communityData) return [];
    
    // Filter for template items (stored as activities with special category)
    const routineTemplates = communityData.activities
      .filter(activity => 
        activity.userId === userId && 
        activity.category === 'exercise' && 
        activity.title.startsWith('Routine:'))
      .map((activity, index) => {
        // Convert activity to routine item
        const routineItem: RoutineItem = {
          id: activity.id,
          title: activity.title.replace('Routine:', '').trim(),
          description: activity.description,
          timeOfDay: this.getTimeOfDayFromActivity(activity),
          isCompleted: false,
          isRecurring: true,
          recurringDays: [0, 1, 2, 3, 4, 5, 6], // Default to every day
          userId: activity.userId,
          order: index,
          reminderEnabled: false
        };
        return routineItem;
      });
      
    // If no templates exist, create default ones
    if (routineTemplates.length === 0) {
      return this.createDefaultRoutineItems(userId);
    }
    
    return routineTemplates;
  }
  
  /**
   * Creates default routine items for a new user
   */
  private createDefaultRoutineItems(userId: string): RoutineItem[] {
    const defaultItems: Partial<RoutineItem>[] = [
      {
        title: 'Morning Medication',
        description: 'Take your morning medications',
        timeOfDay: 'morning',
        isRecurring: true,
        recurringDays: [0, 1, 2, 3, 4, 5, 6],
        order: 0,
        reminderEnabled: true,
        reminderTime: '08:00'
      },
      {
        title: 'Morning Stretches',
        description: 'Do your morning stretching routine',
        timeOfDay: 'morning',
        isRecurring: true,
        recurringDays: [0, 1, 2, 3, 4, 5, 6],
        order: 1,
        reminderEnabled: true,
        reminderTime: '08:30'
      },
      {
        title: 'Afternoon Walk',
        description: 'Take a short walk outside',
        timeOfDay: 'afternoon',
        isRecurring: true,
        recurringDays: [0, 1, 2, 3, 4, 5, 6],
        order: 2,
        reminderEnabled: true,
        reminderTime: '14:00'
      },
      {
        title: 'Evening Medication',
        description: 'Take your evening medications',
        timeOfDay: 'evening',
        isRecurring: true,
        recurringDays: [0, 1, 2, 3, 4, 5, 6],
        order: 3,
        reminderEnabled: true,
        reminderTime: '20:00'
      }
    ];
    
    return defaultItems.map((item, index) => ({
      id: `routine-item-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      isCompleted: false,
      ...item
    } as RoutineItem));
  }
  
  /**
   * Determines time of day from activity properties
   */
  private getTimeOfDayFromActivity(activity: Activity): 'morning' | 'afternoon' | 'evening' | 'anytime' {
    const title = activity.title.toLowerCase();
    if (title.includes('morning')) return 'morning';
    if (title.includes('afternoon')) return 'afternoon';
    if (title.includes('evening')) return 'evening';
    return 'anytime';
  }
  
  /**
   * Saves a daily routine
   */
  async saveDailyRoutine(routine: DailyRoutine): Promise<void> {
    const communityData = await dataAccessLayer.getCommunityData() || { 
      resources: [], 
      activities: [], 
      events: [] 
    };
    
    // Store routine as a special activity
    const routineActivity: Activity = {
      id: routine.id,
      title: `Daily Routine: ${new Date(routine.date).toLocaleDateString()}`,
      description: `Daily routine with ${routine.completedCount}/${routine.totalCount} items completed`,
      category: 'exercise',
      difficulty: 'easy',
      estimatedDuration: 60,
      instructions: routine.items.map(item => item.title),
      isCompleted: routine.completedCount === routine.totalCount,
      userId: routine.userId,
      // Store the actual routine data in a custom property
      // We'll need to add this to the Activity type later
      routineData: JSON.stringify(routine)
    } as Activity & { routineData: string };
    
    // Find and update existing or add new
    const existingIndex = communityData.activities.findIndex(a => a.id === routine.id);
    if (existingIndex >= 0) {
      communityData.activities[existingIndex] = routineActivity;
    } else {
      communityData.activities.push(routineActivity);
    }
    
    await dataAccessLayer.saveCommunityData(communityData);
  }
  
  /**
   * Gets a user's daily routine for a specific date
   */
  async getDailyRoutine(userId: string, date: Date = new Date()): Promise<DailyRoutine | null> {
    const communityData = await dataAccessLayer.getCommunityData();
    
    if (!communityData) {
      return this.createDailyRoutine(userId, date);
    }
    
    const dateString = date.toLocaleDateString();
    const routineActivity = communityData.activities.find(a => 
      a.userId === userId && 
      a.title.includes(dateString) &&
      (a as any).routineData
    );
    
    if (!routineActivity) {
      // No routine found for this date, create a new one
      return this.createDailyRoutine(userId, date);
    }
    
    try {
      // Parse the stored routine data
      const routineData = JSON.parse((routineActivity as any).routineData) as DailyRoutine;
      return routineData;
    } catch (error) {
      console.error('Error parsing routine data:', error);
      // If parsing fails, create a new routine instead of returning null
      return this.createDailyRoutine(userId, date);
    }
  }
  
  /**
   * Updates a routine item's completion status
   */
  async updateRoutineItemStatus(
    userId: string, 
    routineId: string, 
    itemId: string, 
    isCompleted: boolean
  ): Promise<DailyRoutine | null> {
    const routine = await this.getDailyRoutine(userId);
    if (!routine || routine.id !== routineId) return null;
    
    const itemIndex = routine.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return null;
    
    // Update the item
    routine.items[itemIndex] = {
      ...routine.items[itemIndex],
      isCompleted,
      completedAt: isCompleted ? new Date() : undefined
    };
    
    // Update completion counts
    routine.completedCount = routine.items.filter(item => item.isCompleted).length;
    
    // Save the updated routine
    await this.saveDailyRoutine(routine);
    
    // Check if this completion should earn an achievement
    if (isCompleted) {
      await this.checkForAchievements(userId);
    }
    
    return routine;
  }
  
  /**
   * Adds a new routine item
   */
  async addRoutineItem(userId: string, item: Omit<RoutineItem, 'id'>): Promise<RoutineItem> {
    const newItem: RoutineItem = {
      ...item,
      id: `routine-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId
    };
    
    const routine = await this.getDailyRoutine(userId);
    if (routine) {
      routine.items.push(newItem);
      routine.totalCount = routine.items.length;
      await this.saveDailyRoutine(routine);
    }
    
    return newItem;
  }
  
  /**
   * Removes a routine item
   */
  async removeRoutineItem(userId: string, routineId: string, itemId: string): Promise<boolean> {
    const routine = await this.getDailyRoutine(userId);
    if (!routine || routine.id !== routineId) return false;
    
    const initialLength = routine.items.length;
    routine.items = routine.items.filter(item => item.id !== itemId);
    
    if (routine.items.length < initialLength) {
      routine.totalCount = routine.items.length;
      routine.completedCount = routine.items.filter(item => item.isCompleted).length;
      await this.saveDailyRoutine(routine);
      return true;
    }
    
    return false;
  }
  
  /**
   * Gets all achievements for a user
   */
  async getAchievements(userId: string): Promise<Achievement[]> {
    const communityData = await dataAccessLayer.getCommunityData();
    if (!communityData) return [];
    
    // Filter for achievements (stored as activities with special category)
    const achievements = communityData.activities
      .filter(activity => 
        activity.userId === userId && 
        activity.category === 'social' && 
        activity.title.startsWith('Achievement:'))
      .map(activity => {
        try {
          // Parse achievement data from activity
          return JSON.parse((activity as any).achievementData) as Achievement;
        } catch (error) {
          console.error('Error parsing achievement data:', error);
          return null;
        }
      })
      .filter((achievement): achievement is Achievement => achievement !== null);
      
    // If no achievements exist, create default ones
    if (achievements.length === 0) {
      return this.createDefaultAchievements(userId);
    }
    
    return achievements;
  }
  
  /**
   * Creates default achievements for a new user
   */
  private async createDefaultAchievements(userId: string): Promise<Achievement[]> {
    const defaultAchievements: Achievement[] = [
      {
        id: crypto.randomUUID(),
        title: 'Early Bird',
        description: 'Complete all morning routine items for 3 days',
        iconName: 'sunrise',
        isEarned: false,
        progress: 0,
        userId,
        category: 'activity',
        level: 'bronze'
      },
      {
        id: crypto.randomUUID(),
        title: 'Consistency Champion',
        description: 'Complete your full daily routine for 7 days in a row',
        iconName: 'calendar-check',
        isEarned: false,
        progress: 0,
        userId,
        category: 'activity',
        level: 'silver'
      },
      {
        id: crypto.randomUUID(),
        title: 'Health Hero',
        description: 'Take all medications on time for 14 days',
        iconName: 'heart',
        isEarned: false,
        progress: 0,
        userId,
        category: 'health',
        level: 'gold'
      },
      {
        id: crypto.randomUUID(),
        title: 'Social Butterfly',
        description: 'Connect with family members 5 times',
        iconName: 'users',
        isEarned: false,
        progress: 0,
        userId,
        category: 'social',
        level: 'bronze'
      },
      {
        id: crypto.randomUUID(),
        title: 'Knowledge Seeker',
        description: 'Complete 3 educational activities',
        iconName: 'book',
        isEarned: false,
        progress: 0,
        userId,
        category: 'learning',
        level: 'silver'
      }
    ];
    
    // Save the default achievements
    for (const achievement of defaultAchievements) {
      await this.saveAchievement(achievement);
    }
    
    return defaultAchievements;
  }
  
  /**
   * Saves an achievement
   */
  async saveAchievement(achievement: Achievement): Promise<void> {
    const communityData = await dataAccessLayer.getCommunityData() || { 
      resources: [], 
      activities: [], 
      events: [] 
    };
    
    // Store achievement as a special activity
    const achievementActivity: Activity = {
      id: achievement.id,
      title: `Achievement: ${achievement.title}`,
      description: achievement.description,
      category: 'social',
      difficulty: 'easy',
      estimatedDuration: 0,
      instructions: [],
      isCompleted: achievement.isEarned,
      userId: achievement.userId,
      // Store the actual achievement data
      achievementData: JSON.stringify(achievement)
    } as Activity & { achievementData: string };
    
    // Find and update existing or add new
    const existingIndex = communityData.activities.findIndex(a => a.id === achievement.id);
    if (existingIndex >= 0) {
      communityData.activities[existingIndex] = achievementActivity;
    } else {
      communityData.activities.push(achievementActivity);
    }
    
    await dataAccessLayer.saveCommunityData(communityData);
  }
  
  /**
   * Updates an achievement's progress
   */
  async updateAchievementProgress(
    userId: string, 
    achievementId: string, 
    progress: number
  ): Promise<Achievement | null> {
    const achievements = await this.getAchievements(userId);
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return null;
    
    // Update progress
    achievement.progress = Math.min(100, Math.max(0, progress));
    
    // Check if achievement is now earned
    if (achievement.progress >= 100 && !achievement.isEarned) {
      achievement.isEarned = true;
      achievement.earnedAt = new Date();
      
      // TODO: Trigger celebration animation or notification
    }
    
    // Save the updated achievement
    await this.saveAchievement(achievement);
    return achievement;
  }
  
  /**
   * Checks for achievements that should be updated based on user activity
   */
  async checkForAchievements(userId: string): Promise<void> {
    const achievements = await this.getAchievements(userId);
    const routine = await this.getDailyRoutine(userId);
    
    if (!routine) return;
    
    // Check for Early Bird achievement
    const earlyBird = achievements.find(a => a.title === 'Early Bird');
    if (earlyBird) {
      const morningItems = routine.items.filter(item => item.timeOfDay === 'morning');
      const completedMorningItems = morningItems.filter(item => item.isCompleted);
      
      if (morningItems.length > 0 && completedMorningItems.length === morningItems.length) {
        // All morning items completed, update progress (assume 3 days needed)
        const newProgress = Math.min(100, earlyBird.progress + 33.33);
        await this.updateAchievementProgress(userId, earlyBird.id, newProgress);
      }
    }
    
    // Check for Consistency Champion achievement
    const consistencyChampion = achievements.find(a => a.title === 'Consistency Champion');
    if (consistencyChampion && routine.completedCount === routine.totalCount) {
      // Full routine completed, update progress (assume 7 days needed)
      const newProgress = Math.min(100, consistencyChampion.progress + 14.29);
      await this.updateAchievementProgress(userId, consistencyChampion.id, newProgress);
    }
    
    // Other achievements would be checked similarly
  }
  
  /**
   * Gets activity suggestions for a user
   */
  async getActivitySuggestions(userId: string): Promise<ActivitySuggestion[]> {
    const communityData = await dataAccessLayer.getCommunityData();
    if (!communityData) return [];
    
    // Get all activities that could be suggested
    const allActivities = communityData.activities.filter(activity => 
      !activity.title.startsWith('Routine:') && 
      !activity.title.startsWith('Achievement:') &&
      !activity.title.startsWith('Daily Routine:')
    );
    
    // Create suggestions based on user preferences and past activities
    // For now, just suggest random activities
    const suggestions: ActivitySuggestion[] = allActivities
      .slice(0, 3)
      .map(activity => ({
        id: crypto.randomUUID(),
        activity,
        reason: 'Based on your interests',
        suggestedAt: new Date(),
        userId
      }));
    
    return suggestions;
  }
  
  /**
   * Gets detailed steps for an activity
   */
  async getActivitySteps(activityId: string): Promise<ActivityStep[]> {
    const communityData = await dataAccessLayer.getCommunityData();
    if (!communityData) return [];
    
    const activity = communityData.activities.find(a => a.id === activityId);
    if (!activity) return [];
    
    // Convert instructions to steps
    return activity.instructions.map((instruction, index) => ({
      id: crypto.randomUUID(),
      activityId,
      order: index,
      instruction,
      hasVoiceInstruction: false,
      estimatedDuration: activity.estimatedDuration / activity.instructions.length
    }));
  }
  
  /**
   * Starts tracking progress for an activity
   */
  async startActivity(userId: string, activityId: string): Promise<ActivityProgress> {
    const steps = await this.getActivitySteps(activityId);
    
    const progress: ActivityProgress = {
      id: crypto.randomUUID(),
      userId,
      activityId,
      startedAt: new Date(),
      currentStepIndex: 0,
      totalSteps: steps.length,
      isCompleted: false
    };
    
    // Save progress
    await this.saveActivityProgress(progress);
    return progress;
  }
  
  /**
   * Updates activity progress
   */
  async updateActivityProgress(
    userId: string, 
    progressId: string, 
    currentStepIndex: number
  ): Promise<ActivityProgress | null> {
    const communityData = await dataAccessLayer.getCommunityData();
    if (!communityData) return null;
    
    // Find the progress in stored activities
    const progressActivity = communityData.activities.find(a => 
      (a as any).progressId === progressId
    );
    
    if (!progressActivity) return null;
    
    try {
      // Parse progress data
      const progress = JSON.parse((progressActivity as any).progressData) as ActivityProgress;
      
      // Update progress
      progress.currentStepIndex = currentStepIndex;
      
      // Check if activity is now completed
      if (currentStepIndex >= progress.totalSteps - 1) {
        progress.isCompleted = true;
        progress.completedAt = new Date();
        
        // Update the original activity as completed
        const activityIndex = communityData.activities.findIndex(a => a.id === progress.activityId);
        if (activityIndex >= 0) {
          communityData.activities[activityIndex] = {
            ...communityData.activities[activityIndex],
            isCompleted: true,
            completedAt: new Date()
          };
        }
        
        // Check for achievements
        await this.checkForActivityAchievements(userId, progress.activityId);
      }
      
      // Save updated progress
      await this.saveActivityProgress(progress);
      await dataAccessLayer.saveCommunityData(communityData);
      
      return progress;
    } catch (error) {
      console.error('Error updating activity progress:', error);
      return null;
    }
  }
  
  /**
   * Saves activity progress
   */
  private async saveActivityProgress(progress: ActivityProgress): Promise<void> {
    const communityData = await dataAccessLayer.getCommunityData() || { 
      resources: [], 
      activities: [], 
      events: [] 
    };
    
    // Store progress as a special activity
    const progressActivity: Activity = {
      id: `progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `Progress: ${progress.id}`,
      description: `Activity progress tracking`,
      category: 'exercise',
      difficulty: 'easy',
      estimatedDuration: 0,
      instructions: [],
      isCompleted: progress.isCompleted,
      userId: progress.userId,
      // Store the actual progress data
      progressId: progress.id,
      progressData: JSON.stringify(progress)
    } as Activity & { progressId: string, progressData: string };
    
    // Find and update existing or add new
    const existingIndex = communityData.activities.findIndex(a => 
      (a as any).progressId === progress.id
    );
    
    if (existingIndex >= 0) {
      communityData.activities[existingIndex] = progressActivity;
    } else {
      communityData.activities.push(progressActivity);
    }
    
    await dataAccessLayer.saveCommunityData(communityData);
  }
  
  /**
   * Checks for achievements related to completing activities
   */
  private async checkForActivityAchievements(userId: string, activityId: string): Promise<void> {
    const communityData = await dataAccessLayer.getCommunityData();
    if (!communityData) return;
    
    const activity = communityData.activities.find(a => a.id === activityId);
    if (!activity) return;
    
    const achievements = await this.getAchievements(userId);
    
    // Check for Knowledge Seeker achievement
    if (activity.category === 'educational') {
      const knowledgeSeeker = achievements.find(a => a.title === 'Knowledge Seeker');
      if (knowledgeSeeker) {
        // Update progress (assume 3 educational activities needed)
        const newProgress = Math.min(100, knowledgeSeeker.progress + 33.33);
        await this.updateAchievementProgress(userId, knowledgeSeeker.id, newProgress);
      }
    }
    
    // Other achievement checks would go here
  }
}

// Singleton instance
export const activitiesService = ActivitiesService.getInstance();