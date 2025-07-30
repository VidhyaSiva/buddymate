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

export interface TutorialStepProps {
  preferences: UserPreferences;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  canGoBack: boolean;
  canSkip: boolean;
}

interface TutorialFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  instructions: string[];
  voiceScript: string;
}

const TUTORIAL_FEATURES: TutorialFeature[] = [
  {
    id: 'daily-checkin',
    title: 'Daily Check-in',
    description: 'Start each day by sharing how you feel',
    icon: '😊',
    instructions: [
      'Tap the colorful mood faces to show how you feel',
      'Answer simple yes or no questions about your health',
      'Record a voice note if you want to share more',
      'Your responses help track your wellness over time',
    ],
    voiceScript: 'Daily check-in helps you track your mood and health. Simply tap the faces that show how you feel, answer a few yes or no questions, and optionally record a voice note.',
  },
  {
    id: 'emergency-help',
    title: 'Emergency Help',
    description: 'Get help quickly when you need it',
    icon: '🆘',
    instructions: [
      'The red emergency button is always visible',
      'Tap it to immediately call for help',
      'Your location is automatically shared',
      'Emergency contacts are notified right away',
    ],
    voiceScript: 'For emergencies, look for the red emergency button. Tapping it will immediately call for help and notify your emergency contacts with your location.',
  },
  {
    id: 'family-connection',
    title: 'Family Connection',
    description: 'Stay in touch with loved ones',
    icon: '👨‍👩‍👧‍👦',
    instructions: [
      'Tap on family photos to start video calls',
      'View messages with large, clear text',
      'Ask me to read messages aloud',
      'Share photos with simple taps',
    ],
    voiceScript: 'To connect with family, tap on their photos for video calls. I can read messages aloud, and you can easily share photos with simple taps.',
  },
  {
    id: 'medication-reminders',
    title: 'Medication Reminders',
    description: 'Never miss your medications',
    icon: '💊',
    instructions: [
      'Reminders appear with medication photos',
      'Tap "Taken" when you take your medicine',
      'Tap "Skip" if you need to skip a dose',
      'View your weekly adherence summary',
    ],
    voiceScript: 'Medication reminders show photos of your medicines with clear taken or skip buttons. You can view your weekly adherence to track your progress.',
  },
  {
    id: 'voice-commands',
    title: 'Voice Commands',
    description: 'Control the app with your voice',
    icon: '🎤',
    instructions: [
      'Say "Call emergency" for immediate help',
      'Say "Check in" to start your daily check-in',
      'Say "Call family" to contact loved ones',
      'Say "Help" to hear instructions for any screen',
    ],
    voiceScript: 'You can use voice commands like call emergency, check in, call family, or help to navigate the app hands-free.',
  },
  {
    id: 'navigation',
    title: 'Getting Around',
    description: 'Navigate the app easily',
    icon: '🧭',
    instructions: [
      'Use the large buttons at the bottom to navigate',
      'The home button always takes you to the main screen',
      'Back buttons are always in the same place',
      'Ask for help anytime by saying "Help"',
    ],
    voiceScript: 'Navigation is simple with large buttons at the bottom. The home button always returns you to the main screen, and you can ask for help anytime.',
  },
];

