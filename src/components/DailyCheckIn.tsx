import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { Card, Button, Text } from './foundation';

import { DailyCheckIn as DailyCheckInType } from '../types/health';
import { dataAccessLayer } from '../storage/DataAccessLayer';
import { checkInService } from '../services/CheckInService';

interface DailyCheckInProps {
  userId: string;
  onComplete: (checkIn: DailyCheckInType) => void;
  onCancel: () => void;
}

interface MoodOption {
  value: 1 | 2 | 3 | 4 | 5;
  emoji: string;
  label: string;
  color: string;
}

interface HealthQuestion {
  id: string;
  question: string;
  type: 'yesno' | 'text';
}

const MOOD_OPTIONS: MoodOption[] = [
  { value: 1, emoji: '😢', label: 'Very Sad', color: '#FF3B30' },
  { value: 2, emoji: '😔', label: 'Sad', color: '#FF9500' },
  { value: 3, emoji: '😐', label: 'Okay', color: '#FFCC00' },
  { value: 4, emoji: '😊', label: 'Good', color: '#30D158' },
  { value: 5, emoji: '😄', label: 'Great', color: '#34C759' },
];

const HEALTH_QUESTIONS: HealthQuestion[] = [
  { id: 'sleep', question: 'Did you sleep well last night?', type: 'yesno' },
  { id: 'pain', question: 'Are you experiencing any pain today?', type: 'yesno' },
  { id: 'appetite', question: 'Do you have a good appetite today?', type: 'yesno' },
];

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({
  userId,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<'mood' | 'energy' | 'questions' | 'notes' | 'complete'>('mood');
  const [selectedMood, setSelectedMood] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [healthAnswers, setHealthAnswers] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  // Animation values
  const fadeAnim = new Animated.Value(1);
  const scaleAnim = new Animated.Value(1);

  const animateTransition = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const handleMoodSelect = (mood: 1 | 2 | 3 | 4 | 5) => {
    setSelectedMood(mood);
    setTimeout(() => {
      animateTransition();
      setCurrentStep('energy');
    }, 500);
  };

  const handleEnergySelect = (energy: 1 | 2 | 3 | 4 | 5) => {
    setSelectedEnergy(energy);
    setTimeout(() => {
      animateTransition();
      setCurrentStep('questions');
    }, 500);
  };

  const handleHealthAnswer = (questionId: string, answer: boolean) => {
    setHealthAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleQuestionsComplete = () => {
    animateTransition();
    setCurrentStep('notes');
  };

  const handleNotesComplete = () => {
    animateTransition();
    setCurrentStep('complete');
  };



  const handleSubmit = async () => {
    if (!selectedMood || !selectedEnergy) return;

    setIsSubmitting(true);
    
    try {
      const checkIn: DailyCheckInType = {
        id: crypto.randomUUID(),
        userId,
        date: new Date(),
        mood: selectedMood,
        energyLevel: selectedEnergy,
        concerns: Object.entries(healthAnswers)
          .filter(([_, answer]) => !answer)
          .map(([questionId]) => HEALTH_QUESTIONS.find(q => q.id === questionId)?.question)
          .join(', '),
        notes: notes.trim() || undefined,
        completedAt: new Date(),
      };

      await dataAccessLayer.addDailyCheckIn(checkIn);
      
      // Show encouraging message
      const encouragingMessage = checkInService.getEncouragingMessage(selectedMood, selectedEnergy);
      console.log('Check-in completed:', encouragingMessage);
      
      onComplete(checkIn);
    } catch (error) {
      console.error('Failed to save daily check-in:', error);
      Alert.alert(
        'Save Error',
        'We had trouble saving your check-in. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMoodSelection = () => (
    <View style={styles.stepContainer}>
      <Text variant="heading2" align="center" style={styles.stepTitle}>
        How are you feeling today?
      </Text>
      <Text variant="body" align="center" color="secondary" style={styles.stepSubtitle}>
        Tap the emoji that best describes your mood
      </Text>
      
      <View style={styles.moodGrid}>
        {MOOD_OPTIONS.map((option) => (
          <Card
            key={option.value}
            style={[
              styles.moodCard,
              selectedMood === option.value && { borderColor: option.color, borderWidth: 3 }
            ]}
            variant="elevated"
            padding="large"
            onPress={() => handleMoodSelect(option.value)}
            accessibilityLabel={`${option.label} mood`}
            accessibilityHint="Tap to select this mood"
            testID={`mood-${option.value}`}
          >
            <Text style={styles.moodEmoji}>{option.emoji}</Text>
            <Text variant="body" align="center" weight="medium">
              {option.label}
            </Text>
          </Card>
        ))}
      </View>
    </View>
  );

  const renderEnergySelection = () => (
    <View style={styles.stepContainer}>
      <Text variant="heading2" align="center" style={styles.stepTitle}>
        How is your energy level?
      </Text>
      <Text variant="body" align="center" color="secondary" style={styles.stepSubtitle}>
        Choose the level that matches how you feel
      </Text>
      
      <View style={styles.energyContainer}>
        {[1, 2, 3, 4, 5].map((level) => (
          <Card
            key={level}
            style={[
              styles.energyCard,
              selectedEnergy === level && styles.selectedEnergyCard
            ]}
            variant="elevated"
            padding="medium"
            onPress={() => handleEnergySelect(level as 1 | 2 | 3 | 4 | 5)}
            accessibilityLabel={`Energy level ${level} out of 5`}
            accessibilityHint="Tap to select this energy level"
            testID={`energy-${level}`}
          >
            <View style={styles.energyLevel}>
              <Text variant="heading3" align="center">{level}</Text>
              <Text variant="caption" align="center" color="secondary">
                {level === 1 ? 'Very Low' : level === 2 ? 'Low' : level === 3 ? 'Okay' : level === 4 ? 'Good' : 'High'}
              </Text>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );

  const renderHealthQuestions = () => (
    <View style={styles.stepContainer}>
      <Text variant="heading2" align="center" style={styles.stepTitle}>
        A few quick questions
      </Text>
      <Text variant="body" align="center" color="secondary" style={styles.stepSubtitle}>
        These help us understand how you're doing
      </Text>
      
      <View style={styles.questionsContainer}>
        {HEALTH_QUESTIONS.map((question, index) => (
          <Card key={question.id} style={styles.questionCard} variant="outlined" padding="large">
            <Text variant="body" style={styles.questionText}>
              {question.question}
            </Text>
            <View style={styles.answerButtons}>
              <Button
                title="Yes"
                onPress={() => handleHealthAnswer(question.id, true)}
                variant={healthAnswers[question.id] === true ? 'primary' : 'secondary'}
                size="large"
                accessibilityLabel={`Yes to: ${question.question}`}
                testID={`question-${question.id}-yes`}
              />
              <Button
                title="No"
                onPress={() => handleHealthAnswer(question.id, false)}
                variant={healthAnswers[question.id] === false ? 'primary' : 'secondary'}
                size="large"
                accessibilityLabel={`No to: ${question.question}`}
                testID={`question-${question.id}-no`}
              />
            </View>
          </Card>
        ))}
      </View>
      
      <View style={styles.navigationButtons}>
        <Button
          title="Continue"
          onPress={handleQuestionsComplete}
          variant="primary"
          size="large"
          disabled={Object.keys(healthAnswers).length < HEALTH_QUESTIONS.length}
          accessibilityLabel="Continue to next step"
          testID="questions-continue"
        />
      </View>
    </View>
  );

  const renderNotesStep = () => (
      <View style={styles.stepContainer}>
        <Text variant="heading2" align="center" style={styles.stepTitle}>
          Anything else to share?
        </Text>
        <Text variant="body" align="center" color="secondary" style={styles.stepSubtitle}>
          Optional - you can add notes or record a voice message
        </Text>
        
        <View style={styles.notesOptions}>
          <Card 
            style={styles.notesOptionCard} 
            variant="outlined" 
            padding="large"
            onPress={() => handleNotesComplete()}
            accessibilityLabel="Record voice note"
            testID="voice-note-option"
          >
            <Text style={styles.optionIcon}>🎤</Text>
            <Text variant="body" align="center" weight="medium">
              Voice Note
            </Text>
            <Text variant="caption" align="center" color="secondary">
              Record how you're feeling
            </Text>
          </Card>
          
          <Card 
            style={styles.notesOptionCard} 
            variant="outlined" 
            padding="large"
            accessibilityLabel="Skip notes"
            testID="skip-notes-option"
          >
            <Text style={styles.optionIcon}>✏️</Text>
            <Text variant="body" align="center" weight="medium">
              Text Note
            </Text>
            <Text variant="caption" align="center" color="secondary">
              Coming soon
            </Text>
          </Card>
        </View>
        
        <View style={styles.navigationButtons}>
          <Button
            title="Skip"
            onPress={handleNotesComplete}
            variant="secondary"
            size="large"
            accessibilityLabel="Skip notes step"
            testID="notes-skip"
          />
        </View>
      </View>
    );

  const renderComplete = () => (
    <View style={styles.stepContainer}>
      <View style={styles.celebrationContainer}>
        <Text style={styles.celebrationEmoji}>🎉</Text>
        <Text variant="heading2" align="center" style={styles.celebrationTitle}>
          Great job!
        </Text>
        <Text variant="body" align="center" color="secondary" style={styles.celebrationSubtitle}>
          Thank you for completing your daily check-in. Your wellness matters!
        </Text>
      </View>
      
      <Card style={styles.summaryCard} variant="elevated" padding="large">
        <Text variant="heading3" align="center" style={styles.summaryTitle}>
          Today's Summary
        </Text>
        <View style={styles.summaryRow}>
          <Text variant="body">Mood:</Text>
          <Text variant="body" weight="medium">
            {MOOD_OPTIONS.find(m => m.value === selectedMood)?.label} {MOOD_OPTIONS.find(m => m.value === selectedMood)?.emoji}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text variant="body">Energy:</Text>
          <Text variant="body" weight="medium">
            {selectedEnergy}/5
          </Text>
        </View>
      </Card>
      
      <View style={styles.navigationButtons}>
        <Button
          title="Done"
          onPress={handleSubmit}
          variant="primary"
          size="large"
          disabled={isSubmitting}
          accessibilityLabel="Complete check-in"
          testID="complete-checkin"
        />
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'mood':
        return renderMoodSelection();
      case 'energy':
        return renderEnergySelection();
      case 'questions':
        return renderHealthQuestions();
      case 'notes':
        return renderNotesStep();
      case 'complete':
        return renderComplete();
      default:
        return renderMoodSelection();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="caption" color="secondary" align="center">
          Daily Check-in
        </Text>
        <Button
          title="← Back to Main"
          onPress={onCancel}
          variant="secondary"
          size="small"
          accessibilityLabel="Go back to main dashboard"
          testID="cancel-checkin"
        />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {renderCurrentStep()}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  animatedContainer: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 500,
  },
  stepTitle: {
    marginBottom: 8,
  },
  stepSubtitle: {
    marginBottom: 32,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  moodCard: {
    width: '45%',
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  energyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  energyCard: {
    flex: 1,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedEnergyCard: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  energyLevel: {
    alignItems: 'center',
  },
  questionsContainer: {
    gap: 16,
  },
  questionCard: {
    marginBottom: 8,
  },
  questionText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  answerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  notesOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
    marginBottom: 24,
  },
  notesOptionCard: {
    flex: 1,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
    marginTop: 24,
  },
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  celebrationTitle: {
    marginBottom: 8,
  },
  celebrationSubtitle: {
    marginBottom: 16,
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryTitle: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});