import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Button } from './foundation';
import { Contact } from '../types/communication';

interface ContactCardProps {
  contact: Contact;
  onPress: () => void;
  onVideoCall: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  testID?: string;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onPress,
  onVideoCall,
  onEdit,
  onDelete,
  testID,
}) => {
  const formatLastContact = (date?: Date) => {
    if (!date) return 'Never contacted';
    
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <View
      style={styles.container}
      testID={testID}
    >
      <View style={styles.content}>
        <View style={styles.photoContainer}>
          {contact.photo ? (
            <Image
              source={{ uri: contact.photo }}
              style={styles.photo}
              testID={`${testID}-photo`}
            />
          ) : (
            <View style={styles.photoPlaceholder} testID={`${testID}-photo-placeholder`}>
              <Text style={styles.photoInitial}>
                {contact.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {contact.isEmergencyContact && (
            <View style={styles.emergencyBadge}>
              <Text style={styles.emergencyText}>!</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.info}
          onPress={onPress}
          testID={`${testID}-info`}
          accessibilityRole="button"
          accessibilityLabel={`Contact ${contact.name}, ${contact.relationship}`}
          accessibilityHint="Tap to view messages and call options"
        >
          <Text style={styles.name} testID={`${testID}-name`}>
            {contact.name}
          </Text>
          <Text style={styles.relationship} testID={`${testID}-relationship`}>
            {contact.relationship}
          </Text>
          <Text style={styles.lastContact} testID={`${testID}-last-contact`}>
            Last contact: {formatLastContact(contact.lastContactedAt)}
          </Text>
        </TouchableOpacity>

        <View style={styles.actions}>
          <Button
            title="📞 Call"
            onPress={onVideoCall}
            testID={`${testID}-video-call-button`}
            accessibilityLabel={`Start video call with ${contact.name}`}
          />
          {onEdit && (
            <Button
              title="✏️ Edit"
              onPress={onEdit}
              variant="secondary"
              testID={`${testID}-edit-button`}
              accessibilityLabel={`Edit ${contact.name}`}
            />
          )}
          {onDelete && (
            <Button
              title="🗑️ Delete"
              onPress={onDelete}
              variant="secondary"
              testID={`${testID}-delete-button`}
              accessibilityLabel={`Delete ${contact.name}`}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  photoContainer: {
    position: 'relative',
    marginRight: 16,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e9ecef',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emergencyBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  info: {
    flex: 1,
    marginRight: 12,
    paddingVertical: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  relationship: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 4,
  },
  lastContact: {
    fontSize: 16,
    color: '#adb5bd',
  },
  actions: {
    alignItems: 'center',
  },
  videoButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 100,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});