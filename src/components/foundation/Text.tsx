import React from 'react';
import {
  Text as RNText,
  StyleSheet,
  TextStyle,
  AccessibilityRole,
} from 'react-native';
import { useAccessibility } from '../../contexts/AccessibilityContextSafe';
import { getTheme, getAccessibleTextStyle } from '../../themes/AccessibilityTheme';

export interface TextProps {
  children: React.ReactNode;
  variant?: 'display' | 'title' | 'title2' | 'heading1' | 'heading2' | 'heading3' | 'body' | 'caption' | 'button';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'disabled';
  align?: 'left' | 'center' | 'right';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityLanguage?: string;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  testID?: string;
  style?: TextStyle;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
  allowFontScaling?: boolean;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  align = 'left',
  weight = 'normal',
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  accessibilityLanguage,
  accessibilityLiveRegion,
  testID,
  style,
  numberOfLines,
  adjustsFontSizeToFit = false,
  minimumFontScale = 0.5,
  allowFontScaling = true,
}) => {
  const { settings } = useAccessibility();
  const theme = getTheme(settings);
  
  // Map variant to font size key
  const fontSizeKey = mapVariantToFontSize(variant);
  
  const textStyle = [
    getAccessibleTextStyle(fontSizeKey, theme, settings),
    getColorStyle(color, theme),
    getAlignStyle(align),
    getWeightStyle(weight, settings),
    style,
  ];

  const accessibilityProps = accessible
    ? {
        accessible: true,
        accessibilityLabel: accessibilityLabel || (typeof children === 'string' ? children : undefined),
        accessibilityHint,
        accessibilityRole: accessibilityRole || getDefaultAccessibilityRole(variant),
        accessibilityLanguage,
        accessibilityLiveRegion,
        testID,
      }
    : {};

  return (
    <RNText
      style={textStyle}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
      allowFontScaling={allowFontScaling && !settings.isScreenReaderEnabled} // Disable auto-scaling with screen readers
      {...accessibilityProps}
    >
      {children}
    </RNText>
  );
};

// Helper functions
const mapVariantToFontSize = (variant: string) => {
  switch (variant) {
    case 'display':
      return 'display' as const;
    case 'title':
    case 'heading1':
      return 'xxlarge' as const;
    case 'title2':
    case 'heading2':
      return 'xlarge' as const;
    case 'heading3':
      return 'large' as const;
    case 'caption':
      return 'small' as const;
    case 'body':
    case 'button':
    default:
      return 'medium' as const;
  }
};

const getDefaultAccessibilityRole = (variant: string): AccessibilityRole => {
  if (variant.startsWith('heading') || variant === 'title' || variant === 'title2') {
    return 'header';
  }
  return 'text';
};

const getColorStyle = (color: string, theme: any): TextStyle => {
  switch (color) {
    case 'secondary':
      return { color: theme.colors.textSecondary };
    case 'success':
      return { color: theme.colors.success };
    case 'warning':
      return { color: theme.colors.warning };
    case 'error':
      return { color: theme.colors.error };
    case 'disabled':
      return { color: theme.colors.textDisabled };
    case 'primary':
    default:
      return { color: theme.colors.text };
  }
};

const getAlignStyle = (align: string): TextStyle => {
  return { textAlign: align as any };
};

const getWeightStyle = (weight: string, settings: any): TextStyle => {
  let fontWeight: TextStyle['fontWeight'];
  
  switch (weight) {
    case 'medium':
      fontWeight = '500';
      break;
    case 'semibold':
      fontWeight = '600';
      break;
    case 'bold':
      fontWeight = '700';
      break;
    case 'normal':
    default:
      fontWeight = '400';
      break;
  }
  
  // Increase font weight for high contrast mode
  if (settings.isHighContrastEnabled || settings.colorScheme === 'high-contrast') {
    const weightMap: { [key: string]: TextStyle['fontWeight'] } = {
      '400': '500',
      '500': '600',
      '600': '700',
      '700': '800',
    };
    fontWeight = weightMap[fontWeight] || fontWeight;
  }
  
  return { fontWeight };
};

// Styles are now dynamically generated based on accessibility settings and theme