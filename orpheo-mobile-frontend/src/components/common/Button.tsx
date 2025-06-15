import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@/utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = styles.button;
    const variantStyle = styles[`button_${variant}`];
    const sizeStyle = styles[`button_${size}`];
    const widthStyle = fullWidth ? styles.fullWidth : {};
    const disabledStyle = (disabled || loading) ? styles.buttonDisabled : {};

    return {
      ...baseStyle,
      ...variantStyle,
      ...sizeStyle,
      ...widthStyle,
      ...disabledStyle,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = styles.text;
    const variantStyle = styles[`text_${variant}`];
    const sizeStyle = styles[`text_${size}`];
    const disabledStyle = (disabled || loading) ? styles.textDisabled : {};

    return {
      ...baseStyle,
      ...variantStyle,
      ...sizeStyle,
      ...disabledStyle,
      ...textStyle,
    };
  };

  const getLoadingColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return theme.colors.white;
      case 'secondary':
      case 'ghost':
        return theme.colors.gold;
      default:
        return theme.colors.white;
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getLoadingColor()} />
      ) : (
        <>
          {icon && icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: theme.spacing.sm,
  },
  
  // Variants
  button_primary: {
    backgroundColor: theme.colors.gold,
  },
  
  button_secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.gold,
  },
  
  button_danger: {
    backgroundColor: theme.colors.error,
  },
  
  button_ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  button_small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 36,
  },
  
  button_medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 44,
  },
  
  button_large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: 52,
  },
  
  // States
  buttonDisabled: {
    opacity: 0.5,
  },
  
  fullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  text_primary: {
    color: theme.colors.primary,
  },
  
  text_secondary: {
    color: theme.colors.gold,
  },
  
  text_danger: {
    color: theme.colors.white,
  },
  
  text_ghost: {
    color: theme.colors.gold,
  },
  
  text_small: {
    fontSize: 14,
  },
  
  text_medium: {
    fontSize: 16,
  },
  
  text_large: {
    fontSize: 18,
  },
  
  textDisabled: {
    opacity: 0.7,
  },
});

export default Button;