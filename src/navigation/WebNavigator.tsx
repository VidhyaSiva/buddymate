/**
 * Web-compatible navigation system for BuddyMate
 * Provides a simple tab-based navigation for web browsers
 */

import React, { useState } from 'react';
import { View, Text } from '../utils/ReactNativeWeb';
import { theme } from '../themes/AppTheme';

// Mobile-optimized Dashboard screen
const DashboardScreen = () => {
  const [checkInStatus, setCheckInStatus] = React.useState('pending');
  const [lastSync, setLastSync] = React.useState(new Date().toLocaleTimeString());

  return (
    <View style={{ 
      flex: 1, 
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background.primary,
    }}>
      {/* Welcome Section */}
      <View style={{
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        paddingTop: theme.spacing.md,
      }}>
        <Text style={{ 
          fontSize: theme.typography.fontSize['2xl'], 
          color: theme.colors.text.primary,
          fontWeight: theme.typography.fontWeight.bold,
          textAlign: 'center',
          marginBottom: theme.spacing.sm,
        }}>
          5:35 PM
        </Text>
        <Text style={{ 
          fontSize: theme.typography.fontSize.md, 
          color: theme.colors.text.secondary,
          textAlign: 'center',
          marginBottom: theme.spacing.md,
        }}>
          Wednesday, July 30
        </Text>
        
        {/* Weather Card */}
        <View style={{
          backgroundColor: theme.colors.background.secondary,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.xl,
          alignItems: 'center',
          marginBottom: theme.spacing.md,
          minWidth: 200,
        }}>
          <Text style={{ 
            fontSize: theme.typography.fontSize['3xl'],
            marginBottom: theme.spacing.sm,
          }}>
            ☀️
          </Text>
          <Text style={{ 
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.xs,
          }}>
            72°F
          </Text>
          <Text style={{ 
            fontSize: theme.typography.fontSize.md,
            color: theme.colors.text.secondary,
          }}>
            Sunny
          </Text>
        </View>
      </View>

      {/* Check In Today Button */}
      <View style={{
        backgroundColor: 'transparent',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.xl,
        marginBottom: theme.spacing.md,
        alignItems: 'center',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        }}>
          <View style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: theme.colors.neutral[400],
            marginRight: theme.spacing.sm,
          }} />
          <Text style={{ 
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
          }}>
            Check In Today
          </Text>
        </View>
        <Text style={{ 
          fontSize: theme.typography.fontSize.md,
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing.md,
          textAlign: 'center',
        }}>
          How are you feeling today?
        </Text>
        <View style={{ 
          flexDirection: 'row', 
          gap: theme.spacing.md,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {['😊', '😐', '😔'].map((emoji, index) => (
            <View
              key={index}
              style={{
                padding: theme.spacing.lg,
                backgroundColor: checkInStatus === emoji ? theme.colors.primary[200] : theme.colors.background.secondary,
                borderRadius: theme.borderRadius.xl,
                cursor: 'pointer',
                minWidth: theme.layout.touchTarget.large,
                minHeight: theme.layout.touchTarget.large,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: checkInStatus === emoji ? theme.colors.primary[400] : theme.colors.border.light,
              }}
              onClick={() => setCheckInStatus(emoji)}
            >
              <Text style={{ fontSize: theme.typography.fontSize['2xl'] }}>{emoji}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Emergency Help Button */}
      <View style={{
        backgroundColor: theme.colors.emergency[500],
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.xl,
        marginBottom: theme.spacing.md,
        alignItems: 'center',
        cursor: 'pointer',
        minHeight: theme.layout.touchTarget.large,
        justifyContent: 'center',
      }}>
        <Text style={{ 
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.text.inverse,
          fontWeight: theme.typography.fontWeight.bold,
        }}>
          🚨 Emergency Help
        </Text>
      </View>

      {/* Quick Access Cards */}
      <View style={{ gap: theme.spacing.sm }}>
        {[
          { icon: '❤️', title: 'Health', subtitle: 'Daily check-in' },
          { icon: '👥', title: 'Family', subtitle: 'Stay connected' },
          { icon: '💊', title: 'Medicine', subtitle: 'Reminders' },
          { icon: '📋', title: 'Activities', subtitle: 'Daily routine' },
          { icon: '🏘️', title: 'Community', subtitle: 'Local resources' },
        ].map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'transparent',
              padding: theme.spacing.lg,
              borderRadius: theme.borderRadius.lg,
              cursor: 'pointer',
              minHeight: theme.layout.touchTarget.medium,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border.light,
            }}
          >
            <Text style={{ 
              fontSize: theme.typography.fontSize['2xl'],
              marginRight: theme.spacing.lg,
              width: 40,
              textAlign: 'center',
            }}>
              {item.icon}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.xs,
              }}>
                {item.title}
              </Text>
              <Text style={{ 
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.text.secondary,
              }}>
                {item.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const CommunicationScreen = () => {
  const [contacts] = React.useState([
    { id: '1', name: 'Sarah', relationship: 'Daughter', phone: '555-0123', lastCall: '2 hours ago', photo: '👩', status: 'online' },
    { id: '2', name: 'Michael', relationship: 'Son', phone: '555-0124', lastCall: 'Yesterday', photo: '👨', status: 'offline' },
    { id: '3', name: 'Dr. Johnson', relationship: 'Doctor', phone: '555-0125', lastCall: 'Last week', photo: '👨‍⚕️', status: 'busy' },
  ]);

  return (
    <View style={{ 
      flex: 1, 
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background.primary,
    }}>
      <Text style={{ 
        fontSize: theme.typography.fontSize.xl, 
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.lg,
        fontWeight: theme.typography.fontWeight.bold,
        textAlign: 'center',
        paddingTop: theme.spacing.md,
      }}>
        📞 Family & Friends
      </Text>
      
      {contacts.map((contact) => (
        <View
          key={contact.id}
          style={{
            backgroundColor: theme.colors.background.secondary,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.xl,
            marginBottom: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
          }}
        >
          {/* Contact Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
          }}>
            <Text style={{ 
              fontSize: theme.typography.fontSize['3xl'], 
              marginRight: theme.spacing.md 
            }}>
              {contact.photo}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.bold,
                marginBottom: theme.spacing.xs,
                color: theme.colors.text.primary,
              }}>
                {contact.name}
              </Text>
              <Text style={{ 
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.xs,
              }}>
                {contact.relationship}
              </Text>
              <Text style={{ 
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
              }}>
                Last call: {contact.lastCall}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{
            flexDirection: 'row',
            gap: theme.spacing.sm,
          }}>
            <View style={{
              flex: 1,
              backgroundColor: theme.colors.primary[500],
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.lg,
              cursor: 'pointer',
              minHeight: theme.layout.touchTarget.medium,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ 
                color: theme.colors.text.inverse,
                fontSize: theme.typography.fontSize.md,
                fontWeight: theme.typography.fontWeight.semibold,
              }}>
                📞 Call
              </Text>
            </View>
            <View style={{
              flex: 1,
              backgroundColor: theme.colors.secondary[500],
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.lg,
              cursor: 'pointer',
              minHeight: theme.layout.touchTarget.medium,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ 
                color: theme.colors.text.inverse,
                fontSize: theme.typography.fontSize.md,
                fontWeight: theme.typography.fontWeight.semibold,
              }}>
                💬 Message
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const HealthScreen = () => {
  const [medications, setMedications] = React.useState([
    { id: '1', name: 'Blood Pressure', time: '8:00 AM', taken: true, nextDue: '8:00 PM', icon: '🩺' },
    { id: '2', name: 'Vitamin D', time: '12:00 PM', taken: true, nextDue: 'Tomorrow 12:00 PM', icon: '☀️' },
    { id: '3', name: 'Heart Medication', time: '6:00 PM', taken: false, nextDue: 'Due now', icon: '❤️' },
  ]);

  const takeMedication = (id: string) => {
    setMedications(prev => prev.map(med => 
      med.id === id ? { ...med, taken: true, nextDue: 'Taken today' } : med
    ));
  };

  return (
    <View style={{ 
      flex: 1, 
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background.primary,
    }}>
      <Text style={{ 
        fontSize: theme.typography.fontSize.xl, 
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
        fontWeight: theme.typography.fontWeight.bold,
        textAlign: 'center',
        paddingTop: theme.spacing.md,
      }}>
        💊 Health & Wellness
      </Text>

      {/* Health Summary */}
      <View style={{
        backgroundColor: theme.colors.success[100],
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.xl,
        marginBottom: theme.spacing.lg,
        alignItems: 'center',
      }}>
        <Text style={{ 
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.success[700],
          marginBottom: theme.spacing.sm,
        }}>
          Today's Progress
        </Text>
        <Text style={{ 
          fontSize: theme.typography.fontSize.md,
          color: theme.colors.success[600],
        }}>
          2 of 3 medications taken ✅
        </Text>
      </View>
      
      <Text style={{ 
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.semibold,
        marginBottom: theme.spacing.md,
        color: theme.colors.text.primary,
      }}>
        Today's Medications
      </Text>

      {medications.map((med) => (
        <View
          key={med.id}
          style={{
            backgroundColor: med.taken ? theme.colors.success[50] : theme.colors.warning[50],
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.xl,
            marginBottom: theme.spacing.md,
            borderWidth: 2,
            borderColor: med.taken ? theme.colors.success[200] : theme.colors.warning[300],
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
          }}>
            <Text style={{ 
              fontSize: theme.typography.fontSize['2xl'],
              marginRight: theme.spacing.md,
            }}>
              {med.icon}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.bold,
                marginBottom: theme.spacing.xs,
                color: theme.colors.text.primary,
              }}>
                {med.name}
              </Text>
              <Text style={{ 
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.xs,
              }}>
                Scheduled: {med.time}
              </Text>
              <Text style={{ 
                fontSize: theme.typography.fontSize.md,
                color: med.taken ? theme.colors.success[600] : theme.colors.warning[600],
                fontWeight: theme.typography.fontWeight.semibold,
              }}>
                {med.taken ? '✅ Taken' : `⏰ ${med.nextDue}`}
              </Text>
            </View>
          </View>

          {!med.taken && (
            <View style={{
              backgroundColor: theme.colors.success[500],
              padding: theme.spacing.lg,
              borderRadius: theme.borderRadius.lg,
              cursor: 'pointer',
              minHeight: theme.layout.touchTarget.medium,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => takeMedication(med.id)}
            >
              <Text style={{ 
                color: theme.colors.text.inverse,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.bold,
              }}>
                ✓ Mark as Taken
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const EmergencyScreen = () => {
  const [emergencyContacts] = React.useState([
    { id: '1', name: 'Sarah', relationship: 'Daughter', phone: '555-0123', type: 'Primary Contact', icon: '👩' },
    { id: '2', name: 'Michael', relationship: 'Son', phone: '555-0124', type: 'Secondary Contact', icon: '👨' },
    { id: '3', name: '911', relationship: 'Emergency Services', phone: '911', type: 'Emergency Services', icon: '🚨' },
  ]);

  return (
    <View style={{ 
      flex: 1, 
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background.primary,
    }}>
      <Text style={{ 
        fontSize: theme.typography.fontSize.xl, 
        color: theme.colors.emergency[600],
        marginBottom: theme.spacing.lg,
        fontWeight: theme.typography.fontWeight.bold,
        textAlign: 'center',
        paddingTop: theme.spacing.md,
      }}>
        🚨 Emergency Help
      </Text>
      
      {/* Main Emergency Button */}
      <View style={{
        backgroundColor: theme.colors.emergency[500],
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.xl,
        marginBottom: theme.spacing.lg,
        alignItems: 'center',
        cursor: 'pointer',
        minHeight: 120,
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: theme.colors.emergency[600],
        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
      }}>
        <Text style={{ 
          fontSize: theme.typography.fontSize['4xl'], 
          color: theme.colors.text.inverse,
          fontWeight: theme.typography.fontWeight.bold,
          marginBottom: theme.spacing.sm,
        }}>
          🚨
        </Text>
        <Text style={{ 
          fontSize: theme.typography.fontSize.xl, 
          color: theme.colors.text.inverse,
          fontWeight: theme.typography.fontWeight.bold,
          textAlign: 'center',
          marginBottom: theme.spacing.xs,
        }}>
          EMERGENCY
        </Text>
        <Text style={{ 
          fontSize: theme.typography.fontSize.md, 
          color: theme.colors.text.inverse,
          textAlign: 'center',
        }}>
          Tap for immediate help
        </Text>
      </View>

      {/* Emergency Contacts */}
      <Text style={{ 
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
        marginBottom: theme.spacing.md,
        color: theme.colors.text.primary,
      }}>
        Emergency Contacts
      </Text>

      {emergencyContacts.map((contact) => (
        <View
          key={contact.id}
          style={{
            backgroundColor: theme.colors.emergency[50],
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.xl,
            marginBottom: theme.spacing.md,
            borderWidth: 2,
            borderColor: theme.colors.emergency[200],
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
          }}>
            <Text style={{ 
              fontSize: theme.typography.fontSize['2xl'],
              marginRight: theme.spacing.md,
            }}>
              {contact.icon}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.bold,
                marginBottom: theme.spacing.xs,
                color: theme.colors.text.primary,
              }}>
                {contact.name}
              </Text>
              <Text style={{ 
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.xs,
              }}>
                {contact.relationship}
              </Text>
              <Text style={{ 
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.emergency[600],
                fontWeight: theme.typography.fontWeight.medium,
              }}>
                {contact.type}
              </Text>
            </View>
          </View>

          <View style={{
            backgroundColor: theme.colors.emergency[500],
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
            cursor: 'pointer',
            minHeight: theme.layout.touchTarget.medium,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ 
              color: theme.colors.text.inverse,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
            }}>
              📞 CALL {contact.phone}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const screens = [
  { key: 'dashboard', title: 'Home', icon: '🏠', component: DashboardScreen },
  { key: 'communication', title: 'Family', icon: '📞', component: CommunicationScreen },
  { key: 'health', title: 'Health', icon: '💊', component: HealthScreen },
  { key: 'emergency', title: 'Emergency', icon: '🚨', component: EmergencyScreen },
];

export const WebNavigator: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState('dashboard');

  const ActiveComponent = screens.find(screen => screen.key === activeScreen)?.component || DashboardScreen;

  return (
    <View style={{ 
      flex: 1, 
      height: '100vh',
      backgroundColor: theme.colors.background.primary,
      maxWidth: '100vw',
      overflow: 'hidden',
    }}>
      {/* Mobile-Optimized Header */}
      <View style={{
        backgroundColor: theme.colors.primary[500],
        padding: theme.spacing.md,
        paddingTop: theme.spacing.lg,
        alignItems: 'center',
        minHeight: 70,
        justifyContent: 'center',
      }}>
        <Text style={{
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.text.inverse,
          fontWeight: theme.typography.fontWeight.bold,
          textAlign: 'center',
        }}>
          BuddyMate
        </Text>
        <Text style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.inverse,
          opacity: 0.9,
          textAlign: 'center',
        }}>
          Your Companion App
        </Text>
      </View>

      {/* Scrollable Content */}
      <View style={{ 
        flex: 1,
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        <ActiveComponent />
      </View>

      {/* Mobile-Optimized Tab Bar */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.background.primary,
        borderTopWidth: 2,
        borderTopColor: theme.colors.border.medium,
        height: 90,
        paddingBottom: 10,
        paddingTop: 5,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      }}>
        {screens.map((screen) => (
          <View
            key={screen.key}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              padding: theme.spacing.xs,
              backgroundColor: activeScreen === screen.key 
                ? theme.colors.primary[100] 
                : 'transparent',
              cursor: 'pointer',
              borderRadius: theme.borderRadius.lg,
              margin: theme.spacing.xs,
              minHeight: theme.layout.touchTarget.large,
              border: activeScreen === screen.key 
                ? `2px solid ${theme.colors.primary[300]}` 
                : '2px solid transparent',
            }}
            onClick={() => setActiveScreen(screen.key)}
          >
            <Text style={{
              fontSize: theme.typography.fontSize.xl,
              marginBottom: theme.spacing.xs,
            }}>
              {screen.icon}
            </Text>
            <Text style={{
              fontSize: theme.typography.fontSize.xs,
              color: activeScreen === screen.key 
                ? theme.colors.primary[700] 
                : theme.colors.text.secondary,
              fontWeight: activeScreen === screen.key 
                ? theme.typography.fontWeight.bold 
                : theme.typography.fontWeight.medium,
              textAlign: 'center',
              lineHeight: theme.typography.lineHeight.xs,
            }}>
              {screen.title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};