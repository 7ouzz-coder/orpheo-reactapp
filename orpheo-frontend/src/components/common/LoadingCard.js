import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';

const LoadingCard = ({ height = 60, width = '100%' }) => {
  return <View style={[styles.card, { height, width }]} />;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    opacity: 0.6,
  },
});

export default LoadingCard;