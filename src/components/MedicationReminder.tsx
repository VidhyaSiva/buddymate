import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { Button, Card, Text } from './foundation';
import { medicationReminderService, MedicationReminder as ReminderType } from '../services/MedicationReminderService';
import { MedicationSchedule } from '../types/health';

interface MedicationReminderProps {
  userId: string;
  onMedicationLogged?: () => void;
}

interface ActiveReminder extends ReminderType {
  schedule: MedicationSchedule;
  timeUntilReminder: string;
  isPastDue: boolean;
}

export const MedicationReminder: React.FC<MedicationReminderProps> = ({
  userId,
  onMedicationLogged,
}) => {
  const [todayReminders, setTodayReminders] = useState<ActiveReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadTodayReminders();
    
    // Update current time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, [userId]);

  useEffect(() => {
    // Update time until reminder every minute
    updateReminderTimes();
  }, [currentTime]);

  const loadTodayReminders = async () => {
    try {
      setIsLoading(true);
      const reminders = await medicationReminderService.getTodayReminders(userId);
      const schedules = await medicationReminderService.getMedicationSchedules(userId);
      
      const activeReminders: ActiveReminder[] = reminders.map(reminder => {
        const schedule = schedules.find(s => s.id === reminder.scheduleId);
        if (!schedule) return null;

        const now = new Date();
        const reminderTime = new Date(reminder.scheduledTime);
        const timeDiff = reminderTime.getTime() - now.getTime();
        const isPastDue = timeDiff < 0;
        
        return {
          ...reminder,
          schedule,
          timeUntilReminder: formatTimeUntilReminder(timeDiff),
          isPastDue,
        };
      }).filter(Boolean) as ActiveReminder[];

      // Sort by time - past due first, then by scheduled time
      activeReminders.sort((a, b) => {
        if (a.isPastDue && !b.isPastDue) return -1;
        if (!a.isPastDue && b.isPastDue) return 1;
        return a.scheduledTime.getTime() - b.scheduledTime.getTime();
      });

      setTodayReminders(activeReminders);
    } catch (error) {
      console.error('Failed to load today reminders:', error);
      Alert.alert('Error', 'Failed to load medication reminders.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateReminderTimes = () => {
    setTodayReminders(prev => prev.map(reminder => {
      const now = new Date();
      const reminderTime = new Date(reminder.scheduledTime);
      const timeDiff = reminderTime.getTime() - now.getTime();
      const isPastDue = timeDiff < 0;

      return {
        ...reminder,
        timeUntilReminder: formatTimeUntilReminder(timeDiff),
        isPastDue,
      };
    }));
  };

  const formatTimeUntilReminder = (timeDiff: number): string => {
    const absTimeDiff = Math.abs(timeDiff);
    const hours = Math.floor(absTimeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((absTimeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (timeDiff < 0) {
      if (hours > 0) {
        return `${hours}h ${minutes}m overdue`;
      } else {
        return `${minutes}m overdue`;
      }
    } else {
      if (hours > 0) {
        return `in ${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `in ${minutes}m`;
      } else {
        return 'now';
      }
    }
  };

  const formatReminderTime = (date: Date): string => {
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleMedicationTaken = async (reminder: ActiveReminder) => {
    try {
      console.log('Logging medication as taken:', reminder.medicationName);
      
      await medicationReminderService.logMedicationTaken(
        reminder.scheduleId,
        reminder.scheduledTime,
        'Taken as scheduled'
      );

      console.log('Medication logged successfully');

      Alert.alert(
        'Medication Logged Successfully!',
        `${reminder.medicationName} has been marked as taken.`,
        [{ text: 'OK' }]
      );

      // Remove from today's reminders and refresh
      setTodayReminders(prev => prev.filter(r => r.id !== reminder.id));
      
      // Call the callback to refresh parent components
      onMedicationLogged?.();
      
      console.log('Reminder removed from list, callback called');
    } catch (error) {
      console.error('Failed to log medication as taken:', error);
      Alert.alert('Error', 'Failed to log medication. Please try again.');
    }
  };

  const handleMedicationSkipped = async (reminder: ActiveReminder) => {
    Alert.alert(
      'Skip Medication',
      `Are you sure you want to skip ${reminder.medicationName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          style: 'destructive',
          onPress: async () => {
            try {
              await medicationReminderService.logMedicationSkipped(
                reminder.scheduleId,
                reminder.scheduledTime,
                'Skipped by user'
              );

              Alert.alert(
                'Medication Skipped',
                `${reminder.medicationName} has been marked as skipped.`,
                [{ text: 'OK' }]
              );

              // Remove from today's reminders
              setTodayReminders(prev => prev.filter(r => r.id !== reminder.id));
              onMedicationLogged?.();
            } catch (error) {
              console.error('Failed to log medication as skipped:', error);
              Alert.alert('Error', 'Failed to log medication. Please try again.');
            }
          }
        }
      ]
    );
  };

  const showMedicationDetails = (reminder: ActiveReminder) => {
    Alert.alert(
      reminder.medicationName,
      `Dosage: ${reminder.dosage}\nScheduled: ${formatReminderTime(reminder.scheduledTime)}\nFrequency: ${reminder.schedule.frequency}`,
      [{ text: 'OK' }]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading medication reminders...</Text>
      </View>
    );
  }

  if (todayReminders.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No Reminders Today</Text>
        <Text style={styles.emptyText}>
          You're all caught up with your medications for today! 🎉
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Medications</Text>
      
      {todayReminders.map((reminder) => (
        <Card 
          key={reminder.id} 
          style={[
            styles.reminderCard,
            reminder.isPastDue && styles.overdueCard
          ]}
        >
          <View style={styles.reminderHeader}>
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName}>
                {reminder.medicationName}
              </Text>
              <Text style={styles.dosage}>
                {reminder.dosage}
              </Text>
              <Text style={[
                styles.timeInfo,
                reminder.isPastDue && styles.overdueText
              ]}>
                {formatReminderTime(reminder.scheduledTime)} • {reminder.timeUntilReminder}
              </Text>
            </View>
            
            {reminder.schedule.photo && (
              <TouchableOpacity 
                style={styles.photoContainer}
                onPress={() => showMedicationDetails(reminder)}
                accessibilityRole="button"
                accessibilityLabel={`View details for ${reminder.medicationName}`}
              >
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoIcon}>📷</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {reminder.isPastDue && (
            <View style={styles.overdueAlert}>
              <Text style={styles.overdueAlertText}>
                ⚠️ This medication is overdue
              </Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            <Button
              title="✓ Taken"
              onPress={() => handleMedicationTaken(reminder)}
              style={[styles.actionButton, styles.takenButton]}
              accessibilityLabel={`Mark ${reminder.medicationName} as taken`}
            />
            <Button
              title="Skip"
              onPress={() => handleMedicationSkipped(reminder)}
              variant="secondary"
              style={[styles.actionButton, styles.skipButton]}
              accessibilityLabel={`Skip ${reminder.medicationName}`}
            />
          </View>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => showMedicationDetails(reminder)}
            accessibilityRole="button"
            accessibilityLabel={`View details for ${reminder.medicationName}`}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </Card>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tap "Taken" when you take your medication, or "Skip" if you need to skip a dose.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyCard: {
    margin: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  reminderCard: {
    marginBottom: 16,
    padding: 16,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  timeInfo: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  overdueText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  photoContainer: {
    marginLeft: 12,
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  photoIcon: {
    fontSize: 24,
  },
  overdueAlert: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  overdueAlertText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    minHeight: 50,
  },
  takenButton: {
    backgroundColor: '#27ae60',
  },
  skipButton: {
    backgroundColor: '#95a5a6',
  },
  detailsButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#3498db',
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
});