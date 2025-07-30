import { CommunityResource, CommunityEvent, Activity } from '../types/community';
import { validateCommunityResource, validateCommunityEvent } from '../validation/community';
import { AsyncStorageWrapper } from '../storage/AsyncStorageWrapper';
import { createMockCommunityResources, createMockCommunityEvents } from '../mocks/community';

const STORAGE_KEYS = {
  RESOURCES: 'community_resources',
  EVENTS: 'community_events',
  USER_INTERESTS: 'user_interests',
  USER_NEEDS: 'user_needs',
};

export type UserInterests = {
  userId: string;
  categories: Array<'healthcare' | 'transportation' | 'social' | 'emergency' | 'educational' | 'health' | 'recreational'>;
};

export type UserNeeds = {
  userId: string;
  needs: Array<'mobility' | 'vision' | 'hearing' | 'memory' | 'transportation' | 'social' | 'healthcare'>;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type ResourceFilter = {
  category?: CommunityResource['category'];
  userNeeds?: UserNeeds['needs'];
  maxDistance?: number;
  isVerified?: boolean;
};

export class CommunityService {
  private static instance: CommunityService;
  private storage: AsyncStorageWrapper;

  private constructor() {
    this.storage = new AsyncStorageWrapper();
  }

  public static getInstance(): CommunityService {
    if (!CommunityService.instance) {
      CommunityService.instance = new CommunityService();
    }
    return CommunityService.instance;
  }

  /**
   * Initialize community resources if they don't exist
   */
  async initializeResources(): Promise<void> {
    const resources = await this.storage.getJSON<CommunityResource[]>(STORAGE_KEYS.RESOURCES);
    if (!resources || resources.length === 0) {
      const mockResources = createMockCommunityResources(12);
      await this.storage.setJSON(STORAGE_KEYS.RESOURCES, mockResources);
    }
  }
  
  /**
   * Initialize community events if they don't exist
   */
  async initializeEvents(): Promise<void> {
    const events = await this.storage.getJSON<CommunityEvent[]>(STORAGE_KEYS.EVENTS);
    if (!events || events.length === 0) {
      const mockEvents = createMockCommunityEvents(8);
      await this.storage.setJSON(STORAGE_KEYS.EVENTS, mockEvents);
    }
  }
  
  /**
   * For testing purposes - clear all resources
   */
  async clearResources(): Promise<void> {
    await this.storage.setJSON(STORAGE_KEYS.RESOURCES, []);
  }

  /**
   * For testing purposes - clear all events
   */
  async clearEvents(): Promise<void> {
    await this.storage.setJSON(STORAGE_KEYS.EVENTS, []);
  }

  /**
   * Get all community resources
   */
  async getAllResources(): Promise<CommunityResource[]> {
    await this.initializeResources();
    const resources = await this.storage.getJSON<CommunityResource[]>(STORAGE_KEYS.RESOURCES);
    return resources || [];
  }

  /**
   * Get resources by category
   */
  async getResourcesByCategory(category: CommunityResource['category']): Promise<CommunityResource[]> {
    const resources = await this.getAllResources();
    return resources.filter(resource => resource.category === category);
  }

  /**
   * Calculate distance between user location and resources
   * Uses Haversine formula to calculate distance between two points on Earth
   */
  async updateResourceDistances(userLocation: Coordinates): Promise<CommunityResource[]> {
    const resources = await this.getAllResources();
    
    // For demo purposes, we'll use random distances if real coordinates aren't available in our mock data
    // In a real app, each resource would have lat/long coordinates to calculate actual distances
    const resourcesWithDistances = resources.map(resource => ({
      ...resource,
      distance: this.calculateDistance(userLocation, resource),
    }));
    
    await this.storage.setJSON(STORAGE_KEYS.RESOURCES, resourcesWithDistances);
    return resourcesWithDistances;
  }

  /**
   * Get resources sorted by distance
   */
  async getResourcesByDistance(userLocation: Coordinates): Promise<CommunityResource[]> {
    const resources = await this.updateResourceDistances(userLocation);
    return [...resources].sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
  }

  /**
   * Filter resources based on multiple criteria
   */
  async getFilteredResources(
    userLocation: Coordinates | null,
    filter: ResourceFilter
  ): Promise<CommunityResource[]> {
    let resources = await this.getAllResources();
    
    // Update distances if user location is provided
    if (userLocation) {
      resources = await this.updateResourceDistances(userLocation);
    }
    
    // Apply category filter
    if (filter.category) {
      resources = resources.filter(resource => resource.category === filter.category);
    }
    
    // Apply user needs filter
    if (filter.userNeeds && filter.userNeeds.length > 0) {
      resources = resources.filter(resource => {
        // Map resource categories to potential user needs
        const resourceMeetsNeeds = {
          'healthcare': ['healthcare', 'memory'],
          'transportation': ['transportation', 'mobility'],
          'social': ['social'],
          'emergency': ['healthcare', 'mobility', 'vision', 'hearing', 'memory']
        };
        
        // Check if this resource's category addresses any of the user's needs
        const categoryMatches = filter.userNeeds!.some(need => 
          resourceMeetsNeeds[resource.category]?.includes(need)
        );
        
        // Also check accessibility features for specific needs
        const accessibilityMatches = filter.userNeeds!.some(need => {
          if (!resource.accessibility) return false;
          
          switch (need) {
            case 'mobility':
              return resource.accessibility.wheelchairAccessible;
            case 'hearing':
              return resource.accessibility.hearingLoop;
            case 'vision':
              return resource.accessibility.largeText;
            default:
              return false;
          }
        });
        
        return categoryMatches || accessibilityMatches;
      });
    }
    
    // Apply distance filter
    if (userLocation && filter.maxDistance !== undefined) {
      resources = resources.filter(resource => 
        (resource.distance || Infinity) <= filter.maxDistance!
      );
    }
    
    // Apply verification filter
    if (filter.isVerified !== undefined) {
      resources = resources.filter(resource => resource.isVerified === filter.isVerified);
    }
    
    // Sort by distance if user location is provided
    if (userLocation) {
      resources.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }
    
    return resources;
  }

  /**
   * Add a new community resource
   */
  async addResource(resource: Omit<CommunityResource, 'id'>): Promise<CommunityResource> {
    const resources = await this.getAllResources();
    const newResource = {
      ...resource,
      id: crypto.randomUUID(),
    };
    
    // Validate the resource
    validateCommunityResource(newResource);
    
    resources.push(newResource);
    await this.storage.setJSON(STORAGE_KEYS.RESOURCES, resources);
    return newResource;
  }

  /**
   * Update an existing community resource
   */
  async updateResource(id: string, updates: Partial<CommunityResource>): Promise<CommunityResource | null> {
    const resources = await this.getAllResources();
    const index = resources.findIndex(r => r.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updatedResource = {
      ...resources[index],
      ...updates,
    };
    
    // Validate the updated resource
    validateCommunityResource(updatedResource);
    
    resources[index] = updatedResource;
    await this.storage.setJSON(STORAGE_KEYS.RESOURCES, resources);
    return updatedResource;
  }

  /**
   * Delete a community resource
   */
  async deleteResource(id: string): Promise<boolean> {
    const resources = await this.getAllResources();
    const filteredResources = resources.filter(r => r.id !== id);
    
    if (filteredResources.length === resources.length) {
      return false; // No resource was deleted
    }
    
    await this.storage.setJSON(STORAGE_KEYS.RESOURCES, filteredResources);
    return true;
  }

  /**
   * Get community events
   */
  async getCommunityEvents(): Promise<CommunityEvent[]> {
    await this.initializeEvents();
    const events = await this.storage.getJSON<CommunityEvent[]>(STORAGE_KEYS.EVENTS);
    return events || [];
  }

  /**
   * Get community events based on user interests
   */
  async getEventSuggestions(userId: string): Promise<CommunityEvent[]> {
    const userInterests = await this.getUserInterests(userId);
    const events = await this.getCommunityEvents();
    
    if (!userInterests || userInterests.categories.length === 0) {
      return events; // Return all events if no interests are specified
    }
    
    return events.filter(event => userInterests.categories.includes(event.category as any));
  }

  /**
   * Add a new community event
   */
  async addEvent(event: Omit<CommunityEvent, 'id'>): Promise<CommunityEvent> {
    const events = await this.getCommunityEvents();
    const newEvent = {
      ...event,
      id: crypto.randomUUID(),
    };
    
    // Validate the event
    validateCommunityEvent(newEvent);
    
    events.push(newEvent);
    await this.storage.setJSON(STORAGE_KEYS.EVENTS, events);
    return newEvent;
  }

  /**
   * Update an existing community event
   */
  async updateEvent(id: string, updates: Partial<CommunityEvent>): Promise<CommunityEvent | null> {
    const events = await this.getCommunityEvents();
    const index = events.findIndex(e => e.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updatedEvent = {
      ...events[index],
      ...updates,
    };
    
    // Validate the updated event
    validateCommunityEvent(updatedEvent);
    
    events[index] = updatedEvent;
    await this.storage.setJSON(STORAGE_KEYS.EVENTS, events);
    return updatedEvent;
  }

  /**
   * Register user for an event
   */
  async registerForEvent(eventId: string, userId: string): Promise<CommunityEvent | null> {
    const events = await this.getCommunityEvents();
    const index = events.findIndex(e => e.id === eventId);
    
    if (index === -1) {
      return null;
    }
    
    // Check if event has reached maximum participants
    if (events[index].maxParticipants && 
        events[index].currentParticipants >= events[index].maxParticipants) {
      throw new Error('Event has reached maximum participants');
    }
    
    // Update event
    events[index] = {
      ...events[index],
      currentParticipants: events[index].currentParticipants + 1,
      isRegistered: true
    };
    
    await this.storage.setJSON(STORAGE_KEYS.EVENTS, events);
    return events[index];
  }

  /**
   * Save user interests for personalized suggestions
   */
  async saveUserInterests(userId: string, categories: UserInterests['categories']): Promise<void> {
    const userInterests: UserInterests = {
      userId,
      categories,
    };
    
    await this.storage.setJSON(`${STORAGE_KEYS.USER_INTERESTS}_${userId}`, userInterests);
  }

  /**
   * Get user interests
   */
  async getUserInterests(userId: string): Promise<UserInterests | null> {
    return await this.storage.getJSON<UserInterests>(`${STORAGE_KEYS.USER_INTERESTS}_${userId}`);
  }

  /**
   * Save user needs for resource filtering
   */
  async saveUserNeeds(userId: string, needs: UserNeeds['needs']): Promise<void> {
    const userNeeds: UserNeeds = {
      userId,
      needs,
    };
    
    await this.storage.setJSON(`${STORAGE_KEYS.USER_NEEDS}_${userId}`, userNeeds);
  }

  /**
   * Get user needs
   */
  async getUserNeeds(userId: string): Promise<UserNeeds | null> {
    return await this.storage.getJSON<UserNeeds>(`${STORAGE_KEYS.USER_NEEDS}_${userId}`);
  }

  /**
   * Calculate distance between user location and a resource using Haversine formula
   */
  private calculateDistance(userLocation: Coordinates, resource: CommunityResource): number {
    if (resource.coordinates) {
      return this.haversineDistance(userLocation, resource.coordinates);
    }
    // Fallback to mock distance if coordinates aren't available
    return this.calculateMockDistance(userLocation, resource.id);
  }

  /**
   * Calculate distance between two points using the Haversine formula
   * Returns distance in miles
   */
  private haversineDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.latitude)) * Math.cos(this.toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.max(0.1, Math.round(distance * 10) / 10); // Round to 1 decimal place, minimum 0.1
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Helper method to generate mock distances for demo purposes
   * Used when resource coordinates aren't available
   */
  private calculateMockDistance(userLocation: Coordinates, resourceId: string): number {
    // Use the resource ID to generate a consistent but random-seeming distance
    const hash = Array.from(resourceId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // Generate a distance between 0.5 and 15 miles
    return (hash % 145) / 10 + 0.5;
  }
}

export default CommunityService;