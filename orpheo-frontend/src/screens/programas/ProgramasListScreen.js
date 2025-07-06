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
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';

import { colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';
import { wp, hp, fontSize, spacing } from '../../utils/dimensions';
import SearchBar from '../../components/common/SearchBar';
import ProgramaCard from '../../components/programas/ProgramaCard';
import LoadingCard from '../../components/common/LoadingCard';
import Calendar from '../../components/programas/Calendar';
import { 
  getProgramas, 
  selectProgramas, 
  selectProgramasLoading,
  selectProgramasError,
  clearError 
} from '../../store/slices/programasSlice';
import { useDebounce } from '../../hooks/useDebounce';

const ProgramasListScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const programas = useSelector(selectProgramas);
  const loading = useSelector(selectProgramasLoading);
  const error = useSelector(selectProgramasError);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [filters, setFilters] = useState({
    grado: null,
    tipo: null,
    estado: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    proximos: 0,
    completados: 0,
    porTipo: { tenida: 0, instruccion: 0, ceremonia: 0 }
  });

  useFocusEffect(
    useCallback(() => {
      loadProgramas();
    }, [])
  );

  useEffect(() => {
    if (debouncedSearchQuery !== null) {
      loadProgramas();
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
    if (Array.isArray(programas)) {
      const total = programas.length;
      const now = new Date();
      const proximos = programas.filter(p => new Date(p.fecha) > now).length;
      const completados = programas.filter(p => p.estado === 'completado').length;
      
      const porTipo = programas.reduce((acc, programa) => {
        if (programa && programa.tipo) {
          acc[programa.tipo] = (acc[programa.tipo] || 0) + 1;
        }
        return acc;
      }, { tenida: 0, instruccion: 0, ceremonia: 0, reunion: 0, trabajo: 0 });

      setStats({ total, proximos, completados, porTipo });
    }
  }, [programas]);

  const loadProgramas = () => {
    const params = {
      page: 1,
      limit: 50,
      ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
      ...(filters.grado && { grado: filters.grado }),
      ...(filters.tipo && { tipo: filters.tipo }),
      ...(filters.estado && { estado: filters.estado }),
    };
    
    dispatch(getProgramas(params));
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProgramas();
    setRefreshing(false);
  }, []);

  const handleProgramaPress = (programa) => {
    navigation.navigate('ProgramaDetail', { programa });
  };

  const handleNewPrograma = () => {
    navigation.navigate('ProgramaForm');
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      tenida: 'event-seat',
      instruccion: 'school',
      ceremonia: 'star',
      reunion: 'groups',
      trabajo: 'work',
      camara: 'meeting-room'
    };
    return icons[tipo] || 'event';
  };

  const getTipoColor = (tipo) => {
    const colores = {
      tenida: colors.primary,
      instruccion: colors.info,
      ceremonia: colors.maestro,
      reunion: colors.companero,
      trabajo: colors.aprendiz,
      camara: colors.warning
    };
    return colores[tipo] || colors.primary;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{stats.proximos}</Text>
          <Text style={styles.statLabel}>Próximos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.completados}</Text>
          <Text style={styles.statLabel}>Completados</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.maestro }]}>{stats.porTipo.tenida}</Text>
          <Text style={styles.statLabel}>Tenidas</Text>
        </View>
      </View>

      {/* Controles de vista */}
      <View style={styles.viewControls}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Icon name="list" size={wp(5)} color={viewMode === 'list' ? colors.white : colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleButtonActive]}
            onPress={() => setViewMode('calendar')}
          >
            <Icon name="calendar-month" size={wp(5)} color={viewMode === 'calendar' ? colors.white : colors.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleNewPrograma}
          activeOpacity={0.8}
        >
          <Icon name="add" size={wp(5)} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Búsqueda solo en vista lista */}
      {viewMode === 'list' && (
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar programas..."
        />
      )}
    </View>
  );

  const renderPrograma = ({ item, index }) => (
    <ProgramaCard
      programa={item}
      onPress={() => handleProgramaPress(item)}
      getTipoIcon={getTipoIcon}
      getTipoColor={getTipoColor}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon 
        name={searchQuery ? "search-off" : "event-note"} 
        size={wp(20)} 
        color={colors.textTertiary} 
      />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'Sin resultados' : 'No hay programas'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? `No se encontraron programas que coincidan con "${searchQuery}"` 
          : 'Programa la primera tenida o evento'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={handleNewPrograma}
          activeOpacity={0.8}
        >
          <Icon name="add" size={wp(5)} color={colors.white} />
          <Text style={styles.emptyButtonText}>Programar Primer Evento</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && programas.length === 0) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          {[...Array(6)].map((_, index) => (
            <LoadingCard key={index} height={hp(15)} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {viewMode === 'calendar' ? (
        <View style={{ flex: 1 }}>
          {renderHeader()}
          <Calendar 
            programas={programas}
            onProgramaPress={handleProgramaPress}
            onDatePress={(date) => {
              // Navegar a crear programa en esa fecha
              navigation.navigate('ProgramaForm', { selectedDate: date });
            }}
            getTipoColor={getTipoColor}
          />
        </View>
      ) : (
        <FlatList
          data={programas}
          renderItem={renderPrograma}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
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
          initialNumToRender={10}
          maxToRenderPerBatch={10}
        />
      )}
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
  
  // Controles de vista
  viewControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: wp(6),
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: wp(5),
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
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
});

export default ProgramasListScreen;