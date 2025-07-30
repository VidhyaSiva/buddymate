import { useEffect, useCallback } from 'react';
import { AccessibilityInfo, Alert } from 'react-native';
import { useAccessibility } from '../contexts/AccessibilityContext';

export interface AccessibilityShortcut {
  name: string;
  description: string;
  action: () => void;
  voiceCommands: string[];
  keyboardShortcut?: string;
}

export const useAccessibilityShortcuts = (shortcuts: AccessibilityShortcut[]) => {
  const { settings } = useAccessibility();

  // Handle voice commands
  const handleVoiceCommand = useCallback((command: string) => {
    const normalizedCommand = command.toLowerCase().trim();
    
    for (const shortcut of shortcuts) {
      for (const voiceCommand of shortcut.voiceCommands) {
        if (normalizedCommand.includes(voiceCommand.toLowerCase())) {
          shortcut.action();
          
          // Announce action completion
          if (settings.isScreenReaderEnabled) {
            AccessibilityInfo.announceForAccessibility(
              `${shortcut.description} activated`
            );
          }
          return true;
        }
      }
    }
    
    return false;
  }, [shortcuts, settings.isScreenReaderEnabled]);

  // Set up accessibility shortcuts
  useEffect(() => {
    if (!settings.isVoiceControlEnabled && !settings.isSwitchControlEnabled) {
      return;
    }

    // Register accessibility shortcuts with the system
    const accessibilityActions = shortcuts.map(shortcut => ({
      name: shortcut.name,
      label: shortcut.description,
    }));

    // This would typically be registered with a parent component
    // that can handle accessibility actions
    
    return () => {
      // Cleanup shortcuts
    };
  }, [shortcuts, settings.isVoiceControlEnabled, settings.isSwitchControlEnabled]);

  // Show available shortcuts
  const showShortcutsHelp = useCallback(() => {
    const shortcutsList = shortcuts
      .map(shortcut => `• ${shortcut.description}: "${shortcut.voiceCommands[0]}"`)
      .join('\n');

    Alert.alert(
      'Available Voice Commands',
      `You can use these voice commands:\n\n${shortcutsList}`,
      [{ text: 'OK' }]
    );
  }, [shortcuts]);

  return {
    handleVoiceCommand,
    showShortcutsHelp,
  };
};

// Common accessibility shortcuts for the app
export const getCommonAccessibilityShortcuts = (navigation: any): AccessibilityShortcut[] => [
  {
    name: 'go_home',
    description: 'Go to home screen',
    action: () => navigation.navigate('Home'),
    voiceCommands: ['go home', 'home screen', 'main screen'],
    keyboardShortcut: 'Cmd+H',
  },
  {
    name: 'emergency',
    description: 'Open emergency screen',
    action: () => navigation.navigate('Emergency'),
    voiceCommands: ['emergency', 'help me', 'call for help'],
    keyboardShortcut: 'Cmd+E',
  },
  {
    name: 'family',
    description: 'Open family connections',
    action: () => navigation.navigate('Family'),
    voiceCommands: ['call family', 'family screen', 'contact family'],
    keyboardShortcut: 'Cmd+F',
  },
  {
    name: 'medication',
    description: 'Open medication reminders',
    action: () => navigation.navigate('Medication'),
    voiceCommands: ['medication', 'pills', 'medicine'],
    keyboardShortcut: 'Cmd+M',
  },
  {
    name: 'settings',
    description: 'Open accessibility settings',
    action: () => navigation.navigate('AccessibilitySettings'),
    voiceCommands: ['settings', 'accessibility', 'preferences'],
    keyboardShortcut: 'Cmd+,',
  },
  {
    name: 'help',
    description: 'Show help and shortcuts',
    action: () => {}, // Will be set by the component using this hook
    voiceCommands: ['help', 'what can I say', 'voice commands'],
    keyboardShortcut: 'Cmd+?',
  },
];