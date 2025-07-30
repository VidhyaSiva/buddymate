import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { RootTabParamList, NavigationLabels } from '../types/navigation';
import { Dashboard } from '../components/Dashboard';

// Import stack navigators (will be created next)
import { HealthStackNavigator } from './HealthStackNavigator';
import { FamilyStackNavigator } from './FamilyStackNavigator';
import { ActivitiesStackNavigator } from './ActivitiesStackNavigator';
import { CommunityStackNavigator } from './CommunityStackNavigator';
import { EmergencyScreen } from '../screens/EmergencyScreen';
import ErrorHandlingDemo from '../components/ErrorHandlingDemo';

// Dashboard screen with navigation handlers
const DashboardScreen = ({ navigation }: any) => (
  <Dashboard
    onEmergencyPress={() => navigation.navigate('Emergency')}
    onHealthPress={() => navigation.navigate('Health')}
    onFamilyPress={() => navigation.navigate('Family')}
    onActivitiesPress={() => navigation.navigate('Activities')}
    onCommunityPress={() => navigation.navigate('Community')}
    onMedicationPress={() => {
      // Navigate directly to medication reminders
      navigation.navigate('Health', { 
        screen: 'MedicationReminders'
      });
    }}
  />
);

const Tab = createBottomTabNavigator<RootTabParamList>();

// Large, accessible tab bar icons (using text for now, will be replaced with proper icons)
const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      {getIconForLabel(label)}
    </Text>
  </View>
);

const getIconForLabel = (label: string): string => {
  switch (label) {
    case 'Dashboard': return '🏠';
    case 'Health': return '❤️';
    case 'Family': return '👨‍👩‍👧‍👦';
    case 'Emergency': return '🚨';
    case 'Activities': return '📋';
    case 'Community': return '🏘️';
    case 'ErrorDemo': return '🛡️';
    default: return '•';
  }
};

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
        tabBarLabel: ({ focused }) => (
          <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
            {NavigationLabels[route.name as keyof typeof NavigationLabels]}
          </Text>
        ),
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
        // Accessibility features
        tabBarAccessibilityLabel: `${NavigationLabels[route.name as keyof typeof NavigationLabels]} tab`,
        tabBarTestID: `tab-${route.name.toLowerCase()}`,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarAccessibilityHint: 'Navigate to your daily dashboard overview'
        }}
      />
      <Tab.Screen 
        name="Health" 
        component={HealthStackNavigator}
        options={{
          tabBarAccessibilityHint: 'Navigate to health and wellness section'
        }}
      />
      <Tab.Screen 
        name="Family" 
        component={FamilyStackNavigator}
        options={{
          tabBarAccessibilityHint: 'Navigate to family and friends section'
        }}
      />
      <Tab.Screen 
        name="Emergency" 
        component={EmergencyScreen}
        options={{
          tabBarAccessibilityHint: 'Access emergency help and contacts',
          tabBarStyle: [styles.tabBar, styles.emergencyTab]
        }}
      />
      <Tab.Screen 
        name="Activities" 
        component={ActivitiesStackNavigator}
        options={{
          tabBarAccessibilityHint: 'Navigate to daily activities and routines'
        }}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityStackNavigator}
        options={{
          tabBarAccessibilityHint: 'Navigate to community resources and events'
        }}
      />
      <Tab.Screen 
        name="ErrorDemo" 
        component={ErrorHandlingDemo}
        options={{
          tabBarAccessibilityHint: 'Test error handling and offline features',
          tabBarLabel: 'Error Demo'
        }}
      />
    </Tab.Navigator>
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
  emergencyContainer: {
    backgroundColor: '#fef2f2',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emergencyTitle: {
    color: '#dc2626',
  },
  screenSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
  tabBar: {
    height: 80,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  emergencyTab: {
    backgroundColor: '#fef2f2',
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    minWidth: 32,
  },
  tabIcon: {
    fontSize: 24,
    opacity: 0.6,
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  tabLabelFocused: {
    fontWeight: 'bold',
  },
});