import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import miembrosService from '../../services/miembrosService';
import Toast from 'react-native-toast-message';

// Estado inicial
const initialState = {
  // Lista de miembros
  miembros: [],
  
  // Paginación
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  },
  
  // Filtros y búsqueda
  filters: {
    search: '',
    grado: '',
    estado: '',
    sortBy: 'nombres',
    sortOrder: 'ASC'
  },
  
  // Estados de carga
  isLoading: false,
  isLoadingDetail: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isImporting: false,
  
  // Miembro seleccionado
  selectedMiembro: null,
  
  // Estadísticas
  estadisticas: {
    totalMiembros: 0,
    activos: 0,
    inactivos: 0,
    porcentajeActivos: 0,
    distribucionPorGrado: {
      aprendices: 0,
      companeros: 0,
      maestros: 0
    }
  },
  
  // Errores
  error: null,
  
  // Progreso de importación
  importProgress: 0,
  
  // Cache para optimización
  lastFetch: null,
  cacheExpiry: 5 * 60 * 1000 // 5 minutos
};

// Thunks asíncronos

// Obtener lista de miembros
export const fetchMiembros = createAsyncThunk(
  'miembros/fetchMiembros',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentFilters = state.miembros.filters;
      
      // Combinar parámetros con filtros actuales
      const requestParams = {
        page: params.page || state.miembros.pagination.currentPage,
        limit: params.limit || state.miembros.pagination.itemsPerPage,
        search: params.search !== undefined ? params.search : currentFilters.search,
        grado: params.grado !== undefined ? params.grado : currentFilters.grado,
        estado: params.estado !== undefined ? params.estado : currentFilters.estado,
        sortBy: params.sortBy || currentFilters.sortBy,
        sortOrder: params.sortOrder || currentFilters.sortOrder
      };

      const result = await miembrosService.getMiembros(requestParams);
      
      if (result.success) {
        return {
          ...result.data,
          filters: requestParams
        };
      } else {
        return rejectWithValue(result.message || 'Error al obtener miembros');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error inesperado');
    }
  }
);

// Obtener estadísticas
export const fetchEstadisticas = createAsyncThunk(
  'miembros/fetchEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      const result = await miembrosService.getEstadisticas();
      
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message || 'Error al obtener estadísticas');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error inesperado');
    }
  }
);

// Obtener miembro por ID
export const fetchMiembroById = createAsyncThunk(
  'miembros/fetchMiembroById',
  async (id, { rejectWithValue }) => {
    try {
      const result = await miembrosService.getMiembroById(id);
      
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message || 'Miembro no encontrado');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error inesperado');
    }
  }
);

// Crear nuevo miembro
export const createMiembro = createAsyncThunk(
  'miembros/createMiembro',
  async (miembroData, { dispatch, rejectWithValue }) => {
    try {
      const result = await miembrosService.createMiembro(miembroData);
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Miembro Creado',
          text2: result.message || 'Miembro creado exitosamente',
          visibilityTime: 3000,
        });
        
        // Refrescar lista de miembros
        dispatch(fetchMiembros());
        dispatch(fetchEstadisticas());
        
        return result.data;
      } else {
        return rejectWithValue({
          message: result.message || 'Error al crear miembro',
          errors: result.errors || []
        });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Error inesperado',
        errors: []
      });
    }
  }
);

// Actualizar miembro
export const updateMiembro = createAsyncThunk(
  'miembros/updateMiembro',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const result = await miembrosService.updateMiembro(id, data);
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Miembro Actualizado',
          text2: result.message || 'Miembro actualizado exitosamente',
          visibilityTime: 3000,
        });
        
        // Refrescar lista y estadísticas
        dispatch(fetchMiembros());
        dispatch(fetchEstadisticas());
        
        return result.data;
      } else {
        return rejectWithValue({
          message: result.message || 'Error al actualizar miembro',
          errors: result.errors || []
        });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Error inesperado',
        errors: []
      });
    }
  }
);

// Eliminar miembro
export const deleteMiembro = createAsyncThunk(
  'miembros/deleteMiembro',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const result = await miembrosService.deleteMiembro(id);
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Miembro Eliminado',
          text2: result.message || 'Miembro eliminado exitosamente',
          visibilityTime: 3000,
        });
        
        // Refrescar lista y estadísticas
        dispatch(fetchMiembros());
        dispatch(fetchEstadisticas());
        
        return id;
      } else {
        return rejectWithValue(result.message || 'Error al eliminar miembro');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error inesperado');
    }
  }
);

// Importar miembros
export const importMiembros = createAsyncThunk(
  'miembros/importMiembros',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      const result = await miembrosService.importarMiembros(
        file,
        (progress) => {
          // El progreso se maneja en el reducer
          dispatch(setImportProgress(progress));
        }
      );
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Importación Completada',
          text2: result.message || 'Miembros importados exitosamente',
          visibilityTime: 4000,
        });
        
        // Refrescar datos
        dispatch(fetchMiembros());
        dispatch(fetchEstadisticas());
        
        return result.data;
      } else {
        return rejectWithValue({
          message: result.message || 'Error en la importación',
          errors: result.errors || []
        });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Error inesperado',
        errors: []
      });
    }
  }
);

