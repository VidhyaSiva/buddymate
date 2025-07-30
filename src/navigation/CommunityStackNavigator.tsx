import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CommunityStackParamList } from '../types/navigation';
import CommunityResourcesScreen from '../screens/CommunityResourcesScreen';

const Stack = createStackNavigator<CommunityStackParamList>();

// Dashboard screen for Community section
const CommunityDashboardScreen = ({ navigation }: any) => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Community Resources</Text>
    <Text style={styles.screenSubtitle}>Local services and events</Text>
    
    <TouchableOpacity 
      style={styles.navigationButton}
      onPress={() => navigation.navigate('LocalResources')}
      accessibilityLabel="Go to local resources"
      accessibilityHint="Navigate to local services and resources"
    >
      <Text style={styles.buttonText}>Local Resources</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.navigationButton}
      onPress={() => navigation.navigate('Events')}
      accessibilityLabel="View community events"
      accessibilityHint="Navigate to community events and activities"
    >
      <Text style={styles.buttonText}>Community Events</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={[styles.navigationButton, { backgroundColor: '#4CAF50' }]}
      onPress={() => navigation.navigate('ResourceDetails', { resourceId: 'healthcare' })}
      accessibilityLabel="View healthcare resources"
      accessibilityHint="Navigate to healthcare resource information"
    >
      <Text style={styles.buttonText}>Healthcare Resources</Text>
    </TouchableOpacity>
  </View>
);

// Use our new CommunityResourcesScreen for the LocalResources route
const LocalResourcesScreen = CommunityResourcesScreen;

const EventsScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Community Events</Text>
    <Text style={styles.screenSubtitle}>Activities and gatherings near you</Text>
    <Text style={styles.comingSoon}>Coming soon!</Text>
  </View>
);

// ResourceDetailsScreen now uses our CommunityResourcesScreen with a category filter
const ResourceDetailsScreen = ({ route }: any) => {
  const { resourceId } = route.params;
  // Convert resourceId to a valid category if possible
  const category = ['healthcare', 'transportation', 'social', 'emergency'].includes(resourceId) 
    ? resourceId 
    : undefined;
    
  return <CommunityResourcesScreen route={{ params: { initialCategory: category } }} navigation={{}} />;
};

// Custom header with large, accessible back button
const CustomHeader = ({ title, canGoBack, navigation }: any) => (
  <View style={styles.header}>
    {canGoBack && (
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        accessibilityLabel="Go back"
        accessibilityHint="Return to the previous screen"
        accessibilityRole="button"
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    )}
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

export const CommunityStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) => ({
        header: ({ options }) => (
          <CustomHeader
            title={options.title || route.name}
            canGoBack={navigation.canGoBack()}
            navigation={navigation}
          />
        ),
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 2,
          shadowOpacity: 0.1,
        },
        cardStyle: {
          backgroundColor: '#f8fafc',
        },
      })}
    >
      <Stack.Screen 
        name="CommunityDashboard" 
        component={CommunityDashboardScreen}
        options={{ 
          title: 'Community Resources',
          headerAccessibilityLabel: 'Community resources and services section'
        }}
      />
      <Stack.Screen 
        name="LocalResources" 
        component={LocalResourcesScreen}
        options={{ 
          title: 'Local Resources',
          headerAccessibilityLabel: 'Local services and resources'
        }}
      />
      <Stack.Screen 
        name="Events" 
        component={EventsScreen}
        options={{ 
          title: 'Community Events',
          headerAccessibilityLabel: 'Community events and activities'
        }}
      />
      <Stack.Screen 
        name="ResourceDetails" 
        component={ResourceDetailsScreen}
        options={{ 
          title: 'Resource Details',
          headerAccessibilityLabel: 'Detailed resource information'
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  comingSoon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a80f5',
    marginTop: 20,
  },
  navigationButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 8,
    minWidth: 200,
    minHeight: 56, // Minimum 44pt touch target + padding
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 60,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 16,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
});