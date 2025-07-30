import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
  Vibration,
} from 'react-native';
import { useAccessibility } from '../../contexts/AccessibilityContextSafe';
import { getTheme, getAccessibleButtonStyle, getAccessibleTextStyle } from '../../themes/AccessibilityTheme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'emergency';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityActions?: Array<{
    name: string;
    label: string;
  }>;
  onAccessibilityAction?: (event: { nativeEvent: { actionName: string } }) => void;
  testID?: string;
  hapticFeedback?: boolean;
  announceForAccessibility?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityActions,
  onAccessibilityAction,
  testID,
  hapticFeedback = true,
  announceForAccessibility,
}) => {
  const { settings } = useAccessibility();
  const theme = getTheme(settings);
  
  const handlePress = () => {
    // Provide haptic feedback if enabled (only on native platforms)
    if (hapticFeedback && settings.hapticFeedbackEnabled && !disabled) {
      try {
        Vibration.vibrate(50);
      } catch (error) {
        // Vibration not available on web, ignore
      }
    }
    
    onPress();
  };

  // Get accessible styles based on current theme and settings
  const buttonStyle = [
    getAccessibleButtonStyle(size, theme, settings),
    getVariantStyle(variant, theme, settings),
    disabled && getDisabledStyle(theme),
  ];

  const textStyle = [
    getAccessibleTextStyle('medium', theme, settings),
    getVariantTextStyle(variant, theme, settings),
    disabled && getDisabledTextStyle(theme),
  ];

  // Enhanced accessibility props
  const accessibilityProps = {
    accessible: true,
    accessibilityRole,
    accessibilityLabel: accessibilityLabel || title,
    accessibilityHint,
    accessibilityState: { 
      disabled,
      selected: variant === 'primary' // Indicate primary buttons as selected state
    },
    accessibilityActions,
    onAccessibilityAction,
    // Announce content changes for screen readers
    ...(announceForAccessibility && {
      accessibilityLiveRegion: 'polite' as const,
      accessibilityValue: { text: announceForAccessibility }
    }),
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      activeOpacity={settings.isReduceMotionEnabled ? 1.0 : 0.7}
      delayLongPress={settings.touchAccommodations.holdDuration}
      {...accessibilityProps}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

// Helper functions for dynamic styling
const getVariantStyle = (variant: string, theme: any, settings: any): ViewStyle => {
  const baseStyle: ViewStyle = {
    borderWidth: 2,
  };
  
  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.primary,
      };
    case 'emergency':
      return {
        ...baseStyle,
        backgroundColor: theme.colors.emergency,
        borderColor: theme.colors.emergency,
      };
    default:
      return baseStyle;
  }
};

const getVariantTextStyle = (variant: string, theme: any, settings: any): TextStyle => {
  const baseStyle: TextStyle = {
    fontWeight: '600',
    textAlign: 'center',
  };
  
  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        color: theme.colors.background, // White text on colored background
      };
    case 'secondary':
      return {
        ...baseStyle,
        color: theme.colors.primary,
      };
    case 'emergency':
      return {
        ...baseStyle,
        color: theme.colors.background, // White text on red background
      };
    default:
      return {
        ...baseStyle,
        color: theme.colors.text,
      };
  }
};

const getDisabledStyle = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.surface,
  borderColor: theme.colors.border,
});

const getDisabledTextStyle = (theme: any): TextStyle => ({
  color: theme.colors.textDisabled,
});

// Styles are now dynamically generated based on accessibility settings and theme