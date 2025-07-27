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
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Redux
import {
  fetchMiembros,
  fetchEstadisticas,
  updateFiltros,
  setPage,
  resetFiltros,
  selectMiembros,
  selectLoadingList,
  selectError,
  selectFiltros,
  selectPage,
  selectTotalPages,
  selectTotalMiembros,
  selectEstadisticas,
} from '../../store/slices/miembrosSlice';

// Components
import TabSafeView from '../../components/common/TabSafeView';
import SearchBar from '../../components/common/SearchBar';
import FilterModal from '../../components/common/FilterModal';
import MiembroCard from '../../components/miembros/MiembroCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles, spacing, fontSize, wp, hp } from '../../styles/globalStyles';

const MiembrosListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  
  // Estados locales
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Selectores Redux
  const miembros = useSelector(selectMiembros);
  const loading = useSelector(selectLoadingList);
  const error = useSelector(selectError);
  const filtros = useSelector(selectFiltros);
  const page = useSelector(selectPage);
  const totalPages = useSelector(selectTotalPages);
  const totalMiembros = useSelector(selectTotalMiembros);
  const estadisticas = useSelector(selectEstadisticas);

  // Cargar datos al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 MiembrosListScreen: Pantalla enfocada, cargando datos');
      loadData();
    }, [])
  );

  // Recargar cuando cambien los filtros
  useEffect(() => {
    console.log('🔄 Filtros cambiaron, recargando datos:', filtros);
    loadData();
  }, [filtros, page]);

  // Función para cargar datos
  const loadData = async () => {
    try {
      // Cargar miembros y estadísticas en paralelo
      await Promise.all([
        dispatch(fetchMiembros()).unwrap(),
        dispatch(fetchEstadisticas()).unwrap()
      ]);
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
    }
  };

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  // Manejar búsqueda
  const handleSearch = (searchText) => {
    console.log('🔍 Búsqueda:', searchText);
    dispatch(updateFiltros({ search: searchText }));
  };

  // Aplicar filtros
  const handleApplyFilters = (newFilters) => {
    console.log('🎛️ Aplicando filtros:', newFilters);
    dispatch(updateFiltros(newFilters));
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    dispatch(resetFiltros());
  };

  // Navegar a detalle
  const handleMiembroPress = (miembro) => {
    navigation.navigate('MiembroDetail', { miembroId: miembro.id });
  };

  // Navegar a editar
  const handleEditPress = (miembro) => {
    navigation.navigate('MiembroForm', { miembroId: miembro.id });
  };

  // Navegar a crear nuevo
  const handleCreatePress = () => {
    navigation.navigate('MiembroForm');
  };

  // Cargar más miembros (paginación)
  const handleLoadMore = () => {
    if (!loading && page < totalPages) {
      console.log(`📄 Cargando página ${page + 1} de ${totalPages}`);
      dispatch(setPage(page + 1));
    }
  };

  // Renderizar item de la lista
  const renderMiembro = ({ item }) => (
    <MiembroCard
      miembro={item}
      onPress={handleMiembroPress}
      onEdit={handleEditPress}
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
            : 'No se encontraron miembros'
          }
        </Text>
        
        {Object.values(filtros).some(f => f && f !== 'todos' && f !== 'apellidos' && f !== 'ASC') && (
          <TouchableOpacity onPress={handleClearFilters} style={styles.clearFiltersButton}>
            <Icon name="filter-off" size={16} color={colors.primary} />
            <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Renderizar footer de paginación
  const renderFooter = () => {
    if (!loading || page === 1) return <View style={styles.listFooter} />;
    
    return (
      <View style={[styles.footer, styles.listFooter]}>
        <LoadingSpinner size="small" />
        <Text style={styles.loadingText}>Cargando más miembros...</Text>
      </View>
    );
  };

  // Renderizar estado vacío
  const renderEmpty = () => {
    if (loading && miembros.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <LoadingSpinner />
          <Text style={styles.emptyText}>Cargando miembros...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon name="account-search" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>No hay miembros</Text>
        <Text style={styles.emptySubtitle}>
          {filtros.search || filtros.grado !== 'todos' || filtros.estado !== 'todos'
            ? 'Intenta ajustar los filtros de búsqueda'
            : 'Comienza agregando el primer miembro'
          }
        </Text>
        
        {(!filtros.search && filtros.grado === 'todos' && filtros.estado === 'todos') && (
          <TouchableOpacity style={styles.addButton} onPress={handleCreatePress}>
            <Icon name="plus" size={20} color={colors.white} />
            <Text style={styles.addButtonText}>Agregar Miembro</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Mostrar error si existe
  if (error && miembros.length === 0) {
    return (
      <TabSafeView>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Error al cargar miembros</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Icon name="refresh" size={20} color={colors.white} />
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </TabSafeView>
    );
  }

  return (
    <TabSafeView>
      <View style={styles.container}>
        {/* Barra de búsqueda */}
        <SearchBar
          placeholder="Buscar por nombre, apellido o RUT..."
          value={filtros.search}
          onChangeText={handleSearch}
          showFilterButton
          onFilterPress={() => setShowFilters(true)}
        />

        {/* Lista de miembros */}
        <FlatList
          data={miembros}
          renderItem={renderMiembro}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            miembros.length === 0 ? styles.emptyContent : null,
            styles.listContent
          ]}
        />

        {/* Botón flotante para agregar */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreatePress}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={24} color={colors.white} />
        </TouchableOpacity>

        {/* Modal de filtros */}
        <FilterModal
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          onApply={handleApplyFilters}
          filters={filtros}
          title="Filtrar Miembros"
        />
      </View>
    </TabSafeView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  listContent: {
    flexGrow: 1,
  },
  
  header: {
    backgroundColor: colors.background,
    paddingBottom: spacing.md,
  },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  
  statNumber: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  resultsText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  clearFiltersText: {
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  
  listFooter: {
    paddingBottom: spacing.xl, // Espacio extra para el FAB
  },
  
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  
  emptyContent: {
    flexGrow: 1,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    paddingBottom: 120, // Espacio extra para tab bar y FAB
  },
  
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 25,
    gap: spacing.sm,
  },
  
  addButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
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
    backgroundColor: colors.error,
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
  
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...globalStyles.shadowLg,
    elevation: 8, // Para Android
  },
});

export default MiembrosListScreen;