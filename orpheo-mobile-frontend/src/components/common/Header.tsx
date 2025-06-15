import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/utils/theme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  variant?: 'default' | 'transparent' | 'minimal';
  centerTitle?: boolean;
  statusBarStyle?: 'light' | 'dark';
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightAction,
  leftAction,
  style,
  titleStyle,
  variant = 'default',
  centerTitle = true,
  statusBarStyle = 'light',
}) => {
  const getHeaderStyle = (): ViewStyle => {
    const baseStyle = styles.header;
    const variantStyle = styles[`header_${variant}`];

    return {
      ...baseStyle,
      ...variantStyle,
      ...style,
    };
  };

  const renderLeftSection = () => {
    if (leftAction) {
      return <View style={styles.leftSection}>{leftAction}</View>;
    }

    if (showBack) {
      return (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.grayText}
          />
        </TouchableOpacity>
      );
    }

    return <View style={styles.leftSection} />;
  };

  const renderTitleSection = () => {
    if (!title && !subtitle) return null;

    return (
      <View style={[styles.titleSection, centerTitle && styles.titleCentered]}>
        {title && (
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    );
  };

  const renderRightSection = () => {
    return (
      <View style={styles.rightSection}>
        {rightAction}
      </View>
    );
  };

  return (
    <>
      <StatusBar
        barStyle={statusBarStyle === 'light' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
        translucent={false}
      />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={getHeaderStyle()}>
          {renderLeftSection()}
          {renderTitleSection()}
          {renderRightSection()}
        </View>
      </SafeAreaView>
    </>
  );
};

// Header con búsqueda
interface SearchHeaderProps {
  title?: string;
  searchValue: string;
  onSearchChange: (text: string) => void;
  onSearchSubmit?: () => void;
  placeholder?: string;
  showSearchButton?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  title,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  placeholder = 'Buscar...',
  showSearchButton = true,
  onBackPress,
  rightAction,
}) => {
  return (
    <Header
      title={title}
      showBack={!!onBackPress}
      onBackPress={onBackPress}
      rightAction={
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color={theme.colors.grayBorder}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              value={searchValue}
              onChangeText={onSearchChange}
              onSubmitEditing={onSearchSubmit}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.grayBorder}
              returnKeyType="search"
            />
            {searchValue.length > 0 && (
              <TouchableOpacity
                onPress={() => onSearchChange('')}
                style={styles.clearButton}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.colors.grayBorder}
                />
              </TouchableOpacity>
            )}
          </View>
          {rightAction}
        </View>
      }
      centerTitle={false}
    />
  );
};

// Header con avatar y notificaciones
interface ProfileHeaderProps {
  title?: string;
  userName?: string;
  userInitials?: string;
  notificationCount?: number;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  title,
  userName,
  userInitials,
  notificationCount = 0,
  onProfilePress,
  onNotificationPress,
}) => {
  return (
    <Header
      title={title}
      leftAction={
        <TouchableOpacity
          style={styles.profileButton}
          onPress={onProfilePress}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userInitials || 'U'}
            </Text>
          </View>
          {userName && (
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>Hola,</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          )}
        </TouchableOpacity>
      }
      rightAction={
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={theme.colors.grayText}
          />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {notificationCount > 99 ? '99+' : notificationCount.toString()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      }
      centerTitle={false}
    />
  );
};

// Header simple con acción
interface ActionHeaderProps {
  title: string;
  actionTitle?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onActionPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
  disabled?: boolean;
}

export const ActionHeader: React.FC<ActionHeaderProps> = ({
  title,
  actionTitle,
  actionIcon,
  onActionPress,
  showBack = false,
  onBackPress,
  disabled = false,
}) => {
  return (
    <Header
      title={title}
      showBack={showBack}
      onBackPress={onBackPress}
      rightAction={
        onActionPress && (
          <TouchableOpacity
            style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
            onPress={onActionPress}
            disabled={disabled}
          >
            {actionIcon && (
              <Ionicons
                name={actionIcon}
                size={20}
                color={disabled ? theme.colors.grayBorder : theme.colors.gold}
              />
            )}
            {actionTitle && (
              <Text
                style={[
                  styles.actionButtonText,
                  disabled && styles.actionButtonTextDisabled,
                ]}
              >
                {actionTitle}
              </Text>
            )}
          </TouchableOpacity>
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.surface,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 56,
  },
  
  // Variants
  header_default: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grayBorder,
  },
  
  header_transparent: {
    backgroundColor: 'transparent',
  },
  
  header_minimal: {
    backgroundColor: theme.colors.surface,
  },
  
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  
  titleSection: {
    flex: 2,
    alignItems: 'flex-start',
  },
  
  titleCentered: {
    alignItems: 'center',
  },
  
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  
  backButton: {
    padding: theme.spacing.xs,
  },
  
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.gold,
  },
  
  subtitle: {
    fontSize: 14,
    color: theme.colors.grayBorder,
    marginTop: 2,
  },
  
  // Search Header
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.grayBorder,
    paddingHorizontal: theme.spacing.sm,
    flex: 1,
    height: 36,
  },
  
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  
  searchInput: {
    flex: 1,
    color: theme.colors.grayText,
    fontSize: 16,
  },
  
  clearButton: {
    padding: 2,
  },
  
  // Profile Header
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  
  avatarText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  userInfo: {
    flex: 1,
  },
  
  greeting: {
    fontSize: 12,
    color: theme.colors.grayBorder,
  },
  
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.grayText,
  },
  
  notificationButton: {
    position: 'relative',
    padding: theme.spacing.xs,
  },
  
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  notificationBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Action Header
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  
  actionButtonDisabled: {
    opacity: 0.5,
  },
  
  actionButtonText: {
    color: theme.colors.gold,
    fontSize: 16,
    fontWeight: '500',
  },
  
  actionButtonTextDisabled: {
    color: theme.colors.grayBorder,
  },
});

export default Header;