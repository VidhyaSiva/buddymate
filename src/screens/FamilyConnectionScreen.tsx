import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FamilyConnection } from '../components/FamilyConnection';
import { Button } from '../components/foundation';

interface FamilyConnectionScreenProps {
  navigation: any;
}

export const FamilyConnectionScreen: React.FC<FamilyConnectionScreenProps> = ({ navigation }) => {
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
      <FamilyConnection testID="family-connection-screen" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
});