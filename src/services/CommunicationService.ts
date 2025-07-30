import { Contact, Message, VideoCall } from '../types/communication';
import { DataAccessLayer } from '../storage/DataAccessLayer';

export class CommunicationService {
  private static instance: CommunicationService;
  private dataAccess: DataAccessLayer;

  private constructor() {
    this.dataAccess = new DataAccessLayer();
  }

  public static getInstance(): CommunicationService {
    if (!CommunicationService.instance) {
      CommunicationService.instance = new CommunicationService();
    }
    return CommunicationService.instance;
  }

  // Contact Management
  async getContacts(): Promise<Contact[]> {
    try {
      console.log('CommunicationService: Getting contacts from data access layer');
      const contacts = await this.dataAccess.getContacts();
      console.log('CommunicationService: Raw contacts from storage:', contacts);
      
      // Convert date strings back to Date objects
      const contactsWithDates = contacts.map(contact => ({
        ...contact,
        createdAt: contact.createdAt instanceof Date ? contact.createdAt : new Date(contact.createdAt),
        lastContactedAt: contact.lastContactedAt ? 
          (contact.lastContactedAt instanceof Date ? contact.lastContactedAt : new Date(contact.lastContactedAt)) : 
          undefined
      }));
      
      const sortedContacts = contactsWithDates.sort((a, b) => {
        // Sort by emergency contacts first, then by last contacted
        if (a.isEmergencyContact && !b.isEmergencyContact) return -1;
        if (!a.isEmergencyContact && b.isEmergencyContact) return 1;
        
        const aLastContact = a.lastContactedAt?.getTime() || 0;
        const bLastContact = b.lastContactedAt?.getTime() || 0;
        return bLastContact - aLastContact;
      });
      
      console.log('CommunicationService: Sorted contacts:', sortedContacts);
      return sortedContacts;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw new Error('Failed to load contacts');
    }
  }

  async addContact(contact: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> {
    try {
      const newContact: Contact = {
        ...contact,
        id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };
      
      await this.dataAccess.saveContact(newContact);
      return newContact;
    } catch (error) {
      console.error('Error adding contact:', error);
      throw new Error('Failed to add contact');
    }
  }

  async updateContact(contactId: string, updates: Partial<Contact>): Promise<Contact> {
    try {
      const existingContact = await this.dataAccess.getContact(contactId);
      if (!existingContact) {
        throw new Error('Contact not found');
      }

      const updatedContact = { ...existingContact, ...updates };
      await this.dataAccess.saveContact(updatedContact);
      return updatedContact;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw new Error('Failed to update contact');
    }
  }

  async deleteContact(contactId: string): Promise<void> {
    try {
      await this.dataAccess.deleteContact(contactId);
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw new Error('Failed to delete contact');
    }
  }

  // Video Calling
  async initiateVideoCall(contactId: string): Promise<VideoCall> {
    try {
      const contact = await this.dataAccess.getContact(contactId);
      if (!contact) {
        throw new Error('Contact not found');
      }

      const videoCall: VideoCall = {
        id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        initiatorId: 'current-user', // In a real app, this would be the current user's ID
        recipientId: contactId,
        startedAt: new Date(),
        status: 'initiated',
      };

      await this.dataAccess.saveVideoCall(videoCall);
      
      // Update last contacted time
      await this.updateContact(contactId, { lastContactedAt: new Date() });
      
      return videoCall;
    } catch (error) {
      console.error('Error initiating video call:', error);
      throw new Error('Failed to start video call');
    }
  }

  async endVideoCall(callId: string): Promise<VideoCall> {
    try {
      const call = await this.dataAccess.getVideoCall(callId);
      if (!call) {
        throw new Error('Video call not found');
      }

      // Convert date strings back to Date objects
      const callWithDates = {
        ...call,
        startedAt: call.startedAt instanceof Date ? call.startedAt : new Date(call.startedAt),
        endedAt: call.endedAt ? 
          (call.endedAt instanceof Date ? call.endedAt : new Date(call.endedAt)) : 
          undefined
      };

      const endedAt = new Date();
      const duration = Math.floor((endedAt.getTime() - callWithDates.startedAt.getTime()) / 1000);
      
      const updatedCall: VideoCall = {
        ...callWithDates,
        endedAt,
        duration,
        status: 'ended',
      };

      await this.dataAccess.saveVideoCall(updatedCall);
      return updatedCall;
    } catch (error) {
      console.error('Error ending video call:', error);
      throw new Error('Failed to end video call');
    }
  }

  // Message Management
  async getMessages(contactId: string): Promise<Message[]> {
    try {
      const messages = await this.dataAccess.getMessages();
      
      // Convert date strings back to Date objects
      const messagesWithDates = messages.map(message => ({
        ...message,
        sentAt: message.sentAt instanceof Date ? message.sentAt : new Date(message.sentAt),
        readAt: message.readAt ? 
          (message.readAt instanceof Date ? message.readAt : new Date(message.readAt)) : 
          undefined
      }));
      
      return messagesWithDates
        .filter(msg => 
          (msg.fromUserId === contactId && msg.toUserId === 'current-user') ||
          (msg.fromUserId === 'current-user' && msg.toUserId === contactId)
        )
        .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Failed to load messages');
    }
  }

  async sendMessage(contactId: string, content: string, type: Message['type'] = 'text', attachmentUrl?: string): Promise<Message> {
    try {
      const message: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fromUserId: 'current-user',
        toUserId: contactId,
        content,
        type,
        sentAt: new Date(),
        attachmentUrl,
      };

      await this.dataAccess.saveMessage(message);
      
      // Update last contacted time
      await this.updateContact(contactId, { lastContactedAt: new Date() });
      
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      const message = await this.dataAccess.getMessage(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      const updatedMessage = { ...message, readAt: new Date() };
      await this.dataAccess.saveMessage(updatedMessage);
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw new Error('Failed to mark message as read');
    }
  }

  // Wellness Status Sharing
  async shareWellnessStatus(contactId: string, status: { mood: number; energyLevel: number; notes?: string }): Promise<void> {
    try {
      const contact = await this.dataAccess.getContact(contactId);
      if (!contact) {
        throw new Error('Contact not found');
      }

      if (!contact.canViewHealthStatus) {
        throw new Error('Contact does not have permission to view health status');
      }

      const message = `Wellness Update: Mood ${status.mood}/5, Energy ${status.energyLevel}/5${status.notes ? `. Notes: ${status.notes}` : ''}`;
      
      await this.sendMessage(contactId, message, 'text');
    } catch (error) {
      console.error('Error sharing wellness status:', error);
      throw new Error('Failed to share wellness status');
    }
  }

  // Text-to-Speech for messages
  async readMessageAloud(message: Message): Promise<void> {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message.content);
        utterance.rate = 0.8; // Slower rate for seniors
        utterance.volume = 1;
        speechSynthesis.speak(utterance);
      } else {
        console.warn('Speech synthesis not supported');
      }
    } catch (error) {
      console.error('Error reading message aloud:', error);
    }
  }
}