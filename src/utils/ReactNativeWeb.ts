/**
 * React Native Web compatibility layer
 * Provides web-compatible implementations of React Native components
 */

import React from 'react';

// Mock Dimensions for web
export const Dimensions = {
  get: (dimension: 'window' | 'screen') => {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return {
      width: 375, // Default mobile width
      height: 667, // Default mobile height
    };
  },
  addEventListener: (type: string, handler: any) => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handler);
    }
  },
  removeEventListener: (type: string, handler: any) => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handler);
    }
  },
};

// Mock AccessibilityInfo for web
export const AccessibilityInfo = {
  isScreenReaderEnabled: async (): Promise<boolean> => {
    // Simple heuristic for screen reader detection on web
    return typeof window !== 'undefined' && 
           (window.navigator.userAgent.includes('NVDA') || 
            window.navigator.userAgent.includes('JAWS') ||
            window.speechSynthesis !== undefined);
  },
  isReduceMotionEnabled: async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  },
  addEventListener: (eventName: string, handler: any) => {
    // Mock implementation
    console.log(`AccessibilityInfo: addEventListener ${eventName}`);
  },
  removeEventListener: (eventName: string, handler: any) => {
    // Mock implementation
    console.log(`AccessibilityInfo: removeEventListener ${eventName}`);
  },
};

// Mock View component for web
export const View: React.FC<any> = ({ children, style, ...props }) => {
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      ...style,
    },
    ...props,
  }, children);
};

// Mock Text component for web
export const Text: React.FC<any> = ({ children, style, ...props }) => {
  return React.createElement('span', {
    style: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      ...style,
    },
    ...props,
  }, children);
};

// Mock ActivityIndicator for web
export const ActivityIndicator: React.FC<any> = ({ size = 'small', color = '#000', style }) => {
  const spinnerStyle = {
    width: size === 'large' ? '36px' : '20px',
    height: size === 'large' ? '36px' : '20px',
    border: `2px solid ${color}`,
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    ...style,
  };

  // Add CSS animation if not already present
  if (typeof document !== 'undefined' && !document.getElementById('spinner-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'spinner-styles';
    styleSheet.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleSheet);
  }

  return React.createElement('div', { style: spinnerStyle });
};

// Mock SafeAreaProvider for web
export const SafeAreaProvider: React.FC<any> = ({ children }) => {
  return React.createElement('div', {
    style: {
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
    },
  }, children);
};

// Export all components
export default {
  Dimensions,
  AccessibilityInfo,
  View,
  Text,
  ActivityIndicator,
  SafeAreaProvider,
};