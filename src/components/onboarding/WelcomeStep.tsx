import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
} from 'react-native';
import { Button } from '../foundation/Button';
import { Card } from '../foundation/Card';
import { Text } from '../foundation/Text';
import { voiceService } from '../../services/VoiceService';

export interface WelcomeStepProps {
  onNext: () => void;
  onSkip?: () => void;
  canGoBack: boolean;
  canSkip: boolean;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
  onNext,
  onSkip,
}) => {
  useEffect(() => {
    // Welcome message with voice guidance
    const welcomeMessage = `Welcome to BuddyMate! I'm here to help you set up your app so you can stay connected with family, manage your health, and feel confident every day. Let's get started with a few simple steps.`;
    
    // Delay to allow screen to render
    setTimeout(() => {
      voiceService.speak(welcomeMessage, { rate: 0.4 });
    }, 1000);
  }, []);

  const handleGetStarted = () => {
    voiceService.speak('Great! Let\'s begin setting up your profile.');
    onNext();
  };

  const handleSkipSetup = () => {
    if (onSkip) {
      voiceService.speak('You can always set up your profile later from the settings menu.');
      onSkip();
    }
  };

  return (
    <View style={styles.container}>
      <Card variant="elevated" padding="large" style={styles.welcomeCard}>
        {/* App icon/logo placeholder */}
        <View style={styles.iconContainer}>
          <View style={styles.iconPlaceholder}>
            <Text variant="display" style={styles.iconText}>
              🤝
            </Text>
          </View>
        </View>

        <Text
          variant="title"
          weight="bold"
          style={styles.title}
          accessibilityRole="header"
        >
          Welcome to BuddyMate
        </Text>

        <Text
          variant="body"
          style={styles.subtitle}
          accessibilityRole="text"
        >
          Your companion for staying connected, healthy, and confident
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text variant="title2" style={styles.featureIcon}>📱</Text>
            <Text variant="body" style={styles.featureText}>
              Simple, large buttons designed for easy use
            </Text>
          </View>

          <View style={styles.feature}>
            <Text variant="title2" style={styles.featureIcon}>👨‍👩‍👧‍👦</Text>
            <Text variant="body" style={styles.featureText}>
              Stay connected with family and friends
            </Text>
          </View>

          <View style={styles.feature}>
            <Text variant="title2" style={styles.featureIcon}>💊</Text>
            <Text variant="body" style={styles.featureText}>
              Never miss your medications with gentle reminders
            </Text>
          </View>

          <View style={styles.feature}>
            <Text variant="title2" style={styles.featureIcon}>🆘</Text>
            <Text variant="body" style={styles.featureText}>
              Quick access to emergency help when you need it
            </Text>
          </View>
        </View>

        <Text
          variant="body"
          style={styles.setupMessage}
          accessibilityRole="text"
        >
          Let's take a few minutes to set up your app so it works perfectly for you.
        </Text>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Get Started"
          onPress={handleGetStarted}
          variant="primary"
          size="large"
          accessibilityLabel="Get started with app setup"
          accessibilityHint="Begins the setup process to personalize your app"
          testID="welcome-get-started-button"
        />

        {onSkip && (
          <Button
            title="Skip Setup"
            onPress={handleSkipSetup}
            variant="secondary"
            size="large"
            accessibilityLabel="Skip setup for now"
            accessibilityHint="Skip the setup process and use default settings"
            testID="welcome-skip-button"
          />
        )}
      </View>

      <Text
        variant="caption"
        style={styles.helpText}
        accessibilityRole="text"
      >
        Need help? You can ask me to read anything aloud or repeat instructions.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeCard: {
    marginBottom: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 40,
    color: '#FFFFFF',
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
  featuresContainer: {
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureIcon: {
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  featureText: {
    flex: 1,
    color: '#000000',
  },
  setupMessage: {
    textAlign: 'center',
    color: '#000000',
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 24,
  },
  helpText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});