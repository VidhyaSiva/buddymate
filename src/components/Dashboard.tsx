import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Card, Button, Text } from './foundation';

interface DashboardProps {
  onEmergencyPress: () => void;
  onHealthPress: () => void;
  onFamilyPress: () => void;
  onActivitiesPress: () => void;
  onCommunityPress: () => void;
  onMedicationPress: () => void;
}

interface WellnessStatus {
  mood: 'great' | 'good' | 'okay' | 'low' | 'unknown';
  lastCheckIn: Date | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onEmergencyPress,
  onHealthPress,
  onFamilyPress,
  onActivitiesPress,
  onCommunityPress,
  onMedicationPress,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [wellnessStatus, setWellnessStatus] = useState<WellnessStatus>({
    mood: 'unknown',
    lastCheckIn: null,
  });

  // Get screen dimensions for responsive layout
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  // Helper function for conditional card styling
  const getCardStyle = () => {
    return StyleSheet.flatten(isTablet ? [styles.functionCard, styles.tabletCard] : styles.functionCard);
  };

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Mock weather data - in real app this would come from weather API
  const weatherInfo = {
    temperature: '72°F',
    condition: 'Sunny',
    icon: '☀️',
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const getWellnessColor = (mood: WellnessStatus['mood']) => {
    switch (mood) {
      case 'great': return '#34C759';
      case 'good': return '#30D158';
      case 'okay': return '#FF9500';
      case 'low': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getWellnessText = (mood: WellnessStatus['mood']) => {
    switch (mood) {
      case 'great': return 'Feeling Great!';
      case 'good': return 'Feeling Good';
      case 'okay': return 'Doing Okay';
      case 'low': return 'Need Support';
      default: return 'Check In Today';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with time and weather */}
        <View style={styles.header}>
          <View style={styles.timeSection}>
            <Text variant="heading1" align="center" testID="dashboard-time">
              {formatTime(currentTime)}
            </Text>
            <Text variant="heading3" color="secondary" align="center" testID="dashboard-date">
              {formatDate(currentTime)}
            </Text>
          </View>
          
          <Card style={styles.weatherCard} variant="elevated" padding="medium">
            <View style={styles.weatherContent}>
              <Text style={styles.weatherIcon}>{weatherInfo.icon}</Text>
              <View style={styles.weatherText}>
                <Text variant="heading2" testID="dashboard-temperature">
                  {weatherInfo.temperature}
                </Text>
                <Text variant="body" color="secondary" testID="dashboard-weather">
                  {weatherInfo.condition}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Wellness Status Indicator */}
        <Card 
          style={styles.wellnessCard}
          variant="elevated"
          padding="medium"
          testID="wellness-status-card"
        >
          <View style={styles.wellnessContent}>
            <View 
              style={[styles.wellnessIndicator, { backgroundColor: getWellnessColor(wellnessStatus.mood) }]}
              testID="wellness-indicator"
            />
            <Text variant="heading3" testID="wellness-text">
              {getWellnessText(wellnessStatus.mood)}
            </Text>
            {wellnessStatus.lastCheckIn && (
              <Text variant="caption" color="secondary">
                Last check-in: {wellnessStatus.lastCheckIn.toLocaleDateString()}
              </Text>
            )}
          </View>
        </Card>

        {/* Emergency Button - Always Visible */}
        <View style={styles.emergencySection}>
          <Button
            title="🚨 Emergency Help"
            onPress={onEmergencyPress}
            variant="emergency"
            size="large"
            accessibilityLabel="Emergency help button"
            accessibilityHint="Tap to access emergency services and contacts"
            testID="emergency-button"
          />
        </View>

        {/* Main Function Cards - Vertical Stack for Mobile */}
        <View style={[
          styles.cardStack,
          isTablet && styles.cardGrid,
          isDesktop && styles.cardGridLarge
        ]}>
          <Card
            style={getCardStyle()}
            variant="elevated"
            padding="large"
            onPress={onHealthPress}
            accessibilityLabel="Health and wellness"
            accessibilityHint="Tap to access daily check-ins and health tracking"
            testID="health-card"
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardIcon}>❤️</Text>
              <Text variant="heading3" style={styles.cardTitle}>Health</Text>
              <Text variant="body" color="secondary" style={styles.cardSubtitle}>
                Daily check-in
              </Text>
            </View>
          </Card>

          <Card
            style={getCardStyle()}
            variant="elevated"
            padding="large"
            onPress={onFamilyPress}
            accessibilityLabel="Family and friends"
            accessibilityHint="Tap to connect with family and friends"
            testID="family-card"
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardIcon}>👨‍👩‍👧‍👦</Text>
              <Text variant="heading3" style={styles.cardTitle}>Family</Text>
              <Text variant="body" color="secondary" style={styles.cardSubtitle}>
                Stay connected
              </Text>
            </View>
          </Card>

          <Card
            style={getCardStyle()}
            variant="elevated"
            padding="large"
            onPress={onMedicationPress}
            accessibilityLabel="Medication reminders"
            accessibilityHint="Tap to view medication schedule and reminders"
            testID="medication-card"
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardIcon}>💊</Text>
              <Text variant="heading3" style={styles.cardTitle}>Medicine</Text>
              <Text variant="body" color="secondary" style={styles.cardSubtitle}>
                Reminders
              </Text>
            </View>
          </Card>

          <Card
            style={getCardStyle()}
            variant="elevated"
            padding="large"
            onPress={onActivitiesPress}
            accessibilityLabel="Daily activities"
            accessibilityHint="Tap to view daily activities and routines"
            testID="activities-card"
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardIcon}>📋</Text>
              <Text variant="heading3" style={styles.cardTitle}>Activities</Text>
              <Text variant="body" color="secondary" style={styles.cardSubtitle}>
                Daily routine
              </Text>
            </View>
          </Card>

          <Card
            style={getCardStyle()}
            variant="elevated"
            padding="large"
            onPress={onCommunityPress}
            accessibilityLabel="Community resources"
            accessibilityHint="Tap to explore local community resources and events"
            testID="community-card"
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardIcon}>🏘️</Text>
              <Text variant="heading3" style={styles.cardTitle}>Community</Text>
              <Text variant="body" color="secondary" style={styles.cardSubtitle}>
                Local resources
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  timeSection: {
    marginBottom: 16,
  },
  weatherCard: {
    alignSelf: 'center',
    minWidth: 200,
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  weatherText: {
    alignItems: 'flex-start',
  },
  wellnessCard: {
    marginBottom: 24,
  },
  wellnessContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wellnessIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  emergencySection: {
    marginBottom: 32,
  },
  cardStack: {
    gap: 8,
  },
  functionCard: {
    width: '95%',
    minHeight: 76,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  cardIcon: {
    fontSize: 32,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  cardTitle: {
    flex: 1,
    marginBottom: 4,
    marginLeft: 12,
  },
  cardSubtitle: {
    flex: 1,
    marginLeft: 12,
  },
  // Responsive grid layouts
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardGridLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  tabletCard: {
    width: '48%',
    minHeight: 56,
    marginBottom: 16,
  },
});
