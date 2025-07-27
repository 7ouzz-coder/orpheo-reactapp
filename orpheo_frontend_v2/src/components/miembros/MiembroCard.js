import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';

// Redux
import { 
  deleteMiembro, 
  selectLoadingDelete 
} from '../../store/slices/miembrosSlice';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles, spacing, fontSize, wp, hp } from '../../styles/globalStyles';

// Utils
import { getInitials, formatRUT, truncateText } from '../../utils/helpers';

const MiembroCard = ({ miembro, onPress, onEdit, style }) => {
  const dispatch = useDispatch();
  const loadingDelete = useSelector(selectLoadingDelete);

  // Colores por grado
  const getGradoColor = (grado) => {
    switch (grado) {
      case 'aprendiz':
        return colors.info;
      case 'companero':
        return colors.warning;
      case 'maestro':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  // Icono por grado
  const getGradoIcon = (grado) => {
    switch (grado) {
      case 'aprendiz':
        return 'school';
      case 'companero':
        return 'account-group';
      case 'maestro':
        return 'crown';
      default:
        return 'account';
    }
  };

  // Color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo':
        return colors.success;
      case 'inactivo':
        return colors.textSecondary;
      case 'suspendido':
        return colors.warning;
      case 'irradiado':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  // Confirmar eliminación
  const handleDelete = () => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que deseas eliminar a ${miembro.nombres} ${miembro.apellidos}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteMiembro(miembro.id));
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={() => onPress?.(miembro)}
      activeOpacity={0.7}
    >
      {/* Header con avatar e info principal */}
      <View style={styles.header}>
        {/* Avatar con iniciales */}
        <View style={[styles.avatar, { backgroundColor: getGradoColor(miembro.grado) }]}>
          <Text style={styles.avatarText}>
            {getInitials(miembro.nombres, miembro.apellidos)}
          </Text>
        </View>

        {/* Info principal */}
        <View style={styles.mainInfo}>
          <Text style={styles.nombre}>
            {truncateText(`${miembro.nombres} ${miembro.apellidos}`, 25)}
          </Text>
          
          <Text style={styles.rut}>
            {formatRUT(miembro.rut)}
          </Text>

          {miembro.email && (
            <Text style={styles.email}>
              {truncateText(miembro.email, 30)}
            </Text>
          )}
        </View>

        {/* Acciones */}
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(miembro)}
            >
              <Icon name="pencil" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { opacity: loadingDelete ? 0.5 : 1 }]}
            onPress={handleDelete}
            disabled={loadingDelete}
          >
            <Icon 
              name={loadingDelete ? "loading" : "delete"} 
              size={20} 
              color={colors.error} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Body con detalles */}
      <View style={styles.body}>
        {/* Grado y Estado */}
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getGradoColor(miembro.grado) }]}>
            <Icon 
              name={getGradoIcon(miembro.grado)} 
              size={14} 
              color={colors.white} 
              style={styles.badgeIcon}
            />
            <Text style={styles.badgeText}>
              {miembro.grado.charAt(0).toUpperCase() + miembro.grado.slice(1)}
            </Text>
          </View>

          <View style={[styles.badge, { backgroundColor: getEstadoColor(miembro.estado) }]}>
            <Icon 
              name="circle" 
              size={8} 
              color={colors.white} 
              style={styles.badgeIcon}
            />
            <Text style={styles.badgeText}>
              {miembro.estado.charAt(0).toUpperCase() + miembro.estado.slice(1)}
            </Text>
          </View>
        </View>

        {/* Información adicional */}
        <View style={styles.additionalInfo}>
          {miembro.telefono && (
            <View style={styles.infoRow}>
              <Icon name="phone" size={14} color={colors.textSecondary} />
              <Text style={styles.infoText}>{miembro.telefono}</Text>
            </View>
          )}

          {miembro.fechaIngreso && (
            <View style={styles.infoRow}>
              <Icon name="calendar" size={14} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                Ingreso: {new Date(miembro.fechaIngreso).toLocaleDateString('es-CL')}
              </Text>
            </View>
          )}

          {miembro.profesion && (
            <View style={styles.infoRow}>
              <Icon name="briefcase" size={14} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                {truncateText(miembro.profesion, 25)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer con última actualización */}
      {miembro.updated_at && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Actualizado: {new Date(miembro.updated_at).toLocaleString('es-CL')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.sm,
    ...globalStyles.shadow,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  
  avatarText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  
  mainInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  
  nombre: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  
  rut: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  
  email: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  actionButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
    borderRadius: 6,
    backgroundColor: colors.background + '20',
  },
  
  body: {
    marginTop: spacing.xs,
  },
  
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  
  badgeIcon: {
    marginRight: 4,
  },
  
  badgeText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: '600',
  },
  
  additionalInfo: {
    gap: spacing.xs,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  infoText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
  },
  
  footer: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  footerText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    fontStyle: 'italic',
  },
});

export default MiembroCard;