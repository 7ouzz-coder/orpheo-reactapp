import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

// Redux
import {
  fetchMiembros,
  fetchEstadisticas,
  updateFiltros,
  setPage,
  resetFiltros,
  clearError,
  deleteMiembro,
  selectMiembrosToShow,
  selectLoadingList,
  selectError,
  selectFiltros,
  selectPage,
  selectTotalPages,
  selectTotalMiembros,
  selectEstadisticas,
  selectHasMore,
  selectActiveFiltersCount,
} from '../../store/slices/miembrosSlice';

// Components
import SearchBar from '../../components/common/SearchBar';
import FilterModal from '../../components/common/FilterModal';
import MiembroCard from '../../components/miembros/MiembroCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Styles
import { colors } from '../../styles/colors';
import { wp, hp, fontSize, spacing } from '../../utils/dimensions';

// Hook personalizado para debounce
import { useDebounce } from '../../hooks/useDebounce';

const MiembrosListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  
  // Estados locales
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Selectores Redux
  const miembros = useSelector(selectMiembrosToShow);
  const loading = useSelector(selectLoadingList);
  const error = useSelector(selectError);
  const filtros = useSelector(selectFiltros);
  const page = useSelector(selectPage);
  const totalPages = useSelector(selectTotalPages);
  const totalMiembros = useSelector(selectTotalMiembros);
  const estadisticas = useSelector(selectEstadisticas);
  const hasMore = useSelector(selectHasMore);
  const activeFiltersCount = useSelector(selectActiveFiltersCount);
  
  // Debounce para la búsqueda
  const debouncedSearchText = useDebounce(searchText, 500);

  // Cargar datos al montar y cuando se enfoca la pantalla
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 MiembrosListScreen: Pantalla enfocada, cargando datos');
      loadInitialData();
    }, [])
  );

  // Efecto para búsqueda con debounce
  useEffect(() => {
    if (debouncedSearchText !== filtros.search) {
      dispatch(updateFiltros({ search: debouncedSearchText }));
    }
  }, [debouncedSearchText, dispatch, filtros.search]);

  // Efecto para recargar cuando cambien los filtros
  useEffect(() => {
    if (filtros.search !== '' || filtros.grado || filtros.estado) {
      loadData();
    }
  }, [filtros]);

  // Limpiar errores cuando se desmonta
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Función para cargar datos iniciales
  const loadInitialData = async () => {
    try {
      await Promise.all([
        dispatch(fetchMiembros()).unwrap(),
        dispatch(fetchEstadisticas()).unwrap()
      ]);
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar los miembros',
      });
    }
  };

  // Función para cargar datos
  const loadData = async () => {
    try {
      await dispatch(fetchMiembros()).unwrap();
    } catch (error) {
      console.error('❌ Error cargando miembros:', error);
    }
  };

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Resetear página y cargar datos frescos
      dispatch(setPage(1));
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  };

  // Manejar búsqueda
  const handleSearch = (text) => {
    setSearchText(text);
  };

  // Aplicar filtros
  const handleApplyFilters = (newFilters) => {
    console.log('🎛️ Aplicando filtros:', newFilters);
    dispatch(updateFiltros(newFilters));
    setShowFilters(false);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    dispatch(resetFiltros());
    setSearchText('');
    setShowFilters(false);
  };

  // Navegar a detalle de miembro
  const handleMiembroPress = (miembro) => {
    console.log('👤 Navegando a detalle del miembro:', miembro.id);
    navigation.navigate('MiembroDetail', { miembroId: miembro.id });
  };

  // Navegar a editar miembro
  const handleEditPress = (miembro) => {
    console.log('✏️ Navegando a editar miembro:', miembro.id);
    navigation.navigate('MiembroForm', { miembroId: miembro.id, mode: 'edit' });
  };

  // Navegar a crear nuevo miembro
  const handleCreatePress = () => {
    console.log('➕ Navegando a crear nuevo miembro');
    navigation.navigate('MiembroForm', { mode: 'create' });
  };

  // Manejar eliminación de miembro
  const handleDeletePress = (miembro) => {
    Alert.alert(
      'Eliminar Miembro',
      `¿Estás seguro de que deseas eliminar a ${miembro.nombres} ${miembro.apellidos}?`,
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
              Toast.show({
                type: 'success',
                text1: 'Miembro eliminado',
                text2: `${miembro.nombres} ha sido eliminado exitosamente`,
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo eliminar el miembro',
              });
            }
          },
        },
      ]
    );
  };

  // Cargar más miembros (paginación)
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      console.log(`📄 Cargando página ${page + 1} de ${totalPages}`);
      dispatch(setPage(page + 1));
    }
  };

  // Renderizar item de miembro
  const renderMiembro = ({ item, index }) => (
    <MiembroCard
      key={item.id}
      miembro={item}
      onPress={handleMiembroPress}
      onEdit={handleEditPress}
      onLongPress={(miembro) => {
        // Opciones adicionales en long press
        Alert.alert(
          miembro.nombres + ' ' + miembro.apellidos,
          'Selecciona una acción',
          [
            { text: 'Ver Detalle', onPress: () => handleMiembroPress(miembro) },
            { text: 'Editar', onPress: () => handleEditPress(miembro) },
            { text: 'Eliminar', onPress: () => handleDeletePress(miembro), style: 'destructive' },
            { text: 'Cancelar', style: 'cancel' },
          ]
        );
      }}
      style={[
        styles.miembroCard,
        index === miembros.length - 1 && styles.lastCard
      ]}
    />
  );

  // Renderizar header con estadísticas
  const renderHeader = () => (
    <View style={styles.header}>
      {/* Estadísticas resumidas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{estadisticas.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.info }]}>
            {estadisticas.aprendices}
          </Text>
          <Text style={styles.statLabel}>Aprendices</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>
            {estadisticas.companeros}
          </Text>
          <Text style={styles.statLabel}>Compañeros</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.success }]}>
            {estadisticas.maestros}
          </Text>
          <Text style={styles.statLabel}>Maestros</Text>
        </View>
      </View>

      {/* Información de resultados */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {totalMiembros > 0 
            ? `${totalMiembros} miembro${totalMiembros !== 1 ? 's' : ''} encontrado${totalMiembros !== 1 ? 's' : ''}`
            : 'No hay miembros'
          }
        </Text>
        
        {activeFiltersCount > 0 && (
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={handleClearFilters}
          >
            <Icon name="close-circle" size={wp(4)} color={colors.error} />
            <Text style={styles.clearFiltersText}>
              Limpiar filtros ({activeFiltersCount})
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Renderizar footer con loading o botón cargar más
  const renderFooter = () => {
    if (loading && page > 1) {
      return (
        <View style={styles.footerLoading}>
          <LoadingSpinner size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando más miembros...</Text>
        </View>
      );
    }
    
    if (hasMore && !loading) {
      return (
        <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
          <Text style={styles.loadMoreText}>Cargar más miembros</Text>
          <Icon name="chevron-down" size={wp(5)} color={colors.primary} />
        </TouchableOpacity>
      );
    }
    
    if (miembros.length > 0 && !hasMore) {
      return (
        <View style={styles.endMessage}>
          <Text style={styles.endMessageText}>
            Has visto todos los miembros
          </Text>
        </View>
      );
    }
    
    return null;
  };

  // Renderizar lista vacía
  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Cargando miembros...</Text>
        </View>
      );
    }

    const hasActiveFilters = activeFiltersCount > 0 || searchText.length > 0;

    return (
      <View style={styles.emptyContainer}>
        <Icon 
          name={hasActiveFilters ? "account-search" : "account-plus"} 
          size={wp(20)} 
          color={colors.textSecondary} 
        />
        <Text style={styles.emptyTitle}>
          {hasActiveFilters ? 'No se encontraron miembros' : 'No hay miembros registrados'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {hasActiveFilters 
            ? 'Intenta cambiar los filtros de búsqueda o agregar un nuevo miembro.'
            : 'Comienza agregando el primer miembro de la logia.'
          }
        </Text>
        
        <View style={styles.emptyActions}>
          {hasActiveFilters && (
            <TouchableOpacity style={styles.emptySecondaryButton} onPress={handleClearFilters}>
              <Icon name="filter-remove" size={wp(4)} color={colors.textSecondary} />
              <Text style={styles.emptySecondaryButtonText}>Limpiar filtros</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.emptyPrimaryButton} onPress={handleCreatePress}>
            <Icon name="account-plus" size={wp(4)} color={colors.white} />
            <Text style={styles.emptyPrimaryButtonText}>Agregar miembro</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con búsqueda y filtros */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Buscar por nombre, email, RUT..."
          value={searchText}
          onSearch={handleSearch}
          onClear={() => setSearchText('')}
          style={styles.searchBar}
        />
        
        <TouchableOpacity 
          style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Icon 
            name="filter-variant" 
            size={wp(5)} 
            color={activeFiltersCount > 0 ? colors.white : colors.textSecondary} 
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleCreatePress}
        >
          <Icon name="plus" size={wp(6)} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Lista de miembros */}
      <FlatList
        data={miembros}
        renderItem={renderMiembro}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={miembros.length > 0 ? renderHeader : null}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          miembros.length === 0 && styles.emptyListContainer
        ]}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={(data, index) => ({
          length: wp(25), // Altura estimada de cada item
          offset: wp(25) * index,
          index,
        })}
      />

      {/* Modal de filtros */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        initialFilters={filtros}
        title="Filtrar Miembros"
      />

      {/* Toast para notificaciones */}
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header con búsqueda
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  searchBar: {
    flex: 1,
    marginRight: spacing.sm,
  },

  filterButton: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },

  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  filterBadge: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    backgroundColor: colors.error,
    borderRadius: wp(2.5),
    minWidth: wp(5),
    height: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterBadgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },

  addButton: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // Lista
  listContainer: {
    paddingBottom: spacing.xl,
  },

  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  miembroCard: {
    marginVertical: spacing.xs,
  },

  lastCard: {
    marginBottom: spacing.lg,
  },

  // Header con estadísticas
  header: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: wp(3),
    marginHorizontal: spacing.md,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },

  statCard: {
    alignItems: 'center',
    flex: 1,
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
    textAlign: 'center',
  },

  resultsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  resultsText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: wp(4),
  },

  clearFiltersText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },

  // Footer
  footerLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },

  loadingText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },

  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.sm,
  },

  loadMoreText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '500',
    marginRight: spacing.sm,
  },

  endMessage: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },

  endMessageText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

  // Estados vacíos y de carga
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: hp(5),
  },

  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.4,
    marginBottom: spacing.xl,
  },

  emptyActions: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  emptyPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: wp(2),
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  emptyPrimaryButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },

  emptySecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptySecondaryButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
});

export default MiembrosListScreen;