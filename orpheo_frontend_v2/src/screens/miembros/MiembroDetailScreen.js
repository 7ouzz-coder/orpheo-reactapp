import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

// Hooks y servicios
import { useMiembros } from '../../hooks/useMiembros';

// Componentes
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Estilos
import { colors } from '../../styles/colors';
import { wp, hp, fontSize, spacing } from '../../utils/dimensions';

const MiembroDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { miembroId } = route.params;

  // Hook personalizado de miembros
  const {
    miembroActual,
    loading,
    error,
    getMiembro,
    deleteMiembroWithConfirmation,
    clearErrors,
  } = useMiembros();

  // Estados locales
  const [refreshing, setRefreshing] = useState(false);

  // Cargar miembro al montar o enfocar
  useFocusEffect(
    React.useCallback(() => {
      if (miembroId) {
        loadMiembroData();
      }
    }, [miembroId])
  );

  // Configurar header de navegación
  useEffect(() => {
    navigation.setOptions({
      title: miembroActual ? `${miembroActual.nombres} ${miembroActual.apellidos}` : 'Detalle del Miembro',
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleEdit}
            disabled={loading.detail}
          >
            <Icon name="pencil" size={wp(5)} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { marginLeft: spacing.sm }]}
            onPress={handleDelete}
            disabled={loading.detail || loading.delete}
          >
            <Icon name="delete" size={wp(5)} color={colors.error} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, miembroActual, loading, handleEdit, handleDelete]);

  // Cargar datos del miembro
  const loadMiembroData = async () => {
    try {
      await getMiembro(miembroId);
    } catch (error) {
      console.error('Error cargando miembro:', error);
      // El error ya se maneja en el hook
    }
  };

  // Refrescar datos
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadMiembroData();
    } finally {
      setRefreshing(false);
    }
  };

  // Navegar a editar
  const handleEdit = () => {
    if (miembroActual) {
      navigation.navigate('MiembroForm', {
        miembroId: miembroActual.id,
        mode: 'edit',
      });
    }
  };

  // Eliminar miembro
  const handleDelete = () => {
    if (miembroActual) {
      deleteMiembroWithConfirmation(miembroActual, () => {
        navigation.goBack();
      });
    }
  };

  // Acciones de contacto
  const handleCall = (telefono) => {
    if (telefono) {
      Linking.openURL(`tel:${telefono}`).catch(() => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No se puede realizar la llamada',
        });
      });
    }
  };

  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`).catch(() => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No se puede abrir el cliente de email',
        });
      });
    }
  };

  const handleWhatsApp = (telefono) => {
    if (telefono) {
      const cleanPhone = telefono.replace(/[^\d]/g, '');
      Linking.openURL(`whatsapp://send?phone=${cleanPhone}`).catch(() => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'WhatsApp no está instalado',
        });
      });
    }
  };

  // Utilidades de formato
  const formatFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    try {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const diferenciaMeses = hoy.getMonth() - nacimiento.getMonth();
      
      if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      
      return edad;
    } catch {
      return null;
    }
  };

  const calcularAnosMembresia = (fechaIngreso) => {
    if (!fechaIngreso) return null;
    try {
      const hoy = new Date();
      const ingreso = new Date(fechaIngreso);
      const diferencia = hoy - ingreso;
      const anos = diferencia / (1000 * 60 * 60 * 24 * 365.25);
      return Math.floor(anos * 10) / 10; // Redondear a 1 decimal
    } catch {
      return null;
    }
  };

  // Colores según grado
  const getGradoInfo = (grado) => {
    switch (grado?.toLowerCase()) {
      case 'aprendiz':
        return { color: colors.info, icon: 'school', label: 'Aprendiz Masón' };
      case 'companero':
      case 'compañero':
        return { color: colors.warning, icon: 'hammer-wrench', label: 'Compañero Masón' };
      case 'maestro':
        return { color: colors.success, icon: 'crown', label: 'Maestro Masón' };
      default:
        return { color: colors.textSecondary, icon: 'account', label: 'Sin grado especificado' };
    }
  };

  const getEstadoInfo = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return { color: colors.success, icon: 'check-circle', label: 'Miembro Activo' };
      case 'inactivo':
        return { color: colors.warning, icon: 'pause-circle', label: 'Miembro Inactivo' };
      case 'suspendido':
        return { color: colors.error, icon: 'cancel', label: 'Miembro Suspendido' };
      default:
        return { color: colors.textSecondary, icon: 'help-circle', label: 'Estado no especificado' };
    }
  };

  // Renderizar campo de información
  const renderInfoField = (icon, label, value, action = null, actionIcon = null) => (
    <View style={styles.infoField}>
      <View style={styles.infoFieldLeft}>
        <Icon name={icon} size={wp(5)} color={colors.textSecondary} />
        <View style={styles.infoFieldContent}>
          <Text style={styles.infoFieldLabel}>{label}</Text>
          <Text style={styles.infoFieldValue} selectable>
            {value || 'No especificado'}
          </Text>
        </View>
      </View>
      {action && value && (
        <TouchableOpacity style={styles.actionButton} onPress={action}>
          <Icon name={actionIcon} size={wp(4)} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  // Renderizar sección
  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  // Estados de carga y error
  if (loading.detail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Cargando información del miembro...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !miembroActual) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={wp(15)} color={colors.error} />
          <Text style={styles.errorTitle}>Error al cargar</Text>
          <Text style={styles.errorMessage}>
            {error.message || 'No se pudo cargar la información del miembro'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMiembroData}>
            <Icon name="refresh" size={wp(4)} color={colors.white} />
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!miembroActual) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="account-off" size={wp(15)} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>Miembro no encontrado</Text>
          <Text style={styles.errorMessage}>
            El miembro solicitado no existe o ha sido eliminado
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const gradoInfo = getGradoInfo(miembroActual.grado);
  const estadoInfo = getEstadoInfo(miembroActual.estado);
  const edad = calcularEdad(miembroActual.fecha_nacimiento);
  const anosMembresia = calcularAnosMembresia(miembroActual.fecha_ingreso);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header con avatar y información principal */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: gradoInfo.color }]}>
            <Text style={styles.avatarText}>
              {miembroActual.nombres?.charAt(0)}
              {miembroActual.apellidos?.charAt(0)}
            </Text>
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.memberName}>
              {miembroActual.nombres} {miembroActual.apellidos}
            </Text>
            
            <View style={styles.gradoContainer}>
              <Icon name={gradoInfo.icon} size={wp(4)} color={gradoInfo.color} />
              <Text style={[styles.gradoText, { color: gradoInfo.color }]}>
                {gradoInfo.label}
              </Text>
            </View>
            
            <View style={styles.estadoContainer}>
              <Icon name={estadoInfo.icon} size={wp(4)} color={estadoInfo.color} />
              <Text style={[styles.estadoText, { color: estadoInfo.color }]}>
                {estadoInfo.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Acciones rápidas */}
        <View style={styles.quickActions}>
          {miembroActual.telefono && (
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => handleCall(miembroActual.telefono)}
            >
              <Icon name="phone" size={wp(5)} color={colors.white} />
              <Text style={styles.quickActionText}>Llamar</Text>
            </TouchableOpacity>
          )}
          
          {miembroActual.email && (
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => handleEmail(miembroActual.email)}
            >
              <Icon name="email" size={wp(5)} color={colors.white} />
              <Text style={styles.quickActionText}>Email</Text>
            </TouchableOpacity>
          )}
          
          {miembroActual.telefono && (
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => handleWhatsApp(miembroActual.telefono)}
            >
              <Icon name="whatsapp" size={wp(5)} color={colors.white} />
              <Text style={styles.quickActionText}>WhatsApp</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Información personal */}
        {renderSection('Información Personal', (
          <>
            {renderInfoField('card-account-details', 'RUT', miembroActual.rut)}
            {renderInfoField(
              'email', 
              'Correo electrónico', 
              miembroActual.email,
              () => handleEmail(miembroActual.email),
              'open-in-new'
            )}
            {renderInfoField(
              'phone', 
              'Teléfono', 
              miembroActual.telefono,
              () => handleCall(miembroActual.telefono),
              'phone'
            )}
            {renderInfoField('cake', 'Fecha de nacimiento', formatFecha(miembroActual.fecha_nacimiento))}
            {edad && renderInfoField('calendar-today', 'Edad', `${edad} años`)}
            {renderInfoField('map-marker', 'Ciudad de nacimiento', miembroActual.ciudad_nacimiento)}
            {renderInfoField('home', 'Dirección', miembroActual.direccion)}
            {renderInfoField('briefcase', 'Profesión', miembroActual.profesion)}
          </>
        ))}

        {/* Información masónica */}
        {renderSection('Información Masónica', (
          <>
            {renderInfoField('crown', 'Grado masónico', gradoInfo.label)}
            {renderInfoField('calendar-plus', 'Fecha de ingreso', formatFecha(miembroActual.fecha_ingreso))}
            {anosMembresia && renderInfoField('clock', 'Años de membresía', `${anosMembresia} años`)}
            {renderInfoField('account-check', 'Estado', estadoInfo.label)}
          </>
        ))}

        {/* Observaciones */}
        {miembroActual.observaciones && renderSection('Observaciones', (
          <View style={styles.observacionesContainer}>
            <Text style={styles.observacionesText} selectable>
              {miembroActual.observaciones}
            </Text>
          </View>
        ))}

        {/* Estadísticas */}
        {miembroActual.stats && renderSection('Estadísticas', (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{miembroActual.stats.asistencias || 0}</Text>
              <Text style={styles.statLabel}>Asistencias</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{miembroActual.stats.eventos || 0}</Text>
              <Text style={styles.statLabel}>Eventos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{miembroActual.stats.anos || anosMembresia || 0}</Text>
              <Text style={styles.statLabel}>Años</Text>
            </View>
          </View>
        ))}

        {/* Información de metadatos */}
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>
            Última actualización: {formatFecha(miembroActual.updated_at)}
          </Text>
          {miembroActual.creado_por && (
            <Text style={styles.metadataText}>
              Creado por: Usuario ID {miembroActual.creado_por}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Toast */}
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: spacing.xl,
  },

  // Header con avatar
  header: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  avatar: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  avatarText: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
  },

  headerInfo: {
    alignItems: 'center',
  },

  memberName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  gradoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  gradoText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },

  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  estadoText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },

  // Acciones rápidas
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },

  quickAction: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: wp(6),
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  quickActionText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },

  // Secciones
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: wp(3),
    overflow: 'hidden',
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  // Campos de información
  infoField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  infoFieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  infoFieldContent: {
    marginLeft: spacing.sm,
    flex: 1,
  },

  infoFieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },

  infoFieldValue: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  actionButton: {
    padding: spacing.sm,
    borderRadius: wp(2),
  },

  // Observaciones
  observacionesContainer: {
    padding: spacing.md,
  },

  observacionesText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: fontSize.md * 1.5,
  },

  // Estadísticas
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
  },

  statItem: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },

  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },

  // Metadatos
  metadata: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },

  metadataText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },

  // Header actions
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerButton: {
    padding: spacing.sm,
    borderRadius: wp(2),
  },

  // Estados de carga y error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  errorTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  errorMessage: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.4,
    marginBottom: spacing.xl,
  },

  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: wp(2),
  },

  retryButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});

export default MiembroDetailScreen;