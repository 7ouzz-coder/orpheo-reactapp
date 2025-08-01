import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Platform } from 'react-native'; // ✅ PLATFORM AGREGADO
import { colors } from '../../styles/colors';
import { spacing, fontSize } from '../../styles/globalStyles';

const LoadingSpinner = ({ 
  size = "large", 
  text = "Cargando...", 
  color = colors.primary,
  style = {} 
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator 
        size={size} 
        color={color}
        style={styles.spinner}
      />
      {text && (
        <Text style={styles.text}>{text}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  
  spinner: {
    marginBottom: spacing.md,
  },
  
  text: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    ...Platform.select({ // ✅ PLATFORM USADO CORRECTAMENTE
      ios: {
        fontWeight: '500',
      },
      android: {
        fontWeight: '400',
      },
    }),
  },
});

export const LoadingOverlay = ({ visible = true, text = "Cargando..." }) => {
  if (!visible) return null;
  
  return (
    <View style={overlayStyles.overlay}>
      <View style={overlayStyles.content}>
        <LoadingSpinner text={text} />
      </View>
    </View>
  );
};

const overlayStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  
  content: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xl,
    minWidth: 200,
    alignItems: 'center',
  },
});

export default LoadingSpinner;