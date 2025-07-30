import { 
  RoutineItem, 
  DailyRoutine, 
  Achievement, 
  ActivitySuggestion,
  ActivityStep,
  ActivityProgress
} from '../types/activities';
import { Activity } from '../types/community';
import { format } from 'date-fns';

export const createMockRoutineItem = (overrides?: Partial<RoutineItem>): RoutineItem => ({
  id: crypto.randomUUID(),
  title: 'Morning Medication',
  description: 'Take your morning medications',
  timeOfDay: 'morning',
  isCompleted: false,
  isRecurring: true,
  recurringDays: [0, 1, 2, 3, 4, 5, 6], // Every day
  userId: '123456',
  order: 0,
  reminderEnabled: true,
  reminderTime: '08:00',
  ...overrides,
});

export const createMockDailyRoutine = (overrides?: Partial<DailyRoutine>): DailyRoutine => {
  const items = [
    createMockRoutineItem({ title: 'Morning Medication', timeOfDay: 'morning', order: 0 }),
    createMockRoutineItem({ title: 'Morning Stretches', timeOfDay: 'morning', order: 1 }),
    createMockRoutineItem({ title: 'Breakfast', timeOfDay: 'morning', order: 2 }),
    createMockRoutineItem({ title: 'Afternoon Walk', timeOfDay: 'afternoon', order: 3 }),
    createMockRoutineItem({ title: 'Evening Medication', timeOfDay: 'evening', order: 4 }),
  ];
  
  return {
    id: crypto.randomUUID(),
    userId: '123456',
    date: new Date(),
    items,
    completedCount: 0,
    totalCount: items.length,
    ...overrides,
  };
};

export const createMockAchievement = (overrides?: Partial<Achievement>): Achievement => ({
  id: crypto.randomUUID(),
  title: 'Early Bird',
  description: 'Complete all morning routine items for 3 days',
  iconName: 'sunrise',
  isEarned: false,
  progress: 0,
  userId: '123456',
  category: 'activity',
  level: 'bronze',
  ...overrides,
});

export const createMockActivitySuggestion = (overrides?: Partial<ActivitySuggestion>): ActivitySuggestion => {
  const activity = createMockActivity();
  
  return {
    id: crypto.randomUUID(),
    activity,
    reason: 'Based on your interests',
    suggestedAt: new Date(),
    userId: '123456',
    ...overrides,
  };
};

export const createMockActivity = (overrides?: Partial<Activity>): Activity => ({
  id: crypto.randomUUID(),
  title: 'Morning Stretches',
  description: 'Gentle stretching exercises to start your day',
  category: 'exercise',
  difficulty: 'easy',
  estimatedDuration: 15,
  instructions: [
    'Find a comfortable chair or standing position',
    'Slowly roll your shoulders backward 5 times',
    'Gently turn your head left and right',
    'Stretch your arms above your head',
    'Take deep breaths throughout',
  ],
  isCompleted: false,
  userId: '123456',
  ...overrides,
});

export const createMockActivityStep = (overrides?: Partial<ActivityStep>): ActivityStep => ({
  id: crypto.randomUUID(),
  activityId: crypto.randomUUID(),
  order: 0,
  instruction: 'Find a comfortable chair or standing position',
  hasVoiceInstruction: false,
  estimatedDuration: 60,
  ...overrides,
});

export const createMockActivityProgress = (overrides?: Partial<ActivityProgress>): ActivityProgress => ({
  id: crypto.randomUUID(),
  userId: '123456',
  activityId: crypto.randomUUID(),
  startedAt: new Date(),
  currentStepIndex: 0,
  totalSteps: 5,
  isCompleted: false,
  ...overrides,
});

export const createMockRoutineItems = (count: number, userId: string): RoutineItem[] => {
  const timeOfDayOptions: ('morning' | 'afternoon' | 'evening' | 'anytime')[] = ['morning', 'afternoon', 'evening', 'anytime'];
  const routineItems: RoutineItem[] = [];
  
  for (let i = 0; i < count; i++) {
    const timeOfDay = timeOfDayOptions[i % timeOfDayOptions.length];
    
    routineItems.push(createMockRoutineItem({
      title: `${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} Activity ${i + 1}`,
      timeOfDay,
      order: i,
      userId,
      isCompleted: Math.random() > 0.7, // 30% chance of being completed
    }));
  }
  
  return routineItems;
};

export const createMockAchievements = (count: number, userId: string): Achievement[] => {
  const iconNames = ['sunrise', 'calendar-check', 'heart', 'users', 'book', 'star', 'trophy', 'medal'];
  const categories: ('health' | 'social' | 'activity' | 'learning')[] = ['health', 'social', 'activity', 'learning'];
  const levels: ('bronze' | 'silver' | 'gold')[] = ['bronze', 'silver', 'gold'];
  
  return Array.from({ length: count }, (_, index) => {
    const isEarned = Math.random() > 0.6; // 40% chance of being earned
    
    return createMockAchievement({
      title: `Achievement ${index + 1}`,
      description: `This is a sample achievement description for achievement ${index + 1}`,
      iconName: iconNames[index % iconNames.length],
      isEarned,
      progress: isEarned ? 100 : Math.floor(Math.random() * 80),
      earnedAt: isEarned ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
      userId,
      category: categories[index % categories.length],
      level: levels[index % levels.length],
    });
  });
};

export const createMockActivities = (count: number, userId: string): Activity[] => {
  const categories: ('exercise' | 'social' | 'educational' | 'creative')[] = ['exercise', 'social', 'educational', 'creative'];
  const difficulties: ('easy' | 'moderate')[] = ['easy', 'moderate'];
  
  return Array.from({ length: count }, (_, index) => {
    const category = categories[index % categories.length];
    const difficulty = difficulties[index % difficulties.length];
    const isCompleted = Math.random() > 0.7; // 30% chance of being completed
    
    return createMockActivity({
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Activity ${index + 1}`,
      description: `This is a sample ${category} activity that is ${difficulty} difficulty.`,
      category,
      difficulty,
      estimatedDuration: Math.floor(Math.random() * 30) + 10, // 10-40 minutes
      isCompleted,
      userId,
    });
  });
};