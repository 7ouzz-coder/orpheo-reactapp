import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../styles/colors';

const MiembroCard = ({ miembro, onPress, onLongPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {miembro.nombres?.charAt(0)}{miembro.apellidos?.charAt(0)}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>
          {miembro.nombres} {miembro.apellidos}
        </Text>
        <Text style={styles.grado}>
          {miembro.grado?.toUpperCase()}
        </Text>
      </View>
      <Icon name="chevron-right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  grado: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default MiembroCard;