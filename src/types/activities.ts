/**
 * Types for daily activities and routines
 */

import { Activity } from './community';

export interface RoutineItem {
  id: string;
  title: string;
  description?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  isCompleted: boolean;
  completedAt?: Date;
  isRecurring: boolean;
  recurringDays?: number[]; // 0-6 for Sunday-Saturday
  userId: string;
  order: number; // For sorting in the list
  reminderEnabled: boolean;
  reminderTime?: string; // HH:MM format
}

export interface DailyRoutine {
  id: string;
  userId: string;
  date: Date;
  items: RoutineItem[];
  completedCount: number;
  totalCount: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  earnedAt?: Date;
  isEarned: boolean;
  progress: number; // 0-100 percentage
  userId: string;
  category: 'health' | 'social' | 'activity' | 'learning';
  level: 'bronze' | 'silver' | 'gold';
}

export interface ActivitySuggestion {
  id: string;
  activity: Activity;
  reason: string;
  suggestedAt: Date;
  userId: string;
  isAccepted?: boolean;
  acceptedAt?: Date;
}

export interface ActivityStep {
  id: string;
  activityId: string;
  order: number;
  instruction: string;
  imageUrl?: string;
  hasVoiceInstruction: boolean;
  voiceUrl?: string;
  estimatedDuration?: number; // in seconds
}

export interface ActivityProgress {
  id: string;
  userId: string;
  activityId: string;
  startedAt: Date;
  completedAt?: Date;
  currentStepIndex: number;
  totalSteps: number;
  isCompleted: boolean;
}

export interface ActivitiesState {
  routines: DailyRoutine[];
  achievements: Achievement[];
  suggestions: ActivitySuggestion[];
  activitySteps: ActivityStep[];
  activityProgress: ActivityProgress[];
}