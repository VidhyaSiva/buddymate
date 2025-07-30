import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Modal, Switch, Platform, Linking } from 'react-native';
import { Text, Button, Input } from '../components/foundation';
import CommunityResources from '../components/CommunityResources';
import CommunityService, { Coordinates, UserInterests, UserNeeds, ResourceFilter } from '../services/CommunityService';
import { AsyncStorageWrapper } from '../storage/AsyncStorageWrapper';
import { CommunityResource, CommunityEvent } from '../types/community';

interface CommunityResourcesScreenProps {
  navigation: any;
  route: {
    params?: {
      userId: string;
      initialCategory?: CommunityResource['category'];
    };
  };
}

const CommunityResourcesScreen: React.FC<CommunityResourcesScreenProps> = ({ navigation, route }) => {
  const userId = route.params?.userId || 'default-user';
  const initialCategory = route.params?.initialCategory;
  
  const [userLocation, setUserLocation] = useState<Coordinates | undefined>(undefined);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [userInterests, setUserInterests] = useState<UserInterests | null>(null);
  const [userNeeds, setUserNeeds] = useState<UserNeeds | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [resourceFilter, setResourceFilter] = useState<ResourceFilter>({});
  const [maxDistance, setMaxDistance] = useState<string>('10');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState<boolean>(false);
  
  // User needs checkboxes
  const [needsMobility, setNeedsMobility] = useState<boolean>(false);
  const [needsVision, setNeedsVision] = useState<boolean>(false);
  const [needsHearing, setNeedsHearing] = useState<boolean>(false);
  const [needsMemory, setNeedsMemory] = useState<boolean>(false);
  const [needsTransportation, setNeedsTransportation] = useState<boolean>(false);
  const [needsSocial, setNeedsSocial] = useState<boolean>(false);
  const [needsHealthcare, setNeedsHealthcare] = useState<boolean>(false);
  
  const communityService = new CommunityService(new AsyncStorageWrapper());
  
  useEffect(() => {
    loadUserData();
    getMockLocation();
  }, [userId]);
  
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user interests
      const interests = await communityService.getUserInterests(userId);
      setUserInterests(interests);
      
      // Load user needs
      const needs = await communityService.getUserNeeds(userId);
      setUserNeeds(needs);
      
      if (needs) {
        // Set checkbox states based on saved needs
        setNeedsMobility(needs.needs.includes('mobility'));
        setNeedsVision(needs.needs.includes('vision'));
        setNeedsHearing(needs.needs.includes('hearing'));
        setNeedsMemory(needs.needs.includes('memory'));
        setNeedsTransportation(needs.needs.includes('transportation'));
        setNeedsSocial(needs.needs.includes('social'));
        setNeedsHealthcare(needs.needs.includes('healthcare'));
      }
      
      // Load event suggestions
      const eventSuggestions = await communityService.getEventSuggestions(userId);
      setEvents(eventSuggestions);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load community data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // In a real app, we would use the device's location services
  // For this demo, we'll use a mock location
  const getMockLocation = () => {
    // Mock location for San Francisco
    setUserLocation({
      latitude: 37.7749,
      longitude: -122.4194
    });
  };
  
  const handleResourceSelect = (resource: CommunityResource) => {
    // In a real app, we might navigate to a detail screen
    Alert.alert(
      resource.name,
      `${resource.description}\n\nAddress: ${resource.address}\nPhone: ${resource.phoneNumber}\nHours: ${resource.hours}`,
      [
        { 
          text: 'Call', 
          onPress: () => {
            // The call functionality is already in the CommunityResources component
          }
        },
        { text: 'Directions', onPress: () => handleGetDirections(resource.address) },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };
  
  const handleGetDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const url = Platform.OS === 'ios' 
      ? `maps:?q=${encodedAddress}` 
      : `geo:0,0?q=${encodedAddress}`;
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        }
        
        // Fallback to web maps
        return Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
      })
      .catch(err => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Unable to open maps. Please try again.');
      });
  };
  
  const handleSetInterests = () => {
    // In a real app, we would have a proper UI for setting interests
    // For this demo, we'll just set some default interests
    const defaultInterests: UserInterests['categories'] = ['healthcare', 'social', 'educational'];
    
    communityService.saveUserInterests(userId, defaultInterests)
      .then(() => {
        setUserInterests({
          userId,
          categories: defaultInterests
        });
        Alert.alert('Success', 'Your interests have been updated.');
        loadUserData(); // Reload data to get updated event suggestions
      })
      .catch(error => {
        console.error('Error saving interests:', error);
        Alert.alert('Error', 'Failed to save your interests. Please try again.');
      });
  };
  
  const handleSaveNeeds = () => {
    const selectedNeeds: UserNeeds['needs'] = [];
    
    if (needsMobility) selectedNeeds.push('mobility');
    if (needsVision) selectedNeeds.push('vision');
    if (needsHearing) selectedNeeds.push('hearing');
    if (needsMemory) selectedNeeds.push('memory');
    if (needsTransportation) selectedNeeds.push('transportation');
    if (needsSocial) selectedNeeds.push('social');
    if (needsHealthcare) selectedNeeds.push('healthcare');
    
    communityService.saveUserNeeds(userId, selectedNeeds)
      .then(() => {
        setUserNeeds({
          userId,
          needs: selectedNeeds
        });
        
        // Update the resource filter
        setResourceFilter({
          ...resourceFilter,
          userNeeds: selectedNeeds
        });
        
        setFilterModalVisible(false);
        Alert.alert('Success', 'Your needs have been saved and will be used to find relevant resources.');
      })
      .catch(error => {
        console.error('Error saving user needs:', error);
        Alert.alert('Error', 'Failed to save your needs. Please try again.');
      });
  };
  
  const handleApplyFilter = () => {
    const filter: ResourceFilter = {
      category: resourceFilter.category,
      userNeeds: userNeeds?.needs,
      maxDistance: parseFloat(maxDistance),
      isVerified: showVerifiedOnly ? true : undefined
    };
    
    setResourceFilter(filter);
    setFilterModalVisible(false);
  };
  
  const handleRegisterForEvent = (eventId: string) => {
    communityService.registerForEvent(eventId, userId)
      .then(updatedEvent => {
        if (updatedEvent) {
          // Update the events list with the updated event
          setEvents(events.map(event => 
            event.id === eventId ? updatedEvent : event
          ));
          Alert.alert('Success', 'You have been registered for this event.');
        }
      })
      .catch(error => {
        console.error('Error registering for event:', error);
        Alert.alert('Error', 'Failed to register for this event. Please try again.');
      });
  };
  
  const renderEventSuggestions = () => {
    if (events.length === 0) {
      return (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>
            No upcoming events match your interests.
          </Text>
          <View style={styles.interestsButton}>
            <Button
              title="Set My Interests"
              onPress={handleSetInterests}
              variant="primary"
              accessibilityLabel="Set my interests for event recommendations"
            />
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.eventsContainer}>
        <Text style={styles.sectionTitle}>Upcoming Events For You</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          {events.map(event => (
            <View key={event.id} style={styles.eventCard}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDetails}>
                {new Date(event.startTime).toLocaleDateString()} at {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.eventLocation}>{event.location}</Text>
              <Text style={styles.eventDescription}>{event.description}</Text>
              <View style={styles.eventFooter}>
                <Text style={styles.eventParticipants}>
                  {event.currentParticipants} attending
                  {event.maxParticipants ? ` (max ${event.maxParticipants})` : ''}
                </Text>
                <View style={event.isRegistered ? styles.registeredButton : styles.registerButton}>
                  <Button
                    title={event.isRegistered ? "Registered" : "Register"}
                    disabled={event.isRegistered}
                    onPress={() => handleRegisterForEvent(event.id)}
                    variant={event.isRegistered ? "secondary" : "primary"}
                    accessibilityLabel={`Register for ${event.title}`}
                  />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  const renderFilterModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Resources</Text>
            
            <Text style={styles.modalSectionTitle}>Maximum Distance</Text>
            <Input
              value={maxDistance}
              onChangeText={setMaxDistance}
              keyboardType="numeric"
              placeholder="Enter maximum distance in miles"
              style={styles.distanceInput}
              accessibilityLabel="Maximum distance in miles"
            />
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Show verified resources only</Text>
              <Switch
                value={showVerifiedOnly}
                onValueChange={setShowVerifiedOnly}
                accessibilityLabel="Show verified resources only"
              />
            </View>
            
            <Text style={styles.modalSectionTitle}>Your Needs</Text>
            <Text style={styles.modalSubtitle}>
              Select your needs to find relevant resources
            </Text>
            
            <View style={styles.needsContainer}>
              <TouchableOpacity 
                style={[styles.needItem, needsMobility && styles.needItemSelected]} 
                onPress={() => setNeedsMobility(!needsMobility)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: needsMobility }}
                accessibilityLabel="Mobility assistance"
              >
                <Text style={[styles.needText, needsMobility && styles.needTextSelected]}>Mobility</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.needItem, needsVision && styles.needItemSelected]} 
                onPress={() => setNeedsVision(!needsVision)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: needsVision }}
                accessibilityLabel="Vision assistance"
              >
                <Text style={[styles.needText, needsVision && styles.needTextSelected]}>Vision</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.needItem, needsHearing && styles.needItemSelected]} 
                onPress={() => setNeedsHearing(!needsHearing)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: needsHearing }}
                accessibilityLabel="Hearing assistance"
              >
                <Text style={[styles.needText, needsHearing && styles.needTextSelected]}>Hearing</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.needItem, needsMemory && styles.needItemSelected]} 
                onPress={() => setNeedsMemory(!needsMemory)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: needsMemory }}
                accessibilityLabel="Memory assistance"
              >
                <Text style={[styles.needText, needsMemory && styles.needTextSelected]}>Memory</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.needItem, needsTransportation && styles.needItemSelected]} 
                onPress={() => setNeedsTransportation(!needsTransportation)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: needsTransportation }}
                accessibilityLabel="Transportation assistance"
              >
                <Text style={[styles.needText, needsTransportation && styles.needTextSelected]}>Transportation</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.needItem, needsSocial && styles.needItemSelected]} 
                onPress={() => setNeedsSocial(!needsSocial)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: needsSocial }}
                accessibilityLabel="Social activities"
              >
                <Text style={[styles.needText, needsSocial && styles.needTextSelected]}>Social</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.needItem, needsHealthcare && styles.needItemSelected]} 
                onPress={() => setNeedsHealthcare(!needsHealthcare)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: needsHealthcare }}
                accessibilityLabel="Healthcare assistance"
              >
                <Text style={[styles.needText, needsHealthcare && styles.needTextSelected]}>Healthcare</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalButtons}>
              <View style={styles.saveButton}>
                <Button
                  title="Save Needs"
                  onPress={handleSaveNeeds}
                  variant="primary"
                  accessibilityLabel="Save your needs preferences"
                />
              </View>
              <View style={styles.applyButton}>
                <Button
                  title="Apply Filters"
                  onPress={handleApplyFilter}
                  variant="primary"
                  accessibilityLabel="Apply filters to resources"
                />
              </View>
              <View style={styles.cancelButton}>
                <Button
                  title="Cancel"
                  onPress={() => setFilterModalVisible(false)}
                  variant="secondary"
                  accessibilityLabel="Cancel filtering"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="← Back to Main"
          onPress={() => navigation.goBack()}
          variant="secondary"
          accessibilityLabel="Go back to main dashboard"
        />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {renderEventSuggestions()}
        
        <View style={styles.filterButtonContainer}>
          <View style={styles.filterButton}>
            <Button
              title="Filter Resources"
              onPress={() => setFilterModalVisible(true)}
              variant="primary"
              accessibilityLabel="Open resource filters"
            />
          </View>
        </View>
        
        <CommunityResources
          userId={userId}
          initialCategory={initialCategory}
          userLocation={userLocation}
          onResourceSelect={handleResourceSelect}
          resourceFilter={resourceFilter}
        />
      </ScrollView>
      
      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  eventsContainer: {
    marginVertical: 16,
  },
  eventCard: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDetails: {
    fontSize: 16,
    color: '#4a80f5',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 16,
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventParticipants: {
    fontSize: 14,
    color: '#666',
  },
  registerButton: {
    backgroundColor: '#4a80f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  registeredButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  noEventsContainer: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  interestsButton: {
    backgroundColor: '#4a80f5',
  },
  filterButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: '#4a80f5',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  distanceInput: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
  },
  needsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  needItem: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    margin: 4,
  },
  needItemSelected: {
    backgroundColor: '#4a80f5',
  },
  needText: {
    fontSize: 16,
  },
  needTextSelected: {
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'column',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 8,
  },
  applyButton: {
    backgroundColor: '#4a80f5',
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
});

export default CommunityResourcesScreen;