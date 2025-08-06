import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, colorOpacity } from '../../styles/colors';
import { wp, hp, fontSize, spacing } from '../../utils/dimensions';
import { useDebounce } from '../../hooks/useDebounce';

const SearchBar = ({
  placeholder = 'Buscar miembros...',
  value = '',
  onSearch,
  onFocus,
  onBlur,
  onClear,
  autoFocus = false,
  debounceDelay = 500,
  showClearButton = true,
  style,
  inputStyle,
  rightComponent,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Debounce para la búsqueda
  const debouncedSearchValue = useDebounce(internalValue, debounceDelay);

  // Efecto para manejar el debounce
  useEffect(() => {
    if (debouncedSearchValue !== value && onSearch) {
      onSearch(debouncedSearchValue);
    }
  }, [debouncedSearchValue, onSearch]);

  // Efecto para sincronizar con prop value externa
  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value);
    }
  }, [value]);

  // Animación del borde cuando está enfocado
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, animatedValue]);

  // Manejar enfoque
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  // Manejar pérdida de enfoque
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  // Manejar cambio de texto
  const handleChangeText = (text) => {
    setInternalValue(text);
  };

  // Limpiar búsqueda
  const handleClear = () => {
    setInternalValue('');
    onClear?.();
    onSearch?.('');
    inputRef.current?.focus();
  };

  // Enfocar programáticamente
  const focus = () => {
    inputRef.current?.focus();
  };

  // Desenfocar programáticamente
  const blur = () => {
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  // Color del borde animado
  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <Animated.View style={[styles.container, { borderColor }, style]}>
      {/* Icono de búsqueda */}
      <View style={styles.iconContainer}>
        <Icon 
          name="magnify" 
          size={wp(5)} 
          color={isFocused ? colors.primary : colors.textSecondary} 
        />
      </View>

      {/* Input de texto */}
      <TextInput
        ref={inputRef}
        style={[styles.input, inputStyle]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={internalValue}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoFocus={autoFocus}
        returnKeyType="search"
        clearButtonMode="never" // Usamos nuestro botón personalizado
        onSubmitEditing={() => {
          onSearch?.(internalValue);
          blur();
        }}
      />

      {/* Botón de limpiar */}
      {showClearButton && internalValue.length > 0 && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={handleClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon 
            name="close-circle" 
            size={wp(4.5)} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
      )}

      {/* Componente adicional a la derecha */}
      {rightComponent && (
        <View style={styles.rightComponent}>
          {rightComponent}
        </View>
      )}
    </Animated.View>
  );
};

// Variante compacta para uso en headers
export const CompactSearchBar = (props) => (
  <SearchBar
    {...props}
    style={[styles.compactContainer, props.style]}
    inputStyle={[styles.compactInput, props.inputStyle]}
  />
);

// Variante expandible (se expande al hacer tap)
export const ExpandableSearchBar = ({ 
  onExpand, 
  onCollapse, 
  expanded = false, 
  ...props 
}) => {
  const expandAnim = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded, expandAnim]);

  const handlePress = () => {
    if (!expanded) {
      onExpand?.();
    }
  };

  const containerWidth = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [wp(12), wp(80)],
  });

  if (!expanded) {
    return (
      <TouchableOpacity style={styles.expandableButton} onPress={handlePress}>
        <Icon name="magnify" size={wp(5)} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[styles.expandableContainer, { width: containerWidth }]}>
      <SearchBar
        {...props}
        autoFocus={expanded}
        onBlur={() => {
          props.onBlur?.();
          onCollapse?.();
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: wp(6),
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    minHeight: hp(6),
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  iconContainer: {
    marginRight: spacing.sm,
  },

  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    minHeight: hp(5),
  },

  clearButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },

  rightComponent: {
    marginLeft: spacing.sm,
  },

  // Variante compacta
  compactContainer: {
    minHeight: hp(5),
    paddingHorizontal: spacing.sm,
  },

  compactInput: {
    fontSize: fontSize.sm,
    paddingVertical: spacing.xs,
    minHeight: hp(4),
  },

  // Variante expandible
  expandableButton: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  expandableContainer: {
    height: hp(6),
  },
});

// Componente de búsqueda con sugerencias
export const SearchBarWithSuggestions = ({ 
  suggestions = [], 
  onSuggestionPress,
  maxSuggestions = 5,
  ...props 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(props.value?.toLowerCase() || '')
    )
    .slice(0, maxSuggestions);

  return (
    <View style={styles.suggestionsContainer}>
      <SearchBar
        {...props}
        onFocus={() => {
          setShowSuggestions(true);
          props.onFocus?.();
        }}
        onBlur={() => {
          // Delay para permitir el tap en sugerencias
          setTimeout(() => setShowSuggestions(false), 200);
          props.onBlur?.();
        }}
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <View style={styles.suggestionsList}>
          {filteredSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => {
                onSuggestionPress?.(suggestion);
                setShowSuggestions(false);
              }}
            >
              <Icon name="history" size={wp(4)} color={colors.textSecondary} />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// Estilos para sugerencias
const suggestionStyles = StyleSheet.create({
  suggestionsContainer: {
    position: 'relative',
    zIndex: 1000,
  },

  suggestionsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: wp(2),
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: spacing.xs,
    maxHeight: hp(25),
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  suggestionText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
  },
});

// Combinar estilos
Object.assign(styles, suggestionStyles);

export default SearchBar;