import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import miembrosService from '../../services/miembrosService';

// ===== THUNKS ASÍNCRONOS =====

/**
 * Obtener lista de miembros
 */
export const fetchMiembros = createAsyncThunk(
  'miembros/fetchMiembros',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { filtros, page } = state.miembros;
      
      // Combinar parámetros del estado con los parámetros pasados
      const finalParams = {
        ...filtros,
        page,
        limit: 10, // Cantidad por página
        ...params,
      };

      console.log('🔍 Redux: Fetching miembros con params:', finalParams);
      
      const response = await miembrosService.getMiembros(finalParams);
      
      return {
        miembros: response.data,
        pagination: response.pagination,
        total: response.total,
        params: finalParams,
      };
    } catch (error) {
      console.error('❌ Redux: Error fetching miembros:', error);
      return rejectWithValue(error);
    }
  }
);

/**
 * Obtener miembro por ID
 */
export const fetchMiembroById = createAsyncThunk(
  'miembros/fetchMiembroById',
  async (id, { rejectWithValue }) => {
    try {
      console.log(`🔍 Redux: Fetching miembro ID: ${id}`);
      const miembro = await miembrosService.getMiembroById(id);
      return miembro;
    } catch (error) {
      console.error(`❌ Redux: Error fetching miembro ${id}:`, error);
      return rejectWithValue(error);
    }
  }
);

/**
 * Crear nuevo miembro
 */
export const createMiembro = createAsyncThunk(
  'miembros/createMiembro',
  async (miembroData, { rejectWithValue }) => {
    try {
      console.log('🔍 Redux: Creating miembro:', miembroData);
      const miembro = await miembrosService.createMiembro(miembroData);
      return miembro;
    } catch (error) {
      console.error('❌ Redux: Error creating miembro:', error);
      return rejectWithValue(error);
    }
  }
);

/**
 * Actualizar miembro
 */
export const updateMiembro = createAsyncThunk(
  'miembros/updateMiembro',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log(`🔍 Redux: Updating miembro ${id}:`, data);
      const miembro = await miembrosService.updateMiembro(id, data);
      return miembro;
    } catch (error) {
      console.error(`❌ Redux: Error updating miembro ${id}:`, error);
      return rejectWithValue(error);
    }
  }
);

/**
 * Eliminar miembro
 */
export const deleteMiembro = createAsyncThunk(
  'miembros/deleteMiembro',
  async (id, { rejectWithValue }) => {
    try {
      console.log(`🔍 Redux: Deleting miembro ID: ${id}`);
      await miembrosService.deleteMiembro(id);
      return id;
    } catch (error) {
      console.error(`❌ Redux: Error deleting miembro ${id}:`, error);
      return rejectWithValue(error);
    }
  }
);

/**
 * Obtener estadísticas
 */
export const fetchEstadisticas = createAsyncThunk(
  'miembros/fetchEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Redux: Fetching estadísticas');
      const estadisticas = await miembrosService.getEstadisticas();
      return estadisticas;
    } catch (error) {
      console.error('❌ Redux: Error fetching estadísticas:', error);
      return rejectWithValue(error);
    }
  }
);

/**
 * Buscar miembros
 */
export const searchMiembros = createAsyncThunk(
  'miembros/searchMiembros',
  async ({ query, filtros = {} }, { rejectWithValue }) => {
    try {
      console.log('🔍 Redux: Searching miembros:', { query, filtros });
      const results = await miembrosService.buscarMiembros(query, filtros);
      return { results, query, filtros };
    } catch (error) {
      console.error('❌ Redux: Error searching miembros:', error);
      return rejectWithValue(error);
    }
  }
);

