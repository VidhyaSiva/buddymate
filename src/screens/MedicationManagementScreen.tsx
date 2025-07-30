import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Card, Text, Button } from '../components/foundation';
import { medicationReminderService } from '../services/MedicationReminderService';
import { MedicationSchedule } from '../types/health';
import { cleanupDuplicateMedications, getDuplicateSummary } from '../utils/cleanupDuplicates';
import { addTestMedications, clearTestMedications } from '../utils/testData';

interface MedicationManagementScreenProps {
  navigation: any;
}

export const MedicationManagementScreen: React.FC<MedicationManagementScreenProps> = ({ navigation }) => {
  const [medications, setMedications] = useState<MedicationSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId] = useState('demo-user-123');

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setIsLoading(true);
      console.log('Loading medications for user:', userId);
      const schedules = await medicationReminderService.getMedicationSchedules(userId);
      console.log('Loaded medications:', schedules);
      console.log('Setting medications state with', schedules.length, 'items');
      setMedications(schedules);
      console.log('Medications state updated');
    } catch (error) {
      console.error('Failed to load medications:', error);
      Alert.alert('Error', 'Failed to load medications. Please try again.');
    } finally {
      setIsLoading(false);
      console.log('Loading completed');
    }
  };

  const handleDeleteMedication = (medication: MedicationSchedule) => {
    console.log('handleDeleteMedication called for:', medication.medicationName);
    
    const confirmDelete = window.confirm(`Are you sure you want to delete ${medication.medicationName}? This action cannot be undone.`);
    
    if (confirmDelete) {
      (async () => {
        try {
          console.log('Deleting medication:', medication.id, medication.medicationName);
          const result = await medicationReminderService.deleteMedicationSchedule(medication.id);
          console.log('Delete result:', result);
          
          if (result) {
            window.alert(`${medication.medicationName} has been deleted.`);
            
            // Force refresh the list
            console.log('Refreshing medication list after delete...');
            await loadMedications();
            console.log('Medication list refreshed');
          } else {
            window.alert('Failed to delete medication. Please try again.');
          }
        } catch (error) {
          console.error('Failed to delete medication:', error);
          window.alert(`Failed to delete medication: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
        }
      })();
    }
  };

  const handleViewDetails = (medication: MedicationSchedule) => {
    console.log('handleViewDetails called for:', medication.medicationName);
    
    // Safely format dates
    const formatDate = (dateValue: any): string => {
      if (!dateValue) return 'Not available';
      try {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? 'Not available' : date.toLocaleDateString();
      } catch (error) {
        return 'Not available';
      }
    };

    const details = `Medication Information:\n\n• Name: ${medication.medicationName}\n• Dosage: ${medication.dosage}\n• Frequency: ${medication.frequency}\n• Times: ${formatTimes(medication.times)}\n• Status: ${medication.isActive ? 'Active' : 'Inactive'}\n• Created: ${formatDate(medication.createdAt)}\n• Last Updated: ${formatDate(medication.updatedAt)}`;
    
    console.log('Showing details:', details);
    
    // Try using window.alert for web compatibility
    try {
      window.alert(`${medication.medicationName} Details\n\n${details}`);
    } catch (error) {
      console.error('Failed to show alert:', error);
      // Fallback to console
      console.log(`${medication.medicationName} Details:`, details);
    }
  };

  const handleEditMedication = (medication: MedicationSchedule) => {
    console.log('handleEditMedication called for:', medication.medicationName);
    
    const currentDetails = `Current Details:\n• Name: ${medication.medicationName}\n• Dosage: ${medication.dosage}\n• Frequency: ${medication.frequency}\n• Times: ${formatTimes(medication.times)}\n• Status: ${medication.isActive ? 'Active' : 'Inactive'}`;
    
    const confirmToggle = window.confirm(`Edit ${medication.medicationName}\n\n${currentDetails}\n\nClick OK to toggle status.`);
    
    if (confirmToggle) {
      (async () => {
        try {
          console.log('Toggling status for:', medication.medicationName);
          const result = await medicationReminderService.updateMedicationSchedule(
            medication.id,
            { isActive: !medication.isActive }
          );
          if (result) {
            window.alert(`Updated ${medication.medicationName} status.`);
            
            // Force refresh the list
            console.log('Refreshing medication list after edit...');
            await loadMedications();
            console.log('Medication list refreshed');
          } else {
            window.alert('Failed to update medication status.');
          }
        } catch (error) {
          console.error('Failed to update medication:', error);
          window.alert(`Failed to update medication: ${error instanceof Error ? error.message : 'Unknown error'}.`);
        }
      })();
    }
  };

  const handleCleanupDuplicates = async () => {
    console.log('handleCleanupDuplicates called');
    
    try {
      console.log('Checking for duplicate medications...');
      // First check for duplicates
      const summary = await getDuplicateSummary(userId);
      console.log('Duplicate summary:', summary);
      
      if (summary.duplicates === 0) {
        window.alert('No Duplicates\nNo duplicate medications found.');
        return;
      }
      
      const confirmCleanup = window.confirm(`Clean Up Duplicates\n\nFound ${summary.duplicates} duplicate medication entries. This will keep the most recent entry for each medication and remove duplicates.\n\nContinue?`);
      
      if (confirmCleanup) {
        try {
          console.log('Starting duplicate cleanup...');
          const result = await cleanupDuplicateMedications(userId);
          console.log('Cleanup result:', result);
          
          window.alert(`Cleanup Complete\n\nRemoved ${result.duplicatesRemoved} duplicate entries. You now have ${result.activeMedications} active medications.`);
          
          // Force refresh the list
          console.log('Refreshing medication list after cleanup...');
          await loadMedications();
          console.log('Medication list refreshed');
        } catch (error) {
          console.error('Failed to cleanup duplicates:', error);
          window.alert(`Error\nFailed to cleanup duplicates: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
        }
      }
    } catch (error) {
      console.error('Failed to check for duplicates:', error);
      window.alert(`Error\nFailed to check for duplicates: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
  };

  const handleAddTestData = async () => {
    try {
      console.log('Adding test medications...');
      await addTestMedications(userId);
      Alert.alert('Success', 'Test medications added successfully!');
      loadMedications(); // Refresh the list
    } catch (error) {
      console.error('Failed to add test data:', error);
      Alert.alert('Error', `Failed to add test data: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
  };

  const handleClearAllData = async () => {
    console.log('handleClearAllData called');
    
    const confirmClear = window.confirm('Clear All Medications\n\nAre you sure you want to clear all medications? This action cannot be undone.');
    
    if (confirmClear) {
      try {
        console.log('Clearing all medications...');
        // Clear all medications, not just test data
        const { clearAllStorageData } = await import('../utils/testData');
        await clearAllStorageData();
        window.alert('Success\nAll medications cleared successfully!');
        
        // Force refresh the list
        console.log('Refreshing medication list after clear...');
        await loadMedications();
        console.log('Medication list refreshed');
      } catch (error) {
        console.error('Failed to clear data:', error);
        window.alert(`Error\nFailed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      }
    }
  };



  const formatTimes = (times: string[]): string => {
    return times.map(time => {
      const [hour, minute] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hour), parseInt(minute));
      return date.toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }).join(', ');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your medications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Manage Medications</Text>
          <Text style={styles.subtitle}>View and manage all your medications</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.addButtonContainer}>
          <Button
            title="➕ Add New Medication"
            onPress={() => navigation.navigate('MedicationSetup')}
            accessibilityLabel="Add new medication"
          />
          
          <Button
            title="🧹 Clean Up Duplicates"
            onPress={handleCleanupDuplicates}
            variant="secondary"
            accessibilityLabel="Clean up duplicate medications"
          />
          
          <Button
            title="🧪 Add Test Data"
            onPress={handleAddTestData}
            variant="secondary"
            accessibilityLabel="Add test medications for testing"
          />
          
          <Button
            title="🗑️ Clear All Data"
            onPress={handleClearAllData}
            variant="secondary"
            accessibilityLabel="Clear all medications"
          />
        </View>

      {/* Medications List */}
      {medications.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Medications</Text>
          <Text style={styles.emptyText}>
            You haven't added any medications yet. Tap "Add New Medication" to get started.
          </Text>
        </Card>
      ) : (
        <View style={styles.medicationsList}>
          {medications.map((medication) => (
            <Card key={medication.id} style={styles.medicationCard}>
              <View style={styles.medicationHeader}>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>
                    {medication.medicationName}
                  </Text>
                  <Text style={styles.dosage}>
                    {medication.dosage}
                  </Text>
                  <Text style={styles.frequency}>
                    {medication.frequency} • {formatTimes(medication.times)}
                  </Text>
                  {/* Critical medication indicator - will be added in future version */}
                </View>
                
                <View style={styles.statusIndicator}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: medication.isActive ? '#27ae60' : '#e74c3c' }
                  ]} />
                  <Text style={styles.statusText}>
                    {medication.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <Button
                  title="View Details"
                  onPress={() => handleViewDetails(medication)}
                  variant="secondary"
                  accessibilityLabel={`View details for ${medication.medicationName}`}
                />
                <Button
                  title="Edit"
                  onPress={() => handleEditMedication(medication)}
                  variant="secondary"
                  accessibilityLabel={`Edit ${medication.medicationName}`}
                />
                <Button
                  title="Delete"
                  onPress={() => handleDeleteMedication(medication)}
                  accessibilityLabel={`Delete ${medication.medicationName}`}
                />
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Back to Main */}
      <View style={styles.backButtonContainer}>
        <Button
          title="← Back to Main"
          onPress={() => navigation.goBack()}
          variant="secondary"
          accessibilityLabel="Go back to main dashboard"
        />
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  addButton: {
    minHeight: 56,
  },
  emptyCard: {
    margin: 16,
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
  medicationsList: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  medicationCard: {
    marginBottom: 16,
    padding: 16,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  frequency: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
    marginBottom: 4,
  },
  criticalBadge: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: 'bold',
    backgroundColor: '#fdf2f2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusIndicator: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  backButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  backButton: {
    minHeight: 56,
  },
}); 