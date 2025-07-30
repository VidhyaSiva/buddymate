export interface CommunityResource {
  id: string;
  name: string;
  category: 'healthcare' | 'transportation' | 'social' | 'emergency';
  description: string;
  address: string;
  phoneNumber: string;
  website?: string;
  hours: string;
  distance?: number; // calculated based on user location
  rating?: number;
  isVerified: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  services?: string[]; // List of specific services offered
  accessibility?: {
    wheelchairAccessible: boolean;
    hearingLoop: boolean;
    largeText: boolean;
  };
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: 'exercise' | 'social' | 'educational' | 'creative';
  difficulty: 'easy' | 'moderate';
  estimatedDuration: number; // minutes
  instructions: string[];
  isCompleted: boolean;
  completedAt?: Date;
  userId: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  category: 'social' | 'educational' | 'health' | 'recreational';
  maxParticipants?: number;
  currentParticipants: number;
  isRegistered: boolean;
}

export interface Community {
  resources: CommunityResource[];
  activities: Activity[];
  events: CommunityEvent[];
}