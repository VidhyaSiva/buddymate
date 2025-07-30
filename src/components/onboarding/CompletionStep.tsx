import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Button } from '../foundation/Button';
import { Card } from '../foundation/Card';
import { Text } from '../foundation/Text';
import { OnboardingData } from '../OnboardingWizard';
import { voiceService } from '../../services/VoiceService';

export interface CompletionStepProps {
  userData: OnboardingData;
  onComplete: () => void;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({
  userData,
  onComplete,
}) => {
  useEffect(() => {
    const message = `Congratulations! Your BuddyMate app is now set up and ready to use. You have everything you need to stay connected, healthy, and confident.`;
    setTimeout(() => {
      voiceService.speak(message, { rate: 0.4 });
    }, 1000);
  }, []);

  const handleStartUsingApp = () => {
    voiceService.speak('Welcome to BuddyMate! Let\'s get started.');
    onComplete();
  };

  const getSummaryStats = () => {
    const stats = {
      emergencyContacts: userData.emergencyContacts.length,
      medications: userData.medications.length,
      voiceEnabled: userData.preferences.voiceEnabled,
      fontSize: userData.preferences.fontSize,
    };
    return stats;
  };

  const stats = getSummaryStats();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" padding="large" style={styles.celebrationCard}>
          <View style={styles.celebrationHeader}>
            <Text style={styles.celebrationIcon}>🎉</Text>
            <Text
              variant="title"
              weight="bold"
              style={styles.celebrationTitle}
              accessibilityRole="header"
            >
              You're All Set!
            </Text>
          </View>

          <Text
            variant="body"
            style={styles.celebrationMessage}
            accessibilityRole="text"
          >
            {userData.personalInfo.name 
              ? `Congratulations, ${userData.personalInfo.name}! Your BuddyMate app is now personalized and ready to help you every day.`
              : 'Congratulations! Your BuddyMate app is now set up and ready to help you every day.'
            }
          </Text>
        </Card>

        <Card variant="outlined" padding="large" style={styles.summaryCard}>
          <Text
            variant="title2"
            weight="bold"
            style={styles.summaryTitle}
            accessibilityRole="header"
          >
            Your Setup Summary
          </Text>

          <View style={styles.summaryItems}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>👤</Text>
              <View style={styles.summaryText}>
                <Text variant="body" weight="medium" style={styles.summaryLabel}>
                  Personal Profile
                </Text>
                <Text variant="caption" style={styles.summaryValue}>
                  {userData.personalInfo.name || 'Not provided'} • {userData.personalInfo.dateOfBirth ? userData.personalInfo.dateOfBirth.getFullYear() : 'Birth year not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>🆘</Text>
              <View style={styles.summaryText}>
                <Text variant="body" weight="medium" style={styles.summaryLabel}>
                  Emergency Contacts
                </Text>
                <Text variant="caption" style={styles.summaryValue}>
                  {stats.emergencyContacts > 0 
                    ? `${stats.emergencyContacts} contact${stats.emergencyContacts > 1 ? 's' : ''} added`
                    : 'None added (can be added later)'
                  }
                </Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>💊</Text>
              <View style={styles.summaryText}>
                <Text variant="body" weight="medium" style={styles.summaryLabel}>
                  Medication Reminders
                </Text>
                <Text variant="caption" style={styles.summaryValue}>
                  {stats.medications > 0 
                    ? `${stats.medications} medication${stats.medications > 1 ? 's' : ''} scheduled`
                    : 'None added (can be added later)'
                  }
                </Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>⚙️</Text>
              <View style={styles.summaryText}>
                <Text variant="body" weight="medium" style={styles.summaryLabel}>
                  App Preferences
                </Text>
                <Text variant="caption" style={styles.summaryValue}>
                  {stats.fontSize === 'large' ? 'Large text' : 'Extra large text'} • 
                  {stats.voiceEnabled ? ' Voice guidance on' : ' Voice guidance off'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card variant="outlined" padding="large" style={styles.tipsCard}>
          <Text
            variant="title2"
            weight="bold"
            style={styles.tipsTitle}
            accessibilityRole="header"
          >
            Quick Tips to Get Started
          </Text>

          <View style={styles.tips}>
            <View style={styles.tip}>
              <Text style={styles.tipIcon}>📱</Text>
              <Text variant="body" style={styles.tipText}>
                Start with your daily check-in to track your mood and wellness
              </Text>
            </View>

            <View style={styles.tip}>
              <Text style={styles.tipIcon}>🔴</Text>
              <Text variant="body" style={styles.tipText}>
                Remember: the red emergency button is always available for help
              </Text>
            </View>

            <View style={styles.tip}>
              <Text style={styles.tipIcon}>👨‍👩‍👧‍👦</Text>
              <Text variant="body" style={styles.tipText}>
                Tap family photos to start video calls and stay connected
              </Text>
            </View>

            <View style={styles.tip}>
              <Text style={styles.tipIcon}>🎤</Text>
              <Text variant="body" style={styles.tipText}>
                Say "Help" anytime to hear instructions for any screen
              </Text>
            </View>

            <View style={styles.tip}>
              <Text style={styles.tipIcon}>⚙️</Text>
              <Text variant="body" style={styles.tipText}>
                You can change any settings later in the Settings menu
              </Text>
            </View>
          </View>
        </Card>

        <Card variant="elevated" padding="large" style={styles.supportCard}>
          <Text
            variant="title2"
            weight="bold"
            style={styles.supportTitle}
            accessibilityRole="header"
          >
            Need Help?
          </Text>

          <Text variant="body" style={styles.supportText}>
            I'm always here to help! You can:
          </Text>

          <View style={styles.supportOptions}>
            <Text variant="body" style={styles.supportOption}>
              • Say "Help" for voice guidance on any screen
            </Text>
            <Text variant="body" style={styles.supportOption}>
              • Access tutorials from the Settings menu
            </Text>
            <Text variant="body" style={styles.supportOption}>
              • Use the emergency button if you need immediate assistance
            </Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Start Using BuddyMate"
          onPress={handleStartUsingApp}
          variant="primary"
          size="large"
          accessibilityLabel="Start using the BuddyMate app"
          accessibilityHint="Complete setup and go to the main app"
          testID="start-using-app-button"
        />

        <Text
          variant="caption"
          style={styles.finalMessage}
          accessibilityRole="text"
        >
          Welcome to your new digital companion! 🤝
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginBottom: 16,
  },
  celebrationCard: {
    marginBottom: 16,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  celebrationHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  celebrationIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  celebrationTitle: {
    textAlign: 'center',
    color: '#007AFF',
  },
  celebrationMessage: {
    textAlign: 'center',
    color: '#0066CC',
    lineHeight: 24,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryTitle: {
    marginBottom: 16,
    color: '#000000',
  },
  summaryItems: {
    gap: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  summaryIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    color: '#000000',
    marginBottom: 2,
  },
  summaryValue: {
    color: '#8E8E93',
  },
  tipsCard: {
    marginBottom: 16,
  },
  tipsTitle: {
    marginBottom: 16,
    color: '#000000',
  },
  tips: {
    gap: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    color: '#000000',
    lineHeight: 22,
  },
  supportCard: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  supportTitle: {
    marginBottom: 8,
    color: '#F57C00',
  },
  supportText: {
    marginBottom: 12,
    color: '#E65100',
  },
  supportOptions: {
    gap: 8,
  },
  supportOption: {
    color: '#E65100',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 16,
    alignItems: 'center',
  },
  finalMessage: {
    textAlign: 'center',
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});