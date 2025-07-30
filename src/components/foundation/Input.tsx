import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
} from 'react-native';
import { Text } from './Text';

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  editable?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  editable = true,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
  inputStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = [
    styles.container,
    style,
  ];

  const textInputStyle = [
    styles.input,
    isFocused && styles.inputFocused,
    error && styles.inputError,
    !editable && styles.inputDisabled,
    multiline && styles.inputMultiline,
    inputStyle,
  ];

  const inputAccessibilityLabel = accessibilityLabel || label || placeholder;
  const inputAccessibilityHint = accessibilityHint || (error ? `Error: ${error}` : undefined);

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          variant="body"
          weight="medium"
          style={styles.label}
          accessibilityRole="none"
        >
          {label}
        </Text>
      )}
      <TextInput
        style={textInputStyle}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8E8E93"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        maxLength={maxLength}
        editable={editable}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessible={true}
        accessibilityLabel={inputAccessibilityLabel}
        accessibilityHint={inputAccessibilityHint}
        accessibilityRole="none" // Let TextInput handle its own role
        testID={testID}
        // Ensure minimum touch target
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      />
      {error && (
        <Text
          variant="caption"
          color="error"
          style={styles.errorText}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 8,
    color: '#000000',
  },
  input: {
    minHeight: 48, // Minimum touch target size
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18, // Large font size for accessibility
    lineHeight: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    color: '#000000',
  },
  inputFocused: {
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  inputDisabled: {
    backgroundColor: '#F2F2F7',
    color: '#8E8E93',
    borderColor: '#E5E5EA',
  },
  inputMultiline: {
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
  },
});