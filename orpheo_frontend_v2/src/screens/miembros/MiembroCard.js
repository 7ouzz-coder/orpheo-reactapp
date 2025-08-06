import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, colorOpacity } from '../../styles/colors';
import { wp, hp, fontSize, spacing } from '../../utils/dimensions';

const MiembroCard = ({ 
  miembro, 
  onPress, 
  onEdit, 
  onLongPress,
  style,
  showActions = true 
}) => {
  // Colores según el grado masónico
  const getGradoColor = (grado) => {
    switch (grado?.toLowerCase()) {
      case 'aprendiz':
        return colors.info;
      case 'companero':
      case 'compañero':
        return colors.warning;
      case 'maestro':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  // Icono según el grado
  const getGradoIcon = (grado) => {
    switch (grado?.toLowerCase()) {
      case 'aprendiz':
        return 'school';
      case 'companero':
      case 'compañero':
        return 'hammer-wrench';
      case 'maestro':
        return 'crown';
      default:
        return 'account';
    }
  };

  // Estado del miembro
  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return colors.success;
      case 'inactivo':
        return colors.warning;
      case 'suspendido':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  // Formatear fecha de ingreso
  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Iniciales del nombre
  const getIniciales = (nombres, apellidos) => {
    const n = nombres?.charAt(0)?.toUpperCase() || '';
    const a = apellidos?.charAt(0)?.toUpperCase() || '';
    return n + a || '??';
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress?.(miembro)}
      onLongPress={() => onLongPress?.(miembro)}
      activeOpacity={0.7}
    >
      {/* Header con avatar y acciones */}
      <View style={styles.header}>
        {/* Avatar con iniciales */}
        <View style={[styles.avatar, { backgroundColor: getGradoColor(miembro.grado) }]}>
          <Text style={styles.avatarText}>
            {getIniciales(miembro.nombres, miembro.apellidos)}
          </Text>
        </View>

        {/* Información principal */}
        <View style={styles.info}>
          <Text style={styles.nombre} numberOfLines={1}>
            {miembro.nombres} {miembro.apellidos}
          </Text>
          
          <View style={styles.gradoContainer}>
            <Icon 
              name={getGradoIcon(miembro.grado)} 
              size={wp(3.5)} 
              color={getGradoColor(miembro.grado)} 
            />
            <Text style={[styles.grado, { color: getGradoColor(miembro.grado) }]}>
              {miembro.grado || 'Sin grado'}
            </Text>
          </View>

          <Text style={styles.rut} numberOfLines={1}>
            RUT: {miembro.rut || 'N/A'}
          </Text>
        </View>

        {/* Estado del miembro */}
        <View style={styles.estadoContainer}>
          <View style={[styles.estadoIndicator, { backgroundColor: getEstadoColor(miembro.estado) }]} />
          <Text style={[styles.estadoText, { color: getEstadoColor(miembro.estado) }]}>
            {(miembro.estado || 'N/A').toUpperCase()}
          </Text>
        </View>

        {/* Botón de acciones */}
        {showActions && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit?.(miembro)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="dots-vertical" size={wp(5)} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Información adicional */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Icon name="email" size={wp(3.5)} color={colors.textSecondary} />
          <Text style={styles.detailText} numberOfLines={1}>
            {miembro.email || 'Sin email'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="phone" size={wp(3.5)} color={colors.textSecondary} />
          <Text style={styles.detailText} numberOfLines={1}>
            {miembro.telefono || 'Sin teléfono'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="calendar" size={wp(3.5)} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            Ingreso: {formatFecha(miembro.fecha_ingreso)}
          </Text>
        </View>

        {miembro.profesion && (
          <View style={styles.detailRow}>
            <Icon name="briefcase" size={wp(3.5)} color={colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {miembro.profesion}
            </Text>
          </View>
        )}
      </View>

      {/* Footer con estadísticas rápidas si están disponibles */}
      {miembro.stats && (
        <View style={styles.footer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{miembro.stats.asistencias || 0}</Text>
            <Text style={styles.statLabel}>Asistencias</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{miembro.stats.eventos || 0}</Text>
            <Text style={styles.statLabel}>Eventos</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{miembro.stats.anos || 0}</Text>
            <Text style={styles.statLabel}>Años</Text>
          </View>
        </View>
      )}

      {/* Indicador de selección si está seleccionado */}
      {miembro.selected && (
        <View style={styles.selectedIndicator}>
          <Icon name="check-circle" size={wp(5)} color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: wp(3),
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: wp(1),
    borderLeftColor: colors.primary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  avatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },

  avatarText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },

  info: {
    flex: 1,
    marginRight: spacing.sm,
  },

  nombre: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  gradoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  grado: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginLeft: spacing.xs,
    textTransform: 'capitalize',
  },

  rut: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },

  estadoContainer: {
    alignItems: 'center',
    marginRight: spacing.sm,
  },

  estadoIndicator: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    marginBottom: spacing.xs,
  },

  estadoText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },

  actionButton: {
    padding: spacing.xs,
    borderRadius: wp(2),
  },

  details: {
    marginBottom: spacing.sm,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  detailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  stat: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.primary,
  },

  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  selectedIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: wp(3),
    padding: spacing.xs,
  },
});

export default MiembroCard;