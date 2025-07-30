import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { WeeklyAdherence } from '../components/WeeklyAdherence';
import { Button, Text } from '../components/foundation';

interface WeeklyAdherenceScreenProps {
  navigation: any;
}

export const WeeklyAdherenceScreen: React.FC<WeeklyAdherenceScreenProps> = ({ navigation }) => {
  const userId = 'demo-user-123'; // In real app, get from auth context

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <Button
          title="← Back to Main"
          onPress={() => navigation.goBack()}
          variant="secondary"
          accessibilityLabel="Go back to main dashboard"
        />
        <Text style={styles.title}>Weekly Adherence Report</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <WeeklyAdherence userId={userId} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
});