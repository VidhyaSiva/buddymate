import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ActivitiesStackParamList } from '../types/navigation';
import { DailyRoutineScreen } from '../screens/DailyRoutineScreen';
import { ActivityGuideScreen } from '../screens/ActivityGuideScreen';
import { Achievements } from '../components/Achievements';

const Stack = createStackNavigator<ActivitiesStackParamList>();

// Activities Dashboard Screen
const ActivitiesDashboardScreen = ({ navigation }: any) => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Daily Activities</Text>
    <Text style={styles.screenSubtitle}>Your routines and achievements</Text>
    
    <TouchableOpacity 
      style={styles.navigationButton}
      onPress={() => navigation.navigate('DailyRoutine')}
      accessibilityLabel="Go to daily routine"
      accessibilityHint="Navigate to your daily routine checklist"
    >
      <Text style={styles.buttonText}>Daily Routine</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.navigationButton}
      onPress={() => navigation.navigate('ActivityGuide', { activityId: 'sample' })}
      accessibilityLabel="View activity guide"
      accessibilityHint="Navigate to step-by-step activity guides"
    >
      <Text style={styles.buttonText}>Activity Guide</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.navigationButton}
      onPress={() => navigation.navigate('Achievements')}
      accessibilityLabel="View achievements"
      accessibilityHint="Navigate to your achievements and progress"
    >
      <Text style={styles.buttonText}>Achievements</Text>
    </TouchableOpacity>
  </View>
);

// Achievements Screen wrapper
const AchievementsScreen = () => (
  <Achievements userId="123456" />
);

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

export const ActivitiesStackNavigator: React.FC = () => {
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
        name="ActivitiesDashboard" 
        component={ActivitiesDashboardScreen}
        options={{ 
          title: 'Daily Activities',
          headerAccessibilityLabel: 'Daily activities and routines section'
        }}
      />
      <Stack.Screen 
        name="DailyRoutine" 
        component={DailyRoutineScreen}
        options={{ 
          title: 'Daily Routine',
          headerAccessibilityLabel: 'Your daily routine checklist'
        }}
      />
      <Stack.Screen 
        name="ActivityGuide" 
        component={ActivityGuideScreen}
        options={{ 
          title: 'Activity Guide',
          headerAccessibilityLabel: 'Step-by-step activity guide'
        }}
      />
      <Stack.Screen 
        name="Achievements" 
        component={AchievementsScreen}
        options={{ 
          title: 'Achievements',
          headerAccessibilityLabel: 'Your achievements and progress'
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
  navigationButton: {
    backgroundColor: '#f59e0b',
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