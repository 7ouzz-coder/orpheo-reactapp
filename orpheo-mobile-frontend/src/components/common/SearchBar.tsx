import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/utils/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  placeholder?: string;
  showCancel?: boolean;
  onCancel?: () => void;
  autoFocus?: boolean;
  style?: ViewStyle;
  variant?: 'default' | 'minimal' | 'rounded';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  showFilterButton?: boolean;
  onFilterPress?: () => void;
  hasActiveFilters?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  onFocus,
  onBlur,
  onClear,
  placeholder = 'Buscar...',
  showCancel = false,
  onCancel,
  autoFocus = false,
  style,
  variant = 'default',
  size = 'medium',
  disabled = false,
  showFilterButton = false,
  onFilterPress,
  hasActiveFilters = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [cancelWidth] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(cancelWidth, {
      toValue: (isFocused && showCancel) ? 80 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, showCancel, cancelWidth]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  const handleCancel = () => {
    onChangeText('');
    setIsFocused(false);
    onCancel?.();
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle = styles.container;
    const variantStyle = styles[`container_${variant}`];
    const sizeStyle = styles[`container_${size}`];
    const focusedStyle = isFocused ? styles.containerFocused : {};
    const disabledStyle = disabled ? styles.containerDisabled : {};

    return {
      ...baseStyle,
      ...variantStyle,
      ...sizeStyle,
      ...focusedStyle,
      ...disabledStyle,
      ...style,
    };
  };

  const getInputStyle = () => {
    const baseStyle = styles.input;
    const sizeStyle = styles[`input_${size}`];

    return {
      ...baseStyle,
      ...sizeStyle,
    };
  };

  return (
    <View style={styles.wrapper}>
      <View style={getContainerStyle()}>
        <Ionicons
          name="search"
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
          color={isFocused ? theme.colors.gold : theme.colors.grayBorder}
          style={styles.searchIcon}
        />
        
        <TextInput
          style={getInputStyle()}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.grayBorder}
          returnKeyType="search"
          autoFocus={autoFocus}
          editable={!disabled}
          selectionColor={theme.colors.gold}
        />
        
        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close-circle"
              size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
              color={theme.colors.grayBorder}
            />
          </TouchableOpacity>
        )}
        
        {showFilterButton && (
          <TouchableOpacity
            onPress={onFilterPress}
            style={[
              styles.filterButton,
              hasActiveFilters && styles.filterButtonActive,
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="filter"
              size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
              color={hasActiveFilters ? theme.colors.gold : theme.colors.grayBorder}
            />
            {hasActiveFilters && <View style={styles.filterDot} />}
          </TouchableOpacity>
        )}
      </View>
      
      {showCancel && (
        <Animated.View style={[styles.cancelContainer, { width: cancelWidth }]}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

// SearchBar con sugerencias
interface SearchBarWithSuggestionsProps extends SearchBarProps {
  suggestions: string[];
  onSuggestionPress: (suggestion: string) => void;
  maxSuggestions?: number;
  showSuggestions?: boolean;
}

export const SearchBarWithSuggestions: React.FC<SearchBarWithSuggestionsProps> = ({
  suggestions,
  onSuggestionPress,
  maxSuggestions = 5,
  showSuggestions = true,
  ...searchBarProps
}) => {
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);

  const filteredSuggestions = suggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(searchBarProps.value.toLowerCase())
    )
    .slice(0, maxSuggestions);

  const handleFocus = () => {
    setShowSuggestionsList(true);
    searchBarProps.onFocus?.();
  };

  const handleBlur = () => {
    // Delay to allow suggestion press
    setTimeout(() => setShowSuggestionsList(false), 150);
    searchBarProps.onBlur?.();
  };

  const handleSuggestionPress = (suggestion: string) => {
    onSuggestionPress(suggestion);
    setShowSuggestionsList(false);
  };

  return (
    <View style={styles.suggestionsWrapper}>
      <SearchBar
        {...searchBarProps}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      
      {showSuggestions && showSuggestionsList && searchBarProps.value.length > 0 && filteredSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {filteredSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.suggestionItem,
                index === filteredSuggestions.length - 1 && styles.suggestionItemLast,
              ]}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Ionicons
                name="search"
                size={16}
                color={theme.colors.grayBorder}
                style={styles.suggestionIcon}
              />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// SearchBar compacto para headers
export const CompactSearchBar: React.FC<Omit<SearchBarProps, 'variant'>> = (props) => {
  return (
    <SearchBar
      {...props}
      variant="minimal"
      size="small"
      style={[styles.compactSearchBar, props.style]}
    />
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
  },
  
  // Variants
  container_default: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.grayBorder,
  },
  
  container_minimal: {
    backgroundColor: theme.colors.primarySecondary,
    borderColor: 'transparent',
  },
  
  container_rounded: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.grayBorder,
    borderRadius: 20,
  },
  
  // Sizes
  container_small: {
    paddingHorizontal: theme.spacing.sm,
    height: 36,
  },
  
  container_medium: {
    paddingHorizontal: theme.spacing.md,
    height: 44,
  },
  
  container_large: {
    paddingHorizontal: theme.spacing.lg,
    height: 52,
  },
  
  // States
  containerFocused: {
    borderColor: theme.colors.gold,
    borderWidth: 2,
  },
  
  containerDisabled: {
    opacity: 0.5,
  },
  
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  
  input: {
    flex: 1,
    color: theme.colors.grayText,
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
  
  clearButton: {
    marginLeft: theme.spacing.sm,
    padding: 2,
  },
  
  filterButton: {
    marginLeft: theme.spacing.sm,
    padding: 2,
    position: 'relative',
  },
  
  filterButtonActive: {
    backgroundColor: `${theme.colors.gold}20`,
    borderRadius: 4,
  },
  
  filterDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.gold,
  },
  
  // Cancel button
  cancelContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cancelButton: {
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  
  cancelText: {
    color: theme.colors.gold,
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Suggestions
  suggestionsWrapper: {
    position: 'relative',
    zIndex: 1000,
  },
  
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.grayBorder,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    maxHeight: 200,
    zIndex: 1001,
    elevation: 4,
    shadowColor: theme.colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grayBorder,
  },
  
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  
  suggestionIcon: {
    marginRight: theme.spacing.sm,
  },
  
  suggestionText: {
    flex: 1,
    color: theme.colors.grayText,
    fontSize: 16,
  },
  
  // Compact search bar
  compactSearchBar: {
    maxWidth: 200,
  },
});

export default SearchBar;