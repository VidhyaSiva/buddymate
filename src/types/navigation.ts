/**
 * Navigation type definitions for BuddyMate app
 * Defines the navigation structure with maximum 2-level depth
 */

export type RootTabParamList = {
  Dashboard: undefined;
  Health: undefined;
  Family: undefined;
  Emergency: undefined;
  Activities: undefined;
  Community: undefined;
  ErrorDemo: undefined;
};

export type HealthStackParamList = {
  HealthDashboard: undefined;
  DailyCheckIn: undefined;
  MedicationReminders: undefined;
  MedicationSetup: undefined;
  WeeklyAdherence: undefined;
  NotificationDemo: undefined;
  HealthHistory: undefined;
};

export type FamilyStackParamList = {
  FamilyDashboard: undefined;
  ContactList: undefined;
  VideoCall: { contactId: string };
  Messages: { contactId: string };
};

export type ActivitiesStackParamList = {
  ActivitiesDashboard: undefined;
  DailyRoutine: undefined;
  ActivityGuide: { activityId: string };
  Achievements: undefined;
};

export type CommunityStackParamList = {
  CommunityDashboard: undefined;
  LocalResources: undefined;
  Events: undefined;
  ResourceDetails: { resourceId: string };
};

// Navigation accessibility labels for screen readers
export const NavigationLabels = {
  Dashboard: 'Home Dashboard',
  Health: 'Health and Wellness',
  Family: 'Family and Friends',
  Emergency: 'Emergency Help',
  Activities: 'Daily Activities',
  Community: 'Community Resources',
  ErrorDemo: 'Error Demo',
} as const;

// Voice guidance text for navigation
export const VoiceGuidance = {
  tabNavigation: 'You are now in the main navigation. Swipe left or right to explore different sections.',
  backButton: 'Tap the back button to return to the previous screen.',
  emergencyAccess: 'Emergency help is always available by tapping the red emergency button.',
} as const;