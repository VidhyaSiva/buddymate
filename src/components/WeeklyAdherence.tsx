import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text } from './foundation';
import { medicationReminderService, WeeklyAdherence as AdherenceData } from '../services/MedicationReminderService';

interface WeeklyAdherenceProps {
  userId: string;
}

interface WeekNavigation {
  current: Date;
  previous: Date;
  next: Date;
}

// Helper function to get week start
const getWeekStart = (date: Date): Date => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day;
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const WeeklyAdherence: React.FC<WeeklyAdherenceProps> = ({ userId }) => {
  const [adherenceData, setAdherenceData] = useState<AdherenceData[]>([]);
  const [weekNav, setWeekNav] = useState<WeekNavigation>(() => {
    const current = getWeekStart(new Date());
    const previous = new Date(current);
    previous.setDate(previous.getDate() - 7);
    const next = new Date(current);
    next.setDate(next.getDate() + 7);
    
    return { current, previous, next };
  });
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadAdherenceData();
    loadInsights();
  }, [userId, weekNav.current]);

  const loadAdherenceData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading adherence data for week:', weekNav.current);
      const data = await medicationReminderService.getWeeklyAdherence(userId, weekNav.current);
      console.log('Loaded adherence data:', data);
      setAdherenceData(data);
    } catch (error) {
      console.error('Failed to load adherence data:', error);
      setAdherenceData([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      console.log('Loading adherence insights...');
      const insightData = await medicationReminderService.getAdherenceInsights(userId);
      console.log('Loaded insights:', insightData);
      setInsights(insightData);
    } catch (error) {
      console.error('Failed to load insights:', error);
      setInsights([]); // Set empty array on error
    }
  };

  const navigateWeek = (direction: 'previous' | 'next') => {
    const newCurrent = direction === 'previous' ? weekNav.previous : weekNav.next;
    const newPrevious = new Date(newCurrent);
    newPrevious.setDate(newPrevious.getDate() - 7);
    const newNext = new Date(newCurrent);
    newNext.setDate(newNext.getDate() + 7);

    setWeekNav({
      current: newCurrent,
      previous: newPrevious,
      next: newNext,
    });
  };

  const formatWeekRange = (weekStart: Date): string => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const startStr = weekStart.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
    const endStr = weekEnd.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
    
    return `${startStr} - ${endStr}`;
  };

  const getAdherenceColor = (percentage: number): string => {
    if (percentage >= 90) return '#27ae60'; // Green
    if (percentage >= 75) return '#f39c12'; // Orange
    if (percentage >= 50) return '#e67e22'; // Dark orange
    return '#e74c3c'; // Red
  };

  const getAdherenceLabel = (percentage: number): string => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  const isCurrentWeek = (): boolean => {
    const today = new Date();
    const currentWeekStart = getWeekStart(today);
    return weekNav.current.getTime() === currentWeekStart.getTime();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading adherence data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Week Navigation */}
      <Card style={styles.navigationCard}>
        <View style={styles.weekNavigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateWeek('previous')}
            accessibilityRole="button"
            accessibilityLabel="Previous week"
          >
            <Text style={styles.navButtonText}>← Previous</Text>
          </TouchableOpacity>
          
          <View style={styles.weekInfo}>
            <Text style={styles.weekRange}>
              {formatWeekRange(weekNav.current)}
            </Text>
            {isCurrentWeek() && (
              <Text style={styles.currentWeekLabel}>This Week</Text>
            )}
          </View>
          
          <TouchableOpacity
            style={[
              styles.navButton,
              isCurrentWeek() && styles.navButtonDisabled
            ]}
            onPress={() => navigateWeek('next')}
            disabled={isCurrentWeek()}
            accessibilityRole="button"
            accessibilityLabel="Next week"
          >
            <Text style={[
              styles.navButtonText,
              isCurrentWeek() && styles.navButtonTextDisabled
            ]}>
              Next →
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Adherence Summary */}
      {adherenceData.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Medication Adherence</Text>
          
          {adherenceData.map((medication) => (
            <Card key={medication.scheduleId} style={styles.medicationCard}>
              <View style={styles.medicationHeader}>
                <Text style={styles.medicationName}>
                  {medication.medicationName}
                </Text>
                <View style={[
                  styles.adherencePercentage,
                  { backgroundColor: getAdherenceColor(medication.adherencePercentage) }
                ]}>
                  <Text style={styles.percentageText}>
                    {medication.adherencePercentage}%
                  </Text>
                </View>
              </View>
              
              <Text style={[
                styles.adherenceLabel,
                { color: getAdherenceColor(medication.adherencePercentage) }
              ]}>
                {getAdherenceLabel(medication.adherencePercentage)}
              </Text>

              <View style={styles.adherenceStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{medication.takenDoses}</Text>
                  <Text style={styles.statLabel}>Taken</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, styles.missedNumber]}>
                    {medication.missedDoses}
                  </Text>
                  <Text style={styles.statLabel}>Missed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, styles.skippedNumber]}>
                    {medication.skippedDoses}
                  </Text>
                  <Text style={styles.statLabel}>Skipped</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{medication.totalDoses}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>

              {/* Visual Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${medication.adherencePercentage}%`,
                        backgroundColor: getAdherenceColor(medication.adherencePercentage)
                      }
                    ]}
                  />
                </View>
              </View>
            </Card>
          ))}

          {/* Overall Summary */}
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Weekly Summary</Text>
            
            {(() => {
              const totalDoses = adherenceData.reduce((sum, med) => sum + med.totalDoses, 0);
              const totalTaken = adherenceData.reduce((sum, med) => sum + med.takenDoses, 0);
              const overallPercentage = totalDoses > 0 ? Math.round((totalTaken / totalDoses) * 100) : 0;
              
              return (
                <View style={styles.overallStats}>
                  <View style={styles.overallPercentage}>
                    <Text style={[
                      styles.overallPercentageText,
                      { color: getAdherenceColor(overallPercentage) }
                    ]}>
                      {overallPercentage}%
                    </Text>
                    <Text style={styles.overallLabel}>Overall Adherence</Text>
                  </View>
                  
                  <View style={styles.overallBreakdown}>
                    <Text style={styles.breakdownText}>
                      {totalTaken} of {totalDoses} doses taken
                    </Text>
                    <Text style={[
                      styles.overallStatusText,
                      { color: getAdherenceColor(overallPercentage) }
                    ]}>
                      {getAdherenceLabel(overallPercentage)}
                    </Text>
                  </View>
                </View>
              );
            })()}
          </Card>

          {/* Insights */}
          {insights.length > 0 && (
            <Card style={styles.insightsCard}>
              <Text style={styles.insightsTitle}>💡 Insights & Tips</Text>
              {insights.map((insight, index) => (
                <View key={index} style={styles.insightItem}>
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </Card>
          )}
        </>
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Medication Data</Text>
          <Text style={styles.emptyText}>
            Set up your medication schedule to start tracking adherence.
          </Text>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  navigationCard: {
    marginBottom: 16,
    padding: 16,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3498db',
    minWidth: 80,
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  navButtonTextDisabled: {
    color: '#7f8c8d',
  },
  weekInfo: {
    alignItems: 'center',
  },
  weekRange: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  currentWeekLabel: {
    fontSize: 12,
    color: '#3498db',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  medicationCard: {
    marginBottom: 16,
    padding: 16,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  adherencePercentage: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  percentageText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  adherenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  adherenceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  missedNumber: {
    color: '#e74c3c',
  },
  skippedNumber: {
    color: '#f39c12',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  summaryCard: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  overallStats: {
    alignItems: 'center',
  },
  overallPercentage: {
    alignItems: 'center',
    marginBottom: 12,
  },
  overallPercentageText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  overallLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  overallBreakdown: {
    alignItems: 'center',
  },
  breakdownText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 4,
  },
  overallStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  insightsCard: {
    marginBottom: 16,
    padding: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  insightItem: {
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
});