import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';

/**
 * Hook personalizado para manejar llamadas a API
 * Proporciona estados de loading, error, data y funciones para hacer requests
 */
export const useApi = (apiFunction, options = {}) => {
  const {
    immediate = false,           // Ejecutar inmediatamente al montar
    dependencies = [],           // Dependencias para re-ejecutar
    onSuccess = null,           // Callback de éxito
    onError = null,             // Callback de error
    retryCount = 0,             // Número de reintentos automáticos
    retryDelay = 1000,          // Delay entre reintentos (ms)
  } = options;

  // Estados
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Refs
  const mountedRef = useRef(true);
  const retryTimeoutRef = useRef(null);

  // Selectores - definir directamente para evitar imports problemáticos
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || false);

  // Función para ejecutar la API
  const execute = useCallback(async (...args) => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    let attempts = 0;
    const maxAttempts = retryCount + 1;

    const attemptRequest = async () => {
      try {
        const result = await apiFunction(...args);
        
        if (!mountedRef.current) return;

        if (result.success) {
          setData(result.data);
          setError(null);
          setLastUpdated(new Date());
          
          if (onSuccess) {
            onSuccess(result.data);
          }
        } else {
          throw new Error(result.error || 'Error en la API');
        }
      } catch (err) {
        if (!mountedRef.current) return;

        attempts++;
        
        if (attempts < maxAttempts) {
          // Reintentar después del delay
          retryTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              attemptRequest();
            }
          }, retryDelay * attempts);
        } else {
          // No más reintentos
          const errorMessage = err.message || 'Error desconocido';
          setError(errorMessage);
          setData(null);
          
          if (onError) {
            onError(err);
          }
        }
      } finally {
        if (mountedRef.current && attempts >= maxAttempts) {
          setLoading(false);
        }
      }
    };

    await attemptRequest();
  }, [apiFunction, retryCount, retryDelay, onSuccess, onError]);

  // Función para limpiar estados
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setLastUpdated(null);
  }, []);

  // Función para limpiar solo el error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Efecto para ejecutar inmediatamente si se especifica
  useEffect(() => {
    if (immediate && isAuthenticated) {
      execute();
    }
  }, [execute, immediate, isAuthenticated, ...dependencies]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    clearError,
    lastUpdated,
    isIdle: !loading && !error && !data,
    isSuccess: !loading && !error && data !== null,
    isError: !loading && error !== null,
  };
};

/**
 * Hook para paginación de listas
 */
export const usePaginatedApi = (apiFunction, options = {}) => {
  const {
    pageSize = 20,
    immediate = false,
    filters = {},
    ...apiOptions
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [allData, setAllData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: pageSize,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Hook de API base
  const {
    data,
    loading,
    error,
    execute: baseExecute,
    reset: baseReset,
    clearError,
    lastUpdated,
  } = useApi(apiFunction, {
    ...apiOptions,
    immediate: false,
  });

  // Función para cargar página específica
  const loadPage = useCallback(async (page = 1, reset = false) => {
    const params = {
      page,
      limit: pageSize,
      ...filters,
    };

    await baseExecute(params);
    setCurrentPage(page);
  }, [baseExecute, pageSize, filters]);

  // Función para cargar siguiente página
  const loadNextPage = useCallback(async () => {
    if (pagination.hasNextPage) {
      await loadPage(currentPage + 1);
    }
  }, [loadPage, currentPage, pagination.hasNextPage]);

  // Función para cargar página anterior
  const loadPrevPage = useCallback(async () => {
    if (pagination.hasPrevPage) {
      await loadPage(currentPage - 1);
    }
  }, [loadPage, currentPage, pagination.hasPrevPage]);

  // Función para recargar página actual
  const reload = useCallback(async () => {
    await loadPage(currentPage);
  }, [loadPage, currentPage]);

  // Función para reset completo
  const reset = useCallback(() => {
    baseReset();
    setCurrentPage(1);
    setAllData([]);
    setPagination({
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: pageSize,
      hasNextPage: false,
      hasPrevPage: false,
    });
  }, [baseReset, pageSize]);

  // Función para cargar más datos (infinite scroll)
  const loadMore = useCallback(async () => {
    if (pagination.hasNextPage && !loading) {
      const nextPage = currentPage + 1;
      const params = {
        page: nextPage,
        limit: pageSize,
        ...filters,
      };

      await baseExecute(params);
      setCurrentPage(nextPage);
    }
  }, [baseExecute, pagination.hasNextPage, loading, currentPage, pageSize, filters]);

  // Actualizar datos cuando la respuesta cambia
  useEffect(() => {
    if (data) {
      const items = Array.isArray(data) ? data : data.items || data.data || [];
      const paginationData = data.pagination || {};

      if (currentPage === 1) {
        // Primera página o reset
        setAllData(items);
      } else {
        // Páginas adicionales (para infinite scroll)
        setAllData(prev => [...prev, ...items]);
      }

      setPagination({
        currentPage: paginationData.currentPage || currentPage,
        totalPages: paginationData.totalPages || 1,
        totalItems: paginationData.totalItems || items.length,
        itemsPerPage: paginationData.itemsPerPage || pageSize,
        hasNextPage: paginationData.hasNextPage || false,
        hasPrevPage: paginationData.hasPrevPage || false,
      });
    }
  }, [data, currentPage, pageSize]);

  // Cargar primera página si immediate está activado
  useEffect(() => {
    if (immediate) {
      loadPage(1, true);
    }
  }, [immediate, loadPage]);

  // Recargar cuando los filtros cambian
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadPage(1, true);
    }
  }, [filters, loadPage]);

  return {
    // Datos
    items: Array.isArray(data) ? data : data?.items || data?.data || [],
    allItems: allData,
    pagination,
    
    // Estados
    loading,
    error,
    lastUpdated,
    
    // Acciones de paginación
    loadPage,
    loadNextPage,
    loadPrevPage,
    reload,
    loadMore,
    
    // Utilidades
    reset,
    clearError,
    
    // Estados derivados
    isEmpty: !loading && (!data || (Array.isArray(data) ? data.length === 0 : !data.items?.length)),
    isFirstPage: currentPage === 1,
    isLastPage: !pagination.hasNextPage,
    currentPage,
  };
};

