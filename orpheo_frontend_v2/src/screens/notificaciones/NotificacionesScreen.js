import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

// Components
import TabSafeView from '../../components/common/TabSafeView';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles, spacing, fontSize, wp, hp } from '../../styles/globalStyles';

const NotificacionesScreen = ({ navigation }) => {
  // Estados locales
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todas'); // 'todas', 'no_leidas', 'importantes'

  // Cargar notificaciones (datos mock por ahora)
  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos mock
      const mockNotificaciones = [
        {
          id: 1,
          titulo: 'Nueva Tenida Programada',
          mensaje: 'Se ha programado una tenida extraordinaria para el próximo viernes 15 de marzo a las 20:00 hrs.',
          tipo: 'evento',
          categoria: 'importante',
          leida: false,
          fecha: '2024-03-10T14:30:00Z',
          icono: 'calendar-clock',
          color: colors.primary,
          autor: {
            nombres: 'Carlos',
            apellidos: 'Mendoza',
            cargo: 'Venerable Maestro'
          }
        },
        {
          id: 2,
          titulo: 'Documento Aprobado',
          mensaje: 'Tu plancha "La Importancia de la Geometría" ha sido aprobada y publicada en la biblioteca.',
          tipo: 'documento',
          categoria: 'informacion',
          leida: false,
          fecha: '2024-03-09T16:45:00Z',
          icono: 'file-check',
          color: colors.success,
          autor: {
            nombres: 'María Elena',
            apellidos: 'Vásquez',
            cargo: 'Secretaria'
          }
        },
        {
          id: 3,
          titulo: 'Nuevo Miembro Iniciado',
          mensaje: 'Roberto Silva ha sido iniciado como Aprendiz Masón. Dale la bienvenida a la hermandad.',
          tipo: 'miembro',
          categoria: 'informacion',
          leida: true,
          fecha: '2024-03-08T19:20:00Z',
          icono: 'account-plus',
          color: colors.primary,
          autor: {
            nombres: 'Carlos',
            apellidos: 'Mendoza',
            cargo: 'Venerable Maestro'
          }
        },
        {
          id: 4,
          titulo: 'Cuota Mensual Pendiente',
          mensaje: 'Recordatorio: Tu cuota del mes de marzo está pendiente de pago. Fecha límite: 15 de marzo.',
          tipo: 'pago',
          categoria: 'urgente',
          leida: false,
          fecha: '2024-03-07T10:00:00Z',
          icono: 'credit-card-clock',
          color: colors.warning,
          autor: {
            nombres: 'Ana',
            apellidos: 'Rodríguez', 
            cargo: 'Tesorera'
          }
        },
        {
          id: 5,
          titulo: 'Actualización de Reglamento',
          mensaje: 'Se han actualizado las constituciones masónicas. Revisa los cambios en la sección de documentos.',
          tipo: 'documento',
          categoria: 'informacion',
          leida: true,
          fecha: '2024-03-06T12:15:00Z',
          icono: 'book-open-variant',
          color: colors.info,
          autor: {
            nombres: 'María Elena',
            apellidos: 'Vásquez',
            cargo: 'Secretaria'
          }
        },
        {
          id: 6,
          titulo: 'Bienvenido a Orpheo',
          mensaje: 'Bienvenido a la aplicación oficial de la logia. Aquí podrás gestionar documentos, ver eventos y mantenerte conectado.',
          tipo: 'sistema',
          categoria: 'informacion',
          leida: true,
          fecha: '2024-03-05T09:00:00Z',
          icono: 'hand-wave',
          color: colors.primary,
          autor: {
            nombres: 'Sistema',
            apellidos: 'Orpheo',
            cargo: 'Administrador'
          }
        }
      ];

      setNotificaciones(mockNotificaciones);
      
    } catch (error) {
      console.error('❌ Error cargando notificaciones:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar las notificaciones',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refrescar lista
  const onRefresh = () => {
    setRefreshing(true);
    cargarNotificaciones();
  };

  // Marcar como leída
  const marcarComoLeida = async (notificacionId) => {
    try {
      console.log('📖 Marcando notificación como leída:', notificacionId);
      
      // Actualizar estado local
      setNotificaciones(prev => 
        prev.map(notif => 
          notif.id === notificacionId 
            ? { ...notif, leida: true }
            : notif
        )
      );

      // TODO: Enviar a API
      // await notificacionesService.marcarLeida(notificacionId);
      
    } catch (error) {
      console.error('❌ Error marcando como leída:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo marcar como leída',
      });
    }
  };

  // Marcar todas como leídas
  const marcarTodasLeidas = () => {
    Alert.alert(
      'Marcar todas como leídas',
      '¿Estás seguro de que deseas marcar todas las notificaciones como leídas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Marcar todas',
          onPress: async () => {
            try {
              setNotificaciones(prev => 
                prev.map(notif => ({ ...notif, leida: true }))
              );

              Toast.show({
                type: 'success',
                text1: 'Notificaciones leídas',
                text2: 'Todas las notificaciones han sido marcadas como leídas',
              });

              // TODO: Enviar a API
              // await notificacionesService.marcarTodasLeidas();

            } catch (error) {
              console.error('❌ Error marcando todas como leídas:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudieron marcar todas como leídas',
              });
            }
          }
        },
      ]
    );
  };

  // Eliminar notificación
  const eliminarNotificacion = (notificacion) => {
    Alert.alert(
      'Eliminar notificación',
      `¿Estás seguro de que deseas eliminar "${notificacion.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setNotificaciones(prev => 
                prev.filter(notif => notif.id !== notificacion.id)
              );

              Toast.show({
                type: 'success',
                text1: 'Notificación eliminada',
              });

              // TODO: Enviar a API
              // await notificacionesService.eliminar(notificacion.id);

            } catch (error) {
              console.error('❌ Error eliminando notificación:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo eliminar la notificación',
              });
            }
          }
        },
      ]
    );
  };

  // Filtrar notificaciones
  const notificacionesFiltradas = notificaciones.filter(notif => {
    // Filtro por texto
    const matchesSearch = searchText === '' || 
      notif.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
      notif.mensaje.toLowerCase().includes(searchText.toLowerCase()) ||
      notif.autor.nombres.toLowerCase().includes(searchText.toLowerCase()) ||
      notif.autor.apellidos.toLowerCase().includes(searchText.toLowerCase());

    // Filtro por tipo
    const matchesFilter = 
      filtroTipo === 'todas' ||
      (filtroTipo === 'no_leidas' && !notif.leida) ||
      (filtroTipo === 'importantes' && notif.categoria === 'importante');

    return matchesSearch && matchesFilter;
  });

  // Estadísticas
  const noLeidas = notificaciones.filter(n => !n.leida).length;
  const importantes = notificaciones.filter(n => n.categoria === 'importante').length;

  // Renderizar notificación
  const renderNotificacion = ({ item: notificacion }) => (
    <NotificacionCard
      notificacion={notificacion}
      onPress={() => marcarComoLeida(notificacion.id)}
      onDelete={() => eliminarNotificacion(notificacion)}
    />
  );

  // Renderizar estado vacío
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="bell-outline" size={80} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No hay notificaciones</Text>
      <Text style={styles.emptySubtitle}>
        {searchText || filtroTipo !== 'todas'
          ? 'No se encontraron notificaciones con los filtros aplicados'
          : 'Cuando recibas notificaciones aparecerán aquí'}
      </Text>
    </View>
  );

  // Configurar header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={marcarTodasLeidas}
          disabled={noLeidas === 0}
        >
          <Icon 
            name="check-all" 
            size={24} 
            color={noLeidas > 0 ? colors.primary : colors.textSecondary} 
          />
        </TouchableOpacity>
      ),
    });
  }, [noLeidas]);

  // Cargar datos al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      cargarNotificaciones();
    }, [])
  );

  return (
    <TabSafeView style={styles.container}>
      
      {/* Header con estadísticas */}
      <View style={styles.header}>
        <SearchBar
          placeholder="Buscar notificaciones..."
          value={searchText}
          onChangeText={setSearchText}
          onClear={() => setSearchText('')}
        />
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{noLeidas}</Text>
            <Text style={styles.statLabel}>No leídas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{importantes}</Text>
            <Text style={styles.statLabel}>Importantes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{notificaciones.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filtroTipo === 'todas' && styles.filterButtonActive
          ]}
          onPress={() => setFiltroTipo('todas')}
        >
          <Text style={[
            styles.filterButtonText,
            filtroTipo === 'todas' && styles.filterButtonTextActive
          ]}>
            Todas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filtroTipo === 'no_leidas' && styles.filterButtonActive
          ]}
          onPress={() => setFiltroTipo('no_leidas')}
        >
          <Text style={[
            styles.filterButtonText,
            filtroTipo === 'no_leidas' && styles.filterButtonTextActive
          ]}>
            No leídas
          </Text>
          {noLeidas > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{noLeidas}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filtroTipo === 'importantes' && styles.filterButtonActive
          ]}
          onPress={() => setFiltroTipo('importantes')}
        >
          <Text style={[
            styles.filterButtonText,
            filtroTipo === 'importantes' && styles.filterButtonTextActive
          ]}>
            Importantes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de notificaciones */}
      {loading && !refreshing ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={notificacionesFiltradas}
          renderItem={renderNotificacion}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={notificacionesFiltradas.length === 0 ? styles.emptyList : styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
    </TabSafeView>
  );
};

// Componente NotificacionCard
const NotificacionCard = ({ notificacion, onPress, onDelete }) => {
  const getCategoriaStyle = (categoria) => {
    switch (categoria) {
      case 'importante':
        return { backgroundColor: colors.primary, borderColor: colors.primary };
      case 'urgente':
        return { backgroundColor: colors.error, borderColor: colors.error };
      case 'informacion':
      default:
        return { backgroundColor: colors.info, borderColor: colors.info };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (days === 1) {
      return 'Ayer';
    } else if (days < 7) {
      return `Hace ${days}d`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.notificationCard,
        !notificacion.leida && styles.notificationCardUnread
      ]}
      onPress={onPress}
    >
      {/* Header de la notificación */}
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIcon}>
          <Icon 
            name={notificacion.icono} 
            size={24} 
            color={notificacion.color} 
          />
        </View>
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationTitleRow}>
            <Text style={[
              styles.notificationTitle,
              !notificacion.leida && styles.notificationTitleUnread
            ]} numberOfLines={2}>
              {notificacion.titulo}
            </Text>
            
            <View style={styles.notificationMeta}>
              <Text style={styles.notificationDate}>
                {formatDate(notificacion.fecha)}
              </Text>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Icon name="close" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.notificationMessage} numberOfLines={3}>
            {notificacion.mensaje}
          </Text>
          
          <View style={styles.notificationFooter}>
            <Text style={styles.notificationAuthor}>
              {notificacion.autor.nombres} {notificacion.autor.apellidos}
            </Text>
            
            <View style={styles.notificationBadges}>
              <View style={[
                styles.categoryBadge,
                getCategoriaStyle(notificacion.categoria)
              ]}>
                <Text style={styles.categoryBadgeText}>
                  {notificacion.categoria}
                </Text>
              </View>
              
              {!notificacion.leida && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>Nueva</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    padding: spacing.sm,
  },

  // Header
  header: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },

  // Filters
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },

  // List
  list: {
    padding: spacing.sm,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Notification card
  notificationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...globalStyles.shadow,
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 20,
    marginRight: spacing.sm,
  },
  notificationTitleUnread: {
    fontWeight: '600',
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  notificationDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: 2,
  },
  notificationMessage: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationAuthor: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
  },
  notificationBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unreadBadgeText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: '500',
  },
});

export default NotificacionesScreen;