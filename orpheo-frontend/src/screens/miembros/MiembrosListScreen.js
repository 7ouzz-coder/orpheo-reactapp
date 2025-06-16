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
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';

import { colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';
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
  
  // Debounce para búsqueda
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

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
        },
        {
          text: 'Editar',
          onPress: () => navigation.navigate('MiembroForm', { miembro }),
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

  const renderMiembro = ({ item }) => (
    <MiembroCard
      miembro={item}
      onPress={() => handleMiembroPress(item)}
      onLongPress={() => handleMiembroLongPress(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="people-outline" size={64} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>No se encontraron miembros</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Agrega el primer miembro'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('MiembroForm')}
        >
          <Text style={styles.emptyButtonText}>Agregar Miembro</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar miembros..."
      />
      
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilter(true)}
        >
          <Icon name="filter-list" size={20} color={colors.primary} />
          <Text style={styles.filterText}>Filtros</Text>
          {(filters.grado || filters.vigente !== null) && (
            <View style={styles.filterDot} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('MiembroForm')}
        >
          <Icon name="add" size={20} color={colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && miembros.length === 0) {
    return (
      <SafeAreaView style={globalStyles.container}>
        {renderHeader()}
        <View style={globalStyles.padding}>
          {[...Array(5)].map((_, index) => (
            <LoadingCard key={index} height={80} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={miembros}
        renderItem={renderMiembro}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    position: 'relative',
  },
  filterText: {
    color: colors.primary,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  filterDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MiembrosListScreen;