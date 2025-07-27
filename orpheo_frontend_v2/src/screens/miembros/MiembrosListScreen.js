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
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Redux
import { 
  fetchMiembros, 
  selectMiembros, 
  selectMiembrosLoading,
  selectMiembrosError,
  selectMiembrosFilters,
  setFilters,
  clearFilters,
  clearError 
} from '../../store/slices/miembrosSlice';

// Styles
import { colors, getGradoColor, getEstadoColor } from '../../styles/colors';
import { globalStyles, dimensions } from '../../styles/globalStyles';

// Hook personalizado para debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const MiembrosListScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Redux state
  const miembros = useSelector(selectMiembros);
  const loading = useSelector(selectMiembrosLoading);
  const error = useSelector(selectMiembrosError);
  const filters = useSelector(selectMiembrosFilters);
  
  // Local state
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  
  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Cargar miembros al inicializar y cuando cambia la búsqueda
  useFocusEffect(
    useCallback(() => {
      loadMiembros();
    }, [])
  );

  useEffect(() => {
    if (debouncedSearchQuery !== filters.search) {
      dispatch(setFilters({ search: debouncedSearchQuery }));
      loadMiembros();
    }
  }, [debouncedSearchQuery]);

  const loadMiembros = async () => {
    try {
      await dispatch(fetchMiembros()).unwrap();
    } catch (error) {
      console.error('Error loading miembros:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMiembros();
    setRefreshing(false);
  };

  const handleMiembroPress = (miembro) => {
    navigation.navigate('MiembroDetail', { miembro });
  };

  const handleAddMiembro = () => {
    navigation.navigate('MiembroForm');
  };

  // Aplicar filtros
  const applyFilters = () => {
    dispatch(setFilters(localFilters));
    setShowFilters(false);
    loadMiembros();
  };

  // Limpiar filtros
  const clearAllFilters = () => {
    const emptyFilters = {
      search: '',
      grado: null,
      estado: 'activo',
      vigencia: null,
    };
    setLocalFilters(emptyFilters);
    setSearchQuery('');
    dispatch(clearFilters());
    setShowFilters(false);
    loadMiembros();
  };

  // Componente de tarjeta de miembro
  const MiembroCard = ({ miembro }) => (
    <TouchableOpacity
      style={styles.miembroCard}
      onPress={() => handleMiembroPress(miembro)}
      activeOpacity={0.7}
    >
      {/* Header de la tarjeta */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Icon name="account-circle" size={40} color={getGradoColor(miembro.grado)} />
        </View>
        <View style={styles.miembroInfo}>
          <Text style={styles.miembroName}>
            {miembro.nombres} {miembro.apellidos}
          </Text>
          <Text style={styles.miembroEmail}>{miembro.email}</Text>
        </View>
        <View style={styles.cardActions}>
          <Icon name="chevron-right" size={20} color={colors.textMuted} />
        </View>
      </View>

      {/* Badges y información adicional */}
      <View style={styles.cardDetails}>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getGradoColor(miembro.grado) + '20' }]}>
            <Text style={[styles.badgeText, { color: getGradoColor(miembro.grado) }]}>
              {miembro.grado?.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getEstadoColor(miembro.estado) + '20' }]}>
            <Text style={[styles.badgeText, { color: getEstadoColor(miembro.estado) }]}>
              {miembro.estado?.toUpperCase()}
            </Text>
          </View>
        </View>
        
        {miembro.rut && (
          <Text style={styles.miembroRut}>RUT: {miembro.rut}</Text>
        )}
        {miembro.telefono && (
          <Text style={styles.miembroTelefono}>📞 {miembro.telefono}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Componente de filtros
  const FiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Filtros</Text>
          <TouchableOpacity onPress={clearAllFilters}>
            <Text style={styles.clearText}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          {/* Filtro por grado */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Grado Masónico</Text>
            <View style={styles.filterOptions}>
              {['aprendiz', 'companero', 'maestro'].map((grado) => (
                <TouchableOpacity
                  key={grado}
                  style={[
                    styles.filterOption,
                    localFilters.grado === grado && styles.filterOptionActive
                  ]}
                  onPress={() => setLocalFilters(prev => ({ 
                    ...prev, 
                    grado: prev.grado === grado ? null : grado 
                  }))}
                >
                  <Text style={[
                    styles.filterOptionText,
                    localFilters.grado === grado && styles.filterOptionTextActive
                  ]}>
                    {grado.charAt(0).toUpperCase() + grado.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filtro por estado */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Estado</Text>
            <View style={styles.filterOptions}>
              {['activo', 'inactivo', 'suspendido'].map((estado) => (
                <TouchableOpacity
                  key={estado}
                  style={[
                    styles.filterOption,
                    localFilters.estado === estado && styles.filterOptionActive
                  ]}
                  onPress={() => setLocalFilters(prev => ({ 
                    ...prev, 
                    estado: prev.estado === estado ? null : estado 
                  }))}
                >
                  <Text style={[
                    styles.filterOptionText,
                    localFilters.estado === estado && styles.filterOptionTextActive
                  ]}>
                    {estado.charAt(0).toUpperCase() + estado.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={applyFilters}
          >
            <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  // Estado de carga
  if (loading && miembros.length === 0) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={globalStyles.loadingText}>Cargando miembros...</Text>
      </View>
    );
  }

  // Estado de error
  if (error && miembros.length === 0) {
    return (
      <View style={globalStyles.center}>
        <Icon name="alert-circle" size={48} color={colors.error} />
        <Text style={globalStyles.errorText}>{error}</Text>
        <TouchableOpacity style={globalStyles.button} onPress={loadMiembros}>
          <Text style={globalStyles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeContainer}>
      {/* Header con búsqueda y filtros */}
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar miembros..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Icon name="filter" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Lista de miembros */}
      <FlatList
        data={miembros}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => <MiembroCard miembro={item} />}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={globalStyles.emptyContainer}>
            <Icon name="account-group" size={64} color={colors.textMuted} />
            <Text style={globalStyles.emptyText}>
              {searchQuery ? 'No se encontraron miembros' : 'No hay miembros registrados'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity style={globalStyles.button} onPress={handleAddMiembro}>
                <Text style={globalStyles.buttonText}>Agregar Primer Miembro</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Botón flotante para agregar */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleAddMiembro}
        activeOpacity={0.8}
      >
        <Icon name="plus" size={24} color={colors.background} />
      </TouchableOpacity>

      {/* Modal de filtros */}
      <FiltersModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: colors.text,
  },
  filterButton: {
    padding: 8,
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
  },
  listContainer: {
    padding: 16,
  },
  miembroCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  miembroInfo: {
    flex: 1,
  },
  miembroName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  miembroEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardActions: {
    padding: 4,
  },
  cardDetails: {
    marginTop: 8,
  },
  badges: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  miembroRut: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  miembroTelefono: {
    fontSize: 12,
    color: colors.textMuted,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  clearText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  filterOptionTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MiembrosListScreen;