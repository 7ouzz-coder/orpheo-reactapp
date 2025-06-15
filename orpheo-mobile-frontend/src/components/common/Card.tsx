import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '@/utils/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  disabled?: boolean;
  shadow?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'medium',
  margin = 'none',
  disabled = false,
  shadow = false,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle = styles.card;
    const variantStyle = styles[`card_${variant}`];
    const paddingStyle = styles[`padding_${padding}`];
    const marginStyle = styles[`margin_${margin}`];
    const shadowStyle = shadow ? styles.shadow : {};
    const disabledStyle = disabled ? styles.disabled : {};

    return {
      ...baseStyle,
      ...variantStyle,
      ...paddingStyle,
      ...marginStyle,
      ...shadowStyle,
      ...disabledStyle,
      ...style,
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={getCardStyle()}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={getCardStyle()}>
      {children}
    </View>
  );
};

// Card with header and content sections
interface CardWithHeaderProps {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const CardWithHeader: React.FC<CardWithHeaderProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  style,
  onPress,
}) => {
  return (
    <Card style={style} onPress={onPress} padding="none">
      {(title || subtitle || headerAction) && (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {headerAction && (
            <View style={styles.headerAction}>
              {headerAction}
            </View>
          )}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </Card>
  );
};

// Card for list items
interface ListCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  showArrow?: boolean;
  disabled?: boolean;
}

export const ListCard: React.FC<ListCardProps> = ({
  children,
  onPress,
  style,
  showArrow = false,
  disabled = false,
}) => {
  return (
    <Card
      style={[styles.listCard, style]}
      onPress={onPress}
      disabled={disabled}
      variant="outlined"
      padding="medium"
      margin="small"
    >
      <View style={styles.listCardContent}>
        <View style={styles.listCardMain}>
          {children}
        </View>
        {showArrow && onPress && (
          <View style={styles.listCardArrow}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.grayBorder}
            />
          </View>
        )}
      </View>
    </Card>
  );
};

// Card for stats/metrics
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = theme.colors.gold,
  onPress,
  style,
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return theme.colors.success;
      case 'down':
        return theme.colors.error;
      default:
        return theme.colors.grayBorder;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  return (
    <Card
      style={[styles.statsCard, style]}
      onPress={onPress}
      variant="elevated"
      shadow
    >
      <View style={styles.statsHeader}>
        <View style={styles.statsInfo}>
          <Text style={styles.statsTitle}>{title}</Text>
          <Text style={[styles.statsValue, { color }]}>{value}</Text>
          {subtitle && <Text style={styles.statsSubtitle}>{subtitle}</Text>}
        </View>
        {icon && (
          <View style={[styles.statsIcon, { backgroundColor: `${color}20` }]}>
            {icon}
          </View>
        )}
      </View>
      
      {trend && trendValue && (
        <View style={styles.statsTrend}>
          <Ionicons
            name={getTrendIcon()}
            size={14}
            color={getTrendColor()}
          />
          <Text style={[styles.statsTrendText, { color: getTrendColor() }]}>
            {trendValue}
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  // Variants
  card_default: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.grayBorder,
  },
  
  card_elevated: {
    backgroundColor: theme.colors.surface,
    elevation: 4,
    shadowColor: theme.colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  card_outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.grayBorder,
  },
  
  card_filled: {
    backgroundColor: theme.colors.primarySecondary,
    borderWidth: 0,
  },
  
  // Padding
  padding_none: {
    padding: 0,
  },
  
  padding_small: {
    padding: theme.spacing.sm,
  },
  
  padding_medium: {
    padding: theme.spacing.md,
  },
  
  padding_large: {
    padding: theme.spacing.lg,
  },
  
  // Margin
  margin_none: {
    margin: 0,
  },
  
  margin_small: {
    margin: theme.spacing.sm,
  },
  
  margin_medium: {
    margin: theme.spacing.md,
  },
  
  margin_large: {
    margin: theme.spacing.lg,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  
  shadow: {
    elevation: 4,
    shadowColor: theme.colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // Card with header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grayBorder,
  },
  
  headerContent: {
    flex: 1,
  },
  
  headerAction: {
    marginLeft: theme.spacing.md,
  },
  
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gold,
    marginBottom: theme.spacing.xs,
  },
  
  subtitle: {
    fontSize: 14,
    color: theme.colors.grayBorder,
  },
  
  content: {
    padding: theme.spacing.md,
  },
  
  // List card
  listCard: {
    marginBottom: theme.spacing.sm,
  },
  
  listCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  listCardMain: {
    flex: 1,
  },
  
  listCardArrow: {
    marginLeft: theme.spacing.md,
  },
  
  // Stats card
  statsCard: {
    padding: theme.spacing.md,
  },
  
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  
  statsInfo: {
    flex: 1,
  },
  
  statsTitle: {
    fontSize: 14,
    color: theme.colors.grayBorder,
    marginBottom: theme.spacing.xs,
  },
  
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  
  statsSubtitle: {
    fontSize: 12,
    color: theme.colors.grayBorder,
  },
  
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  statsTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  
  statsTrendText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Card;