import { TextStyle, ViewStyle } from 'react-native';
import { AccessibilitySettings } from '../contexts/AccessibilityContext';

export interface ColorPalette {
  // Primary colors
  primary: string;
  primaryDark: string;
  primaryLight: string;
  
  // Secondary colors
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textDisabled: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Interactive colors
  link: string;
  linkVisited: string;
  
  // Border colors
  border: string;
  borderFocus: string;
  
  // Emergency colors
  emergency: string;
  emergencyDark: string;
}

export interface FontSizes {
  tiny: number;
  small: number;
  medium: number;
  large: number;
  xlarge: number;
  xxlarge: number;
  display: number;
}

export interface AccessibilityTheme {
  colors: ColorPalette;
  fonts: FontSizes;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
  touchTargets: {
    minimum: number;
    comfortable: number;
    large: number;
  };
  animations: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
    easing: string;
  };
}

// Light theme with standard contrast
const lightTheme: AccessibilityTheme = {
  colors: {
    primary: '#007AFF',
    primaryDark: '#0056CC',
    primaryLight: '#4DA6FF',
    secondary: '#5856D6',
    secondaryDark: '#3634A3',
    secondaryLight: '#7D7AFF',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#6C6C70',
    textDisabled: '#8E8E93',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
    link: '#007AFF',
    linkVisited: '#5856D6',
    border: '#E5E5EA',
    borderFocus: '#007AFF',
    emergency: '#FF3B30',
    emergencyDark: '#D70015',
  },
  fonts: {
    tiny: 14,
    small: 16,
    medium: 18,
    large: 20,
    xlarge: 24,
    xxlarge: 28,
    display: 32,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
  },
  touchTargets: {
    minimum: 44,
    comfortable: 48,
    large: 56,
  },
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: 'ease-in-out',
  },
};

// Dark theme
const darkTheme: AccessibilityTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#0A84FF',
    primaryDark: '#0056CC',
    primaryLight: '#4DA6FF',
    secondary: '#5E5CE6',
    secondaryDark: '#3634A3',
    secondaryLight: '#7D7AFF',
    background: '#000000',
    surface: '#1C1C1E',
    card: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    textDisabled: '#6C6C70',
    border: '#38383A',
    borderFocus: '#0A84FF',
  },
};

// High contrast theme for maximum accessibility
const highContrastTheme: AccessibilityTheme = {
  ...lightTheme,
  colors: {
    primary: '#0000FF',
    primaryDark: '#000080',
    primaryLight: '#4040FF',
    secondary: '#800080',
    secondaryDark: '#400040',
    secondaryLight: '#C040C0',
    background: '#FFFFFF',
    surface: '#F0F0F0',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#000000',
    textDisabled: '#666666',
    success: '#008000',
    warning: '#FF8000',
    error: '#FF0000',
    info: '#0000FF',
    link: '#0000FF',
    linkVisited: '#800080',
    border: '#000000',
    borderFocus: '#0000FF',
    emergency: '#FF0000',
    emergencyDark: '#CC0000',
  },
  fonts: {
    tiny: 16,
    small: 18,
    medium: 20,
    large: 24,
    xlarge: 28,
    xxlarge: 32,
    display: 36,
  },
};

export const getTheme = (settings: AccessibilitySettings): AccessibilityTheme => {
  let baseTheme: AccessibilityTheme;
  
  // Select base theme
  switch (settings.colorScheme) {
    case 'dark':
      baseTheme = darkTheme;
      break;
    case 'high-contrast':
      baseTheme = highContrastTheme;
      break;
    default:
      baseTheme = lightTheme;
  }
  
  // Apply font scaling
  const fontScale = getFontScale(settings);
  const scaledFonts: FontSizes = {
    tiny: Math.round(baseTheme.fonts.tiny * fontScale),
    small: Math.round(baseTheme.fonts.small * fontScale),
    medium: Math.round(baseTheme.fonts.medium * fontScale),
    large: Math.round(baseTheme.fonts.large * fontScale),
    xlarge: Math.round(baseTheme.fonts.xlarge * fontScale),
    xxlarge: Math.round(baseTheme.fonts.xxlarge * fontScale),
    display: Math.round(baseTheme.fonts.display * fontScale),
  };
  
  // Apply touch target scaling for motor accessibility
  const touchScale = settings.isSwitchControlEnabled ? 1.2 : 1.0;
  const scaledTouchTargets = {
    minimum: Math.round(baseTheme.touchTargets.minimum * touchScale),
    comfortable: Math.round(baseTheme.touchTargets.comfortable * touchScale),
    large: Math.round(baseTheme.touchTargets.large * touchScale),
  };
  
  // Adjust animation durations for reduced motion
  const animationScale = settings.isReduceMotionEnabled ? 0.1 : 1.0;
  const adjustedAnimations = {
    duration: {
      fast: Math.round(baseTheme.animations.duration.fast * animationScale),
      normal: Math.round(baseTheme.animations.duration.normal * animationScale),
      slow: Math.round(baseTheme.animations.duration.slow * animationScale),
    },
    easing: baseTheme.animations.easing,
  };
  
  return {
    ...baseTheme,
    fonts: scaledFonts,
    touchTargets: scaledTouchTargets,
    animations: adjustedAnimations,
  };
};

const getFontScale = (settings: AccessibilitySettings): number => {
  // Use system font scale as base
  let scale = settings.fontScale;
  
  // Apply user preference scaling
  switch (settings.preferredFontSize) {
    case 'large':
      scale *= 1.2;
      break;
    case 'extra-large':
      scale *= 1.5;
      break;
    default:
      // normal - no additional scaling
      break;
  }
  
  // Ensure minimum and maximum bounds
  return Math.max(1.0, Math.min(2.0, scale));
};

export const getAccessibleTextStyle = (
  variant: keyof FontSizes,
  theme: AccessibilityTheme,
  settings: AccessibilitySettings
): TextStyle => {
  const baseStyle: TextStyle = {
    fontSize: theme.fonts[variant],
    color: theme.colors.text,
    fontFamily: 'System', // Use system font for better accessibility
  };
  
  // Apply high contrast adjustments
  if (settings.isHighContrastEnabled || settings.colorScheme === 'high-contrast') {
    baseStyle.fontWeight = '600'; // Slightly bolder for better contrast
  }
  
  // Apply screen reader optimizations
  if (settings.isScreenReaderEnabled) {
    baseStyle.lineHeight = baseStyle.fontSize! * 1.4; // Better line spacing for screen readers
  }
  
  return baseStyle;
};

export const getAccessibleButtonStyle = (
  size: 'small' | 'medium' | 'large',
  theme: AccessibilityTheme,
  settings: AccessibilitySettings
): ViewStyle => {
  const touchTarget = theme.touchTargets[size === 'small' ? 'minimum' : size === 'large' ? 'large' : 'comfortable'];
  
  const baseStyle: ViewStyle = {
    minHeight: touchTarget,
    minWidth: touchTarget,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    // Mobile-specific improvements
    flexDirection: 'row',
    // Ensure buttons are touch-friendly on mobile
    ...(typeof window !== 'undefined' && {
      cursor: 'pointer',
      touchAction: 'manipulation',
    }),
  };
  
  // Apply motor accessibility adjustments
  if (settings.isSwitchControlEnabled) {
    baseStyle.margin = theme.spacing.sm; // Extra margin for switch control
  }
  
  return baseStyle;
};