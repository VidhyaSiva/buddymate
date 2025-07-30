import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Button } from '../foundation/Button';
import { Card } from '../foundation/Card';
import { Text } from '../foundation/Text';
import { Input } from '../foundation/Input';
import { MedicationSchedule } from '../../types/health';
import { voiceService } from '../../services/VoiceService';

export interface MedicationSetupStepProps {
  medications: MedicationSchedule[];
  onUpdate: (medications: MedicationSchedule[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  canGoBack: boolean;
  canSkip: boolean;
}

interface MedicationForm {
  medicationName: string;
  dosage: string;
  frequency: string;
  times: string[];
  photo?: string;
}

const FREQUENCY_OPTIONS = [
  { label: 'Once daily', value: 'daily', times: ['08:00'] },
  { label: 'Twice daily', value: 'twice-daily', times: ['08:00', '20:00'] },
  { label: 'Three times daily', value: 'three-times', times: ['08:00', '14:00', '20:00'] },
  { label: 'Four times daily', value: 'four-times', times: ['08:00', '12:00', '16:00', '20:00'] },
  { label: 'As needed', value: 'as-needed', times: [] },
];

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00',
];

export const MedicationSetupStep: React.FC<MedicationSetupStepProps> = ({
  medications,
  onUpdate,
  onNext,
  onPrevious,
  onSkip,
  canGoBack,
  canSkip,
}) => {
  const [medicationForms, setMedicationForms] = useState<MedicationForm[]>([
    {
      medicationName: '',
      dosage: '',
      frequency: '',
      times: [],
    },
  ]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Initialize with existing medications if any
    if (medications.length > 0) {
      const forms = medications.map(med => ({
        medicationName: med.medicationName,
        dosage: med.dosage,
        frequency: med.frequency,
        times: med.times,
        photo: med.photo,
      }));
      setMedicationForms(forms);
    }

    const message = `Now let's set up your medication reminders. This helps ensure you never miss taking your medicines. You can add photos to help identify each medication.`;
    setTimeout(() => {
      voiceService.speak(message, { rate: 0.4 });
    }, 500);
  }, [medications]);

  const validateMedication = (medication: MedicationForm, index: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!medication.medicationName.trim()) {
      newErrors[`name_${index}`] = 'Medication name is required';
      isValid = false;
    }

    if (!medication.dosage.trim()) {
      newErrors[`dosage_${index}`] = 'Dosage is required';
      isValid = false;
    }

    if (!medication.frequency.trim()) {
      newErrors[`frequency_${index}`] = 'Frequency is required';
      isValid = false;
    }

