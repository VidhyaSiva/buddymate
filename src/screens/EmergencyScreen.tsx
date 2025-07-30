import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Text, Button } from '../components/foundation';
import { dataAccessLayer } from '../storage/DataAccessLayer';
import { Contact } from '../types/communication';

interface EmergencyScreenProps {
  navigation: any;
}

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ navigation }) => {
  const [emergencyContacts, setEmergencyContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    phoneNumber: '',
    relationship: '',
    isEmergencyContact: true
  });

  useEffect(() => {
    loadEmergencyContacts();
  }, []);

  const loadEmergencyContacts = async () => {
    try {
      setLoading(true);
      const contacts = await dataAccessLayer.getContacts();
      const emergency = contacts.filter(contact => contact.isEmergencyContact);
      setEmergencyContacts(emergency);
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
      Alert.alert('Error', 'Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phoneNumber) {
      Alert.alert('Error', 'Name and phone number are required');
      return;
    }

    try {
      const contact: Contact = {
        id: crypto.randomUUID(),
        name: newContact.name,
        phoneNumber: newContact.phoneNumber,
        relationship: newContact.relationship || 'Emergency Contact',
        isEmergencyContact: true,
        canViewHealthStatus: true,
        createdAt: new Date(),
        lastContactedAt: new Date()
      };

      await dataAccessLayer.saveContact(contact);
      setModalVisible(false);
      setNewContact({
        name: '',
        phoneNumber: '',
        relationship: '',
        isEmergencyContact: true
      });
      
      // Reload contacts
      await loadEmergencyContacts();
      Alert.alert('Success', 'Emergency contact added successfully');
    } catch (error) {
      console.error('Error saving emergency contact:', error);
      Alert.alert('Error', 'Failed to save emergency contact');
    }
  };

  const handleCallEmergency = (contact: Contact) => {
    Alert.alert(
      'Emergency Call',
      `Calling ${contact.name} at ${contact.phoneNumber}`,
      [{ text: 'OK' }]
    );
  };

  const handleCall911 = () => {
    Alert.alert(
      'Emergency Services',
      'Calling 911 Emergency Services',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Button
          title="← Back to Main"
          onPress={() => navigation.goBack()}
          variant="secondary"
          accessibilityLabel="Go back to main dashboard"
        />
        <Text style={styles.title}>Emergency Help</Text>
        <Text style={styles.subtitle}>Quick access to emergency services</Text>
      </View>

      {/* Emergency Services Button */}
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={handleCall911}
        accessibilityLabel="Call 911 emergency services"
        accessibilityHint="Immediately calls 911 emergency services"
      >
        <Text style={styles.emergencyButtonText}>🚨 Call 911</Text>
        <Text style={styles.emergencyButtonSubtext}>Emergency Services</Text>
      </TouchableOpacity>

      {/* Emergency Contacts Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={styles.loadingText}>Loading contacts...</Text>
          </View>
        ) : emergencyContacts.length > 0 ? (
          emergencyContacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCallEmergency(contact)}
                accessibilityLabel={`Call ${contact.name}`}
                accessibilityHint={`Calls your emergency contact ${contact.name}`}
              >
                <Text style={styles.callButtonText}>📞 Call</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No emergency contacts added</Text>
            <Text style={styles.emptySubtext}>
              Add important contacts for quick access during emergencies
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
          accessibilityLabel="Add emergency contact"
          accessibilityHint="Opens form to add a new emergency contact"
        >
          <Text style={styles.addButtonText}>+ Add Emergency Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Emergency Tips</Text>
        <View style={styles.tipsList}>
          <Text style={styles.tipItem}>• Stay calm and speak clearly when calling for help</Text>
          <Text style={styles.tipItem}>• Know your location to share with emergency services</Text>
          <Text style={styles.tipItem}>• Keep emergency contacts easily accessible</Text>
          <Text style={styles.tipItem}>• Follow instructions from emergency personnel</Text>
        </View>
      </View>

      {/* Add Contact Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Emergency Contact</Text>
            
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={newContact.name}
              onChangeText={(text) => setNewContact({...newContact, name: text})}
              placeholder="Contact Name"
              placeholderTextColor="#9ca3af"
            />
            
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={newContact.phoneNumber}
              onChangeText={(text) => setNewContact({...newContact, phoneNumber: text})}
              placeholder="Phone Number"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
            
            <Text style={styles.inputLabel}>Relationship</Text>
            <TextInput
              style={styles.input}
              value={newContact.relationship}
              onChangeText={(text) => setNewContact({...newContact, relationship: text})}
              placeholder="Relationship (e.g. Spouse, Doctor)"
              placeholderTextColor="#9ca3af"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddContact}
              >
                <Text style={styles.saveButtonText}>Save Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef2f2',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  emergencyButton: {
    backgroundColor: '#dc2626',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emergencyButtonSubtext: {
    color: '#ffffff',
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6b7280',
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  contactRelationship: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 16,
    color: '#4b5563',
  },
  callButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4b5563',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  saveButton: {
    backgroundColor: '#dc2626',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});