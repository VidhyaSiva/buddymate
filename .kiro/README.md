# BuddyMate - Kiro Hackathon Project

## Project Overview

BuddyMate is a comprehensive wellness and medication management application designed for seniors and their caregivers. Built with React Native for Web, it provides an accessible, user-friendly interface for managing daily health routines, medications, family connections, and emergency situations.

## Key Features

### 🏠 Dashboard
- **Wellness Status**: Real-time mood and energy tracking
- **Quick Navigation**: Easy access to all app modules
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Accessibility**: Screen reader support and high contrast options

### 💊 Medication Management
- **Add Medications**: Complete medication setup with dosage, timing, and instructions
- **View & Edit**: Comprehensive medication list with editing capabilities
- **Delete & Cleanup**: Remove medications and clean up duplicate entries
- **Weekly Reports**: Track medication adherence over time
- **Photo Integration**: Capture medication photos for reference

### 👨‍👩‍👧‍👦 Family Connection
- **Contact Management**: Add, edit, and delete family contacts
- **Messaging**: In-app messaging system for family communication
- **Emergency Contacts**: Designate emergency contacts with quick access
- **Health Status Sharing**: Control who can view health information

### 📅 Activities & Daily Routine
- **Daily Tasks**: Create and manage daily routine items
- **Progress Tracking**: Mark tasks as completed
- **Customizable**: Add new activities and modify existing ones
- **Motivation**: Visual progress indicators and completion tracking

### 🏥 Health Check-in
- **Mood Tracking**: 5-point scale with emoji indicators
- **Energy Levels**: Daily energy assessment
- **Health Questions**: Customizable health questionnaires
- **Notes**: Optional text notes for additional context

### 🚨 Emergency Features
- **Emergency Button**: One-tap emergency contact access
- **Quick Actions**: Direct access to emergency services
- **Location Sharing**: Share location with emergency contacts
- **Medical Info**: Quick access to important medical information

### 🌐 Community Resources
- **Resource Directory**: Local healthcare and support resources
- **Category Filtering**: Filter by healthcare, transportation, social, emergency
- **Contact Integration**: Direct calling and email capabilities
- **Location-Based**: Find resources near the user

## Technical Architecture

### Frontend Framework
- **React Native for Web**: Cross-platform compatibility
- **TypeScript**: Type-safe development
- **Webpack**: Modern bundling and development server

### State Management
- **React Context**: Accessibility settings and app state
- **AsyncStorage**: Local data persistence
- **Service Layer**: Business logic separation

### Data Layer
- **DataAccessLayer**: Centralized data access
- **Service Classes**: Medication, Communication, Activities services
- **Mock Data**: Test data utilities for development

### Accessibility
- **Screen Reader Support**: Full VoiceOver/TalkBack compatibility
- **High Contrast**: Enhanced visibility options
- **Large Touch Targets**: 44px minimum touch areas
- **Keyboard Navigation**: Full keyboard accessibility

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Running the Application
```bash
npm run web
```

The application will be available at `http://localhost:3006`

### Available Scripts
- `npm run web`: Start development server
- `npm run build`: Build for production
- `npm run test`: Run test suite

## Project Structure

```
BuddyMate/
├── src/
│   ├── components/          # React components
│   │   ├── foundation/     # Base UI components
│   │   └── ...
│   ├── screens/            # Screen components
│   ├── services/           # Business logic services
│   ├── contexts/           # React contexts
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── storage/            # Data persistence layer
├── public/                 # Static assets
├── .kiro/                  # Kiro documentation
└── webpack.config.js       # Webpack configuration
```

## Key Components

### Foundation Components
- **Button**: Accessible button with multiple variants
- **Card**: Flexible card component for content display
- **Text**: Typography component with accessibility features
- **Input**: Form input with validation support

### Service Classes
- **MedicationReminderService**: Medication management logic
- **CommunicationService**: Family contact and messaging
- **ActivitiesService**: Daily routine management
- **CheckInService**: Health check-in functionality

### Data Management
- **DataAccessLayer**: Centralized data access
- **AsyncStorageWrapper**: Cross-platform storage abstraction
- **Test Data Utilities**: Development and testing helpers

## Accessibility Features

### Screen Reader Support
- Proper ARIA labels and roles
- Semantic HTML structure
- Focus management
- Screen reader announcements

### Visual Accessibility
- High contrast mode
- Large text options
- Clear visual hierarchy
- Consistent color schemes

### Motor Accessibility
- Large touch targets (44px minimum)
- Gesture alternatives
- Keyboard navigation
- Voice command support

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Service layer testing
- Utility function testing

### Integration Tests
- End-to-end user flows
- Data persistence testing
- Cross-module integration

### Accessibility Testing
- Automated accessibility audits
- Screen reader testing
- Keyboard navigation testing

## Performance Optimizations

### Bundle Optimization
- Code splitting by routes
- Tree shaking for unused code
- Asset optimization
- Lazy loading for components

### Runtime Performance
- Memoization for expensive calculations
- Efficient re-rendering
- Optimized state updates
- Background data synchronization

## Security Considerations

### Data Protection
- Local data encryption
- Secure storage practices
- Input validation
- XSS prevention

### Privacy Features
- Granular privacy controls
- Data sharing permissions
- Anonymized analytics
- GDPR compliance

## Deployment

### Web Deployment
- Static site generation
- CDN optimization
- Progressive Web App features
- Service worker for offline support

### Mobile Deployment
- React Native build process
- App store optimization
- Native performance tuning
- Platform-specific features

## Future Enhancements

### Planned Features
- **Voice Commands**: Hands-free operation
- **AI Integration**: Smart medication reminders
- **Telemedicine**: Video call integration
- **Wearable Integration**: Health device connectivity

### Technical Improvements
- **Offline Support**: Full offline functionality
- **Real-time Sync**: Multi-device synchronization
- **Advanced Analytics**: Health trend analysis
- **Machine Learning**: Predictive health insights

## Contributing

### Development Guidelines
- Follow TypeScript best practices
- Maintain accessibility standards
- Write comprehensive tests
- Document new features

### Code Review Process
- Accessibility review required
- Performance impact assessment
- Security review for new features
- User experience validation

## Support and Documentation

### User Documentation
- In-app tutorials
- Help system integration
- Video guides
- FAQ section

### Technical Documentation
- API documentation
- Component library
- Architecture diagrams
- Deployment guides

---

**BuddyMate** - Empowering seniors to take control of their health and stay connected with their loved ones.

*Built with ❤️ for the Kiro Hackathon* 