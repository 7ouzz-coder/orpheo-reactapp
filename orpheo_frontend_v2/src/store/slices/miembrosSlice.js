import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Toast from 'react-native-toast-message';
import api from '../../services/api';

// Estado inicial
const initialState = {
  miembros: [],
  selectedMiembro: null,
  isLoading: false,
  isLoadingDetail: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  
  // Filtros y búsqueda
  filters: {
    search: '',
    grado: null,
    estado: 'activo',
    vigencia: null,
  },
  
  // Paginación
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  },
  
  // Estadísticas
  estadisticas: {
    total: 0,
    porGrado: {
      aprendiz: 0,
      companero: 0,
      maestro: 0,
    },
    porEstado: {
      activo: 0,
      inactivo: 0,
      suspendido: 0,
    },
    nuevosUltimoMes: 0,
  },
  
  // Cache
  lastFetch: null,
  cacheTimeout: 5 * 60 * 1000, // 5 minutos
};

// Thunks asíncronos

// Fetch miembros con filtros y paginación
export const fetchMiembros = createAsyncThunk(
  'miembros/fetchMiembros',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().miembros;
      
      // Usar filtros actuales si no se proporcionan
      const filters = { ...state.filters, ...params.filters };
      const pagination = { ...state.pagination, ...params.pagination };
      
      console.log('📊 Cargando miembros...', filters);
      
      const response = await api.get('/miembros', {
        params: {
          page: pagination.currentPage,
          limit: pagination.pageSize,
          search: filters.search,
          grado: filters.grado,
          estado: filters.estado,
          vigencia: filters.vigencia,
        },
      });
      
      if (response.data && response.data.success) {
        console.log(`✅ Miembros cargados: ${response.data.data.miembros.length}`);
        return {
          miembros: response.data.data.miembros,
          pagination: response.data.data.pagination,
          filters,
        };
      } else {
        throw new Error(response.data?.message || 'Error al cargar miembros');
      }
    } catch (error) {
      console.error('❌ Error al cargar miembros:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error de conexión';
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `No se pudieron cargar los miembros: ${errorMessage}`,
        visibilityTime: 4000,
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch estadísticas
export const fetchEstadisticas = createAsyncThunk(
  'miembros/fetchEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📈 Cargando estadísticas de miembros...');
      
      const response = await api.get('/miembros/estadisticas');
      
      if (response.data && response.data.success) {
        console.log('✅ Estadísticas cargadas');
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Error al cargar estadísticas');
      }
    } catch (error) {
      console.warn('⚠️ Error al cargar estadísticas:', error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch miembro por ID
export const fetchMiembroById = createAsyncThunk(
  'miembros/fetchMiembroById',
  async (id, { rejectWithValue }) => {
    try {
      console.log(`👤 Cargando miembro ID: ${id}`);
      
      const response = await api.get(`/miembros/${id}`);
      
      if (response.data && response.data.success) {
        console.log(`✅ Miembro cargado: ${response.data.data.nombres}`);
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Miembro no encontrado');
      }
    } catch (error) {
      console.error('❌ Error al cargar miembro:', error);
      const errorMessage = error.response?.data?.message || error.message;
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `No se pudo cargar el miembro: ${errorMessage}`,
        visibilityTime: 4000,
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Crear miembro
export const createMiembro = createAsyncThunk(
  'miembros/createMiembro',
  async (miembroData, { dispatch, rejectWithValue }) => {
    try {
      console.log('➕ Creando miembro:', miembroData.nombres);
      
      const response = await api.post('/miembros', miembroData);
      
      if (response.data && response.data.success) {
        console.log('✅ Miembro creado exitosamente');
        
        Toast.show({
          type: 'success',
          text1: 'Miembro Creado',
          text2: `${miembroData.nombres} ${miembroData.apellidos} ha sido registrado`,
          visibilityTime: 3000,
        });
        
        // Recargar lista de miembros
        dispatch(fetchMiembros());
        dispatch(fetchEstadisticas());
        
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Error al crear miembro');
      }
    } catch (error) {
      console.error('❌ Error al crear miembro:', error);
      const errorMessage = error.response?.data?.message || error.message;
      
      Toast.show({
        type: 'error',
        text1: 'Error al Crear',
        text2: errorMessage,
        visibilityTime: 4000,
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Actualizar miembro
export const updateMiembro = createAsyncThunk(
  'miembros/updateMiembro',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      console.log(`✏️ Actualizando miembro ID: ${id}`);
      
      const response = await api.put(`/miembros/${id}`, data);
      
      if (response.data && response.data.success) {
        console.log('✅ Miembro actualizado exitosamente');
        
        Toast.show({
          type: 'success',
          text1: 'Miembro Actualizado',
          text2: `Los datos han sido guardados correctamente`,
          visibilityTime: 3000,
        });
        
        // Recargar datos
        dispatch(fetchMiembros());
        dispatch(fetchEstadisticas());
        
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Error al actualizar miembro');
      }
    } catch (error) {
      console.error('❌ Error al actualizar miembro:', error);
      const errorMessage = error.response?.data?.message || error.message;
      
      Toast.show({
        type: 'error',
        text1: 'Error al Actualizar',
        text2: errorMessage,
        visibilityTime: 4000,
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Eliminar miembro
export const deleteMiembro = createAsyncThunk(
  'miembros/deleteMiembro',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      console.log(`🗑️ Eliminando miembro ID: ${id}`);
      
      const response = await api.delete(`/miembros/${id}`);
      
      if (response.data && response.data.success) {
        console.log('✅ Miembro eliminado exitosamente');
        
        Toast.show({
          type: 'success',
          text1: 'Miembro Eliminado',
          text2: 'El miembro ha sido eliminado del sistema',
          visibilityTime: 3000,
        });
        
        // Recargar datos
        dispatch(fetchMiembros());
        dispatch(fetchEstadisticas());
        
        return id;
      } else {
        throw new Error(response.data?.message || 'Error al eliminar miembro');
      }
    } catch (error) {
      console.error('❌ Error al eliminar miembro:', error);
      const errorMessage = error.response?.data?.message || error.message;
      
      Toast.show({
        type: 'error',
        text1: 'Error al Eliminar',
        text2: errorMessage,
        visibilityTime: 4000,
      });
      
      return rejectWithValue(errorMessage);
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
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Reset a la primera página
    },
    
    // Limpiar filtros
    clearFilters: (state) => {
      state.filters = {
        search: '',
        grado: null,
        estado: 'activo',
        vigencia: null,
      };
      state.pagination.currentPage = 1;
    },
    
    // Actualizar paginación
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Seleccionar miembro
    setSelectedMiembro: (state, action) => {
      state.selectedMiembro = action.payload;
    },
    
    // Limpiar miembro seleccionado
    clearSelectedMiembro: (state) => {
      state.selectedMiembro = null;
    },
    
    // Invalidar cache
    invalidateCache: (state) => {
      state.lastFetch = null;
    },
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
      .addCase(fetchEstadisticas.fulfilled, (state, action) => {
        state.estadisticas = action.payload;
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
      .addCase(createMiembro.fulfilled, (state) => {
        state.isCreating = false;
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
      .addCase(updateMiembro.fulfilled, (state) => {
        state.isUpdating = false;
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
      .addCase(deleteMiembro.fulfilled, (state) => {
        state.isDeleting = false;
      })
      .addCase(deleteMiembro.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const {
  clearError,
  setFilters,
  clearFilters,
  setPagination,
  setSelectedMiembro,
  clearSelectedMiembro,
  invalidateCache,
} = miembrosSlice.actions;

// Selectores
export const selectMiembros = (state) => state.miembros.miembros;
export const selectMiembrosLoading = (state) => state.miembros.isLoading;
export const selectMiembrosError = (state) => state.miembros.error;
export const selectMiembrosFilters = (state) => state.miembros.filters;
export const selectMiembrosPagination = (state) => state.miembros.pagination;
export const selectMiembrosEstadisticas = (state) => state.miembros.estadisticas;
export const selectSelectedMiembro = (state) => state.miembros.selectedMiembro;
export const selectMiembrosDetailLoading = (state) => state.miembros.isLoadingDetail;
export const selectMiembrosCreating = (state) => state.miembros.isCreating;
export const selectMiembrosUpdating = (state) => state.miembros.isUpdating;
export const selectMiembrosDeleting = (state) => state.miembros.isDeleting;

// Selectores derivados
export const selectFilteredMiembros = (state) => {
  const miembros = selectMiembros(state);
  const filters = selectMiembrosFilters(state);
  
  return miembros.filter((miembro) => {
    // Filtro por búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const fullName = `${miembro.nombres} ${miembro.apellidos}`.toLowerCase();
      const matches = fullName.includes(searchTerm) || 
                     miembro.rut?.includes(searchTerm) ||
                     miembro.email?.toLowerCase().includes(searchTerm);
      if (!matches) return false;
    }
    
    // Filtro por grado
    if (filters.grado && miembro.grado !== filters.grado) {
      return false;
    }
    
    // Filtro por estado
    if (filters.estado && miembro.estado !== filters.estado) {
      return false;
    }
    
    return true;
  });
};

export default miembrosSlice.reducer;