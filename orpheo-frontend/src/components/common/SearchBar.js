import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../styles/colors';
import { wp, fontSize, spacing } from '../../utils/dimensions';

const SearchBar = ({ 
  value, 
  onChangeText, 
  placeholder = 'Buscar...',
  onClear,
  editable = true,
  autoFocus = false 
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  const borderColor = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.card, colors.primary],
  });

  return (
    <Animated.View style={[styles.container, { borderColor }]}>
      <Icon name="search" size={wp(5)} color={colors.textSecondary} style={styles.searchIcon} />
      
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={editable}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        returnKeyType="search"
      />
      
      {value.length > 0 && (
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={handleClear}
          activeOpacity={0.8}
        >
          <Icon name="clear" size={wp(5)} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: wp(2),
    paddingHorizontal: spacing.sm,
    borderWidth: 2,
    minHeight: wp(12),
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
    borderRadius: wp(1),
  },
});

export default SearchBar;