import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dashboard } from './components/Dashboard';
import { DailyCheckIn } from './components/DailyCheckIn';
import { EmergencyScreen } from './screens/EmergencyScreen';
import { FamilyConnectionScreen } from './screens/FamilyConnectionScreen';
import CommunityResourcesScreen from './screens/CommunityResourcesScreen';
import { DailyRoutineScreen } from './screens/DailyRoutineScreen';
import { MedicationDashboard } from './screens/MedicationDashboard';
import { MedicationSetupScreen } from './screens/MedicationSetupScreen';
import { WeeklyAdherenceScreen } from './screens/WeeklyAdherenceScreen';
import { MedicationManagementScreen } from './screens/MedicationManagementScreen';
import { DeviceSimulator } from './components/DeviceSimulator';
import { seedCommunicationData } from './utils/seedData';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'daily-checkin' | 'emergency' | 'family' | 'community' | 'activities' | 'medication' | 'medication-setup' | 'weekly-adherence' | 'medication-management'>('dashboard');
  const mockUserId = 'demo-user-123';

  useEffect(() => {
    // Seed demo data for testing
    const initializeData = async () => {
      console.log('App starting, initializing data...');
      try {
        await seedCommunicationData();
        console.log('Data initialization complete');
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };
    
    initializeData();
  }, []);

  // Mock navigation handlers for web preview
  const handleNavigation = (screen: string) => {
    console.log(`Navigate to: ${screen}`);
    if (screen === 'Health') {
      setCurrentScreen('daily-checkin');
    } else if (screen === 'Emergency') {
      setCurrentScreen('emergency');
    } else if (screen === 'Family') {
      setCurrentScreen('family');
    } else if (screen === 'Community') {
      setCurrentScreen('community');
    } else if (screen === 'Activities') {
      setCurrentScreen('activities');
    } else if (screen === 'Medication') {
      setCurrentScreen('medication');
    } else {
      window.alert(`Navigation to ${screen} - This would navigate in the full app`);
    }
  };

  const handleCheckInComplete = (checkIn: any) => {
    console.log('Check-in completed:', checkIn);
    window.alert(`Daily check-in completed! Mood: ${checkIn.mood}/5, Energy: ${checkIn.energyLevel}/5`);
    setCurrentScreen('dashboard');
  };

  const handleCheckInCancel = () => {
    console.log('Check-in cancelled');
    setCurrentScreen('dashboard');
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  // Helper function to wrap content with DeviceSimulator
  const wrapWithSimulator = (content: React.ReactNode) => (
    <DeviceSimulator>
      <View style={styles.container}>
        {content}
      </View>
    </DeviceSimulator>
  );

  if (currentScreen === 'daily-checkin') {
    return wrapWithSimulator(
      <DailyCheckIn
        userId={mockUserId}
        onComplete={handleCheckInComplete}
        onCancel={handleCheckInCancel}
      />
    );
  }

  if (currentScreen === 'emergency') {
    return wrapWithSimulator(
      <EmergencyScreen navigation={{ goBack: handleBackToDashboard }} />
    );
  }

  if (currentScreen === 'family') {
    return wrapWithSimulator(
      <FamilyConnectionScreen navigation={{ goBack: handleBackToDashboard }} />
    );
  }

  if (currentScreen === 'community') {
    return wrapWithSimulator(
      <CommunityResourcesScreen 
        route={{ params: { userId: mockUserId } }} 
        navigation={{ goBack: handleBackToDashboard }}
      />
    );
  }

  if (currentScreen === 'activities') {
    return wrapWithSimulator(
      <DailyRoutineScreen 
        route={{ params: { userId: mockUserId } }} 
        navigation={{ goBack: () => setCurrentScreen('dashboard') }}
      />
    );
  }

  if (currentScreen === 'medication') {
    return wrapWithSimulator(
      <MedicationDashboard 
        navigation={{ 
          goBack: handleBackToDashboard,
          navigate: (screen: string) => {
            if (screen === 'MedicationSetup') {
              setCurrentScreen('medication-setup');
            } else if (screen === 'WeeklyAdherence') {
              setCurrentScreen('weekly-adherence');
            } else if (screen === 'MedicationManagement') {
              setCurrentScreen('medication-management');
            } else {
              alert(`Navigation to ${screen} - This would navigate in the full app`);
            }
          }
        }}
      />
    );
  }

  if (currentScreen === 'medication-setup') {
    return wrapWithSimulator(
      <MedicationSetupScreen 
        navigation={{ goBack: () => setCurrentScreen('medication') }}
      />
    );
  }

  if (currentScreen === 'weekly-adherence') {
    return wrapWithSimulator(
      <WeeklyAdherenceScreen 
        navigation={{ goBack: () => setCurrentScreen('medication') }}
      />
    );
  }

  if (currentScreen === 'medication-management') {
    return wrapWithSimulator(
      <MedicationManagementScreen 
        navigation={{ 
          goBack: () => setCurrentScreen('medication'),
          navigate: (screen: string) => {
            if (screen === 'MedicationSetup') {
              setCurrentScreen('medication-setup');
            } else {
              alert(`Navigation to ${screen} - This would navigate in the full app`);
            }
          }
        }}
      />
    );
  }

  return wrapWithSimulator(
    <Dashboard
      onEmergencyPress={() => handleNavigation('Emergency')}
      onHealthPress={() => handleNavigation('Health')}
      onFamilyPress={() => handleNavigation('Family')}
      onActivitiesPress={() => handleNavigation('Activities')}
      onCommunityPress={() => handleNavigation('Community')}
      onMedicationPress={() => handleNavigation('Medication')}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    // Mobile-specific styling
    maxWidth: '100%',
    overflow: 'hidden',
    // Add safe area padding for mobile devices
    paddingTop: 0,
    paddingBottom: 0,
  },
});

export default App;