// Slice
const miembrosSlice = createSlice({
  name: 'miembros',
  initialState,
  reducers: {
    // Limpiar errores
    clearError: (state) => {
      state.error = null;
    },

    // Actualizar filtros
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Reset filtros
    resetFilters: (state) => {
      state.filters = {
        search: '',
        grado: '',
        estado: '',
        sortBy: 'nombres',
        sortOrder: 'ASC'
      };
    },

    // Seleccionar miembro
    selectMiembro: (state, action) => {
      state.selectedMiembro = action.payload;
    },

    // Limpiar miembro seleccionado
    clearSelectedMiembro: (state) => {
      state.selectedMiembro = null;
    },

    // Actualizar progreso de importación
    setImportProgress: (state, action) => {
      state.importProgress = action.payload;
    },

    // Reset progreso de importación
    resetImportProgress: (state) => {
      state.importProgress = 0;
    },

    // Actualizar página
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },

    // Actualizar items por página
    setItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1; // Reset a la primera página
    },

    // Invalidar cache
    invalidateCache: (state) => {
      state.lastFetch = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch miembros
    builder
      .addCase(fetchMiembros.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMiembros.fulfilled, (state, action) => {
        state.isLoading = false;
        state.miembros = action.payload.miembros;
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters;
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchMiembros.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch estadísticas
    builder
      .addCase(fetchEstadisticas.pending, (state) => {
        // No mostrar loading para estadísticas
      })
      .addCase(fetchEstadisticas.fulfilled, (state, action) => {
        state.estadisticas = action.payload;
      })
      .addCase(fetchEstadisticas.rejected, (state, action) => {
        console.warn('Error al cargar estadísticas:', action.payload);
      });

    // Fetch miembro by ID
    builder
      .addCase(fetchMiembroById.pending, (state) => {
        state.isLoadingDetail = true;
        state.error = null;
      })
      .addCase(fetchMiembroById.fulfilled, (state, action) => {
        state.isLoadingDetail = false;
        state.selectedMiembro = action.payload;
      })
      .addCase(fetchMiembroById.rejected, (state, action) => {
        state.isLoadingDetail = false;
        state.error = action.payload;
      });

    // Create miembro
    builder
      .addCase(createMiembro.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createMiembro.fulfilled, (state, action) => {
        state.isCreating = false;
        // El miembro se agregará cuando se refresque la lista
      })
      .addCase(createMiembro.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      });

    // Update miembro
    builder
      .addCase(updateMiembro.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateMiembro.fulfilled, (state, action) => {
        state.isUpdating = false;
        
        // Actualizar en la lista si existe
        const index = state.miembros.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.miembros[index] = action.payload;
        }
        
        // Actualizar miembro seleccionado si es el mismo
        if (state.selectedMiembro?.id === action.payload.id) {
          state.selectedMiembro = action.payload;
        }
      })
      .addCase(updateMiembro.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });

    // Delete miembro
    builder
      .addCase(deleteMiembro.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteMiembro.fulfilled, (state, action) => {
        state.isDeleting = false;
        
        // Remover de la lista
        state.miembros = state.miembros.filter(m => m.id !== action.payload);
        
        // Limpiar selección si era el miembro eliminado
        if (state.selectedMiembro?.id === action.payload) {
          state.selectedMiembro = null;
        }
      })
      .addCase(deleteMiembro.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      });

    // Import miembros
    builder
      .addCase(importMiembros.pending, (state) => {
        state.isImporting = true;
        state.error = null;
        state.importProgress = 0;
      })
      .addCase(importMiembros.fulfilled, (state, action) => {
        state.isImporting = false;
        state.importProgress = 100;
        // Los datos se actualizarán cuando se refresque la lista
      })
      .addCase(importMiembros.rejected, (state, action) => {
        state.isImporting = false;
        state.importProgress = 0;
        state.error = action.payload;
      });
  }
});

// Selectores
export const selectMiembros = (state) => state.miembros.miembros;
export const selectMiembrosPagination = (state) => state.miembros.pagination;
export const selectMiembrosFilters = (state) => state.miembros.filters;
export const selectMiembrosLoading = (state) => state.miembros.isLoading;
export const selectMiembrosError = (state) => state.miembros.error;
export const selectSelectedMiembro = (state) => state.miembros.selectedMiembro;
export const selectMiembrosEstadisticas = (state) => state.miembros.estadisticas;
export const selectIsCreatingMiembro = (state) => state.miembros.isCreating;
export const selectIsUpdatingMiembro = (state) => state.miembros.isUpdating;
export const selectIsDeletingMiembro = (state) => state.miembros.isDeleting;
export const selectIsImportingMiembros = (state) => state.miembros.isImporting;
export const selectImportProgress = (state) => state.miembros.importProgress;
export const selectIsLoadingDetail = (state) => state.miembros.isLoadingDetail;

// Selectores con lógica
export const selectMiembroById = (id) => (state) => {
  return state.miembros.miembros.find(miembro => miembro.id === id);
};

export const selectMiembrosByGrado = (grado) => (state) => {
  return state.miembros.miembros.filter(miembro => miembro.grado === grado);
};

export const selectActiveMiembros = (state) => {
  return state.miembros.miembros.filter(miembro => miembro.estado === 'activo');
};

export const selectMiembrosNeedCache = (state) => {
  if (!state.miembros.lastFetch) return true;
  
  const lastFetch = new Date(state.miembros.lastFetch);
  const now = new Date();
  return (now.getTime() - lastFetch.getTime()) > state.miembros.cacheExpiry;
};

export const selectHasMiembros = (state) => {
  return state.miembros.miembros.length > 0;
};

export const selectTotalPages = (state) => {
  return state.miembros.pagination.totalPages;
};

export const selectCurrentPage = (state) => {
  return state.miembros.pagination.currentPage;
};

export const selectCanLoadMore = (state) => {
  return state.miembros.pagination.hasNextPage;
};

// Acciones
export const {
  clearError,
  updateFilters,
  resetFilters,
  selectMiembro,
  clearSelectedMiembro,
  setImportProgress,
  resetImportProgress,
  setCurrentPage,
  setItemsPerPage,
  invalidateCache
} = miembrosSlice.actions;

export default miembrosSlice.reducer;