import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/utils/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  required?: boolean;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  variant = 'default',
  size = 'medium',
  required = false,
  showPasswordToggle = false,
  secureTextEntry,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle = styles.container;
    const variantStyle = styles[`container_${variant}`];
    const sizeStyle = styles[`container_${size}`];
    const focusedStyle = isFocused ? styles.containerFocused : {};
    const errorStyle = error ? styles.containerError : {};

    return {
      ...baseStyle,
      ...variantStyle,
      ...sizeStyle,
      ...focusedStyle,
      ...errorStyle,
      ...containerStyle,
    };
  };

  const getInputStyle = (): ViewStyle => {
    const baseStyle = styles.input;
    const sizeStyle = styles[`input_${size}`];

    return {
      ...baseStyle,
      ...sizeStyle,
      ...inputStyle,
    };
  };

  const finalRightIcon = showPasswordToggle 
    ? (isPasswordVisible ? 'eye-off' : 'eye')
    : rightIcon;

  const finalOnRightIconPress = showPasswordToggle
    ? togglePasswordVisibility
    : onRightIconPress;

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={getContainerStyle()}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? theme.colors.error : theme.colors.grayBorder}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          ref={ref}
          style={getInputStyle()}
          placeholderTextColor={theme.colors.grayBorder}
          selectionColor={theme.colors.gold}
          secureTextEntry={showPasswordToggle ? !isPasswordVisible : secureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {finalRightIcon && (
          <TouchableOpacity
            onPress={finalOnRightIconPress}
            style={styles.rightIconContainer}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={finalRightIcon}
              size={20}
              color={error ? theme.colors.error : theme.colors.grayBorder}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={error ? styles.errorText : styles.helperText}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.md,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.grayText,
    marginBottom: theme.spacing.xs,
  },
  
  required: {
    color: theme.colors.error,
  },
  
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  
  // Variants
  container_default: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.grayBorder,
  },
  
  container_outlined: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.grayBorder,
  },
  
  container_filled: {
    backgroundColor: theme.colors.primarySecondary,
    borderColor: 'transparent',
  },
  
  // Sizes
  container_small: {
    minHeight: 36,
    paddingHorizontal: theme.spacing.sm,
  },
  
  container_medium: {
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
  },
  
  container_large: {
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
  },
  
  // States
  containerFocused: {
    borderColor: theme.colors.gold,
    borderWidth: 2,
  },
  
  containerError: {
    borderColor: theme.colors.error,
  },
  
  input: {
    flex: 1,
    color: theme.colors.grayText,
    fontSize: 16,
  },
  
  input_small: {
    fontSize: 14,
  },
  
  input_medium: {
    fontSize: 16,
  },
  
  input_large: {
    fontSize: 18,
  },
  
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  
  rightIconContainer: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  
  helperText: {
    fontSize: 12,
    color: theme.colors.grayBorder,
    marginTop: theme.spacing.xs,
  },
});

export default Input;