import { Contact, Message, VideoCall, Communication } from '../types/communication';

export const createMockContact = (overrides?: Partial<Contact>): Contact => ({
  id: crypto.randomUUID(),
  name: 'Sarah Johnson',
  relationship: 'Daughter',
  phoneNumber: '+1-555-987-6543',
  email: 'sarah.johnson@email.com',
  photo: 'https://example.com/sarah.jpg',
  isEmergencyContact: true,
  canViewHealthStatus: true,
  createdAt: new Date('2024-01-01'),
  lastContactedAt: new Date(),
  ...overrides,
});

export const createMockMessage = (overrides?: Partial<Message>): Message => ({
  id: crypto.randomUUID(),
  fromUserId: crypto.randomUUID(),
  toUserId: crypto.randomUUID(),
  content: 'Hi Mom! How are you feeling today?',
  type: 'text',
  sentAt: new Date(),
  readAt: new Date(),
  ...overrides,
});

export const createMockVideoCall = (overrides?: Partial<VideoCall>): VideoCall => ({
  id: crypto.randomUUID(),
  initiatorId: crypto.randomUUID(),
  recipientId: crypto.randomUUID(),
  startedAt: new Date(),
  endedAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes later
  duration: 900, // 15 minutes in seconds
  status: 'ended',
  ...overrides,
});

export const createMockCommunication = (overrides?: Partial<Communication>): Communication => ({
  contacts: [createMockContact()],
  messages: [createMockMessage()],
  videoCalls: [createMockVideoCall()],
  ...overrides,
});

export const createMockContacts = (count: number): Contact[] => {
  const relationships = ['Son', 'Daughter', 'Spouse', 'Friend', 'Neighbor', 'Caregiver'];
  const names = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'Robert Wilson', 'Lisa Anderson'];
  
  return Array.from({ length: count }, (_, index) => 
    createMockContact({
      name: names[index % names.length],
      relationship: relationships[index % relationships.length],
      phoneNumber: `+1-555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      isEmergencyContact: index < 2, // First two are emergency contacts
    })
  );
};

export const createMockMessages = (count: number, fromUserId: string, toUserId: string): Message[] => {
  const messageContents = [
    'Hi! How are you doing today?',
    'Just wanted to check in on you.',
    'The weather is beautiful today!',
    'Don\'t forget to take your medication.',
    'Love you!',
    'Call me when you get a chance.',
  ];
  
  return Array.from({ length: count }, (_, index) => {
    const sentAt = new Date();
    sentAt.setHours(sentAt.getHours() - index);
    
    return createMockMessage({
      fromUserId: index % 2 === 0 ? fromUserId : toUserId,
      toUserId: index % 2 === 0 ? toUserId : fromUserId,
      content: messageContents[index % messageContents.length],
      sentAt,
      readAt: index < count - 2 ? sentAt : undefined, // Last 2 messages unread
    });
  });
};