import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Button } from '../foundation/Button';
import { Card } from '../foundation/Card';
import { Text } from '../foundation/Text';
import { UserPreferences } from '../../types/user';
import { voiceService } from '../../services/VoiceService';

export interface PreferencesStepProps {
  preferences: UserPreferences;
  onUpdate: (preferences: UserPreferences) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  canGoBack: boolean;
  canSkip: boolean;
}

const FONT_SIZE_OPTIONS = [
  { label: 'Large Text', value: 'large' as const, description: 'Comfortable reading size' },
  { label: 'Extra Large Text', value: 'extra-large' as const, description: 'Easier to read' },
];

const REMINDER_FREQUENCY_OPTIONS = [
  { label: 'Gentle Reminders', value: 'low' as const, description: 'Fewer notifications' },
  { label: 'Normal Reminders', value: 'normal' as const, description: 'Balanced notifications' },
  { label: 'Frequent Reminders', value: 'high' as const, description: 'More notifications' },
];

const CONTACT_METHOD_OPTIONS = [
  { label: 'Phone Call', value: 'call' as const, description: 'Voice calls with family' },
  { label: 'Video Call', value: 'video' as const, description: 'See family while talking' },
  { label: 'Messages', value: 'message' as const, description: 'Text messages' },
];

export const PreferencesStep: React.FC<PreferencesStepProps> = ({
  preferences,
  onUpdate,
  onNext,
  onPrevious,
  onSkip,
  canGoBack,
  canSkip,
}) => {
  const [currentPreferences, setCurrentPreferences] = useState<UserPreferences>(preferences);

  useEffect(() => {
    const message = `Now let's customize the app to work best for you. These settings help make the app easier and more comfortable to use.`;
    setTimeout(() => {
      voiceService.speak(message, { rate: 0.4 });
    }, 500);
  }, []);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const updatedPreferences = { ...currentPreferences, [key]: value };
    setCurrentPreferences(updatedPreferences);
    
    // Apply voice settings immediately for testing
    if (key === 'voiceEnabled') {
      voiceService.updateAudioSettings({ voiceEnabled: value as boolean });
      if (value) {
        voiceService.speak('Voice guidance is now enabled');
      }
    }
  };

  const testVoiceSettings = async () => {
    if (currentPreferences.voiceEnabled) {
      await voiceService.speak('This is how I sound with your current settings. I can read messages, provide instructions, and help you navigate the app.');
    } else {
      // Show visual feedback when voice is disabled
      alert('Voice guidance is currently disabled. Enable it to hear this message.');
    }
  };

  const handleNext = () => {
    onUpdate(currentPreferences);
    voiceService.speak('Great! Your preferences have been saved. Now let me show you how to use the key features of the app.');
    onNext();
  };

  const handleSkip = () => {
    voiceService.speak('Using default preferences. You can change these anytime in settings.');
    onSkip();
  };

  const renderOptionGroup = <T extends string>(
    title: string,
    description: string,
    options: Array<{ label: string; value: T; description: string }>,
    currentValue: T,
    onSelect: (value: T) => void,
    testId: string
  ) => (
    <Card variant="outlined" padding="medium" style={styles.optionGroup}>
      <Text variant="title2" weight="medium" style={styles.optionGroupTitle}>
        {title}
      </Text>
      <Text variant="body" style={styles.optionGroupDescription}>
        {description}
      </Text>
      
      <View style={styles.options}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[
              styles.option,
              currentValue === option.value && styles.optionSelected,
            ]}
            accessibilityLabel={`Select ${option.label}`}
            accessibilityHint={option.description}
            accessibilityRole="button"
            accessibilityState={{ selected: currentValue === option.value }}
            testID={`${testId}-${option.value}`}
          >
            <View style={styles.optionContent}>
              <View style={[
                styles.radioButton,
                currentValue === option.value && styles.radioButtonSelected,
              ]}>
                {currentValue === option.value && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              
              <View style={styles.optionText}>
                <Text
                  variant="body"
                  weight="medium"
                  style={[
                    styles.optionLabel,
                    currentValue === option.value && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  variant="caption"
                  style={[
                    styles.optionDescription,
                    currentValue === option.value && styles.optionDescriptionSelected,
                  ]}
                >
                  {option.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
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
          Customize Your Experience
        </Text>

        <Text
          variant="body"
          style={styles.subtitle}
          accessibilityRole="text"
        >
          Let's adjust these settings to make the app work perfectly for you.
        </Text>
      </Card>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderOptionGroup(
          'Text Size',
          'Choose the text size that\'s most comfortable for you to read',
          FONT_SIZE_OPTIONS,
          currentPreferences.fontSize,
          (value) => updatePreference('fontSize', value),
          'font-size'
        )}

        <Card variant="outlined" padding="medium" style={styles.optionGroup}>
          <Text variant="title2" weight="medium" style={styles.optionGroupTitle}>
            Display Options
          </Text>
          <Text variant="body" style={styles.optionGroupDescription}>
            Adjust the display for better visibility
          </Text>
          
          <TouchableOpacity
            onPress={() => updatePreference('highContrast', !currentPreferences.highContrast)}
            style={styles.toggleOption}
            accessibilityLabel={`${currentPreferences.highContrast ? 'Disable' : 'Enable'} high contrast mode`}
            accessibilityRole="switch"
            accessibilityState={{ checked: currentPreferences.highContrast }}
            testID="high-contrast-toggle"
          >
            <View style={styles.toggleContent}>
              <View style={styles.toggleText}>
                <Text variant="body" weight="medium" style={styles.toggleLabel}>
                  High Contrast Mode
                </Text>
                <Text variant="caption" style={styles.toggleDescription}>
                  Makes text and buttons easier to see
                </Text>
              </View>
              
              <View style={[
                styles.toggle,
                currentPreferences.highContrast && styles.toggleActive,
              ]}>
                <View style={[
                  styles.toggleThumb,
                  currentPreferences.highContrast && styles.toggleThumbActive,
                ]} />
              </View>
            </View>
          </TouchableOpacity>
        </Card>

        <Card variant="outlined" padding="medium" style={styles.optionGroup}>
          <Text variant="title2" weight="medium" style={styles.optionGroupTitle}>
            Voice Assistance
          </Text>
          <Text variant="body" style={styles.optionGroupDescription}>
            I can read messages and provide spoken guidance
          </Text>
          
          <TouchableOpacity
            onPress={() => updatePreference('voiceEnabled', !currentPreferences.voiceEnabled)}
            style={styles.toggleOption}
            accessibilityLabel={`${currentPreferences.voiceEnabled ? 'Disable' : 'Enable'} voice guidance`}
            accessibilityRole="switch"
            accessibilityState={{ checked: currentPreferences.voiceEnabled }}
            testID="voice-enabled-toggle"
          >
            <View style={styles.toggleContent}>
              <View style={styles.toggleText}>
                <Text variant="body" weight="medium" style={styles.toggleLabel}>
                  Voice Guidance
                </Text>
                <Text variant="caption" style={styles.toggleDescription}>
                  Hear instructions and messages read aloud
                </Text>
              </View>
              
              <View style={[
                styles.toggle,
                currentPreferences.voiceEnabled && styles.toggleActive,
              ]}>
                <View style={[
                  styles.toggleThumb,
                  currentPreferences.voiceEnabled && styles.toggleThumbActive,
                ]} />
              </View>
            </View>
          </TouchableOpacity>

          {currentPreferences.voiceEnabled && (
            <Button
              title="Test Voice Settings"
              onPress={testVoiceSettings}
              variant="secondary"
              size="medium"
              accessibilityLabel="Test voice settings"
              accessibilityHint="Hear a sample of voice guidance"
              testID="test-voice-button"
            />
          )}
        </Card>

        {renderOptionGroup(
          'Reminder Frequency',
          'How often would you like to receive reminders?',
          REMINDER_FREQUENCY_OPTIONS,
          currentPreferences.reminderFrequency,
          (value) => updatePreference('reminderFrequency', value),
          'reminder-frequency'
        )}

        {renderOptionGroup(
          'Preferred Contact Method',
          'How do you prefer to connect with family and friends?',
          CONTACT_METHOD_OPTIONS,
          currentPreferences.preferredContactMethod,
          (value) => updatePreference('preferredContactMethod', value),
          'contact-method'
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Continue"
          onPress={handleNext}
          variant="primary"
          size="large"
          accessibilityLabel="Continue to next step"
          accessibilityHint="Save preferences and continue setup"
          testID="preferences-continue-button"
        />

        <View style={styles.secondaryButtons}>
          {canGoBack && (
            <Button
              title="Back"
              onPress={onPrevious}
              variant="secondary"
              size="large"
              accessibilityLabel="Go back to previous step"
              testID="preferences-back-button"
            />
          )}

          {canSkip && (
            <Button
              title="Use Defaults"
              onPress={handleSkip}
              variant="secondary"
              size="large"
              accessibilityLabel="Use default preferences"
              accessibilityHint="Skip customization and use default settings"
              testID="preferences-skip-button"
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
  content: {
    flex: 1,
    marginBottom: 16,
  },
  optionGroup: {
    marginBottom: 16,
  },
  optionGroupTitle: {
    marginBottom: 4,
    color: '#000000',
  },
  optionGroupDescription: {
    marginBottom: 16,
    color: '#8E8E93',
  },
  options: {
    gap: 8,
  },
  option: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  optionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F9FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#007AFF',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    color: '#000000',
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  optionDescription: {
    color: '#8E8E93',
  },
  optionDescriptionSelected: {
    color: '#0066CC',
  },
  toggleOption: {
    paddingVertical: 12,
    marginBottom: 16,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleText: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    color: '#000000',
    marginBottom: 2,
  },
  toggleDescription: {
    color: '#8E8E93',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  buttonContainer: {
    gap: 16,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});