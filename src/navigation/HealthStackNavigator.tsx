import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HealthStackParamList } from '../types/navigation';
import { MedicationDashboard } from '../screens/MedicationDashboard';
import { MedicationSetupScreen } from '../screens/MedicationSetupScreen';
import { WeeklyAdherenceScreen } from '../screens/WeeklyAdherenceScreen';
import { NotificationDemo } from '../components/NotificationDemo';

const Stack = createStackNavigator<HealthStackParamList>();

// Placeholder screens for Health section
const HealthDashboardScreen = ({ navigation }: any) => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Health Dashboard</Text>
    <Text style={styles.screenSubtitle}>Track your wellness and health</Text>
    
    <TouchableOpacity 
      style={styles.navigationButton}
      onPress={() => navigation.navigate('DailyCheckIn')}
      accessibilityLabel="Go to daily check-in"
      accessibilityHint="Navigate to daily wellness check-in screen"
    >
      <Text style={styles.buttonText}>Daily Check-In</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.navigationButton}
      onPress={() => navigation.navigate('MedicationReminders')}
      accessibilityLabel="Go to medication reminders"
      accessibilityHint="Navigate to medication reminders screen"
    >
      <Text style={styles.buttonText}>Medication Reminders</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.navigationButton}
      onPress={() => navigation.navigate('NotificationDemo')}
      accessibilityLabel="Go to notification demo"
      accessibilityHint="Navigate to notification system demo"
    >
      <Text style={styles.buttonText}>Notification Demo</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.navigationButton}
      onPress={() => navigation.navigate('HealthHistory')}
      accessibilityLabel="Go to health history"
      accessibilityHint="Navigate to health history screen"
    >
      <Text style={styles.buttonText}>Health History</Text>
    </TouchableOpacity>
  </View>
);

const DailyCheckInScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Daily Check-In</Text>
    <Text style={styles.screenSubtitle}>How are you feeling today?</Text>
  </View>
);

// Medication screens are now imported from separate files

const HealthHistoryScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Health History</Text>
    <Text style={styles.screenSubtitle}>Your wellness trends</Text>
  </View>
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

export const HealthStackNavigator: React.FC = () => {
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
        name="HealthDashboard" 
        component={HealthDashboardScreen}
        options={{ 
          title: 'Health & Wellness',
          headerAccessibilityLabel: 'Health and Wellness section'
        }}
      />
      <Stack.Screen 
        name="DailyCheckIn" 
        component={DailyCheckInScreen}
        options={{ 
          title: 'Daily Check-In',
          headerAccessibilityLabel: 'Daily wellness check-in'
        }}
      />
      <Stack.Screen 
        name="MedicationReminders" 
        component={MedicationDashboard}
        options={{ 
          title: 'Medications',
          headerAccessibilityLabel: 'Medication reminders and schedule'
        }}
      />
      <Stack.Screen 
        name="MedicationSetup" 
        component={MedicationSetupScreen}
        options={{ 
          title: 'Add Medication',
          headerAccessibilityLabel: 'Set up new medication reminder'
        }}
      />
      <Stack.Screen 
        name="WeeklyAdherence" 
        component={WeeklyAdherenceScreen}
        options={{ 
          title: 'Weekly Report',
          headerAccessibilityLabel: 'Weekly medication adherence report'
        }}
      />
      <Stack.Screen 
        name="NotificationDemo" 
        component={NotificationDemo}
        options={{ 
          title: 'Notification Demo',
          headerAccessibilityLabel: 'Notification system demonstration'
        }}
      />
      <Stack.Screen 
        name="HealthHistory" 
        component={HealthHistoryScreen}
        options={{ 
          title: 'Health History',
          headerAccessibilityLabel: 'Your health history and trends'
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
    backgroundColor: '#3b82f6',
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