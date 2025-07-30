import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { Button, Card, Text, Input } from './foundation';
import { medicationReminderService } from '../services/MedicationReminderService';
import { MedicationSchedule } from '../types/health';

interface MedicationSetupProps {
  userId: string;
  onScheduleCreated?: (schedule: MedicationSchedule) => void;
  onCancel?: () => void;
}

interface TimeSlot {
  id: string;
  time: string;
  label: string;
}

const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: '1', time: '08:00', label: 'Morning (8:00 AM)' },
  { id: '2', time: '12:00', label: 'Noon (12:00 PM)' },
  { id: '3', time: '18:00', label: 'Evening (6:00 PM)' },
  { id: '4', time: '22:00', label: 'Night (10:00 PM)' },
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Every Day' },
  { value: 'twice-daily', label: 'Twice a Day' },
  { value: 'three-times-daily', label: 'Three Times a Day' },
  { value: 'as-needed', label: 'As Needed' },
];

export const MedicationSetup: React.FC<MedicationSetupProps> = ({
  userId,
  onScheduleCreated,
  onCancel,
}) => {
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['08:00']);
  const [customTime, setCustomTime] = useState('');
  const [medicationPhoto, setMedicationPhoto] = useState<string | null>(null);
  const [isCritical, setIsCritical] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTimeSelection = (timeSlot: TimeSlot) => {
    const isSelected = selectedTimes.includes(timeSlot.time);
    
    if (isSelected) {
      setSelectedTimes(prev => prev.filter(time => time !== timeSlot.time));
    } else {
      setSelectedTimes(prev => [...prev, timeSlot.time]);
    }
  };

  const addCustomTime = () => {
    if (customTime && !selectedTimes.includes(customTime)) {
      setSelectedTimes(prev => [...prev, customTime]);
      setCustomTime('');
    }
  };

  const removeTime = (timeToRemove: string) => {
    setSelectedTimes(prev => prev.filter(time => time !== timeToRemove));
  };

  const formatTimeDisplay = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const takeMedicationPhoto = () => {
    // In a real implementation, this would open the camera
    const confirmPhoto = window.confirm(
      'Take Photo\n\nThis would open the camera to take a photo of your medication for easy identification.\n\nClick OK to simulate taking a photo.'
    );
    
    if (confirmPhoto) {
      // Mock photo URI
      setMedicationPhoto(`medication_photo_${Date.now()}.jpg`);
      window.alert('Photo taken successfully! (This is a simulation)');
    }
  };

  const handleSave = async () => {
    console.log('Starting save process...');
    console.log('Form data:', { medicationName, dosage, frequency, selectedTimes, isCritical });
    
    if (!medicationName.trim()) {
      window.alert('Missing Information\n\nPlease enter the medication name.');
      return;
    }

    if (!dosage.trim()) {
      window.alert('Missing Information\n\nPlease enter the dosage.');
      return;
    }

    if (selectedTimes.length === 0) {
      window.alert('Missing Information\n\nPlease select at least one time for reminders.');
      return;
    }

    setIsLoading(true);
    console.log('Form validation passed, attempting to save...');

    try {
      console.log('Calling medicationReminderService.createMedicationSchedule...');
      const schedule = await medicationReminderService.createMedicationSchedule(
        userId,
        medicationName.trim(),
        dosage.trim(),
        frequency,
        selectedTimes.sort(),
        medicationPhoto || undefined,
        isCritical
      );
      
      console.log('Schedule created successfully:', schedule);

      // Show success message and navigate back
      console.log('Medication saved successfully!');
      
      // Use window.alert for web compatibility
      try {
        window.alert(`Medication Added Successfully!\n\n${medicationName} has been added to your medication schedule. You'll receive reminders at the selected times.`);
        console.log('Success alert shown, calling onScheduleCreated');
        onScheduleCreated?.(schedule);
      } catch (alertError) {
        console.log('Alert failed, calling onScheduleCreated directly');
        onScheduleCreated?.(schedule);
      }
    } catch (error) {
      console.error('Failed to create medication schedule:', error);
      console.error('Error details:', error);
      window.alert(`Error\n\nFailed to save medication schedule: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <Card style={styles.card}>
        <Text style={styles.title}>Add New Medication</Text>
        
        {/* Medication Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Medication Name *</Text>
          <Input
            value={medicationName}
            onChangeText={setMedicationName}
            placeholder="Enter medication name"
            style={styles.input}
            accessibilityLabel="Medication name input"
            accessibilityHint="Enter the name of your medication"
          />
        </View>

        {/* Dosage */}
        <View style={styles.section}>
          <Text style={styles.label}>Dosage *</Text>
          <Input
            value={dosage}
            onChangeText={setDosage}
            placeholder="e.g., 10mg, 1 tablet"
            style={styles.input}
            accessibilityLabel="Medication dosage input"
            accessibilityHint="Enter the dosage amount"
          />
        </View>

        {/* Frequency */}
        <View style={styles.section}>
          <Text style={styles.label}>How Often</Text>
          <View style={styles.frequencyContainer}>
            {FREQUENCY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyOption,
                  frequency === option.value && styles.frequencyOptionSelected
                ]}
                onPress={() => setFrequency(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: frequency === option.value }}
                accessibilityLabel={`Frequency option: ${option.label}`}
              >
                <Text style={[
                  styles.frequencyText,
                  frequency === option.value && styles.frequencyTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Reminder Times *</Text>
          <Text style={styles.subtitle}>Select when you want to be reminded</Text>
          
          <View style={styles.timeSlotContainer}>
            {DEFAULT_TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.timeSlot,
                  selectedTimes.includes(slot.time) && styles.timeSlotSelected
                ]}
                onPress={() => handleTimeSelection(slot)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selectedTimes.includes(slot.time) }}
                accessibilityLabel={`Time slot: ${slot.label}`}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedTimes.includes(slot.time) && styles.timeSlotTextSelected
                ]}>
                  {slot.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Time */}
          <View style={styles.customTimeContainer}>
            <Input
              value={customTime}
              onChangeText={setCustomTime}
              placeholder="Custom time (HH:MM)"
              style={[styles.input, styles.customTimeInput]}
              accessibilityLabel="Custom time input"
              accessibilityHint="Enter custom reminder time in 24-hour format"
            />
            <Button
              title="Add"
              onPress={addCustomTime}
              style={styles.addTimeButton}
              disabled={!customTime}
              accessibilityLabel="Add custom time"
            />
          </View>

          {/* Selected Times Display */}
          {selectedTimes.length > 0 && (
            <View style={styles.selectedTimesContainer}>
              <Text style={styles.selectedTimesLabel}>Selected Times:</Text>
              <View style={styles.selectedTimesList}>
                {selectedTimes.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={styles.selectedTimeChip}
                    onPress={() => removeTime(time)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove time ${formatTimeDisplay(time)}`}
                    accessibilityHint="Tap to remove this reminder time"
                  >
                    <Text style={styles.selectedTimeText}>
                      {formatTimeDisplay(time)}
                    </Text>
                    <Text style={styles.removeTimeText}>×</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Medication Photo */}
        <View style={styles.section}>
          <Text style={styles.label}>Medication Photo (Optional)</Text>
          <Text style={styles.subtitle}>Take a photo to help identify your medication</Text>
          
          <TouchableOpacity
            style={styles.photoButton}
            onPress={takeMedicationPhoto}
            accessibilityRole="button"
            accessibilityLabel="Take medication photo"
            accessibilityHint="Opens camera to take a photo of your medication"
          >
            {medicationPhoto ? (
              <View style={styles.photoPreview}>
                <Text style={styles.photoPreviewText}>📷 Photo Added</Text>
                <Text style={styles.photoChangeText}>Tap to change</Text>
              </View>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>📷</Text>
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Critical Medication Toggle */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.criticalToggle}
            onPress={() => setIsCritical(!isCritical)}
            accessibilityRole="switch"
            accessibilityState={{ checked: isCritical }}
            accessibilityLabel="Critical medication toggle"
            accessibilityHint="Mark as critical to enable emergency contact notifications for missed doses"
          >
            <View style={[styles.checkbox, isCritical && styles.checkboxChecked]}>
              {isCritical && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.criticalTextContainer}>
              <Text style={styles.criticalLabel}>Critical Medication</Text>
              <Text style={styles.criticalSubtext}>
                Emergency contacts will be notified if multiple doses are missed
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Save Medication"
            onPress={handleSave}
            style={styles.saveButton}
            disabled={isLoading}
            accessibilityLabel="Save medication schedule"
          />
          {onCancel && (
            <Button
              title="Cancel"
              onPress={onCancel}
              variant="secondary"
              style={styles.cancelButton}
              accessibilityLabel="Cancel medication setup"
            />
          )}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 40, // Add padding to ensure content is scrollable
  },
  card: {
    margin: 16,
    padding: 20,
    flexGrow: 1, // Ensure card can grow to accommodate content
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  input: {
    fontSize: 16,
    minHeight: 50,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    backgroundColor: '#ffffff',
    minWidth: 120,
    alignItems: 'center',
  },
  frequencyOptionSelected: {
    borderColor: '#3498db',
    backgroundColor: '#e3f2fd',
  },
  frequencyText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  frequencyTextSelected: {
    color: '#3498db',
    fontWeight: '600',
  },
  timeSlotContainer: {
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  timeSlotSelected: {
    borderColor: '#27ae60',
    backgroundColor: '#e8f5e8',
  },
  timeSlotText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  timeSlotTextSelected: {
    color: '#27ae60',
    fontWeight: '600',
  },
  customTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  customTimeInput: {
    flex: 1,
  },
  addTimeButton: {
    paddingHorizontal: 20,
  },
  selectedTimesContainer: {
    marginTop: 16,
  },
  selectedTimesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  selectedTimesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTimeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#27ae60',
    borderRadius: 16,
    gap: 6,
  },
  selectedTimeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  removeTimeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  photoButton: {
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 32,
    marginBottom: 8,
  },
  photoButtonText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '500',
  },
  photoPreview: {
    alignItems: 'center',
  },
  photoPreviewText: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '600',
    marginBottom: 4,
  },
  photoChangeText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  criticalToggle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginTop: 2,
  },
  checkboxChecked: {
    borderColor: '#e74c3c',
    backgroundColor: '#e74c3c',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  criticalTextContainer: {
    flex: 1,
  },
  criticalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  criticalSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
});