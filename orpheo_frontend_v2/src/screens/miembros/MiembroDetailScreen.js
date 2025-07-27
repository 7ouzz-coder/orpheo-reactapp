import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Redux
import {
  fetchMiembroById,
  deleteMiembro,
  clearMiembroSeleccionado,
  selectMiembroSeleccionado,
  selectLoadingDetail,
  selectLoadingDelete,
  selectError,
} from '../../store/slices/miembrosSlice';

// Components
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles, spacing, fontSize, wp, hp } from '../../styles/globalStyles';

// Utils
import { getInitials, formatRUT } from '../../utils/helpers';

const MiembroDetailScreen = ({ route, navigation }) => {
  const { miembroId } = route.params;
  const dispatch = useDispatch();
  
  // Estados locales
  const [showActions, setShowActions] = useState(false);
  
  // Selectores Redux
  const miembro = useSelector(selectMiembroSeleccionado);
  const loading = useSelector(selectLoadingDetail);
  const loadingDelete = useSelector(selectLoadingDelete);
  const error = useSelector(selectError);

  // Cargar miembro al montar componente
  useEffect(() => {
    console.log(`🔍 Cargando detalle del miembro ID: ${miembroId}`);
    dispatch(fetchMiembroById(miembroId));
    
    // Limpiar al desmontar
    return () => {
      dispatch(clearMiembroSeleccionado());
    };
  }, [miembroId, dispatch]);

  // Configurar header con acciones
  useEffect(() => {
    if (miembro) {
      navigation.setOptions({
        title: `${miembro.nombres} ${miembro.apellidos}`,
        headerRight: () => (
          <TouchableOpacity
            onPress={() => setShowActions(!showActions)}
            style={styles.headerButton}
          >
            <Icon name="dots-vertical" size={24} color={colors.text} />
          </TouchableOpacity>
        ),
      });
    }
  }, [miembro, navigation, showActions]);

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

  // Manejar llamada telefónica
  const handleCall = (telefono) => {
    if (telefono) {
      Linking.openURL(`tel:${telefono}`);
    }
  };

  // Manejar envío de email
  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  // Manejar edición
  const handleEdit = () => {
    navigation.navigate('MiembroForm', { miembroId: miembro.id });
  };

  // Manejar eliminación
  const handleDelete = () => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que deseas eliminar a ${miembro.nombres} ${miembro.apellidos}?\n\nEsta acción no se puede deshacer.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteMiembro(miembro.id)).unwrap();
              navigation.goBack();
            } catch (error) {
              console.error('Error al eliminar miembro:', error);
            }
          },
        },
      ]
    );
  };

  // Renderizar campo de información
  const renderInfoField = (label, value, icon, onPress, color) => {
    if (!value) return null;

    return (
      <TouchableOpacity
        style={styles.infoField}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.infoIcon}>
          <Icon name={icon} size={20} color={color || colors.textSecondary} />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={[styles.infoValue, onPress && { color: colors.primary }]}>
            {value}
          </Text>
        </View>
        {onPress && (
          <Icon name="chevron-right" size={20} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
    );
  };

  // Renderizar sección
  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  // Estados de carga y error
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Cargando información del miembro...</Text>
      </View>
    );
  }

  if (error || !miembro) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color={colors.error} />
        <Text style={styles.errorTitle}>Error al cargar miembro</Text>
        <Text style={styles.errorSubtitle}>
          {error || 'No se pudo encontrar la información del miembro'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(fetchMiembroById(miembroId))}
        >
          <Icon name="refresh" size={20} color={colors.white} />
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header del miembro */}
        <View style={styles.memberHeader}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: getGradoColor(miembro.grado) }]}>
            <Text style={styles.avatarText}>
              {getInitials(miembro.nombres, miembro.apellidos)}
            </Text>
          </View>

          {/* Información principal */}
          <Text style={styles.memberName}>
            {miembro.nombres} {miembro.apellidos}
          </Text>
          
          <Text style={styles.memberRut}>
            {formatRUT(miembro.rut)}
          </Text>

          {/* Badges de grado y estado */}
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: getGradoColor(miembro.grado) }]}>
              <Icon 
                name={miembro.grado === 'aprendiz' ? 'school' : miembro.grado === 'companero' ? 'account-group' : 'crown'} 
                size={16} 
                color={colors.white} 
              />
              <Text style={styles.badgeText}>
                {miembro.grado.charAt(0).toUpperCase() + miembro.grado.slice(1)}
              </Text>
            </View>
            
            <View style={[styles.badge, { backgroundColor: getEstadoColor(miembro.estado) }]}>
              <Icon name="circle" size={8} color={colors.white} />
              <Text style={styles.badgeText}>
                {miembro.estado.charAt(0).toUpperCase() + miembro.estado.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Información de contacto */}
        {renderSection('Información de Contacto', (
          <>
            {renderInfoField(
              'Email',
              miembro.email,
              'email',
              miembro.email ? () => handleEmail(miembro.email) : null,
              colors.primary
            )}
            {renderInfoField(
              'Teléfono',
              miembro.telefono,
              'phone',
              miembro.telefono ? () => handleCall(miembro.telefono) : null,
              colors.success
            )}
            {renderInfoField(
              'Dirección',
              miembro.direccion,
              'map-marker',
              null
            )}
          </>
        ))}

        {/* Información personal */}
        {renderSection('Información Personal', (
          <>
            {renderInfoField(
              'Fecha de Nacimiento',
              miembro.fechaNacimiento ? new Date(miembro.fechaNacimiento).toLocaleDateString('es-CL') : null,
              'calendar',
              null
            )}
            {renderInfoField(
              'Ciudad de Nacimiento',
              miembro.ciudadNacimiento,
              'city',
              null
            )}
            {renderInfoField(
              'Profesión',
              miembro.profesion,
              'briefcase',
              null
            )}
          </>
        ))}

        {/* Información masónica */}
        {renderSection('Información Masónica', (
          <>
            {renderInfoField(
              'Fecha de Iniciación',
              miembro.fechaIniciacion ? new Date(miembro.fechaIniciacion).toLocaleDateString('es-CL') : null,
              'calendar-star',
              null
            )}
            {renderInfoField(
              'Fecha de Ingreso',
              miembro.fechaIngreso ? new Date(miembro.fechaIngreso).toLocaleDateString('es-CL') : null,
              'calendar-check',
              null
            )}
          </>
        ))}

        {/* Información del sistema */}
        {renderSection('Información del Sistema', (
          <>
            {renderInfoField(
              'Fecha de Registro',
              new Date(miembro.created_at).toLocaleString('es-CL'),
              'clock-plus',
              null
            )}
            {renderInfoField(
              'Última Actualización',
              new Date(miembro.updated_at).toLocaleString('es-CL'),
              'clock-edit',
              null
            )}
          </>
        ))}
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
        >
          <Icon name="pencil" size={20} color={colors.white} />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton, 
            styles.deleteButton,
            { opacity: loadingDelete ? 0.5 : 1 }
          ]}
          onPress={handleDelete}
          disabled={loadingDelete}
        >
          <Icon 
            name={loadingDelete ? "loading" : "delete"} 
            size={20} 
            color={colors.white} 
          />
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  content: {
    flex: 1,
  },
  
  headerButton: {
    padding: spacing.sm,
  },
  
  memberHeader: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  avatarText: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
  },
  
  memberName: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  
  memberRut: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  
  badgeText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  
  section: {
    marginBottom: spacing.lg,
  },
  
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  
  sectionContent: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  infoField: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  infoIcon: {
    width: 40,
    alignItems: 'center',
  },
  
  infoContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  
  infoValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  
  actionButtons: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  
  editButton: {
    backgroundColor: colors.primary,
  },
  
  deleteButton: {
    backgroundColor: colors.error,
  },
  
  actionButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  
  errorTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.error,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  
  errorSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 25,
    gap: spacing.sm,
  },
  
  retryButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

export default MiembroDetailScreen;