import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../styles/colors';
import { wp, fontSize, spacing } from '../../utils/dimensions';

const MiembroCard = ({ miembro, onPress, onLongPress }) => {
  const getGradoColor = (grado) => {
    return colors[grado] || colors.primary;
  };

  const initials = miembro.nombres?.charAt(0) + miembro.apellidos?.charAt(0);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={[styles.avatar, { backgroundColor: getGradoColor(miembro.grado) }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {miembro.nombres} {miembro.apellidos}
          </Text>
          
          <View style={styles.badgeContainer}>
            <View style={[styles.gradoBadge, { backgroundColor: getGradoColor(miembro.grado) }]}>
              <Text style={styles.gradoText}>
                {miembro.grado?.toUpperCase()}
              </Text>
            </View>
            
            {miembro.cargo && (
              <View style={styles.cargoBadge}>
                <Text style={styles.cargoText}>
                  {miembro.cargo.replace('_', ' ')}
                </Text>
              </View>
            )}
          </View>
          
          {miembro.email && (
            <View style={styles.contactRow}>
              <Icon name="email" size={wp(3.5)} color={colors.textTertiary} />
              <Text style={styles.contactText} numberOfLines={1}>
                {miembro.email}
              </Text>
            </View>
          )}
          
          {miembro.telefono && (
            <View style={styles.contactRow}>
              <Icon name="phone" size={wp(3.5)} color={colors.textTertiary} />
              <Text style={styles.contactText}>
                {miembro.telefono}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.actionContainer}>
          <View style={[styles.statusIndicator, { 
            backgroundColor: miembro.vigente ? colors.success : colors.error 
          }]} />
          <Icon name="chevron-right" size={wp(5)} color={colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: wp(3),
    marginBottom: spacing.sm,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  avatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  gradoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: wp(1),
    marginRight: spacing.xs,
  },
  gradoText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  cargoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: wp(1),
    backgroundColor: colors.card,
  },
  cargoText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  contactText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    marginLeft: spacing.xs,
    flex: 1,
  },
  actionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    marginBottom: spacing.xs,
  },
});

export default MiembroCard;