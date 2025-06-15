import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '@/utils/theme';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  overlay?: boolean;
  color?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  text,
  overlay = false,
  color = theme.colors.gold,
  style,
  fullScreen = false,
}) => {
  const getIndicatorSize = () => {
    switch (size) {
      case 'small':
        return 'small' as const;
      case 'large':
        return 'large' as const;
      default:
        return 'large' as const;
    }
  };

  const getContainerStyle = (): ViewStyle => {
    if (fullScreen) {
      return {
        ...styles.fullScreenContainer,
        ...style,
      };
    }

    if (overlay) {
      return {
        ...styles.overlayContainer,
        ...style,
      };
    }

    return {
      ...styles.container,
      ...style,
    };
  };

  const getTextStyle = () => {
    switch (size) {
      case 'small':
        return styles.textSmall;
      case 'large':
        return styles.textLarge;
      default:
        return styles.textMedium;
    }
  };

  return (
    <View style={getContainerStyle()}>
      <View style={styles.content}>
        <ActivityIndicator
          size={getIndicatorSize()}
          color={color}
          style={styles.indicator}
        />
        {text && (
          <Text style={[styles.text, getTextStyle()]}>
            {text}
          </Text>
        )}
      </View>
    </View>
  );
};

// Loading dots animation (alternative)
interface LoadingDotsProps {
  color?: string;
  size?: number;
  style?: ViewStyle;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  color = theme.colors.gold,
  size = 8,
  style,
}) => {
  return (
    <View style={[styles.dotsContainer, style]}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: color,
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      ))}
    </View>
  );
};

// Loading skeleton (for lists)
interface LoadingSkeletonProps {
  lines?: number;
  style?: ViewStyle;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  lines = 3,
  style,
}) => {
  return (
    <View style={[styles.skeletonContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.skeletonLine,
            {
              width: index === lines - 1 ? '60%' : '100%',
            },
          ]}
        />
      ))}
    </View>
  );
};

// Loading button state
interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  color?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  loadingText = 'Cargando...',
  color = theme.colors.white,
}) => {
  if (loading) {
    return (
      <View style={styles.loadingButtonContainer}>
        <ActivityIndicator size="small" color={color} />
        <Text style={[styles.loadingButtonText, { color }]}>
          {loadingText}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  fullScreenContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  indicator: {
    marginBottom: theme.spacing.sm,
  },
  
  text: {
    color: theme.colors.grayText,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  textSmall: {
    fontSize: 12,
  },
  
  textMedium: {
    fontSize: 14,
  },
  
  textLarge: {
    fontSize: 16,
  },
  
  // Loading dots
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  
  dot: {
    opacity: 0.6,
  },
  
  // Loading skeleton
  skeletonContainer: {
    gap: theme.spacing.sm,
  },
  
  skeletonLine: {
    height: 16,
    backgroundColor: theme.colors.grayBorder,
    opacity: 0.3,
    borderRadius: 4,
  },
  
  // Loading button
  loadingButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  
  loadingButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Loading;