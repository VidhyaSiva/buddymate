import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Button } from '../foundation/Button';
import { Card } from '../foundation/Card';
import { Text } from '../foundation/Text';
import { Input } from '../foundation/Input';
import { EmergencyContact } from '../../types/user';
import { voiceService } from '../../services/VoiceService';

export interface EmergencyContactsStepProps {
  contacts: EmergencyContact[];
  onUpdate: (contacts: EmergencyContact[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  canGoBack: boolean;
  canSkip: boolean;
}

interface ContactForm {
  name: string;
  relationship: string;
  phoneNumber: string;
  isPrimary: boolean;
}

const RELATIONSHIP_OPTIONS = [
  'Spouse/Partner',
  'Adult Child',
  'Sibling',
  'Friend',
  'Neighbor',
  'Caregiver',
  'Doctor',
  'Other',
];

export const EmergencyContactsStep: React.FC<EmergencyContactsStepProps> = ({
  contacts,
  onUpdate,
  onNext,
  onPrevious,
  onSkip,
  canGoBack,
  canSkip,
}) => {
  const [contactForms, setContactForms] = useState<ContactForm[]>([
    {
      name: '',
      relationship: '',
      phoneNumber: '',
      isPrimary: true,
    },
  ]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Initialize with existing contacts if any
    if (contacts.length > 0) {
      const forms = contacts.map(contact => ({
        name: contact.name,
        relationship: contact.relationship,
        phoneNumber: contact.phoneNumber,
        isPrimary: contact.isPrimary,
      }));
      setContactForms(forms);
    }

    const message = `Now let's add your emergency contacts. These are the people who will be notified if you need help. You can add at least one contact, but I recommend having two or three.`;
    setTimeout(() => {
      voiceService.speak(message, { rate: 0.4 });
    }, 500);
  }, [contacts]);

  const validatePhoneNumber = (phone: string): boolean => {
    // Simple phone validation - allows various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
  };

  const validateContact = (contact: ContactForm, index: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!contact.name.trim()) {
      newErrors[`name_${index}`] = 'Name is required';
      isValid = false;
    }

    if (!contact.relationship.trim()) {
      newErrors[`relationship_${index}`] = 'Relationship is required';
      isValid = false;
    }

    if (!contact.phoneNumber.trim()) {
      newErrors[`phone_${index}`] = 'Phone number is required';
      isValid = false;
    } else if (!validatePhoneNumber(contact.phoneNumber)) {
      newErrors[`phone_${index}`] = 'Please enter a valid phone number';
      isValid = false;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const updateContact = (index: number, field: keyof ContactForm, value: string | boolean) => {
    const updatedForms = [...contactForms];
    updatedForms[index] = { ...updatedForms[index], [field]: value };
    
    // If setting as primary, unset others
    if (field === 'isPrimary' && value === true) {
      updatedForms.forEach((form, i) => {
        if (i !== index) {
          form.isPrimary = false;
        }
      });
    }
    
    setContactForms(updatedForms);

    // Clear error for this field
    const errorKey = `${field}_${index}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addContact = () => {
    if (contactForms.length < 5) {
      setContactForms([
        ...contactForms,
        {
          name: '',
          relationship: '',
          phoneNumber: '',
          isPrimary: false,
        },
      ]);
      voiceService.speak('Added new contact form');
    }
  };

  const removeContact = (index: number) => {
    if (contactForms.length > 1) {
      const updatedForms = contactForms.filter((_, i) => i !== index);
      setContactForms(updatedForms);
      voiceService.speak('Contact removed');
    }
  };

  const handleNext = () => {
    // Validate all contacts
    let allValid = true;
    const validContacts: ContactForm[] = [];

    contactForms.forEach((contact, index) => {
      // Only validate contacts that have some data entered
      const hasData = contact.name.trim() || contact.relationship.trim() || contact.phoneNumber.trim();
      
      if (hasData) {
        if (validateContact(contact, index)) {
          validContacts.push(contact);
        } else {
          allValid = false;
        }
      }
    });

    if (validContacts.length === 0) {
      Alert.alert(
        'No Emergency Contacts',
        'For your safety, please add at least one emergency contact.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!allValid) {
      voiceService.speak('Please check the contact information and fix any errors.');
      return;
    }

    // Ensure at least one primary contact
    const hasPrimary = validContacts.some(contact => contact.isPrimary);
    if (!hasPrimary && validContacts.length > 0) {
      validContacts[0].isPrimary = true;
    }

    // Convert to EmergencyContact format
    const emergencyContacts: EmergencyContact[] = validContacts.map((contact, index) => ({
      id: `contact_${Date.now()}_${index}`,
      name: contact.name.trim(),
      relationship: contact.relationship.trim(),
      phoneNumber: contact.phoneNumber.trim(),
      isPrimary: contact.isPrimary,
    }));

    onUpdate(emergencyContacts);
    voiceService.speak(`Great! I've saved ${emergencyContacts.length} emergency contact${emergencyContacts.length > 1 ? 's' : ''}. Now let's set up your medications.`);
    onNext();
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Emergency Contacts?',
      'Emergency contacts are important for your safety. Are you sure you want to skip this step?',
      [
        {
          text: 'Go Back',
          style: 'cancel',
        },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: () => {
            voiceService.speak('Skipping emergency contacts. You can add these later in settings.');
            onSkip();
          },
        },
      ]
    );
  };

  const renderContactForm = (contact: ContactForm, index: number) => (
    <Card key={index} variant="outlined" padding="medium" style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <Text variant="title2" weight="medium" style={styles.contactTitle}>
          Contact {index + 1}
          {contact.isPrimary && (
            <Text variant="caption" style={styles.primaryLabel}> (Primary)</Text>
          )}
        </Text>
        
        {contactForms.length > 1 && (
          <TouchableOpacity
            onPress={() => removeContact(index)}
            style={styles.removeButton}
            accessibilityLabel={`Remove contact ${index + 1}`}
            accessibilityRole="button"
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <Input
        label="Name"
        value={contact.name}
        onChangeText={(value) => updateContact(index, 'name', value)}
        placeholder="Enter contact's name"
        error={errors[`name_${index}`]}
        accessibilityLabel={`Contact ${index + 1} name`}
        testID={`emergency-contact-name-${index}`}
        maxLength={50}
      />

      <View style={styles.relationshipContainer}>
        <Text variant="body" weight="medium" style={styles.relationshipLabel}>
          Relationship
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.relationshipScroll}
        >
          {RELATIONSHIP_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => updateContact(index, 'relationship', option)}
              style={[
                styles.relationshipOption,
                contact.relationship === option && styles.relationshipOptionSelected,
              ]}
              accessibilityLabel={`Select relationship: ${option}`}
              accessibilityRole="button"
              accessibilityState={{ selected: contact.relationship === option }}
            >
              <Text
                style={[
                  styles.relationshipOptionText,
                  contact.relationship === option && styles.relationshipOptionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {errors[`relationship_${index}`] && (
          <Text variant="caption" color="error" style={styles.errorText}>
            {errors[`relationship_${index}`]}
          </Text>
        )}
      </View>

      <Input
        label="Phone Number"
        value={contact.phoneNumber}
        onChangeText={(value) => updateContact(index, 'phoneNumber', value)}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        error={errors[`phone_${index}`]}
        accessibilityLabel={`Contact ${index + 1} phone number`}
        testID={`emergency-contact-phone-${index}`}
        maxLength={20}
      />

      <TouchableOpacity
        onPress={() => updateContact(index, 'isPrimary', !contact.isPrimary)}
        style={styles.primaryToggle}
        accessibilityLabel={`${contact.isPrimary ? 'Remove' : 'Set as'} primary contact`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: contact.isPrimary }}
      >
        <View style={[styles.checkbox, contact.isPrimary && styles.checkboxChecked]}>
          {contact.isPrimary && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text variant="body" style={styles.primaryToggleText}>
          Primary emergency contact
        </Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Card variant="elevated" padding="large" style={styles.headerCard}>
        <Text
          variant="title"
          weight="bold"
          style={styles.title}
          accessibilityRole="header"
        >
          Emergency Contacts
        </Text>

        <Text
          variant="body"
          style={styles.subtitle}
          accessibilityRole="text"
        >
          Add people who should be contacted in case of emergency. Your primary contact will be called first.
        </Text>
      </Card>

      <ScrollView style={styles.contactsContainer} showsVerticalScrollIndicator={false}>
        {contactForms.map((contact, index) => renderContactForm(contact, index))}

        {contactForms.length < 5 && (
          <Button
            title="Add Another Contact"
            onPress={addContact}
            variant="secondary"
            size="large"
            accessibilityLabel="Add another emergency contact"
            testID="add-emergency-contact-button"
          />
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Continue"
          onPress={handleNext}
          variant="primary"
          size="large"
          accessibilityLabel="Continue to next step"
          accessibilityHint="Save emergency contacts and continue setup"
          testID="emergency-contacts-continue-button"
        />

        <View style={styles.secondaryButtons}>
          {canGoBack && (
            <Button
              title="Back"
              onPress={onPrevious}
              variant="secondary"
              size="large"
              accessibilityLabel="Go back to previous step"
              testID="emergency-contacts-back-button"
            />
          )}

          {canSkip && (
            <Button
              title="Skip"
              onPress={handleSkip}
              variant="secondary"
              size="large"
              accessibilityLabel="Skip emergency contacts"
              accessibilityHint="Skip this step, not recommended for safety"
              testID="emergency-contacts-skip-button"
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
    color: '#8E8E93',
  },
  contactsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  contactCard: {
    marginBottom: 16,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactTitle: {
    color: '#000000',
  },
  primaryLabel: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  relationshipContainer: {
    marginVertical: 8,
  },
  relationshipLabel: {
    marginBottom: 8,
    color: '#000000',
  },
  relationshipScroll: {
    marginBottom: 8,
  },
  relationshipOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  relationshipOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  relationshipOptionText: {
    fontSize: 16,
    color: '#000000',
  },
  relationshipOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
  },
  primaryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryToggleText: {
    color: '#000000',
  },
  buttonContainer: {
    gap: 16,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});