// ===== ESTADO INICIAL =====
const initialState = {
  // Datos
  miembros: [],
  miembroActual: null,
  estadisticas: {
    total: 0,
    aprendices: 0,
    companeros: 0,
    maestros: 0,
    activos: 0,
    inactivos: 0,
    suspendidos: 0,
    nuevosEsteAno: 0,
    promedioEdad: 0,
    promedioAnosMembresia: 0,
  },
  
  // Paginación
  page: 1,
  limit: 10,
  totalPages: 0,
  totalMiembros: 0,
  
  // Filtros y búsqueda
  filtros: {
    search: '',
    grado: null,
    estado: null,
    fechaIngreso: null,
    ordenarPor: 'nombre',
    orden: 'asc',
  },
  
  // Estados de carga
  loading: {
    list: false,
    detail: false,
    create: false,
    update: false,
    delete: false,
    estadisticas: false,
    search: false,
  },
  
  // Errores
  error: null,
  
  // UI States
  selectedMiembros: [],
  lastFetch: null,
  searchResults: [],
  isSearchMode: false,
};

// ===== SLICE =====
const miembrosSlice = createSlice({
  name: 'miembros',
  initialState,
  reducers: {
    // Limpiar errores
    clearError: (state) => {
      state.error = null;
    },
    
    // Actualizar filtros
    updateFiltros: (state, action) => {
      state.filtros = { ...state.filtros, ...action.payload };
      state.page = 1; // Resetear página cuando cambian filtros
    },
    
    // Resetear filtros
    resetFiltros: (state) => {
      state.filtros = initialState.filtros;
      state.page = 1;
    },
    
    // Cambiar página
    setPage: (state, action) => {
      state.page = action.payload;
    },
    
    // Seleccionar/deseleccionar miembros
    toggleSelectMiembro: (state, action) => {
      const miembroId = action.payload;
      const index = state.selectedMiembros.indexOf(miembroId);
      
      if (index > -1) {
        state.selectedMiembros.splice(index, 1);
      } else {
        state.selectedMiembros.push(miembroId);
      }
    },
    
    // Seleccionar todos los miembros
    selectAllMiembros: (state) => {
      state.selectedMiembros = state.miembros.map(m => m.id);
    },
    
    // Deseleccionar todos los miembros
    clearSelectedMiembros: (state) => {
      state.selectedMiembros = [];
    },
    
    // Limpiar miembro actual
    clearMiembroActual: (state) => {
      state.miembroActual = null;
    },
    
    // Entrar/salir del modo búsqueda
    setSearchMode: (state, action) => {
      state.isSearchMode = action.payload;
      if (!action.payload) {
        state.searchResults = [];
      }
    },
    
    // Limpiar resultados de búsqueda
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.isSearchMode = false;
    },
    
    // Actualizar un miembro en la lista local
    updateMiembroInList: (state, action) => {
      const updatedMiembro = action.payload;
      const index = state.miembros.findIndex(m => m.id === updatedMiembro.id);
      
      if (index !== -1) {
        state.miembros[index] = updatedMiembro;
      }
    },
    
    // Eliminar un miembro de la lista local
    removeMiembroFromList: (state, action) => {
      const miembroId = action.payload;
      state.miembros = state.miembros.filter(m => m.id !== miembroId);
      state.selectedMiembros = state.selectedMiembros.filter(id => id !== miembroId);
      state.totalMiembros = Math.max(0, state.totalMiembros - 1);
    },
  },
  
  extraReducers: (builder) => {
    // ===== FETCH MIEMBROS =====
    builder
      .addCase(fetchMiembros.pending, (state) => {
        state.loading.list = true;
        state.error = null;
      })
      .addCase(fetchMiembros.fulfilled, (state, action) => {
        state.loading.list = false;
        
        const { miembros, pagination, total, params } = action.payload;
        
        // Si es la primera página o cambio de filtros, reemplazar
        if (params.page === 1) {
          state.miembros = miembros;
        } else {
          // Si es paginación, agregar a la lista existente
          state.miembros = [...state.miembros, ...miembros];
        }
        
        // Actualizar información de paginación
        state.totalMiembros = total;
        state.totalPages = pagination.totalPages || Math.ceil(total / state.limit);
        state.lastFetch = new Date().toISOString();
        
        // Limpiar selección si hay nuevos datos
        if (params.page === 1) {
          state.selectedMiembros = [];
        }
      })
      .addCase(fetchMiembros.rejected, (state, action) => {
        state.loading.list = false;
        state.error = action.payload;
      });
    
    // ===== FETCH MIEMBRO BY ID =====
    builder
      .addCase(fetchMiembroById.pending, (state) => {
        state.loading.detail = true;
        state.error = null;
      })
      .addCase(fetchMiembroById.fulfilled, (state, action) => {
        state.loading.detail = false;
        state.miembroActual = action.payload;
      })
      .addCase(fetchMiembroById.rejected, (state, action) => {
        state.loading.detail = false;
        state.error = action.payload;
      });
    
    // ===== CREATE MIEMBRO =====
    builder
      .addCase(createMiembro.pending, (state) => {
        state.loading.create = true;
        state.error = null;
      })
      .addCase(createMiembro.fulfilled, (state, action) => {
        state.loading.create = false;
        
        // Agregar el nuevo miembro al principio de la lista
        state.miembros.unshift(action.payload);
        state.totalMiembros += 1;
        
        // Actualizar estadísticas si es necesario
        const grado = action.payload.grado;
        if (grado) {
          state.estadisticas.total += 1;
          if (grado === 'aprendiz') state.estadisticas.aprendices += 1;
          else if (grado === 'companero') state.estadisticas.companeros += 1;
          else if (grado === 'maestro') state.estadisticas.maestros += 1;
        }
      })
      .addCase(createMiembro.rejected, (state, action) => {
        state.loading.create = false;
        state.error = action.payload;
      });
    
    // ===== UPDATE MIEMBRO =====
    builder
      .addCase(updateMiembro.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateMiembro.fulfilled, (state, action) => {
        state.loading.update = false;
        
        const updatedMiembro = action.payload;
        
        // Actualizar en la lista
        const index = state.miembros.findIndex(m => m.id === updatedMiembro.id);
        if (index !== -1) {
          state.miembros[index] = updatedMiembro;
        }
        
        // Actualizar miembro actual si es el mismo
        if (state.miembroActual && state.miembroActual.id === updatedMiembro.id) {
          state.miembroActual = updatedMiembro;
        }
      })
      .addCase(updateMiembro.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload;
      });
    
    // ===== DELETE MIEMBRO =====
    builder
      .addCase(deleteMiembro.pending, (state) => {
        state.loading.delete = true;
        state.error = null;
      })
      .addCase(deleteMiembro.fulfilled, (state, action) => {
        state.loading.delete = false;
        
        const deletedId = action.payload;
        
        // Eliminar de la lista
        state.miembros = state.miembros.filter(m => m.id !== deletedId);
        state.totalMiembros = Math.max(0, state.totalMiembros - 1);
        
        // Eliminar de seleccionados
        state.selectedMiembros = state.selectedMiembros.filter(id => id !== deletedId);
        
        // Limpiar miembro actual si es el mismo
        if (state.miembroActual && state.miembroActual.id === deletedId) {
          state.miembroActual = null;
        }
      })
      .addCase(deleteMiembro.rejected, (state, action) => {
        state.loading.delete = false;
        state.error = action.payload;
      });
    
    // ===== FETCH ESTADÍSTICAS =====
    builder
      .addCase(fetchEstadisticas.pending, (state) => {
        state.loading.estadisticas = true;
        state.error = null;
      })
      .addCase(fetchEstadisticas.fulfilled, (state, action) => {
        state.loading.estadisticas = false;
        state.estadisticas = { ...state.estadisticas, ...action.payload };
      })
      .addCase(fetchEstadisticas.rejected, (state, action) => {
        state.loading.estadisticas = false;
        state.error = action.payload;
      });
    
    // ===== SEARCH MIEMBROS =====
    builder
      .addCase(searchMiembros.pending, (state) => {
        state.loading.search = true;
        state.error = null;
      })
      .addCase(searchMiembros.fulfilled, (state, action) => {
        state.loading.search = false;
        const { results, query } = action.payload;
        
        state.searchResults = results;
        state.isSearchMode = query.length > 0;
      })
      .addCase(searchMiembros.rejected, (state, action) => {
        state.loading.search = false;
        state.error = action.payload;
      });
  },
});

