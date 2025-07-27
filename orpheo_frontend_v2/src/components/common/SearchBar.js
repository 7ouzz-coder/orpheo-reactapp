import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles, spacing, fontSize, wp } from '../../styles/globalStyles';

// Custom hooks
import { useDebounce } from '../../hooks/useDebounce';

const SearchBar = ({
  placeholder = 'Buscar...',
  value = '',
  onChangeText,
  onSearch,
  onFocus,
  onBlur,
  style,
  autoFocus = false,
  showFilterButton = false,
  onFilterPress,
  debounceMs = 300,
  clearable = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState(value);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Debounce para optimizar búsquedas
  const debouncedSearchValue = useDebounce(searchValue, debounceMs);
  
  // Efecto para búsqueda debounced
  useEffect(() => {
    if (debouncedSearchValue !== value) {
      onChangeText?.(debouncedSearchValue);
      onSearch?.(debouncedSearchValue);
    }
  }, [debouncedSearchValue]);

  // Sincronizar con prop value
  useEffect(() => {
    if (value !== searchValue) {
      setSearchValue(value);
    }
  }, [value]);

  // Animación al hacer focus
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleClear = () => {
    setSearchValue('');
    onChangeText?.('');
    onSearch?.('');
  };

  const handleSubmit = () => {
    onSearch?.(searchValue);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[
        styles.searchContainer,
        isFocused && styles.searchContainerFocused
      ]}>
        {/* Icono de búsqueda */}
        <Icon 
          name="magnify" 
          size={20} 
          color={isFocused ? colors.primary : colors.textSecondary}
          style={styles.searchIcon}
        />

        {/* Input de búsqueda */}
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={searchValue}
          onChangeText={setSearchValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          autoFocus={autoFocus}
          returnKeyType="search"
          clearButtonMode="never" // Manejamos clear manualmente
        />

        {/* Botón de limpiar */}
        {clearable && searchValue.length > 0 && (
          <Animated.View style={[
            styles.clearButton,
            { opacity: fadeAnim }
          ]}>
            <TouchableOpacity
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon 
                name="close-circle" 
                size={18} 
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Botón de filtros */}
        {showFilterButton && (
          <TouchableOpacity
            style={styles.filterButton}
            onPress={onFilterPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon 
              name="filter-variant" 
              size={20} 
              color={isFocused ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Línea de enfoque animada */}
      <Animated.View style={[
        styles.focusLine,
        {
          backgroundColor: colors.primary,
          transform: [{
            scaleX: fadeAnim
          }]
        }
      ]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...globalStyles.shadow,
  },
  
  searchContainerFocused: {
    borderColor: colors.primary,
    ...globalStyles.shadowMd,
  },
  
  searchIcon: {
    marginRight: spacing.sm,
  },
  
  textInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: 0, // Remover padding default en iOS
  },
  
  clearButton: {
    marginLeft: spacing.xs,
  },
  
  filterButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  
  focusLine: {
    height: 2,
    marginTop: 2,
    borderRadius: 1,
  },
});

export default SearchBar;