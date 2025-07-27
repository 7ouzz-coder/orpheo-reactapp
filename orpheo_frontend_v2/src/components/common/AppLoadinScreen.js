import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../styles/colors';
import { spacing, fontSize } from '../../styles/globalStyles';

const AppLoadingScreen = ({ text = "Cargando Orpheo..." }) => {
  const insets = useSafeAreaInsets();

  const containerStyle = {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: Math.max(insets.left, spacing.md),
    paddingRight: Math.max(insets.right, spacing.md),
  };

  return (
    <View style={containerStyle}>
      <Icon name="temple-buddhist" size={80} color={colors.primary} />
      <Text style={styles.appTitle}>ORPHEO</Text>
      <ActivityIndicator 
        size="large" 
        color={colors.primary} 
        style={styles.spinner}
      />
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  appTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    letterSpacing: 2,
  },
  
  spinner: {
    marginBottom: spacing.md,
  },
  
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default AppLoadingScreen;