// ===== ACTIONS =====
export const {
  clearError,
  updateFiltros,
  resetFiltros,
  setPage,
  toggleSelectMiembro,
  selectAllMiembros,
  clearSelectedMiembros,
  clearMiembroActual,
  setSearchMode,
  clearSearchResults,
  updateMiembroInList,
  removeMiembroFromList,
} = miembrosSlice.actions;

// ===== SELECTORS =====

// Selectores básicos
export const selectMiembros = (state) => state.miembros.miembros;
export const selectMiembroActual = (state) => state.miembros.miembroActual;
export const selectEstadisticas = (state) => state.miembros.estadisticas;
export const selectFiltros = (state) => state.miembros.filtros;
export const selectSelectedMiembros = (state) => state.miembros.selectedMiembros;
export const selectSearchResults = (state) => state.miembros.searchResults;
export const selectIsSearchMode = (state) => state.miembros.isSearchMode;

// Selectores de loading
export const selectLoadingList = (state) => state.miembros.loading.list;
export const selectLoadingDetail = (state) => state.miembros.loading.detail;
export const selectLoadingCreate = (state) => state.miembros.loading.create;
export const selectLoadingUpdate = (state) => state.miembros.loading.update;
export const selectLoadingDelete = (state) => state.miembros.loading.delete;
export const selectLoadingEstadisticas = (state) => state.miembros.loading.estadisticas;
export const selectLoadingSearch = (state) => state.miembros.loading.search;