/**
 * Hook para búsqueda con debounce
 */
export const useSearchApi = (apiFunction, options = {}) => {
  const {
    debounceMs = 300,
    minSearchLength = 2,
    immediate = false,
    ...apiOptions
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const searchTimeoutRef = useRef(null);

  // Hook de API base
  const apiHook = useApi(apiFunction, {
    ...apiOptions,
    immediate: false,
  });

  // Debounce del término de búsqueda
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, debounceMs]);

  // Ejecutar búsqueda cuando el término debounced cambia
  useEffect(() => {
    if (debouncedSearchTerm.length >= minSearchLength) {
      apiHook.execute({ search: debouncedSearchTerm });
    } else if (debouncedSearchTerm.length === 0) {
      // Limpiar resultados cuando no hay término de búsqueda
      apiHook.reset();
    }
  }, [debouncedSearchTerm, minSearchLength, apiHook.execute, apiHook.reset]);

  // Función para actualizar el término de búsqueda
  const search = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Función para limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    apiHook.reset();
  }, [apiHook.reset]);

  return {
    ...apiHook,
    search,
    clearSearch,
    searchTerm,
    debouncedSearchTerm,
    isSearching: searchTerm !== debouncedSearchTerm,
    hasSearchTerm: debouncedSearchTerm.length >= minSearchLength,
  };
};

/**
 * Hook para manejo de formularios con API
 */
export const useFormApi = (apiFunction, options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    resetOnSuccess = false,
    ...apiOptions
  } = options;

  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  // Hook de API base
  const apiHook = useApi(apiFunction, {
    ...apiOptions,
    immediate: false,
    onSuccess: (data) => {
      if (resetOnSuccess) {
        setFormData({});
      }
      setValidationErrors({});
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      // Si el error contiene detalles de validación, extraerlos
      if (error.details && typeof error.details === 'object') {
        setValidationErrors(error.details);
      }
      if (onError) {
        onError(error);
      }
    },
  });

  // Función para actualizar campo del formulario
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Limpiar error de validación del campo
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  }, [validationErrors]);

  // Función para enviar formulario
  const submit = useCallback(async (overrideData = {}) => {
    const dataToSubmit = { ...formData, ...overrideData };
    await apiHook.execute(dataToSubmit);
  }, [formData, apiHook.execute]);

  // Función para resetear formulario
  const resetForm = useCallback(() => {
    setFormData({});
    setValidationErrors({});
    apiHook.reset();
  }, [apiHook.reset]);

  return {
    ...apiHook,
    formData,
    validationErrors,
    updateField,
    submit,
    resetForm,
    hasValidationErrors: Object.keys(validationErrors).length > 0,
  };
};

export default useApi;