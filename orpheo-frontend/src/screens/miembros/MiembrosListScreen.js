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
  StatusBar,
  Animated,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';

import { colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';
import { wp, hp, fontSize, spacing, deviceInfo } from '../../utils/dimensions';
import SearchBar from '../../components/common/SearchBar';
import MiembroCard from '../../components/miembros/MiembroCard';
import FilterModal from '../../components/miembros/FilterModal';
import LoadingCard from '../../components/common/LoadingCard';
import { 
  getMiembros, 
  selectMiembros, 
  selectMiembrosLoading,
  selectMiembrosError,
  clearError 
} from '../../store/slices/miembrosSlice';
import { useDebounce } from '../../hooks/useDebounce';

const MiembrosListScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const miembros = useSelector(selectMiembros);
  const loading = useSelector(selectMiembrosLoading);
  const error = useSelector(selectMiembrosError);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    grado: null,
    vigente: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Stats animados
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    porGrado: { aprendiz: 0, companero: 0, maestro: 0 }
  });

  useFocusEffect(
    useCallback(() => {
      loadMiembros();
    }, [])
  );

  useEffect(() => {
    if (debouncedSearchQuery !== null) {
      loadMiembros();
    }
  }, [debouncedSearchQuery, filters]);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
        position: 'top',
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Calcular estadísticas
  useEffect(() => {
    if (Array.isArray(miembros)) {
      const total = miembros.length;
      const activos = miembros.filter(m => m && m.vigente).length;
      
      const porGrado = miembros.reduce((acc, miembro) => {
        if (miembro && miembro.grado) {
          acc[miembro.grado] = (acc[miembro.grado] || 0) + 1;
        }
        return acc;
      }, { aprendiz: 0, companero: 0, maestro: 0 });

      setStats({ total, activos, porGrado });
    }
  }, [miembros]);

  const loadMiembros = () => {
    const params = {
      page: 1,
      limit: 50,
      ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
      ...(filters.grado && { grado: filters.grado }),
      ...(filters.vigente !== null && { vigente: filters.vigente }),
    };
    
    dispatch(getMiembros(params));
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMiembros();
    setRefreshing(false);
  }, []);

  const handleMiembroPress = (miembro) => {
    navigation.navigate('MiembroDetail', { miembro });
  };

  const handleMiembroLongPress = (miembro) => {
    Alert.alert(
      `${miembro.nombres} ${miembro.apellidos}`,
      'Selecciona una acción',
      [
        {
          text: 'Ver detalle',
          onPress: () => handleMiembroPress(miembro),
          style: 'default'
        },
        {
          text: 'Editar',
          onPress: () => navigation.navigate('MiembroForm', { miembro }),
          style: 'default'
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setShowFilter(false);
  };

  const clearFilters = () => {
    setFilters({ grado: null, vigente: null });
    setSearchQuery('');
  };

  const hasActiveFilters = () => {
    return filters.grado || filters.vigente !== null || searchQuery.length > 0;
  };

  const renderHeader = () => {
    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 50],
      outputRange: [1, 0.8],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{stats.activos}</Text>
            <Text style={styles.statLabel}>Activos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.aprendiz }]}>{stats.porGrado.aprendiz}</Text>
            <Text style={styles.statLabel}>Aprendices</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.companero }]}>{stats.porGrado.companero}</Text>
            <Text style={styles.statLabel}>Compañeros</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.maestro }]}>{stats.porGrado.maestro}</Text>
            <Text style={styles.statLabel}>Maestros</Text>
          </View>
        </View>

        {/* Barra de búsqueda y controles */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar miembros..."
        />
        
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.filterButton, hasActiveFilters() && styles.filterButtonActive]}
            onPress={() => setShowFilter(true)}
            activeOpacity={0.8}
          >
            <Icon name="tune" size={wp(5)} color={hasActiveFilters() ? colors.white : colors.primary} />
            <Text style={[styles.filterText, hasActiveFilters() && styles.filterTextActive]}>
              Filtros
            </Text>
            {hasActiveFilters() && <View style={styles.filterDot} />}
          </TouchableOpacity>
          
          {hasActiveFilters() && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
              activeOpacity={0.8}
            >
              <Icon name="clear" size={wp(4)} color={colors.error} />
              <Text style={styles.clearText}>Limpiar</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('MiembroForm')}
            activeOpacity={0.8}
          >
            <Icon name="add" size={wp(5)} color={colors.white} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderMiembro = ({ item, index }) => {
    const inputRange = [-1, 0, (index + 1) * 100, (index + 2) * 100];
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.8],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <MiembroCard
          miembro={item}
          onPress={() => handleMiembroPress(item)}
          onLongPress={() => handleMiembroLongPress(item)}
        />
      </Animated.View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon 
        name={searchQuery ? "search-off" : "people-outline"} 
        size={wp(20)} 
        color={colors.textTertiary} 
      />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'Sin resultados' : 'No hay miembros'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? `No se encontraron miembros que coincidan con "${searchQuery}"` 
          : 'Agrega el primer miembro de tu logia'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('MiembroForm')}
          activeOpacity={0.8}
        >
          <Icon name="add" size={wp(5)} color={colors.white} />
          <Text style={styles.emptyButtonText}>Agregar Primer Miembro</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.footer}>
        <LoadingCard height={hp(10)} />
      </View>
    );
  };

  if (loading && miembros.length === 0) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          {[...Array(8)].map((_, index) => (
            <LoadingCard key={index} height={hp(12)} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <Animated.FlatList
        data={miembros}
        renderItem={renderMiembro}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: hp(12) + spacing.sm,
          offset: (hp(12) + spacing.sm) * index,
          index,
        })}
      />
      
      <FilterModal
        visible={showFilter}
        filters={filters}
        onApply={handleFilterApply}
        onClose={() => setShowFilter(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  
  // Estadísticas
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: wp(3),
    padding: spacing.md,
    marginBottom: spacing.md,
    justifyContent: 'space-around',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Controles
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: wp(6),
    marginRight: spacing.sm,
    position: 'relative',
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.primary,
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.white,
  },
  filterDot: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: colors.warning,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: wp(4),
    marginRight: spacing.sm,
  },
  clearText: {
    color: colors.error,
    marginLeft: spacing.xs,
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: colors.primary,
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  
  // Lista
  listContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  
  // Estados
  loadingContainer: {
    padding: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(10),
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: fontSize.md * 1.4,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: wp(2),
    elevation: 2,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  footer: {
    padding: spacing.md,
  },
});

export default MiembrosListScreen;