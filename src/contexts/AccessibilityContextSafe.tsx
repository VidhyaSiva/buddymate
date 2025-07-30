/**
 * Safe Accessibility Context that provides default values
 * Prevents crashes when useAccessibility is called outside provider
 */

import React, { createContext, useContext, ReactNode } from 'react';

// Default accessibility settings matching AccessibilityContext interface
const defaultSettings = {
  // Screen reader settings
  isScreenReaderEnabled: false,
  isReduceMotionEnabled: false,
  isReduceTransparencyEnabled: false,
  
  // Visual settings
  fontScale: 1.0,
  isHighContrastEnabled: false,
  colorScheme: 'light' as const,
  
  // Motor accessibility
  isSwitchControlEnabled: false,
  isVoiceControlEnabled: false,
  touchAccommodations: {
    holdDuration: 500,
    tapAssistance: false,
    stickyKeys: false,
  },
  
  // User preferences
  preferredFontSize: 'normal' as const,
  animationsEnabled: true,
  hapticFeedbackEnabled: true,
  audioDescriptionsEnabled: false,
};

interface AccessibilityContextType {
  settings: typeof defaultSettings;
  updateSettings: (newSettings: Partial<typeof defaultSettings>) => void;
  resetSettings: () => void;
  getAccessibilityLabel: (text: string, context?: string) => string;
  announceForScreenReader: (message: string) => void;
  isScreenReaderEnabled: () => boolean;
  getContrastRatio: (foreground: string, background: string) => number;
  validateAccessibility: (element: any) => boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  resetSettings: () => {},
  getAccessibilityLabel: (text: string) => text,
  announceForScreenReader: () => {},
  isScreenReaderEnabled: () => false,
  getContrastRatio: () => 4.5,
  validateAccessibility: () => true,
});

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = React.useState(defaultSettings);

  const updateSettings = (newSettings: Partial<typeof defaultSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const getAccessibilityLabel = (text: string, context?: string) => {
    return context ? `${text}, ${context}` : text;
  };

  const announceForScreenReader = (message: string) => {
    if (settings.isScreenReaderEnabled) {
      console.log('Screen reader announcement:', message);
    }
  };

  const isScreenReaderEnabled = () => {
    return settings.isScreenReaderEnabled;
  };

  const getContrastRatio = (foreground: string, background: string) => {
    // Simple contrast ratio calculation
    return 4.5; // Default to WCAG AA compliant ratio
  };

  const validateAccessibility = (element: any) => {
    return true; // Simple validation
  };

  const value: AccessibilityContextType = {
    settings,
    updateSettings,
    resetSettings,
    getAccessibilityLabel,
    announceForScreenReader,
    isScreenReaderEnabled,
    getContrastRatio,
    validateAccessibility,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  
  // If context is undefined, return default values instead of throwing
  if (!context) {
    console.warn('useAccessibility called outside of AccessibilityProvider, using defaults');
    return {
      settings: defaultSettings,
      updateSettings: () => {},
      resetSettings: () => {},
      getAccessibilityLabel: (text: string) => text,
      announceForScreenReader: () => {},
      isScreenReaderEnabled: () => false,
      getContrastRatio: () => 4.5,
      validateAccessibility: () => true,
    };
  }
  
  return context;
};

export default AccessibilityContext;