// Selectores de paginación
export const selectPage = (state) => state.miembros.page;
export const selectTotalPages = (state) => state.miembros.totalPages;
export const selectTotalMiembros = (state) => state.miembros.totalMiembros;

// Selector de error
export const selectError = (state) => state.miembros.error;

// Selectores computados
export const selectMiembrosToShow = (state) => {
  const { isSearchMode, searchResults, miembros } = state.miembros;
  return isSearchMode ? searchResults : miembros;
};

export const selectHasMore = (state) => {
  const { page, totalPages } = state.miembros;
  return page < totalPages;
};

export const selectIsAnyLoading = (state) => {
  const { loading } = state.miembros;
  return Object.values(loading).some(isLoading => isLoading);
};

export const selectActiveFiltersCount = (state) => {
  const { filtros } = state.miembros;
  let count = 0;
  if (filtros.search) count++;
  if (filtros.grado) count++;
  if (filtros.estado) count++;
  if (filtros.fechaIngreso) count++;
  return count;
};

// Selector para obtener miembro por ID
export const selectMiembroById = (state, miembroId) => {
  const allMiembros = [...state.miembros.miembros, ...state.miembros.searchResults];
  return allMiembros.find(miembro => miembro.id === miembroId);
};

// Selector para estadísticas computadas
export const selectComputedStats = (state) => {
  const { estadisticas, totalMiembros } = state.miembros;
  
  return {
    ...estadisticas,
    porcentajeAprendices: totalMiembros > 0 ? Math.round((estadisticas.aprendices / totalMiembros) * 100) : 0,
    porcentajeCompaneros: totalMiembros > 0 ? Math.round((estadisticas.companeros / totalMiembros) * 100) : 0,
    porcentajeMaestros: totalMiembros > 0 ? Math.round((estadisticas.maestros / totalMiembros) * 100) : 0,
    porcentajeActivos: totalMiembros > 0 ? Math.round((estadisticas.activos / totalMiembros) * 100) : 0,
  };
};

export default miembrosSlice.reducer;