    if (medication.frequency !== 'as-needed' && medication.times.length === 0) {
      newErrors[`times_${index}`] = 'Please select at least one time';
      isValid = false;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const updateMedication = (index: number, field: keyof MedicationForm, value: any) => {
    const updatedForms = [...medicationForms];
    updatedForms[index] = { ...updatedForms[index], [field]: value };
    setMedicationForms(updatedForms);

    // Clear error for this field
    const errorKey = `${field}_${index}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const setFrequency = (index: number, frequencyOption: typeof FREQUENCY_OPTIONS[0]) => {
    updateMedication(index, 'frequency', frequencyOption.value);
    updateMedication(index, 'times', frequencyOption.times);
  };

  const toggleTime = (index: number, time: string) => {
    const medication = medicationForms[index];
    const currentTimes = medication.times;
    
    if (currentTimes.includes(time)) {
      updateMedication(index, 'times', currentTimes.filter(t => t !== time));
    } else {
      updateMedication(index, 'times', [...currentTimes, time].sort());
    }
  };

  const addMedication = () => {
    if (medicationForms.length < 10) {
      setMedicationForms([
        ...medicationForms,
        {
          medicationName: '',
          dosage: '',
          frequency: '',
          times: [],
        },
      ]);
      voiceService.speak('Added new medication form');
    }
  };

  const removeMedication = (index: number) => {
    if (medicationForms.length > 1) {
      const updatedForms = medicationForms.filter((_, i) => i !== index);
      setMedicationForms(updatedForms);
      voiceService.speak('Medication removed');
    }
  };

  const handleTakePhoto = (index: number) => {
    // In a real app, this would open the camera
    Alert.alert(
      'Take Photo',
      'In a real app, this would open your camera to take a photo of the medication.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Simulate Photo',
          onPress: () => {
            updateMedication(index, 'photo', `medication_photo_${index}_${Date.now()}.jpg`);
            voiceService.speak('Photo added for medication identification');
          },
        },
      ]
    );
  };

  const handleNext = () => {
    // Validate all medications
    let allValid = true;
    const validMedications: MedicationForm[] = [];

    medicationForms.forEach((medication, index) => {
      // Only validate medications that have some data entered
      const hasData = medication.medicationName.trim() || medication.dosage.trim();
      
      if (hasData) {
        if (validateMedication(medication, index)) {
          validMedications.push(medication);
        } else {
          allValid = false;
        }
      }
    });

    if (!allValid) {
      voiceService.speak('Please check the medication information and fix any errors.');
      return;
    }

    // Convert to MedicationSchedule format
    const medicationSchedules: MedicationSchedule[] = validMedications.map((medication, index) => ({
      id: `medication_${Date.now()}_${index}`,
      userId: 'current_user', // Will be updated when user profile is created
      medicationName: medication.medicationName.trim(),
      dosage: medication.dosage.trim(),
      frequency: medication.frequency,
      times: medication.times,
      photo: medication.photo,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    onUpdate(medicationSchedules);
    
    const message = validMedications.length > 0 
      ? `Great! I've set up reminders for ${validMedications.length} medication${validMedications.length > 1 ? 's' : ''}. Now let's customize your app preferences.`
      : `No medications added. You can always add them later. Now let's customize your app preferences.`;
    
    voiceService.speak(message);
    onNext();
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Medication Setup?',
      'Medication reminders help you stay healthy. You can always add medications later in the app.',
      [
        {
          text: 'Go Back',
          style: 'cancel',
        },
        {
          text: 'Skip',
          onPress: () => {
            voiceService.speak('Skipping medication setup. You can add medications later in the health section.');
            onSkip();
          },
        },
      ]
    );
  };

