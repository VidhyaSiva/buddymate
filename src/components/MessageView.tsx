import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Text, Button, Card } from './foundation';
import { Contact, Message } from '../types/communication';
import { CommunicationService } from '../services/CommunicationService';
import { voiceService } from '../services/VoiceService';
import AudioFeedback from './AudioFeedback';

interface MessageViewProps {
  contact: Contact;
  onBack: () => void;
  onVideoCall: () => void;
  testID?: string;
}

export const MessageView: React.FC<MessageViewProps> = ({
  contact,
  onBack,
  onVideoCall,
  testID,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const communicationService = CommunicationService.getInstance();

  useEffect(() => {
    loadMessages();
  }, [contact.id]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messageList = await communicationService.getMessages(contact.id);
      setMessages(messageList);
      
      // Mark unread messages as read
      const unreadMessages = messageList.filter(msg => 
        msg.toUserId === 'current-user' && !msg.readAt
      );
      
      for (const message of unreadMessages) {
        await communicationService.markMessageAsRead(message.id);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      window.alert('Error\n\nFailed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const message = await communicationService.sendMessage(
        contact.id,
        newMessage.trim()
      );
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Scroll to bottom after sending
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.error('Error sending message:', err);
      window.alert('Error\n\nFailed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleReadAloud = async (message: Message) => {
    try {
      const senderName = message.fromUserId === 'current-user' ? 'You' : contact.name;
      await voiceService.readMessageAloud(message.content, senderName);
    } catch (err) {
      console.error('Error reading message aloud:', err);
      window.alert('Error\n\nUnable to read message aloud');
    }
  };

  const handleSharePhoto = () => {
    Alert.alert(
      'Share Photo',
      'Choose how to share a photo:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: '📷 Take Photo', 
          onPress: () => simulatePhotoCapture('camera')
        },
        { 
          text: '🖼️ Choose from Gallery', 
          onPress: () => simulatePhotoCapture('gallery')
        }
      ]
    );
  };

  const simulatePhotoCapture = async (source: 'camera' | 'gallery') => {
    try {
      // Simulate photo capture/selection
      const photoUrl = 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Shared+Photo';
      const message = source === 'camera' ? 'Just took this photo!' : 'Sharing a photo with you!';
      
      await communicationService.sendMessage(contact.id, message, 'photo', photoUrl);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        fromUserId: 'current-user',
        toUserId: contact.id,
        content: message,
        type: 'photo',
        sentAt: new Date(),
        attachmentUrl: photoUrl,
      }]);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      Alert.alert('Error', 'Failed to share photo');
    }
  };

  const handleShareWellness = () => {
    if (!contact.canViewHealthStatus) {
      Alert.alert(
        'Permission Required',
        `${contact.name} doesn't have permission to view your wellness status. Would you like to enable this?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Enable', 
            onPress: async () => {
              try {
                await communicationService.updateContact(contact.id, { canViewHealthStatus: true });
                shareWellnessStatus();
              } catch (err) {
                Alert.alert('Error', 'Failed to update permissions');
              }
            }
          }
        ]
      );
      return;
    }
    shareWellnessStatus();
  };

  const shareWellnessStatus = () => {
    Alert.alert(
      'Share Wellness Status',
      'How are you feeling today?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Great! 😊', 
          onPress: () => sendWellnessUpdate(5, 5, 'Feeling great today!')
        },
        { 
          text: 'Good 🙂', 
          onPress: () => sendWellnessUpdate(4, 4, 'Having a good day')
        },
        { 
          text: 'Okay 😐', 
          onPress: () => sendWellnessUpdate(3, 3, 'Doing okay')
        },
        { 
          text: 'Not great 😔', 
          onPress: () => sendWellnessUpdate(2, 2, 'Not feeling my best')
        }
      ]
    );
  };

  const sendWellnessUpdate = async (mood: number, energy: number, notes: string) => {
    try {
      await communicationService.shareWellnessStatus(contact.id, { mood, energyLevel: energy, notes });
      window.alert(`Shared!\n\nYour wellness status has been shared with ${contact.name}`);
      loadMessages(); // Refresh to show the new message
    } catch (err) {
      window.alert('Error\n\nFailed to share wellness status');
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isFromUser = message.fromUserId === 'current-user';
    const showPhoto = message.type === 'photo' && message.attachmentUrl;

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isFromUser ? styles.userMessage : styles.contactMessage,
        ]}
        testID={`${testID}-message-${index}`}
      >
        <TouchableOpacity
          onPress={() => handleReadAloud(message)}
          style={[
            styles.messageContent,
            isFromUser ? styles.userMessageContent : styles.contactMessageContent,
          ]}
          accessibilityLabel={`Message from ${isFromUser ? 'you' : contact.name}: ${message.content}`}
          accessibilityHint="Tap to read aloud"
        >
          {showPhoto && (
            <Image
              source={{ uri: message.attachmentUrl }}
              style={styles.messagePhoto}
              testID={`${testID}-message-photo-${index}`}
            />
          )}
          <Text style={[
            styles.messageText,
            isFromUser ? styles.userMessageText : styles.contactMessageText,
          ]}>
            {message.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>
              {message.sentAt.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
            <TouchableOpacity
              onPress={() => handleReadAloud(message)}
              style={styles.speakButton}
              testID={`${testID}-speak-button-${index}`}
              accessibilityLabel="Read message aloud"
            >
              <Text style={styles.speakIcon}>🔊 Read Aloud</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      testID={testID}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          testID={`${testID}-back-button`}
          accessibilityLabel="Go back to contacts"
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.contactInfo}>
          {contact.photo ? (
            <Image
              source={{ uri: contact.photo }}
              style={styles.headerPhoto}
              testID={`${testID}-header-photo`}
            />
          ) : (
            <View style={styles.headerPhotoPlaceholder}>
              <Text style={styles.headerPhotoInitial}>
                {contact.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{contact.name}</Text>
            <Text style={styles.headerRelationship}>{contact.relationship}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleShareWellness}
            style={styles.wellnessButton}
            testID={`${testID}-wellness-button`}
            accessibilityLabel="Share wellness status"
          >
            <Text style={styles.wellnessIcon}>💚</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onVideoCall}
            style={styles.videoCallButton}
            testID={`${testID}-video-call-button`}
            accessibilityLabel={`Start video call with ${contact.name}`}
          >
            <Text style={styles.videoCallIcon}>📹</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start a conversation!</Text>
          </View>
        ) : (
          messages.map((message, index) => renderMessage(message, index))
        )}
      </ScrollView>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={handleSharePhoto}
          style={styles.photoButton}
          testID={`${testID}-photo-button`}
          accessibilityLabel="Share a photo"
        >
          <Text style={styles.photoIcon}>📷</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          placeholderTextColor="#adb5bd"
          multiline
          maxLength={500}
          testID={`${testID}-text-input`}
          accessibilityLabel="Message input"
        />

        <Button
          title="Send"
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || sending}
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) && styles.sendButtonDisabled,
          ]}
          textStyle={styles.sendButtonText}
          testID={`${testID}-send-button`}
          accessibilityLabel="Send message"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#007bff',
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  headerPhotoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerPhotoInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerRelationship: {
    fontSize: 16,
    color: '#6c757d',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wellnessButton: {
    padding: 12,
    backgroundColor: '#17a2b8',
    borderRadius: 8,
    marginRight: 8,
  },
  wellnessIcon: {
    fontSize: 20,
  },
  videoCallButton: {
    padding: 12,
    backgroundColor: '#28a745',
    borderRadius: 8,
  },
  videoCallIcon: {
    fontSize: 20,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#6c757d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    color: '#6c757d',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#adb5bd',
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  contactMessage: {
    alignItems: 'flex-start',
  },
  messageContent: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 12,
  },
  userMessageContent: {
    backgroundColor: '#007bff',
  },
  contactMessageContent: {
    backgroundColor: '#e9ecef',
  },
  userMessageContent: {
    backgroundColor: '#007bff',
  },
  contactMessageContent: {
    backgroundColor: '#e9ecef',
  },
  userMessageText: {
    color: '#ffffff',
  },
  contactMessageText: {
    color: '#2c3e50',
  },
  messageText: {
    fontSize: 18,
    lineHeight: 24,
  },
  messagePhoto: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  messageTime: {
    fontSize: 14,
    color: '#adb5bd',
  },
  speakButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    marginLeft: 8,
  },
  speakIcon: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  photoButton: {
    padding: 12,
    marginRight: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  photoIcon: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});