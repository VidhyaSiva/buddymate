import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AccessibilityInfo, Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AccessibilitySettings {
  // Screen reader settings
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  
  // Visual settings
  fontScale: number;
  isHighContrastEnabled: boolean;
  colorScheme: 'light' | 'dark' | 'high-contrast';
  
  // Motor accessibility
  isSwitchControlEnabled: boolean;
  isVoiceControlEnabled: boolean;
  touchAccommodations: {
    holdDuration: number;
    tapAssistance: boolean;
    stickyKeys: boolean;
  };
  
  // User preferences
  preferredFontSize: 'normal' | 'large' | 'extra-large';
  animationsEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  audioDescriptionsEnabled: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  isAccessibilityFeatureEnabled: (feature: keyof AccessibilitySettings) => boolean;
}

const defaultSettings: AccessibilitySettings = {
  isScreenReaderEnabled: false,
  isReduceMotionEnabled: false,
  isReduceTransparencyEnabled: false,
  fontScale: 1.0,
  isHighContrastEnabled: false,
  colorScheme: 'light',
  isSwitchControlEnabled: false,
  isVoiceControlEnabled: false,
  touchAccommodations: {
    holdDuration: 500,
    tapAssistance: false,
    stickyKeys: false,
  },
  preferredFontSize: 'normal',
  animationsEnabled: true,
  hapticFeedbackEnabled: true,
  audioDescriptionsEnabled: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = '@buddy_mate_accessibility_settings';

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  useEffect(() => {
    loadSettings();
    setupSystemListeners();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const storedSettings = stored ? JSON.parse(stored) : {};
      
      // Get system accessibility settings
      const systemSettings = await getSystemAccessibilitySettings();
      
      // Merge stored settings with system settings
      const mergedSettings = {
        ...defaultSettings,
        ...storedSettings,
        ...systemSettings,
      };
      
      setSettings(mergedSettings);
    } catch (error) {
      console.error('Failed to load accessibility settings:', error);
      setSettings(defaultSettings);
    }
  };

  const getSystemAccessibilitySettings = async (): Promise<Partial<AccessibilitySettings>> => {
    try {
      const [
        isScreenReaderEnabled,
        isReduceMotionEnabled,
        isReduceTransparencyEnabled,
        isSwitchControlEnabled,
        isVoiceControlEnabled,
      ] = await Promise.all([
        AccessibilityInfo.isScreenReaderEnabled(),
        AccessibilityInfo.isReduceMotionEnabled(),
        AccessibilityInfo.isReduceTransparencyEnabled(),
        AccessibilityInfo.isSwitchControlEnabled(),
        AccessibilityInfo.isVoiceOverEnabled(), // iOS VoiceOver as proxy for voice control
      ]);

      const colorScheme = Appearance.getColorScheme();

      return {
        isScreenReaderEnabled,
        isReduceMotionEnabled,
        isReduceTransparencyEnabled,
        isSwitchControlEnabled,
        isVoiceControlEnabled,
        colorScheme: colorScheme === 'dark' ? 'dark' : 'light',
        animationsEnabled: !isReduceMotionEnabled,
      };
    } catch (error) {
      console.error('Failed to get system accessibility settings:', error);
      return {};
    }
  };

  const setupSystemListeners = () => {
    const listeners = [
      AccessibilityInfo.addEventListener('screenReaderChanged', (isEnabled) => {
        updateSettings({ isScreenReaderEnabled: isEnabled });
      }),
      AccessibilityInfo.addEventListener('reduceMotionChanged', (isEnabled) => {
        updateSettings({ 
          isReduceMotionEnabled: isEnabled,
          animationsEnabled: !isEnabled 
        });
      }),
      AccessibilityInfo.addEventListener('reduceTransparencyChanged', (isEnabled) => {
        updateSettings({ isReduceTransparencyEnabled: isEnabled });
      }),
      Appearance.addChangeListener(({ colorScheme }) => {
        updateSettings({ 
          colorScheme: colorScheme === 'dark' ? 'dark' : 'light' 
        });
      }),
    ];

    return () => {
      listeners.forEach(listener => listener?.remove());
    };
  };

  const updateSettings = async (updates: Partial<AccessibilitySettings>) => {
    try {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to update accessibility settings:', error);
    }
  };

  const resetToDefaults = async () => {
    try {
      const systemSettings = await getSystemAccessibilitySettings();
      const resetSettings = { ...defaultSettings, ...systemSettings };
      setSettings(resetSettings);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(resetSettings));
    } catch (error) {
      console.error('Failed to reset accessibility settings:', error);
    }
  };

  const isAccessibilityFeatureEnabled = (feature: keyof AccessibilitySettings): boolean => {
    const value = settings[feature];
    return typeof value === 'boolean' ? value : false;
  };

  const contextValue: AccessibilityContextType = {
    settings,
    updateSettings,
    resetToDefaults,
    isAccessibilityFeatureEnabled,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};