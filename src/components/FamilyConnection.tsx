import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card } from './foundation';
import { Contact } from '../types/communication';
import { CommunicationService } from '../services/CommunicationService';
import { ContactCard } from './ContactCard';
import { ContactForm } from './ContactForm';
import { MessageView } from './MessageView';


interface FamilyConnectionProps {
  testID?: string;
}

export const FamilyConnection: React.FC<FamilyConnectionProps> = ({ testID }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [currentView, setCurrentView] = useState<'contacts' | 'messages' | 'video' | 'add-contact' | 'edit-contact'>('contacts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const communicationService = CommunicationService.getInstance();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading contacts...');
      
      // First try to get existing contacts
      let contactList = await communicationService.getContacts();
      console.log('Loaded contacts from storage:', contactList);
      
      // If no contacts exist, create some demo contacts directly
      if (contactList.length === 0) {
        console.log('No contacts found, creating demo contacts...');
        const demoContacts = [
          {
            name: 'Sarah Johnson',
            relationship: 'Daughter',
            phoneNumber: '+1-555-987-6543',
            email: 'sarah.johnson@email.com',
            isEmergencyContact: true,
            canViewHealthStatus: true,
          },
          {
            name: 'Michael Brown',
            relationship: 'Son',
            phoneNumber: '+1-555-123-4567',
            email: 'michael.brown@email.com',
            isEmergencyContact: true,
            canViewHealthStatus: true,
          },
          {
            name: 'Emily Davis',
            relationship: 'Friend',
            phoneNumber: '+1-555-456-7890',
            email: 'emily.davis@email.com',
            isEmergencyContact: false,
            canViewHealthStatus: false,
          },
          {
            name: 'Dr. Wilson',
            relationship: 'Doctor',
            phoneNumber: '+1-555-789-0123',
            email: 'dr.wilson@clinic.com',
            isEmergencyContact: false,
            canViewHealthStatus: true,
          },
          {
            name: 'Lisa Anderson',
            relationship: 'Neighbor',
            phoneNumber: '+1-555-321-6547',
            email: 'lisa.anderson@email.com',
            isEmergencyContact: false,
            canViewHealthStatus: false,
          }
        ];
        
        // Add each demo contact
        for (const contactData of demoContacts) {
          try {
            await communicationService.addContact(contactData);
          } catch (err) {
            console.error('Error adding demo contact:', err);
          }
        }
        
        // Reload contacts after adding demo data
        contactList = await communicationService.getContacts();
        console.log('Contacts after adding demo data:', contactList);
      }
      
      setContacts(contactList);
    } catch (err) {
      setError('Failed to load family contacts');
      console.error('Error loading contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setCurrentView('messages');
  };

  const handleVideoCall = async (contact: Contact) => {
    try {
      setSelectedContact(contact);
      setCurrentView('video');
      await communicationService.initiateVideoCall(contact.id);
    } catch (err) {
      window.alert('Call Failed\n\nUnable to start video call. Please try again.');
    }
  };

  const handleBackToContacts = () => {
    setSelectedContact(null);
    setCurrentView('contacts');
    loadContacts(); // Refresh contacts to update last contacted time
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setCurrentView('add-contact');
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setCurrentView('edit-contact');
  };

  const handleDeleteContact = async (contact: Contact) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${contact.name}? This action cannot be undone.`);
    if (confirmDelete) {
      try {
        await communicationService.deleteContact(contact.id);
        window.alert(`${contact.name} has been deleted successfully.`);
        await loadContacts();
      } catch (err) {
        window.alert('Failed to delete contact. Please try again.');
      }
    }
  };

  const handleSaveContact = async (contactData: Omit<Contact, 'id' | 'createdAt'>) => {
    try {
      if (editingContact) {
        // Update existing contact
        await communicationService.updateContact(editingContact.id, contactData);
        window.alert(`${contactData.name} has been updated successfully.`);
      } else {
        // Add new contact
        await communicationService.addContact(contactData);
        window.alert(`${contactData.name} has been added successfully.`);
      }
      setCurrentView('contacts');
      await loadContacts();
    } catch (err) {
      window.alert('Failed to save contact. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingContact(null);
    setCurrentView('contacts');
  };

  if (loading) {
    return (
      <View style={styles.container} testID={testID}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading family contacts...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container} testID={testID}>
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Try Again"
            onPress={loadContacts}
            accessibilityLabel="Retry loading contacts"
          />
        </Card>
      </View>
    );
  }



  if (currentView === 'messages' && selectedContact) {
    return (
      <MessageView
        contact={selectedContact}
        onBack={handleBackToContacts}
        onVideoCall={() => handleVideoCall(selectedContact)}
        testID={`${testID}-messages`}
      />
    );
  }

  if (currentView === 'add-contact' || currentView === 'edit-contact') {
    return (
      <ContactForm
        contact={editingContact}
        onSave={handleSaveContact}
        onCancel={handleCancelEdit}
        testID={`${testID}-contact-form`}
      />
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.title}>Family & Friends</Text>
        <Text style={styles.subtitle}>Stay connected with your loved ones</Text>
      </View>

      {/* Contact Management Controls */}
      <View style={styles.testDataContainer}>
        <Button
          title="➕ Add Contact"
          onPress={handleAddContact}
          accessibilityLabel="Add new contact"
        />
        <Button
          title="➕ Add Test Contacts"
          onPress={loadContacts}
          accessibilityLabel="Add test contacts"
        />
        <Button
          title="🗑️ Clear All Contacts"
          onPress={async () => {
            try {
              const contacts = await communicationService.getContacts();
              for (const contact of contacts) {
                await communicationService.deleteContact(contact.id);
              }
              window.alert('All contacts cleared successfully!');
              await loadContacts();
            } catch (err) {
              window.alert('Failed to clear contacts. Please try again.');
            }
          }}
          variant="secondary"
          accessibilityLabel="Clear all contacts"
        />
      </View>

      <ScrollView 
        style={styles.contactsList}
        contentContainerStyle={styles.contactsContent}
        showsVerticalScrollIndicator={true}
      >
        {contacts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No contacts added yet</Text>
            <Text style={styles.emptySubtext}>
              Ask a family member to help you add contacts
            </Text>
          </Card>
        ) : (
          contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onPress={() => handleContactSelect(contact)}
              onVideoCall={() => handleVideoCall(contact)}
              onEdit={() => handleEditContact(contact)}
              onDelete={() => handleDeleteContact(contact)}
              testID={`${testID}-contact-${contact.id}`}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d',
  },
  contactsList: {
    flex: 1,
  },
  contactsContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 20,
    color: '#6c757d',
    textAlign: 'center',
  },
  errorCard: {
    margin: 20,
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    minWidth: 120,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 20,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#adb5bd',
    textAlign: 'center',
  },
  testDataContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
});