import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Input } from './foundation';
import { Contact } from '../types/communication';

interface ContactFormProps {
  contact?: Contact | null;
  onSave: (contactData: Omit<Contact, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  testID?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ 
  contact, 
  onSave, 
  onCancel, 
  testID 
}) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isEmergencyContact, setIsEmergencyContact] = useState(false);
  const [canViewHealthStatus, setCanViewHealthStatus] = useState(false);

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setRelationship(contact.relationship);
      setPhoneNumber(contact.phoneNumber);
      setEmail(contact.email || '');
      setIsEmergencyContact(contact.isEmergencyContact);
      setCanViewHealthStatus(contact.canViewHealthStatus);
    }
  }, [contact]);

  const handleSave = () => {
    if (!name.trim()) {
      window.alert('Please enter a name for the contact.');
      return;
    }
    if (!relationship.trim()) {
      window.alert('Please enter a relationship.');
      return;
    }
    if (!phoneNumber.trim()) {
      window.alert('Please enter a phone number.');
      return;
    }

    onSave({
      name: name.trim(),
      relationship: relationship.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim() || undefined,
      isEmergencyContact,
      canViewHealthStatus,
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <Card style={styles.card}>
        <Text style={styles.title}>
          {contact ? 'Edit Contact' : 'Add New Contact'}
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Name *</Text>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Enter contact name"
            style={styles.input}
            accessibilityLabel="Contact name input"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Relationship *</Text>
          <Input
            value={relationship}
            onChangeText={setRelationship}
            placeholder="e.g., Daughter, Son, Friend"
            style={styles.input}
            accessibilityLabel="Relationship input"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Phone Number *</Text>
          <Input
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+1-555-123-4567"
            style={styles.input}
            accessibilityLabel="Phone number input"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email (Optional)</Text>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="contact@email.com"
            style={styles.input}
            accessibilityLabel="Email input"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.checkboxContainer}>
            <Button
              title={isEmergencyContact ? "✓ Emergency Contact" : "Emergency Contact"}
              onPress={() => setIsEmergencyContact(!isEmergencyContact)}
              variant={isEmergencyContact ? "primary" : "secondary"}
              accessibilityLabel={`Emergency contact ${isEmergencyContact ? 'enabled' : 'disabled'}`}
            />
          </View>
          <Text style={styles.checkboxHelp}>
            Emergency contacts will be notified in case of emergency
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.checkboxContainer}>
            <Button
              title={canViewHealthStatus ? "✓ Can View Health Status" : "Can View Health Status"}
              onPress={() => setCanViewHealthStatus(!canViewHealthStatus)}
              variant={canViewHealthStatus ? "primary" : "secondary"}
              accessibilityLabel={`Health status access ${canViewHealthStatus ? 'enabled' : 'disabled'}`}
            />
          </View>
          <Text style={styles.checkboxHelp}>
            This contact can view your wellness updates and health status
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Save Contact"
            onPress={handleSave}
            accessibilityLabel="Save contact"
          />
          <Button
            title="Cancel"
            onPress={onCancel}
            variant="secondary"
            accessibilityLabel="Cancel editing contact"
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  card: {
    margin: 16,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    minHeight: 50,
  },
  checkboxContainer: {
    marginBottom: 8,
  },
  checkboxHelp: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 20,
  },
}); 