export const TutorialStep: React.FC<TutorialStepProps> = ({
  preferences,
  onNext,
  onPrevious,
  onSkip,
  canGoBack,
  canSkip,
}) => {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [completedFeatures, setCompletedFeatures] = useState<Set<string>>(new Set());

  const currentFeature = TUTORIAL_FEATURES[currentFeatureIndex];
  const isLastFeature = currentFeatureIndex === TUTORIAL_FEATURES.length - 1;
  const allFeaturesCompleted = completedFeatures.size === TUTORIAL_FEATURES.length;

  useEffect(() => {
    const message = `Now let me show you how to use the key features of BuddyMate. We'll go through each feature step by step.`;
    setTimeout(() => {
      voiceService.speak(message, { rate: 0.4 });
    }, 500);
  }, []);

  useEffect(() => {
    // Announce current feature when it changes
    if (currentFeature && preferences.voiceEnabled) {
      setTimeout(() => {
        voiceService.speak(`Feature ${currentFeatureIndex + 1} of ${TUTORIAL_FEATURES.length}: ${currentFeature.title}. ${currentFeature.voiceScript}`, { rate: 0.4 });
      }, 1000);
    }
  }, [currentFeatureIndex, currentFeature, preferences.voiceEnabled]);

  const handleFeatureComplete = () => {
    const newCompleted = new Set(completedFeatures);
    newCompleted.add(currentFeature.id);
    setCompletedFeatures(newCompleted);

    if (isLastFeature) {
      voiceService.speak('Great! You\'ve completed the tutorial. You\'re ready to start using BuddyMate.');
    } else {
      setCurrentFeatureIndex(currentFeatureIndex + 1);
    }
  };

  const handlePreviousFeature = () => {
    if (currentFeatureIndex > 0) {
      setCurrentFeatureIndex(currentFeatureIndex - 1);
    }
  };

  const handleNextFeature = () => {
    if (currentFeatureIndex < TUTORIAL_FEATURES.length - 1) {
      setCurrentFeatureIndex(currentFeatureIndex + 1);
    }
  };

  const handleSkipTutorial = () => {
    voiceService.speak('Skipping tutorial. You can always access help from the settings menu.');
    onSkip();
  };

  const handleFinishTutorial = () => {
    voiceService.speak('Tutorial complete! Welcome to BuddyMate. You\'re all set up and ready to go.');
    onNext();
  };

  const playFeatureAudio = () => {
    if (preferences.voiceEnabled) {
      voiceService.speak(currentFeature.voiceScript, { rate: 0.4 });
    }
  };

  return (
    <View style={styles.container}>
      <Card variant="elevated" padding="large" style={styles.headerCard}>
        <Text
          variant="title"
          weight="bold"
          style={styles.title}
          accessibilityRole="header"
        >
          App Tutorial
        </Text>

        <Text
          variant="body"
          style={styles.subtitle}
          accessibilityRole="text"
        >
          Let me show you how to use the key features of BuddyMate
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressDots}>
            {TUTORIAL_FEATURES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentFeatureIndex && styles.progressDotActive,
                  index < currentFeatureIndex && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>
          <Text variant="caption" style={styles.progressText}>
            {currentFeatureIndex + 1} of {TUTORIAL_FEATURES.length}
          </Text>
        </View>
      </Card>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="outlined" padding="large" style={styles.featureCard}>
          <View style={styles.featureHeader}>
            <Text style={styles.featureIcon}>{currentFeature.icon}</Text>
            <Text variant="title2" weight="bold" style={styles.featureTitle}>
              {currentFeature.title}
            </Text>
          </View>

          <Text variant="body" style={styles.featureDescription}>
            {currentFeature.description}
          </Text>

          <View style={styles.instructionsContainer}>
            <Text variant="body" weight="medium" style={styles.instructionsTitle}>
              How to use this feature:
            </Text>
            
            {currentFeature.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>{index + 1}</Text>
                <Text variant="body" style={styles.instructionText}>
                  {instruction}
                </Text>
              </View>
            ))}
          </View>

          {preferences.voiceEnabled && (
            <Button
              title="🔊 Hear Instructions"
              onPress={playFeatureAudio}
              variant="secondary"
              size="medium"
              accessibilityLabel="Play audio instructions for this feature"
              testID="play-feature-audio-button"
            />
          )}
        </Card>

        <View style={styles.navigationContainer}>
          <View style={styles.featureNavigation}>
            <Button
              title="← Previous"
              onPress={handlePreviousFeature}
              variant="secondary"
              size="medium"
              disabled={currentFeatureIndex === 0}
              accessibilityLabel="Go to previous feature"
              testID="previous-feature-button"
            />

            <Button
              title={isLastFeature ? "Got It!" : "Next →"}
              onPress={isLastFeature ? handleFeatureComplete : handleNextFeature}
              variant="primary"
              size="medium"
              accessibilityLabel={isLastFeature ? "Mark feature as understood" : "Go to next feature"}
              testID={isLastFeature ? "complete-feature-button" : "next-feature-button"}
            />
          </View>

          {allFeaturesCompleted && (
            <Card variant="elevated" padding="medium" style={styles.completionCard}>
              <Text variant="body" weight="medium" style={styles.completionText}>
                🎉 Great job! You've learned about all the key features.
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        {allFeaturesCompleted ? (
          <Button
            title="Finish Tutorial"
            onPress={handleFinishTutorial}
            variant="primary"
            size="large"
            accessibilityLabel="Complete tutorial and continue to app"
            testID="finish-tutorial-button"
          />
        ) : (
          <Button
            title="Skip Tutorial"
            onPress={handleSkipTutorial}
            variant="secondary"
            size="large"
            accessibilityLabel="Skip tutorial and continue to app"
            accessibilityHint="You can access help later from the settings menu"
            testID="skip-tutorial-button"
          />
        )}

        <View style={styles.secondaryButtons}>
          {canGoBack && (
            <Button
              title="Back"
              onPress={onPrevious}
              variant="secondary"
              size="large"
              accessibilityLabel="Go back to previous step"
              testID="tutorial-back-button"
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
    marginBottom: 16,
    color: '#8E8E93',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
    transform: [{ scale: 1.2 }],
  },
  progressDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  progressText: {
    color: '#8E8E93',
  },
  content: {
    flex: 1,
    marginBottom: 16,
  },
  featureCard: {
    marginBottom: 16,
  },
  featureHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  featureTitle: {
    textAlign: 'center',
    color: '#000000',
  },
  featureDescription: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#8E8E93',
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionsTitle: {
    marginBottom: 16,
    color: '#000000',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    color: '#000000',
    lineHeight: 24,
  },
  navigationContainer: {
    gap: 16,
  },
  featureNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  completionCard: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  completionText: {
    textAlign: 'center',
    color: '#2E7D32',
  },
  buttonContainer: {
    gap: 16,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});