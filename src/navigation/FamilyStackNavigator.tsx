import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FamilyStackParamList } from '../types/navigation';
import { FamilyDashboardScreen } from '../screens/FamilyDashboardScreen';

const ContactListScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Contact List</Text>
    <Text style={styles.screenSubtitle}>Your family and friends</Text>
  </View>
);

const VideoCallScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Video Call</Text>
    <Text style={styles.screenSubtitle}>Connect face-to-face</Text>
  </View>
);

const MessagesScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Messages</Text>
    <Text style={styles.screenSubtitle}>Your conversations</Text>
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

export const FamilyStackNavigator: React.FC = () => {
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
        name="FamilyDashboard" 
        component={FamilyDashboardScreen}
        options={{ 
          title: 'Family & Friends',
          headerAccessibilityLabel: 'Family and friends section'
        }}
      />
      <Stack.Screen 
        name="ContactList" 
        component={ContactListScreen}
        options={{ 
          title: 'Contacts',
          headerAccessibilityLabel: 'Your contact list'
        }}
      />
      <Stack.Screen 
        name="VideoCall" 
        component={VideoCallScreen}
        options={{ 
          title: 'Video Call',
          headerAccessibilityLabel: 'Video calling screen'
        }}
      />
      <Stack.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{ 
          title: 'Messages',
          headerAccessibilityLabel: 'Messages and conversations'
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
    backgroundColor: '#10b981',
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