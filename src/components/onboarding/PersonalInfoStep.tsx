import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { Button } from '../foundation/Button';
import { Card } from '../foundation/Card';
import { Text } from '../foundation/Text';
import { Input } from '../foundation/Input';
import { voiceService } from '../../services/VoiceService';

export interface PersonalInfoData {
  name: string;
  dateOfBirth: Date | null;
}

export interface PersonalInfoStepProps {
  data: PersonalInfoData;
  onUpdate: (data: PersonalInfoData) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  canGoBack: boolean;
  canSkip: boolean;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  onSkip,
  canGoBack,
  canSkip,
}) => {
  const [name, setName] = useState(data.name);
  const [birthYear, setBirthYear] = useState(
    data.dateOfBirth ? data.dateOfBirth.getFullYear().toString() : ''
  );
  const [nameError, setNameError] = useState('');
  const [birthYearError, setBirthYearError] = useState('');

  useEffect(() => {
    const message = `Let's start with some basic information about you. This helps me personalize your experience and ensure your safety.`;
    setTimeout(() => {
      voiceService.speak(message, { rate: 0.4 });
    }, 500);
  }, []);

  const validateName = (nameValue: string): boolean => {
    if (!nameValue.trim()) {
      setNameError('Please enter your name');
      return false;
    }
    if (nameValue.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateBirthYear = (yearValue: string): boolean => {
    if (!yearValue.trim()) {
      setBirthYearError('Please enter your birth year');
      return false;
    }

    const year = parseInt(yearValue);
    const currentYear = new Date().getFullYear();
    
    if (isNaN(year)) {
      setBirthYearError('Please enter a valid year');
      return false;
    }
    
    if (year < 1900 || year > currentYear) {
      setBirthYearError(`Please enter a year between 1900 and ${currentYear}`);
      return false;
    }

    setBirthYearError('');
    return true;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) {
      validateName(value);
    }
  };

  const handleBirthYearChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setBirthYear(numericValue);
    if (birthYearError) {
      validateBirthYear(numericValue);
    }
  };

  const handleNext = () => {
    const isNameValid = validateName(name);
    const isBirthYearValid = validateBirthYear(birthYear);

    if (!isNameValid || !isBirthYearValid) {
      voiceService.speak('Please check the information you entered and try again.');
      return;
    }

    // Create date of birth (using January 1st as default)
    const dateOfBirth = new Date(parseInt(birthYear), 0, 1);

    const updatedData: PersonalInfoData = {
      name: name.trim(),
      dateOfBirth,
    };

    onUpdate(updatedData);
    voiceService.speak(`Thank you, ${name.trim()}. Now let's set up your emergency contacts.`);
    onNext();
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Personal Information?',
      'We recommend providing your name for a personalized experience. Are you sure you want to skip this step?',
      [
        {
          text: 'Go Back',
          style: 'cancel',
        },
        {
          text: 'Skip',
          onPress: () => {
            voiceService.speak('Skipping personal information. You can add this later in settings.');
            onSkip();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Card variant="elevated" padding="large" style={styles.card}>
        <Text
          variant="title"
          weight="bold"
          style={styles.title}
          accessibilityRole="header"
        >
          Tell Me About Yourself
        </Text>

        <Text
          variant="body"
          style={styles.subtitle}
          accessibilityRole="text"
        >
          This information helps personalize your experience and keeps you safe.
        </Text>

        <View style={styles.formContainer}>
          <Input
            label="What's your name?"
            value={name}
            onChangeText={handleNameChange}
            placeholder="Enter your first name"
            error={nameError}
            accessibilityLabel="Your name"
            accessibilityHint="Enter your first name or preferred name"
            testID="personal-info-name-input"
            maxLength={50}
          />

          <Input
            label="What year were you born?"
            value={birthYear}
            onChangeText={handleBirthYearChange}
            placeholder="Enter birth year (e.g., 1950)"
            keyboardType="numeric"
            error={birthYearError}
            accessibilityLabel="Birth year"
            accessibilityHint="Enter the year you were born, for example 1950"
            testID="personal-info-birth-year-input"
            maxLength={4}
          />
        </View>

        <View style={styles.privacyNote}>
          <Text variant="caption" style={styles.privacyText}>
            🔒 Your personal information is encrypted and stored securely on your device.
          </Text>
        </View>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Continue"
          onPress={handleNext}
          variant="primary"
          size="large"
          accessibilityLabel="Continue to next step"
          accessibilityHint="Save your personal information and continue setup"
          testID="personal-info-continue-button"
        />

        <View style={styles.secondaryButtons}>
          {canGoBack && (
            <Button
              title="Back"
              onPress={onPrevious}
              variant="secondary"
              size="large"
              accessibilityLabel="Go back to previous step"
              testID="personal-info-back-button"
            />
          )}

          {canSkip && (
            <Button
              title="Skip"
              onPress={handleSkip}
              variant="secondary"
              size="large"
              accessibilityLabel="Skip personal information"
              accessibilityHint="Skip this step and continue with default settings"
              testID="personal-info-skip-button"
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
  card: {
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#000000',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#8E8E93',
  },
  formContainer: {
    marginBottom: 24,
  },
  privacyNote: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  privacyText: {
    textAlign: 'center',
    color: '#0369A1',
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 16,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});