import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

// Redux actions y selectores
import {
  fetchMiembros,
  fetchMiembroById,
  createMiembro,
  updateMiembro,
  deleteMiembro,
  fetchEstadisticas,
  searchMiembros,
  updateFiltros,
  resetFiltros,
  setPage,
  clearError,
  selectMiembrosToShow,
  selectMiembroActual,
  selectLoadingList,
  selectLoadingDetail,
  selectLoadingCreate,
  selectLoadingUpdate,
  selectLoadingDelete,
  selectError,
  selectFiltros,
  selectEstadisticas,
  selectTotalMiembros,
  selectHasMore,
  selectActiveFiltersCount,
} from '../store/slices/miembrosSlice';

/**
 * Hook personalizado para gestionar miembros
 * Centraliza toda la lógica de miembros en un hook reutilizable
 */
export const useMiembros = () => {
  const dispatch = useDispatch();
  
  // Estados locales
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Selectores Redux
  const miembros = useSelector(selectMiembrosToShow);
  const miembroActual = useSelector(selectMiembroActual);
  const loading = {
    list: useSelector(selectLoadingList),
    detail: useSelector(selectLoadingDetail),
    create: useSelector(selectLoadingCreate),
    update: useSelector(selectLoadingUpdate),
    delete: useSelector(selectLoadingDelete),
  };
  const error = useSelector(selectError);
  const filtros = useSelector(selectFiltros);
  const estadisticas = useSelector(selectEstadisticas);
  const totalMiembros = useSelector(selectTotalMiembros);
  const hasMore = useSelector(selectHasMore);
  const activeFiltersCount = useSelector(selectActiveFiltersCount);

  // ===== FUNCIONES DE CARGA =====

  /**
   * Cargar lista de miembros
   */
  const loadMiembros = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setRefreshing(true);
      await dispatch(fetchMiembros()).unwrap();
      return true;
    } catch (error) {
      console.error('❌ Error cargando miembros:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudieron cargar los miembros',
      });
      return false;
    } finally {
      if (showLoading) setRefreshing(false);
    }
  }, [dispatch]);

  /**
   * Cargar estadísticas
   */
  const loadEstadisticas = useCallback(async () => {
    try {
      await dispatch(fetchEstadisticas()).unwrap();
      return true;
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
      return false;
    }
  }, [dispatch]);

  /**
   * Cargar datos iniciales (miembros + estadísticas)
   */
  const loadInitialData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setRefreshing(true);
      
      const [miembrosResult, estadisticasResult] = await Promise.allSettled([
        dispatch(fetchMiembros()).unwrap(),
        dispatch(fetchEstadisticas()).unwrap()
      ]);

      const miembrosSuccess = miembrosResult.status === 'fulfilled';
      const estadisticasSuccess = estadisticasResult.status === 'fulfilled';

      if (!miembrosSuccess) {
        throw miembrosResult.reason;
      }

      return { miembrosSuccess, estadisticasSuccess };
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar los datos',
      });
      return { miembrosSuccess: false, estadisticasSuccess: false };
    } finally {
      if (showLoading) setRefreshing(false);
    }
  }, [dispatch]);

  /**
   * Refrescar datos (pull to refresh)
   */
  const refreshData = useCallback(async () => {
    dispatch(setPage(1)); // Resetear página
    return await loadInitialData(true);
  }, [dispatch, loadInitialData]);

  // ===== FUNCIONES DE MIEMBRO INDIVIDUAL =====

  /**
   * Obtener miembro por ID
   */
  const getMiembro = useCallback(async (id) => {
    try {
      const miembro = await dispatch(fetchMiembroById(id)).unwrap();
      return miembro;
    } catch (error) {
      console.error(`❌ Error obteniendo miembro ${id}:`, error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo cargar el miembro',
      });
      throw error;
    }
  }, [dispatch]);

  /**
   * Crear nuevo miembro
   */
  const createNewMiembro = useCallback(async (miembroData) => {
    try {
      const nuevoMiembro = await dispatch(createMiembro(miembroData)).unwrap();
      
      Toast.show({
        type: 'success',
        text1: 'Miembro creado',
        text2: `${nuevoMiembro.nombres} ha sido agregado exitosamente`,
      });
      
      // Recargar estadísticas después de crear
      loadEstadisticas();
      
      return nuevoMiembro;
    } catch (error) {
      console.error('❌ Error creando miembro:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudo crear el miembro',
      });
      throw error;
    }
  }, [dispatch, loadEstadisticas]);

  /**
   * Actualizar miembro existente
   */
  const updateExistingMiembro = useCallback(async (id, miembroData) => {
    try {
      const miembroActualizado = await dispatch(updateMiembro({ id, data: miembroData })).unwrap();
      
      Toast.show({
        type: 'success',
        text1: 'Miembro actualizado',
        text2: `${miembroActualizado.nombres} ha sido actualizado exitosamente`,
      });
      
      return miembroActualizado;
    } catch (error) {
      console.error(`❌ Error actualizando miembro ${id}:`, error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudo actualizar el miembro',
      });
      throw error;
    }
  }, [dispatch]);

  /**
   * Eliminar miembro con confirmación
   */
  const deleteMiembroWithConfirmation = useCallback((miembro, onSuccess) => {
    Alert.alert(
      'Eliminar Miembro',
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
              
              Toast.show({
                type: 'success',
                text1: 'Miembro eliminado',
                text2: `${miembro.nombres} ha sido eliminado exitosamente`,
              });
              
              // Recargar estadísticas después de eliminar
              loadEstadisticas();
              onSuccess?.();
              
            } catch (error) {
              console.error(`❌ Error eliminando miembro ${miembro.id}:`, error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'No se pudo eliminar el miembro',
              });
            }
          },
        },
      ]
    );
  }, [dispatch, loadEstadisticas]);

  // ===== FUNCIONES DE BÚSQUEDA Y FILTROS =====

  /**
   * Buscar miembros
   */
  const buscarMiembros = useCallback(async (query, filtrosExtra = {}) => {
    try {
      const results = await dispatch(searchMiembros({ query, filtros: filtrosExtra })).unwrap();
      return results;
    } catch (error) {
      console.error('❌ Error buscando miembros:', error);
      Toast.show({
        type: 'error',
        text1: 'Error en búsqueda',
        text2: 'No se pudo realizar la búsqueda',
      });
      return [];
    }
  }, [dispatch]);

  /**
   * Aplicar filtros
   */
  const aplicarFiltros = useCallback((nuevosFiltros) => {
    dispatch(updateFiltros(nuevosFiltros));
  }, [dispatch]);

  /**
   * Limpiar filtros
   */
  const limpiarFiltros = useCallback(() => {
    dispatch(resetFiltros());
    setSearchText('');
  }, [dispatch]);

  /**
   * Manejar búsqueda con texto
   */
  const handleSearch = useCallback((text) => {
    setSearchText(text);
    dispatch(updateFiltros({ search: text }));
  }, [dispatch]);

  // ===== FUNCIONES DE PAGINACIÓN =====

  /**
   * Cargar más miembros (paginación)
   */
  const loadMore = useCallback(() => {
    if (!loading.list && hasMore) {
      dispatch(setPage(currentPage => currentPage + 1));
    }
  }, [dispatch, loading.list, hasMore]);

  // ===== FUNCIONES UTILITARIAS =====

  /**
   * Limpiar errores
   */
  const clearErrors = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Verificar si hay alguna operación en curso
   */
  const isAnyLoading = useCallback(() => {
    return Object.values(loading).some(isLoading => isLoading);
  }, [loading]);

  /**
   * Obtener mensaje de estado
   */
  const getStatusMessage = useCallback(() => {
    if (loading.list) return 'Cargando miembros...';
    if (loading.create) return 'Creando miembro...';
    if (loading.update) return 'Actualizando miembro...';
    if (loading.delete) return 'Eliminando miembro...';
    if (error) return error.message || 'Ha ocurrido un error';
    return null;
  }, [loading, error]);

  // ===== EFECTOS =====

  // Limpiar errores al desmontar
  useEffect(() => {
    return () => {
      clearErrors();
    };
  }, [clearErrors]);

  // ===== RETURN =====
  return {
    // Datos
    miembros,
    miembroActual,
    estadisticas,
    totalMiembros,
    filtros,
    searchText,
    activeFiltersCount,
    
    // Estados
    loading,
    error,
    refreshing,
    hasMore,
    
    // Funciones de carga
    loadMiembros,
    loadEstadisticas,
    loadInitialData,
    refreshData,
    
    // Funciones CRUD
    getMiembro,
    createNewMiembro,
    updateExistingMiembro,
    deleteMiembroWithConfirmation,
    
    // Funciones de búsqueda
    buscarMiembros,
    handleSearch,
    aplicarFiltros,
    limpiarFiltros,
    
    // Funciones de paginación
    loadMore,
    
    // Utilidades
    clearErrors,
    isAnyLoading,
    getStatusMessage,
    
    // Estados computados
    isEmpty: miembros.length === 0,
    hasResults: miembros.length > 0,
    hasFilters: activeFiltersCount > 0,
  };
};

export default useMiembros;