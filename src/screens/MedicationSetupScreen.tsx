import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MedicationSetup } from '../components/MedicationSetup';
import { Button } from '../components/foundation';

interface MedicationSetupScreenProps {
  navigation: any;
}

export const MedicationSetupScreen: React.FC<MedicationSetupScreenProps> = ({ navigation }) => {
  const userId = 'demo-user-123'; // In real app, get from auth context

  const handleScheduleCreated = () => {
    // Navigate back to medication dashboard after successful creation
    navigation.goBack();
  };

  const handleCancel = () => {
    // Navigate back to medication dashboard
    navigation.goBack();
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
      <MedicationSetup
        userId={userId}
        onScheduleCreated={handleScheduleCreated}
        onCancel={handleCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
});