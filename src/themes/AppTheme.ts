/**
 * Comprehensive theme system for consistent UI styling and animations
 * Provides accessibility-compliant colors, typography, and spacing
 */

import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Color palette optimized for seniors with high contrast
export const colors = {
  // Primary colors - warm and friendly
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main primary
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Secondary colors - calming green
  secondary: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main secondary
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  // Emergency colors - clear and urgent
  emergency: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336', // Main emergency
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  // Warning colors
  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107', // Main warning
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },

  // Success colors
  success: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main success
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  // Neutral colors with high contrast
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Text colors optimized for readability
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
  },

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
    inverse: '#212121',
  },

  // Border colors
  border: {
    light: '#E0E0E0',
    medium: '#BDBDBD',
    dark: '#757575',
  },
};

// Typography system with large, readable fonts
export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  // Font sizes optimized for seniors (minimum 18pt)
  fontSize: {
    xs: 16,
    sm: 18,
    md: 20,
    lg: 24,
    xl: 28,
    '2xl': 32,
    '3xl': 36,
    '4xl': 42,
    '5xl': 48,
  },

  // Line heights for optimal readability
  lineHeight: {
    xs: 20,
    sm: 24,
    md: 28,
    lg: 32,
    xl: 36,
    '2xl': 40,
    '3xl': 44,
    '4xl': 50,
    '5xl': 56,
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Spacing system based on 8pt grid
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 56,
  '5xl': 64,
};

// Border radius for consistent rounded corners
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

// Shadow system for depth and hierarchy
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

// Animation configurations
export const animations = {
  // Duration presets
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  // Easing curves
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },

  // Common animation presets
  presets: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: 300,
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: 300,
    },
    slideInUp: {
      from: { transform: [{ translateY: 50 }], opacity: 0 },
      to: { transform: [{ translateY: 0 }], opacity: 1 },
      duration: 300,
    },
    slideInDown: {
      from: { transform: [{ translateY: -50 }], opacity: 0 },
      to: { transform: [{ translateY: 0 }], opacity: 1 },
      duration: 300,
    },
    scaleIn: {
      from: { transform: [{ scale: 0.8 }], opacity: 0 },
      to: { transform: [{ scale: 1 }], opacity: 1 },
      duration: 300,
    },
    bounce: {
      from: { transform: [{ scale: 1 }] },
      to: { transform: [{ scale: 1.05 }] },
      duration: 150,
    },
  },
};

// Layout constants
export const layout = {
  // Screen dimensions
  screen: {
    width: screenWidth,
    height: screenHeight,
  },

  // Touch target sizes (minimum 44pt for accessibility)
  touchTarget: {
    small: 44,
    medium: 56,
    large: 72,
  },

  // Container widths
  container: {
    sm: 320,
    md: 768,
    lg: 1024,
    xl: 1280,
  },

  // Header heights
  header: {
    default: 64,
    large: 80,
  },

  // Tab bar height
  tabBar: {
    height: 80, // Larger for easier touch
  },

  // Card dimensions
  card: {
    minHeight: 120,
    aspectRatio: 1.5,
  },
};

// Component-specific theme configurations
export const components = {
  button: {
    height: {
      small: 44,
      medium: 56,
      large: 72,
    },
    borderRadius: borderRadius.lg,
    fontSize: {
      small: typography.fontSize.md,
      medium: typography.fontSize.lg,
      large: typography.fontSize.xl,
    },
  },

  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadow: shadows.md,
  },

  input: {
    height: 56,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.lg,
    padding: spacing.md,
  },

  modal: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    shadow: shadows.xl,
  },
};

// Accessibility configurations
export const accessibility = {
  // Minimum contrast ratios (WCAG AA compliant)
  contrast: {
    normal: 4.5,
    large: 3.0,
  },

  // Focus indicators
  focus: {
    borderWidth: 3,
    borderColor: colors.primary[500],
    borderRadius: borderRadius.md,
  },

  // Animation preferences
  reduceMotion: {
    duration: 0,
    easing: 'linear',
  },
};

// Export complete theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  layout,
  components,
  accessibility,
};

export type Theme = typeof theme;
export default theme;