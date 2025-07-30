import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, Text, Button } from '../components/foundation';
import { MedicationReminder } from '../components/MedicationReminder';
import { medicationReminderService } from '../services/MedicationReminderService';
import { dataAccessLayer } from '../storage/DataAccessLayer';

interface MedicationDashboardProps {
  navigation: any;
}

interface MedicationStats {
  totalMedications: number;
  todayReminders: number;
  weeklyAdherence: number;
  upcomingReminder: Date | null;
}

export const MedicationDashboard: React.FC<MedicationDashboardProps> = ({ navigation }) => {
  const [stats, setStats] = useState<MedicationStats>({
    totalMedications: 0,
    todayReminders: 0,
    weeklyAdherence: 0,
    upcomingReminder: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userId] = useState('demo-user-123'); // In real app, get from auth context

  useEffect(() => {
    loadMedicationStats();
  }, []);

  const loadMedicationStats = async () => {
    try {
      setIsLoading(true);
      
      // Get medication schedules
      const schedules = await medicationReminderService.getMedicationSchedules(userId);
      const activeSchedules = schedules.filter(s => s.isActive);
      
      // Get today's reminders
      const todayReminders = await medicationReminderService.getTodayReminders(userId);
      
      // Get weekly adherence
      const adherenceData = await medicationReminderService.getWeeklyAdherence(userId);
      const averageAdherence = adherenceData.length > 0 
        ? Math.round(adherenceData.reduce((sum, med) => sum + med.adherencePercentage, 0) / adherenceData.length)
        : 0;

      // Find next upcoming reminder
      const now = new Date();
      const upcomingReminders = todayReminders
        .filter(r => new Date(r.scheduledTime) > now)
        .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

      setStats({
        totalMedications: activeSchedules.length,
        todayReminders: todayReminders.length,
        weeklyAdherence: averageAdherence,
        upcomingReminder: upcomingReminders.length > 0 ? new Date(upcomingReminders[0].scheduledTime) : null,
      });
    } catch (error) {
      console.error('Failed to load medication stats:', error);
      Alert.alert('Error', 'Failed to load medication information.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMedicationLogged = () => {
    // Refresh stats when medication is logged
    loadMedicationStats();
  };

  const formatUpcomingTime = (date: Date): string => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `in ${minutes}m`;
    } else {
      return 'now';
    }
  };

  const getAdherenceColor = (percentage: number): string => {
    if (percentage >= 90) return '#27ae60';
    if (percentage >= 75) return '#f39c12';
    if (percentage >= 50) return '#e67e22';
    return '#e74c3c';
  };

  const getAdherenceLabel = (percentage: number): string => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your medications...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Button
            title="← Back to Main"
            onPress={() => navigation.goBack()}
            variant="secondary"
            accessibilityLabel="Go back to main dashboard"
          />
        </View>
        <Text style={styles.title}>Your Medications</Text>
        <Text style={styles.subtitle}>Stay on track with your health</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalMedications}</Text>
          <Text style={styles.statLabel}>Active Medications</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.todayReminders}</Text>
          <Text style={styles.statLabel}>Today's Reminders</Text>
        </Card>
        
        <Card style={[styles.statCard, styles.adherenceCard]}>
          <Text style={[
            styles.statNumber,
            { color: getAdherenceColor(stats.weeklyAdherence) }
          ]}>
            {stats.weeklyAdherence}%
          </Text>
          <Text style={styles.statLabel}>Weekly Adherence</Text>
          <Text style={[
            styles.adherenceLabel,
            { color: getAdherenceColor(stats.weeklyAdherence) }
          ]}>
            {getAdherenceLabel(stats.weeklyAdherence)}
          </Text>
        </Card>
      </View>

      {/* Next Reminder */}
      {stats.upcomingReminder && (
        <Card style={styles.nextReminderCard}>
          <View style={styles.nextReminderContent}>
            <Text style={styles.nextReminderTitle}>Next Reminder</Text>
            <Text style={styles.nextReminderTime}>
              {stats.upcomingReminder.toLocaleTimeString([], { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })} • {formatUpcomingTime(stats.upcomingReminder)}
            </Text>
          </View>
          <Text style={styles.nextReminderIcon}>⏰</Text>
        </Card>
      )}

      {/* Today's Medications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Medications</Text>
        <MedicationReminder 
          userId={userId} 
          onMedicationLogged={handleMedicationLogged}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="➕ Add New Medication"
          onPress={() => navigation.navigate('MedicationSetup')}
          accessibilityLabel="Add new medication"
          accessibilityHint="Navigate to medication setup screen"
        />
        
        <Button
          title="📊 View Weekly Report"
          onPress={() => navigation.navigate('WeeklyAdherence')}
          variant="secondary"
          accessibilityLabel="View weekly adherence report"
          accessibilityHint="Navigate to weekly adherence tracking screen"
        />
        
        <Button
          title="⚙️ Manage Medications"
          onPress={() => navigation.navigate('MedicationManagement')}
          variant="secondary"
          accessibilityLabel="Manage all medications"
          accessibilityHint="Navigate to medication management screen"
        />
      </View>

      {/* Quick Tips */}
      <Card style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Medication Tips</Text>
        <View style={styles.tipsList}>
          <Text style={styles.tipItem}>• Take medications at the same time each day</Text>
          <Text style={styles.tipItem}>• Keep a glass of water nearby</Text>
          <Text style={styles.tipItem}>• Set up a weekly pill organizer</Text>
          <Text style={styles.tipItem}>• Never skip doses without consulting your doctor</Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTop: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  adherenceCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  adherenceLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  nextReminderCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  nextReminderContent: {
    flex: 1,
  },
  nextReminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  nextReminderTime: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: '500',
  },
  nextReminderIcon: {
    fontSize: 24,
    alignSelf: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    minHeight: 56,
  },
  tipsCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
});