import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, ScrollView } from 'react-native';
import { CommunityResource } from '../types/community';
import CommunityService, { Coordinates, ResourceFilter } from '../services/CommunityService';
import { AsyncStorageWrapper } from '../storage/AsyncStorageWrapper';
import { Card, Button, Text as CustomText } from './foundation';

interface CommunityResourcesProps {
  userId: string;
  initialCategory?: CommunityResource['category'];
  userLocation?: Coordinates;
  onResourceSelect?: (resource: CommunityResource) => void;
  resourceFilter?: ResourceFilter;
}

const CommunityResources: React.FC<CommunityResourcesProps> = ({
  userId,
  initialCategory,
  userLocation,
  onResourceSelect,
  resourceFilter,
}) => {
  const [resources, setResources] = useState<CommunityResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<CommunityResource['category'] | 'all'>(
    initialCategory || 'all'
  );
  const [error, setError] = useState<string | null>(null);

  const communityService = new CommunityService(new AsyncStorageWrapper());

  useEffect(() => {
    loadResources();
  }, [selectedCategory, userLocation, resourceFilter]);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let resourcesList: CommunityResource[];
      
      // Use filtered resources if resourceFilter is provided
      if (resourceFilter) {
        resourcesList = await communityService.getFilteredResources(userLocation || null, resourceFilter);
      } else if (userLocation) {
        // If we have user location, get resources sorted by distance
        resourcesList = await communityService.getResourcesByDistance(userLocation);
      } else {
        // Otherwise, get all resources
        resourcesList = await communityService.getAllResources();
      }
      
      // Filter by category if needed
      if (selectedCategory !== 'all') {
        resourcesList = resourcesList.filter(resource => resource.category === selectedCategory);
      }
      
      setResources(resourcesList);
    } catch (err) {
      setError('Unable to load community resources. Please try again.');
      console.error('Error loading community resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: CommunityResource['category'] | 'all') => {
    setSelectedCategory(category);
  };

  const handleCallResource = (phoneNumber: string) => {
    const formattedNumber = phoneNumber.replace(/[^\d+]/g, '');
    const url = Platform.OS === 'ios' ? `telprompt:${formattedNumber}` : `tel:${formattedNumber}`;
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        }
        setError('Phone calls are not supported on this device');
      })
      .catch(err => {
        setError('An error occurred while trying to make a call');
        console.error('Error making phone call:', err);
      });
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
        setError('An error occurred while trying to open maps');
        console.error('Error opening maps:', err);
      });
  };

  const renderCategoryButtons = () => {
    const categories: Array<CommunityResource['category'] | 'all'> = [
      'all', 'healthcare', 'transportation', 'social', 'emergency'
    ];
    
    return (
      <View style={styles.categoryContainer}>
        <CustomText style={styles.filterLabel}>Filter by:</CustomText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.selectedCategoryButton
              ]}
              onPress={() => handleCategoryChange(item)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${item} category`}
              accessibilityState={{ selected: selectedCategory === item }}
            >
              <CustomText 
                style={selectedCategory === item ? 
                  [styles.categoryButtonText, styles.selectedCategoryText] : 
                  styles.categoryButtonText
                }
              >
                {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
              </CustomText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderResourceItem = ({ item }: { item: CommunityResource }) => {
    const getCategoryIcon = (category: CommunityResource['category']) => {
      switch (category) {
        case 'healthcare': return '🏥';
        case 'transportation': return '🚌';
        case 'social': return '👥';
        case 'emergency': return '🚨';
        default: return '📍';
      }
    };

    return (
      <Card style={styles.resourceCard}>
        <TouchableOpacity
          onPress={() => onResourceSelect && onResourceSelect(item)}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}, ${item.category} resource`}
        >
          <View style={styles.resourceHeader}>
            <View style={styles.resourceTitleContainer}>
              <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
              <CustomText style={styles.resourceName}>{item.name}</CustomText>
            </View>
            {item.distance !== undefined && (
              <CustomText style={styles.distance}>{item.distance.toFixed(1)} mi</CustomText>
            )}
          </View>
          
          <CustomText style={styles.resourceDescription}>{item.description}</CustomText>
          <CustomText style={styles.resourceAddress}>{item.address}</CustomText>
          <CustomText style={styles.resourceHours}>{item.hours}</CustomText>
          
          {item.services && item.services.length > 0 && (
            <View style={styles.servicesContainer}>
              <CustomText style={styles.servicesLabel}>Services:</CustomText>
              <CustomText style={styles.servicesText}>
                {item.services.join(', ')}
              </CustomText>
            </View>
          )}
          
          {item.accessibility && (
            <View style={styles.accessibilityContainer}>
              <CustomText style={styles.accessibilityLabel}>Accessibility:</CustomText>
              <View style={styles.accessibilityIcons}>
                {item.accessibility.wheelchairAccessible && (
                  <CustomText style={styles.accessibilityIcon}>♿</CustomText>
                )}
                {item.accessibility.hearingLoop && (
                  <CustomText style={styles.accessibilityIcon}>🔊</CustomText>
                )}
                {item.accessibility.largeText && (
                  <CustomText style={styles.accessibilityIcon}>🔍</CustomText>
                )}
              </View>
            </View>
          )}
          
          {item.rating && (
            <View style={styles.ratingContainer}>
              <CustomText style={styles.ratingText}>
                ⭐ {item.rating.toFixed(1)} {item.isVerified && '✓ Verified'}
              </CustomText>
            </View>
          )}
          
          <View style={styles.actionButtons}>
            <View style={styles.callButton}>
              <Button 
                title="Call" 
                onPress={() => handleCallResource(item.phoneNumber)}
                accessibilityLabel={`Call ${item.name}`}
                variant="primary"
                size="medium"
              />
            </View>
            <View style={styles.directionsButton}>
              <Button 
                title="Directions" 
                onPress={() => handleGetDirections(item.address)}
                accessibilityLabel={`Get directions to ${item.name}`}
                variant="secondary"
                size="medium"
              />
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>Community Resources</CustomText>
      
      {renderCategoryButtons()}
      
      {error && (
        <View style={styles.errorContainer}>
          <CustomText style={styles.errorText}>{error}</CustomText>
        </View>
      )}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <CustomText style={styles.loadingText}>Loading resources...</CustomText>
        </View>
      ) : (
        <View style={styles.resourcesList}>
          {resources.length === 0 ? (
            <View style={styles.emptyContainer}>
              <CustomText style={styles.emptyText}>
                No resources found for this category.
              </CustomText>
            </View>
          ) : (
            resources.map((item) => (
              <View key={item.id}>
                {renderResourceItem({ item })}
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
  },
  filterLabel: {
    fontSize: 18,
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: '#4a80f5',
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  resourcesList: {
    paddingBottom: 20,
  },
  resourceCard: {
    marginBottom: 16,
    padding: 16,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  resourceName: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  distance: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  resourceDescription: {
    fontSize: 16,
    marginBottom: 8,
  },
  resourceAddress: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  resourceHours: {
    fontSize: 16,
    color: '#555',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  callButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#4CAF50',
  },
  directionsButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#2196F3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#c62828',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  servicesContainer: {
    marginVertical: 8,
  },
  servicesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  servicesText: {
    fontSize: 14,
    color: '#666',
  },
  accessibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  accessibilityLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  accessibilityIcons: {
    flexDirection: 'row',
  },
  accessibilityIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  ratingContainer: {
    marginVertical: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#4a80f5',
    fontWeight: '500',
  },
});

export default CommunityResources;