  const renderMedicationForm = (medication: MedicationForm, index: number) => (
    <Card key={index} variant="outlined" padding="medium" style={styles.medicationCard}>
      <View style={styles.medicationHeader}>
        <Text variant="title2" weight="medium" style={styles.medicationTitle}>
          Medication {index + 1}
        </Text>
        
        {medicationForms.length > 1 && (
          <TouchableOpacity
            onPress={() => removeMedication(index)}
            style={styles.removeButton}
            accessibilityLabel={`Remove medication ${index + 1}`}
            accessibilityRole="button"
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <Input
        label="Medication Name"
        value={medication.medicationName}
        onChangeText={(value) => updateMedication(index, 'medicationName', value)}
        placeholder="Enter medication name"
        error={errors[`name_${index}`]}
        accessibilityLabel={`Medication ${index + 1} name`}
        testID={`medication-name-${index}`}
        maxLength={100}
      />

      <Input
        label="Dosage"
        value={medication.dosage}
        onChangeText={(value) => updateMedication(index, 'dosage', value)}
        placeholder="e.g., 1 tablet, 5mg"
        error={errors[`dosage_${index}`]}
        accessibilityLabel={`Medication ${index + 1} dosage`}
        testID={`medication-dosage-${index}`}
        maxLength={50}
      />

      <View style={styles.photoSection}>
        <Text variant="body" weight="medium" style={styles.photoLabel}>
          Medication Photo (Optional)
        </Text>
        
        <TouchableOpacity
          onPress={() => handleTakePhoto(index)}
          style={styles.photoButton}
          accessibilityLabel={`${medication.photo ? 'Change' : 'Add'} photo for medication ${index + 1}`}
          accessibilityRole="button"
        >
          {medication.photo ? (
            <View style={styles.photoPreview}>
              <Text style={styles.photoPreviewText}>📷 Photo Added</Text>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>📷 Take Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.frequencySection}>
        <Text variant="body" weight="medium" style={styles.frequencyLabel}>
          How often do you take this medication?
        </Text>
        {errors[`frequency_${index}`] && (
          <Text variant="caption" color="error" style={styles.errorText}>
            {errors[`frequency_${index}`]}
          </Text>
        )}
        
        <View style={styles.frequencyOptions}>
          {FREQUENCY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setFrequency(index, option)}
              style={[
                styles.frequencyOption,
                medication.frequency === option.value && styles.frequencyOptionSelected,
              ]}
              accessibilityLabel={`Select frequency: ${option.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: medication.frequency === option.value }}
            >
              <Text
                style={[
                  styles.frequencyOptionText,
                  medication.frequency === option.value && styles.frequencyOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {medication.frequency && medication.frequency !== 'as-needed' && (
        <View style={styles.timesSection}>
          <Text variant="body" weight="medium" style={styles.timesLabel}>
            What times do you take this medication?
          </Text>
          {errors[`times_${index}`] && (
            <Text variant="caption" color="error" style={styles.errorText}>
              {errors[`times_${index}`]}
            </Text>
          )}
          
          <View style={styles.timeSlots}>
            {TIME_SLOTS.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => toggleTime(index, time)}
                style={[
                  styles.timeSlot,
                  medication.times.includes(time) && styles.timeSlotSelected,
                ]}
                accessibilityLabel={`${medication.times.includes(time) ? 'Remove' : 'Add'} time ${time}`}
                accessibilityRole="button"
                accessibilityState={{ selected: medication.times.includes(time) }}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    medication.times.includes(time) && styles.timeSlotTextSelected,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <Card variant="elevated" padding="large" style={styles.headerCard}>
        <Text
          variant="title"
          weight="bold"
          style={styles.title}
          accessibilityRole="header"
        >
          Medication Reminders
        </Text>

        <Text
          variant="body"
          style={styles.subtitle}
          accessibilityRole="text"
        >
          Set up reminders for your medications. I'll help you remember to take them on time.
        </Text>
      </View>

      <ScrollView style={styles.medicationsContainer} showsVerticalScrollIndicator={false}>
        {medicationForms.map((medication, index) => renderMedicationForm(medication, index))}

        {medicationForms.length < 10 && (
          <Button
            title="Add Another Medication"
            onPress={addMedication}
            variant="secondary"
            size="large"
            accessibilityLabel="Add another medication"
            testID="add-medication-button"
          />
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Continue"
          onPress={handleNext}
          variant="primary"
          size="large"
          accessibilityLabel="Continue to next step"
          accessibilityHint="Save medication reminders and continue setup"
          testID="medication-setup-continue-button"
        />

        <View style={styles.secondaryButtons}>
          {canGoBack && (
            <Button
              title="Back"
              onPress={onPrevious}
              variant="secondary"
              size="large"
              accessibilityLabel="Go back to previous step"
              testID="medication-setup-back-button"
            />
          )}

          {canSkip && (
            <Button
              title="Skip"
              onPress={handleSkip}
              variant="secondary"
              size="large"
              accessibilityLabel="Skip medication setup"
              accessibilityHint="Skip this step and continue without medication reminders"
              testID="medication-setup-skip-button"
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#000000',
  },
  subtitle: {
    textAlign: 'center',
    color: '#8E8E93',
  },
  medicationsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  medicationCard: {
    marginBottom: 16,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicationTitle: {
    color: '#000000',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoSection: {
    marginVertical: 12,
  },
  photoLabel: {
    marginBottom: 8,
    color: '#000000',
  },
  photoButton: {
    alignSelf: 'flex-start',
  },
  photoPreview: {
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  photoPreviewText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '500',
  },
  photoPlaceholder: {
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  frequencySection: {
    marginVertical: 12,
  },
  frequencyLabel: {
    marginBottom: 8,
    color: '#000000',
  },
  frequencyOptions: {
    gap: 8,
  },
  frequencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  frequencyOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  frequencyOptionText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  frequencyOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timesSection: {
    marginVertical: 12,
  },
  timesLabel: {
    marginBottom: 8,
    color: '#000000',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minWidth: 60,
  },
  timeSlotSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
  },
  buttonContainer: {
    gap: 16,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});