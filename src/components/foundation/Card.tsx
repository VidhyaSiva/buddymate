import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  AccessibilityRole,
  Vibration,
} from 'react-native';
import { useAccessibility } from '../../contexts/AccessibilityContextSafe';
import { getTheme } from '../../themes/AccessibilityTheme';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'small' | 'medium' | 'large';
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityActions?: Array<{
    name: string;
    label: string;
  }>;
  onAccessibilityAction?: (event: { nativeEvent: { actionName: string } }) => void;
  testID?: string;
  style?: ViewStyle;
  hapticFeedback?: boolean;
  focusable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'default',
  padding = 'medium',
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  accessibilityActions,
  onAccessibilityAction,
  testID,
  style,
  hapticFeedback = true,
  focusable = true,
}) => {
  const { settings } = useAccessibility();
  const theme = getTheme(settings);

  const handlePress = () => {
    if (onPress) {
      // Provide haptic feedback if enabled
      if (hapticFeedback && settings.hapticFeedbackEnabled) {
        Vibration.vibrate(50);
      }
      onPress();
    }
  };

  const cardStyle = [
    getBaseCardStyle(theme, settings),
    getVariantStyle(variant, theme, settings),
    getPaddingStyle(padding, theme),
    onPress && getInteractiveStyle(theme, settings),
    style,
  ];

  const CardComponent = onPress ? TouchableOpacity : View;

  const accessibilityProps = accessible
    ? {
        accessible: true,
        accessibilityLabel,
        accessibilityHint,
        accessibilityRole: accessibilityRole || (onPress ? 'button' : 'none'),
        accessibilityActions,
        onAccessibilityAction,
        testID,
        focusable: focusable && onPress !== undefined,
        ...(onPress && { 
          activeOpacity: settings.isReduceMotionEnabled ? 1.0 : 0.8,
          delayLongPress: settings.touchAccommodations.holdDuration,
        }),
      }
    : {};

  return (
    <CardComponent
      style={cardStyle}
      onPress={handlePress}
      {...accessibilityProps}
    >
      {children}
    </CardComponent>
  );
};

// Helper functions for dynamic styling
const getBaseCardStyle = (theme: any, settings: any): ViewStyle => ({
  borderRadius: theme.borderRadius.medium,
  backgroundColor: theme.colors.card,
  minHeight: settings.isSwitchControlEnabled 
    ? theme.touchTargets.large 
    : theme.touchTargets.minimum,
});

const getVariantStyle = (variant: string, theme: any, settings: any): ViewStyle => {
  const baseStyle: ViewStyle = {};
  
  switch (variant) {
    case 'elevated':
      return {
        ...baseStyle,
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: settings.isReduceTransparencyEnabled ? 0.2 : 0.1,
        shadowRadius: 4,
        elevation: 3,
      };
    case 'outlined':
      return {
        ...baseStyle,
        borderWidth: settings.isHighContrastEnabled ? 2 : 1,
        borderColor: theme.colors.border,
      };
    case 'default':
    default:
      return baseStyle;
  }
};

const getPaddingStyle = (padding: string, theme: any): ViewStyle => {
  switch (padding) {
    case 'small':
      return { padding: theme.spacing.sm };
    case 'large':
      return { padding: theme.spacing.lg };
    case 'medium':
    default:
      return { padding: theme.spacing.md };
  }
};

const getInteractiveStyle = (theme: any, settings: any): ViewStyle => ({
  // Add extra margin for switch control
  margin: settings.isSwitchControlEnabled ? theme.spacing.xs : 0,
});

// Styles are now dynamically generated based on accessibility settings and theme