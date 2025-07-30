import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  Switch
} from 'react-native';
import { DailyRoutine } from '../components/DailyRoutine';
import { RoutineItem } from '../types/activities';
import { activitiesService } from '../services/ActivitiesService';
import { Button } from '../components/foundation';

interface DailyRoutineScreenProps {
  navigation: any;
  route: any;
}

export const DailyRoutineScreen: React.FC<DailyRoutineScreenProps> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemTimeOfDay, setNewItemTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('morning');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [refreshKey, setRefreshKey] = useState(0);

  // Mock user ID - in a real app, this would come from authentication
  const userId = '123456';

  const handleItemComplete = (item: RoutineItem) => {
    // Show a positive reinforcement message
    if (item.isCompleted) return; // Don't show if unchecking
    
    const messages = [
      "Great job! 👏",
      "Well done! 🌟",
      "You're doing great! 💪",
      "Keep it up! 🎉",
      "Excellent progress! 👍"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    window.alert(`${randomMessage}\n\nYou've completed "${item.title}"`);
  };

  const handleAddItem = () => {
    setModalVisible(true);
  };

  const handleSaveNewItem = async () => {
    if (!newItemTitle.trim()) {
      window.alert('Error\n\nPlease enter a title for your routine item');
      return;
    }
    
    try {
      await activitiesService.addRoutineItem(userId, {
        title: newItemTitle,
        description: newItemDescription,
        timeOfDay: newItemTimeOfDay,
        isCompleted: false,
        isRecurring: true,
        recurringDays: [0, 1, 2, 3, 4, 5, 6], // Every day
        userId,
        order: 999, // Will be sorted later
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime : undefined
      });
      
      // Reset form and close modal
      setNewItemTitle('');
      setNewItemDescription('');
      setNewItemTimeOfDay('morning');
      setReminderEnabled(false);
      setReminderTime('08:00');
      setModalVisible(false);
      
      // Show success message and refresh the component
      window.alert('Success\n\nNew routine item added successfully!');
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Error adding routine item:', err);
      window.alert('Error\n\nUnable to add new routine item. Please try again.');
    }
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
      <DailyRoutine
        key={refreshKey}
        userId={userId}
        onItemComplete={handleItemComplete}
        onAddItem={handleAddItem}
      />
      
      {/* Add New Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Routine Item</Text>
            
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.textInput}
              value={newItemTitle}
              onChangeText={setNewItemTitle}
              placeholder="Enter item title"
              placeholderTextColor="#9ca3af"
              accessibilityLabel="Item title"
              accessibilityHint="Enter a title for your routine item"
            />
            
            <Text style={styles.inputLabel}>Description (optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={newItemDescription}
              onChangeText={setNewItemDescription}
              placeholder="Enter item description"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              accessibilityLabel="Item description"
              accessibilityHint="Enter an optional description for your routine item"
            />
            
            <Text style={styles.inputLabel}>Time of Day</Text>
            <View style={styles.timeOfDayContainer}>
              {(['morning', 'afternoon', 'evening', 'anytime'] as const).map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOfDayButton,
                    newItemTimeOfDay === time && styles.timeOfDayButtonSelected
                  ]}
                  onPress={() => setNewItemTimeOfDay(time)}
                  accessibilityLabel={`${time} time of day`}
                  accessibilityHint={`Set the time of day to ${time}`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: newItemTimeOfDay === time }}
                >
                  <Text
                    style={[
                      styles.timeOfDayButtonText,
                      newItemTimeOfDay === time && styles.timeOfDayButtonTextSelected
                    ]}
                  >
                    {time.charAt(0).toUpperCase() + time.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.reminderContainer}>
              <Text style={styles.inputLabel}>Enable Reminder</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: '#e5e7eb', true: '#c7d2fe' }}
                thumbColor={reminderEnabled ? '#4f46e5' : '#9ca3af'}
                accessibilityLabel="Enable reminder"
                accessibilityHint="Toggle to enable or disable reminders for this item"
                accessibilityRole="switch"
              />
            </View>
            
            {reminderEnabled && (
              <View>
                <Text style={styles.inputLabel}>Reminder Time</Text>
                <TextInput
                  style={styles.textInput}
                  value={reminderTime}
                  onChangeText={setReminderTime}
                  placeholder="HH:MM"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numbers-and-punctuation"
                  accessibilityLabel="Reminder time"
                  accessibilityHint="Enter the time for your reminder in 24-hour format"
                />
              </View>
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Cancel"
                accessibilityHint="Cancel adding a new routine item"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveNewItem}
                accessibilityLabel="Save item"
                accessibilityHint="Save this new routine item"
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    borderBottomColor: '#e9ecef',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 48, // Ensure minimum touch target size
  },
  textAreaInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  timeOfDayContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  timeOfDayButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    minHeight: 44, // Ensure minimum touch target size
    minWidth: 80,
    alignItems: 'center',
  },
  timeOfDayButtonSelected: {
    backgroundColor: '#4f46e5',
  },
  timeOfDayButtonText: {
    fontSize: 16,
    color: '#4b5563',
  },
  timeOfDayButtonTextSelected: {
    color: '#ffffff',
  },
  reminderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    minWidth: 120,
    alignItems: 'center',
    minHeight: 48, // Ensure minimum touch target size
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  saveButton: {
    backgroundColor: '#4f46e5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});