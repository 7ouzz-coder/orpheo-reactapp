import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Share,
  Platform, // ✅ IMPORT AGREGADO
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Redux
import {
  fetchMiembroById,
  deleteMiembro,
  clearSelectedMiembro,
  selectMiembroSeleccionado,
  selectLoadingDetail,
  selectError,
} from '../../store/slices/miembrosSlice';

// Components
import TabSafeView from '../../components/common/TabSafeView';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles, spacing, fontSize } from '../../styles/globalStyles';

const MiembroDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const { miembroId } = route.params;
  const miembro = useSelector(selectMiembroSeleccionado);
  const loading = useSelector(selectLoadingDetail);
  const error = useSelector(selectError);

  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos al enfocar la pantalla
  useFocusEffect(
    React.useCallback(() => {
      if (miembroId) {
        console.log(`🔍 Cargando detalle del miembro ID: ${miembroId}`);
        dispatch(fetchMiembroById(miembroId));
      }
      
      return () => {
        // Limpiar miembro seleccionado al salir
        dispatch(clearSelectedMiembro());
      };
    }, [miembroId, dispatch])
  );

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchMiembroById(miembroId)).unwrap();
    } catch (error) {
      console.error('Error al refrescar:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Navegar a editar
  const handleEdit = () => {
    navigation.navigate('MiembroForm', { miembroId });
  };

  // Eliminar miembro con confirmación
  const handleDelete = () => {
    if (!miembro) return;

    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de eliminar a ${miembro.nombres} ${miembro.apellidos}?\n\nEsta acción no se puede deshacer.`,
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
              await dispatch(deleteMiembro(miembroId)).unwrap();
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                'Error',
                'No se pudo eliminar el miembro. Verifica tu conexión e intenta nuevamente.'
              );
            }
          },
        },
      ]
    );
  };

  // Llamar al miembro
  const handleCall = () => {
    if (miembro?.telefono) {
      const phoneUrl = `tel:${miembro.telefono}`;
      Linking.canOpenURL(phoneUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(phoneUrl);
          } else {
            Alert.alert('Error', 'No se puede realizar la llamada');
          }
        });
    }
  };

  // Enviar email
  const handleEmail = () => {
    if (miembro?.email) {
      const emailUrl = `mailto:${miembro.email}`;
      Linking.canOpenURL(emailUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(emailUrl);
          } else {
            Alert.alert('Error', 'No se puede abrir el cliente de email');
          }
        });
    }
  };

  // Compartir información del miembro
  const handleShare = async () => {
    if (!miembro) return;

    try {
      const shareContent = {
        message: `Información de ${miembro.nombres} ${miembro.apellidos}\n` +
                 `Grado: ${miembro.grado}\n` +
                 `Email: ${miembro.email}\n` +
                 `${miembro.telefono ? `Teléfono: ${miembro.telefono}` : ''}`,
      };

      await Share.share(shareContent);
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  // Helpers para obtener colores y iconos
  const getGradoColor = (grado) => {
    const gradoColors = {
      aprendiz: '#10B981',  // Verde
      companero: '#F59E0B', // Amarillo/Dorado
      maestro: '#8B5CF6',   // Púrpura
    };
    return gradoColors[grado] || '#6B7280';
  };

  const getGradoIcon = (grado) => {
    const gradoIcons = {
      aprendiz: 'hammer',
      companero: 'cog',
      maestro: 'crown',
    };
    return gradoIcons[grado] || 'account';
  };

  const getEstadoColor = (estado) => {
    const estadoColors = {
      activo: '#10B981',
      inactivo: '#F59E0B',
      suspendido: '#EF4444',
    };
    return estadoColors[estado] || '#6B7280';
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'No registrada';
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calcularAnosEnLogia = (fechaIngreso) => {
    if (!fechaIngreso) return 0;
    const hoy = new Date();
    const ingreso = new Date(fechaIngreso);
    const diffTime = Math.abs(hoy - ingreso);
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    return diffYears;
  };

  // Estados de carga y error
  if (loading && !miembro) {
    return (
      <TabSafeView style={styles.loadingContainer}>
        <LoadingSpinner size="large" text="Cargando información del miembro..." />
      </TabSafeView>
    );
  }

  if (error && !miembro) {
    return (
      <TabSafeView style={styles.errorContainer}>
        <Icon name="account-alert" size={64} color={colors.error} />
        <Text style={styles.errorTitle}>Error al cargar</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(fetchMiembroById(miembroId))}>
          <Icon name="refresh" size={20} color={colors.white} />
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </TabSafeView>
    );
  }

  if (!miembro) {
    return (
      <TabSafeView style={styles.errorContainer}>
        <Icon name="account-off" size={64} color={colors.textMuted} />
        <Text style={styles.errorTitle}>Miembro no encontrado</Text>
        <Text style={styles.errorText}>El miembro que buscas no existe o ha sido eliminado.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </TabSafeView>
    );
  }

  return (
    <TabSafeView>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <Icon 
              name={getGradoIcon(miembro.grado)} 
              size={48} 
              color={getGradoColor(miembro.grado)} 
            />
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.memberName}>
              {miembro.nombres} {miembro.apellidos}
            </Text>
            <Text style={styles.memberEmail}>{miembro.email}</Text>
            
            <View style={styles.badges}>
              <View style={[
                styles.gradoBadge, 
                { backgroundColor: getGradoColor(miembro.grado) }
              ]}>
                <Text style={styles.gradoBadgeText}>
                  {miembro.grado?.charAt(0).toUpperCase() + miembro.grado?.slice(1)}
                </Text>
              </View>
              
              <View style={[
                styles.estadoBadge,
                { backgroundColor: getEstadoColor(miembro.estado) }
              ]}>
                <Text style={styles.estadoBadgeText}>
                  {miembro.estado?.charAt(0).toUpperCase() + miembro.estado?.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* Botones de acción rápida */}
          <View style={styles.quickActions}>
            {miembro.telefono && (
              <TouchableOpacity style={styles.quickActionButton} onPress={handleCall}>
                <Icon name="phone" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.quickActionButton} onPress={handleEmail}>
              <Icon name="email" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleShare}>
              <Icon name="share" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="account-details" size={20} color={colors.primary} /> Información Personal
          </Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Icon name="card-account-details" size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>RUT</Text>
                <Text style={styles.infoValue}>{miembro.rut}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{miembro.telefono || 'No registrado'}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="calendar-account" size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Fecha de Nacimiento</Text>
                <Text style={styles.infoValue}>{formatFecha(miembro.fecha_nacimiento)}</Text>
              </View>
            </View>
            
            {miembro.direccion && (
              <View style={styles.infoRow}>
                <Icon name="map-marker" size={20} color={colors.textSecondary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Dirección</Text>
                  <Text style={styles.infoValue}>{miembro.direccion}</Text>
                </View>
              </View>
            )}

            {miembro.profesion && (
              <View style={styles.infoRow}>
                <Icon name="briefcase" size={20} color={colors.textSecondary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Profesión</Text>
                  <Text style={styles.infoValue}>{miembro.profesion}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Información Masónica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="compass" size={20} color={colors.primary} /> Información Masónica
          </Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Icon name={getGradoIcon(miembro.grado)} size={20} color={getGradoColor(miembro.grado)} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Grado</Text>
                <Text style={[styles.infoValue, { color: getGradoColor(miembro.grado) }]}>
                  {miembro.grado?.charAt(0).toUpperCase() + miembro.grado?.slice(1)}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="calendar-check" size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Fecha de Ingreso</Text>
                <Text style={styles.infoValue}>{formatFecha(miembro.fecha_ingreso)}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="clock-outline" size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Años en la Logia</Text>
                <Text style={styles.infoValue}>
                  {calcularAnosEnLogia(miembro.fecha_ingreso)} años
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="account-check" size={20} color={getEstadoColor(miembro.estado)} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Estado</Text>
                <Text style={[styles.infoValue, { color: getEstadoColor(miembro.estado) }]}>
                  {miembro.estado?.charAt(0).toUpperCase() + miembro.estado?.slice(1)}
                </Text>
              </View>
            </View>

            {miembro.cargo && (
              <View style={styles.infoRow}>
                <Icon name="star" size={20} color={colors.warning} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Cargo</Text>
                  <Text style={styles.infoValue}>{miembro.cargo}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Metadatos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="information" size={20} color={colors.primary} /> Información del Sistema
          </Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Icon name="calendar-plus" size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Fecha de Registro</Text>
                <Text style={styles.infoValue}>{formatFecha(miembro.created_at)}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="calendar-edit" size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Última Actualización</Text>
                <Text style={styles.infoValue}>{formatFecha(miembro.updated_at)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Espaciado para botones flotantes */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Botones de acción flotantes */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={handleEdit}
          activeOpacity={0.8}
        >
          <Icon name="pencil" size={20} color={colors.white} />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Icon name="delete" size={20} color={colors.white} />
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </TabSafeView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Loading y Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
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
  
  errorText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 25,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  
  retryButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  
  backButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },

  // Header Card
  headerCard: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    marginRight: spacing.md,
  },
  
  headerInfo: {
    flex: 1,
  },
  
  memberName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  
  memberEmail: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  
  gradoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  gradoBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.white,
  },
  
  estadoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  estadoBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.white,
  },
  
  quickActions: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  quickActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Sections
  section: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  infoGrid: {
    gap: spacing.md,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  
  infoContent: {
    flex: 1,
    marginLeft: spacing.md,
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

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 25,
    gap: spacing.sm,
  },
  
  editButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: 25,
    gap: spacing.sm,
  },
  
  deleteButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  
  bottomSpacer: {
    height: spacing.xl,
  },
});

export default MiembroDetailScreen;