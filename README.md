# BuddyMate - Senior Companion App

A comprehensive companion application designed specifically for seniors, providing easy access to health management, family communication, emergency services, and daily activities.

## 🌟 Features

### 🏠 **Dashboard**
- Daily check-in with mood tracking
- Weather information
- Quick access to all features
- Real-time sync status

### 📞 **Family & Friends**
- Easy-to-use contact management
- One-touch calling and messaging
- Large photos for easy identification
- Last contact tracking

### 💊 **Health & Wellness**
- Medication reminder system
- Progress tracking (2/3 medications taken)
- Interactive "Mark as Taken" buttons
- Visual status indicators

### 🚨 **Emergency Services**
- Large, prominent emergency button
- Quick access to emergency contacts
- 911 integration
- Location sharing capabilities

## 🎯 **Senior-Friendly Design**

- **Large Touch Targets**: Minimum 44pt for easy tapping
- **High Contrast Colors**: WCAG 2.1 AA compliant
- **Large Fonts**: Minimum 18pt for better readability
- **Simple Navigation**: Clear, intuitive interface
- **Voice Support**: Text-to-speech capabilities
- **Accessibility**: Screen reader compatible

## 🚀 **Getting Started**

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/BuddyMate.git
cd BuddyMate
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run web
\`\`\`

4. Open your browser and navigate to \`http://localhost:3006\`

## 🧪 **Testing**

Run the comprehensive test suite:
\`\`\`bash
npm test
\`\`\`

Run integration tests:
\`\`\`bash
npm test -- --run src/tests/integration/
\`\`\`

Generate accessibility report:
\`\`\`bash
npm run accessibility:report
\`\`\`

## 🏗️ **Architecture**

### Core Services
- **AppIntegration**: Central service coordination
- **CrashReportingService**: Error logging and reporting
- **NotificationService**: Medication and appointment reminders
- **VoiceService**: Text-to-speech and voice commands
- **EmergencyService**: Emergency contact management
- **AuthenticationService**: Secure user authentication

### Key Components
- **WebNavigator**: Mobile-optimized navigation
- **AccessibilityContext**: WCAG compliance features
- **ErrorBoundary**: Graceful error handling
- **Theme System**: Consistent design language

## 📱 **Mobile Optimization**

The app is fully optimized for mobile devices with:
- Responsive design that adapts to screen sizes
- Touch-friendly interface elements
- Optimized performance for older devices
- Offline functionality for core features

## 🔒 **Security & Privacy**

- End-to-end encryption for health data
- Biometric authentication with PIN fallback
- Privacy-conscious error logging
- HIPAA compliance considerations
- User-controlled data sharing

## 🎨 **Accessibility Features**

- WCAG 2.1 AA compliance
- Screen reader support
- High contrast mode
- Large text support
- Voice navigation
- Keyboard navigation
- Reduced motion support

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Designed with input from senior user testing
- Built with accessibility-first principles
- Optimized for ease of use and reliability

## 📞 **Support**

For support, please contact [your-email@example.com] or open an issue on GitHub.

---

**BuddyMate** - Making technology accessible and friendly for seniors. 💙