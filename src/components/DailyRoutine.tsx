import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { DailyRoutine as DailyRoutineType, RoutineItem } from '../types/activities';
import { activitiesService } from '../services/ActivitiesService';

interface DailyRoutineProps {
  userId: string;
  date?: Date;
  onItemComplete?: (item: RoutineItem) => void;
  onAddItem?: () => void;
}

export const DailyRoutine: React.FC<DailyRoutineProps> = ({
  userId,
  date = new Date(),
  onItemComplete,
  onAddItem
}) => {
  const [routine, setRoutine] = useState<DailyRoutineType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load the daily routine
  useEffect(() => {
    const loadRoutine = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Add timeout protection
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout loading routine')), 10000);
        });
        
        const routinePromise = activitiesService.getDailyRoutine(userId, date);
        const userRoutine = await Promise.race([routinePromise, timeoutPromise]) as DailyRoutineType | null;
        
        setRoutine(userRoutine);
      } catch (err) {
        console.error('Error loading daily routine:', err);
        setError('Unable to load your daily routine. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [userId, date.toDateString()]); // Use date string to prevent infinite re-renders

  // Handle item completion toggle
  const handleToggleComplete = async (item: RoutineItem) => {
    if (!routine) return;
    
    try {
      const newStatus = !item.isCompleted;
      const updatedRoutine = await activitiesService.updateRoutineItemStatus(
        userId,
        routine.id,
        item.id,
        newStatus
      );
      
      if (updatedRoutine) {
        setRoutine(updatedRoutine);
        
        if (newStatus && onItemComplete) {
          onItemComplete(item);
        }
        
        // Show celebration for completing all items
        if (updatedRoutine.completedCount === updatedRoutine.totalCount) {
          window.alert("Great job! 🎉\n\nYou've completed all your routine tasks for today!");
        }
      }
    } catch (err) {
      console.error('Error updating routine item:', err);
      window.alert('Error\n\nUnable to update this item. Please try again.');
    }
  };

  // Group items by time of day
  const groupedItems = routine?.items.reduce((groups, item) => {
    const group = groups[item.timeOfDay] || [];
    group.push(item);
    groups[item.timeOfDay] = group;
    return groups;
  }, {} as Record<string, RoutineItem[]>) || {};

  // Order of time of day sections
  const timeOfDayOrder = ['morning', 'afternoon', 'evening', 'anytime'];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading your daily routine...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setLoading(true)}
          accessibilityLabel="Retry loading your routine"
          accessibilityHint="Attempts to load your daily routine again"
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateText}>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${routine ? (routine.completedCount / routine.totalCount) * 100 : 0}%`,
                  backgroundColor: routine && routine.completedCount === routine.totalCount 
                    ? '#10b981' // green for complete
                    : '#4f46e5' // purple for in progress
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {routine ? `${routine.completedCount}/${routine.totalCount} completed` : '0/0 completed'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {timeOfDayOrder.map(timeOfDay => {
          const items = groupedItems[timeOfDay];
          if (!items || items.length === 0) return null;

          return (
            <View key={timeOfDay} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
              </Text>
              {items.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemContainer}
                  onPress={() => handleToggleComplete(item)}
                  accessibilityLabel={`${item.title}, ${item.isCompleted ? 'completed' : 'not completed'}`}
                  accessibilityHint={`Tap to mark as ${item.isCompleted ? 'not completed' : 'completed'}`}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: item.isCompleted }}
                >
                  <View style={[styles.checkbox, item.isCompleted && styles.checkboxChecked]}>
                    {item.isCompleted && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemTitle, item.isCompleted && styles.itemTitleCompleted]}>
                      {item.title}
                    </Text>
                    {item.description && (
                      <Text style={[styles.itemDescription, item.isCompleted && styles.itemDescriptionCompleted]}>
                        {item.description}
                      </Text>
                    )}
                    {item.reminderEnabled && item.reminderTime && (
                      <Text style={styles.reminderText}>
                        Reminder: {item.reminderTime}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddItem}
        accessibilityLabel="Add new routine item"
        accessibilityHint="Adds a new item to your daily routine"
      >
        <Text style={styles.addButtonText}>+ Add Item</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
  },
  progressText: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 72, // Ensure minimum touch target size
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#6b7280',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemDescriptionCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  reminderText: {
    fontSize: 14,
    color: '#4f46e5',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#4f46e5',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56, // Ensure minimum touch target size
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});