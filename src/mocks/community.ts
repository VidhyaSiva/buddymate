import { CommunityResource, Activity, CommunityEvent, Community } from '../types/community';

export const createMockCommunityResource = (overrides?: Partial<CommunityResource>): CommunityResource => {
  const baseResource = {
    id: crypto.randomUUID(),
    name: 'Sunrise Senior Center',
    category: 'social' as const,
    description: 'Community center offering activities and support for seniors',
    address: '123 Main Street, Anytown, ST 12345',
    phoneNumber: '+1-555-123-4567',
    website: 'https://sunrisesenior.org',
    hours: 'Mon-Fri 9:00 AM - 5:00 PM',
    rating: 4.5,
    isVerified: true,
    coordinates: {
      latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
      longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
    },
    services: ['Social Activities', 'Meal Programs', 'Transportation'],
    accessibility: {
      wheelchairAccessible: true,
      hearingLoop: true,
      largeText: true,
    },
  };
  
  // Apply overrides, but don't include distance in the base resource
  // Distance should be calculated by the service
  const result = { ...baseResource, ...overrides };
  
  // Remove distance from the base resource if it wasn't explicitly set in overrides
  if (!overrides?.distance) {
    delete result.distance;
  }
  
  return result;
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
  userId: crypto.randomUUID(),
  ...overrides,
});

export const createMockCommunityEvent = (overrides?: Partial<CommunityEvent>): CommunityEvent => ({
  id: crypto.randomUUID(),
  title: 'Senior Book Club',
  description: 'Monthly book discussion group for seniors',
  location: 'Community Library, Room 201',
  startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
  endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
  category: 'social',
  maxParticipants: 15,
  currentParticipants: 8,
  isRegistered: false,
  ...overrides,
});

export const createMockCommunity = (overrides?: Partial<Community>): Community => ({
  resources: [createMockCommunityResource()],
  activities: [createMockActivity()],
  events: [createMockCommunityEvent()],
  ...overrides,
});

export const createMockCommunityResources = (count: number): CommunityResource[] => {
  const resourceTypes = [
    { 
      name: 'General Hospital', 
      category: 'healthcare' as const, 
      description: 'Full-service hospital with emergency care',
      services: ['Emergency Care', 'Cardiology', 'Geriatric Medicine', 'Physical Therapy'],
      hours: '24/7'
    },
    { 
      name: 'Senior Health Clinic', 
      category: 'healthcare' as const, 
      description: 'Specialized healthcare services for seniors',
      services: ['Primary Care', 'Wellness Checkups', 'Medication Management'],
      hours: 'Mon-Fri 8:00 AM - 6:00 PM'
    },
    { 
      name: 'Senior Transit Service', 
      category: 'transportation' as const, 
      description: 'Door-to-door transportation for seniors',
      services: ['Medical Appointments', 'Grocery Shopping', 'Social Outings'],
      hours: 'Mon-Fri 7:00 AM - 7:00 PM'
    },
    { 
      name: 'City Bus Service', 
      category: 'transportation' as const, 
      description: 'Public transportation with senior discounts',
      services: ['Regular Routes', 'Senior Discounts', 'Wheelchair Accessible'],
      hours: 'Daily 5:00 AM - 11:00 PM'
    },
    { 
      name: 'Community Center', 
      category: 'social' as const, 
      description: 'Activities and programs for seniors',
      services: ['Exercise Classes', 'Social Events', 'Educational Programs'],
      hours: 'Mon-Fri 9:00 AM - 5:00 PM'
    },
    { 
      name: 'Senior Center', 
      category: 'social' as const, 
      description: 'Dedicated space for senior activities and support',
      services: ['Meal Programs', 'Game Rooms', 'Support Groups'],
      hours: 'Mon-Sat 8:00 AM - 6:00 PM'
    },
    { 
      name: 'Emergency Services', 
      category: 'emergency' as const, 
      description: '24/7 emergency response services',
      services: ['Emergency Response', 'Medical Emergency', 'Safety Check'],
      hours: '24/7'
    },
    { 
      name: 'Crisis Support Hotline', 
      category: 'emergency' as const, 
      description: 'Mental health and crisis support for seniors',
      services: ['Crisis Counseling', 'Mental Health Support', 'Referral Services'],
      hours: '24/7'
    },
  ];
  
  return Array.from({ length: count }, (_, index) => {
    const type = resourceTypes[index % resourceTypes.length];
    const baseLatitude = 37.7749; // San Francisco
    const baseLongitude = -122.4194;
    
    return createMockCommunityResource({
      name: `${type.name} ${Math.floor(index / resourceTypes.length) + 1}`,
      category: type.category,
      description: type.description,
      services: type.services,
      hours: type.hours,
      rating: Math.random() * 2 + 3, // 3.0 to 5.0 rating
      isVerified: Math.random() > 0.2, // 80% verified
      coordinates: {
        latitude: baseLatitude + (Math.random() - 0.5) * 0.2, // Within ~11 miles
        longitude: baseLongitude + (Math.random() - 0.5) * 0.2,
      },
      accessibility: {
        wheelchairAccessible: Math.random() > 0.3, // 70% wheelchair accessible
        hearingLoop: Math.random() > 0.5, // 50% have hearing loop
        largeText: Math.random() > 0.2, // 80% have large text options
      },
    });
  });
};

export const createMockActivities = (count: number, userId: string): Activity[] => {
  const activityTypes = [
    { title: 'Morning Walk', category: 'exercise' as const, duration: 30 },
    { title: 'Crossword Puzzle', category: 'educational' as const, duration: 20 },
    { title: 'Call a Friend', category: 'social' as const, duration: 15 },
    { title: 'Watercolor Painting', category: 'creative' as const, duration: 45 },
  ];
  
  return Array.from({ length: count }, (_, index) => {
    const type = activityTypes[index % activityTypes.length];
    return createMockActivity({
      title: type.title,
      category: type.category,
      estimatedDuration: type.duration,
      userId,
      isCompleted: Math.random() > 0.7, // 30% chance of being completed
    });
  });
};

export const createMockCommunityEvents = (count: number): CommunityEvent[] => {
  const eventTypes = [
    { 
      title: 'Senior Book Club', 
      category: 'social' as const, 
      description: 'Monthly book discussion group for seniors',
      location: 'Community Library, Room 201'
    },
    { 
      title: 'Gentle Yoga Class', 
      category: 'health' as const, 
      description: 'Low-impact yoga designed for seniors of all abilities',
      location: 'Senior Center, Exercise Room'
    },
    { 
      title: 'Technology Workshop', 
      category: 'educational' as const, 
      description: 'Learn how to use smartphones and tablets effectively',
      location: 'Community Center, Computer Lab'
    },
    { 
      title: 'Garden Club Meeting', 
      category: 'recreational' as const, 
      description: 'Share gardening tips and socialize with fellow gardeners',
      location: 'Botanical Gardens, Meeting Room'
    },
  ];
  
  return Array.from({ length: count }, (_, index) => {
    const type = eventTypes[index % eventTypes.length];
    const daysFromNow = (index + 1) * 3; // Events spaced 3 days apart
    const startTime = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
    
    return createMockCommunityEvent({
      title: type.title,
      category: type.category,
      description: type.description,
      location: type.location,
      startTime,
      endTime,
      maxParticipants: 10 + (index % 10), // 10-19 participants
      currentParticipants: index % 8, // 0-7 current participants
      isRegistered: index % 5 === 0, // 20% chance of being registered
    });
  });
};