import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import miembrosService from '../../services/miembrosService';

// Thunks asíncronos
export const getMiembros = createAsyncThunk(
  'miembros/getMiembros',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await miembrosService.getMiembros(params);
      // ✅ Verificar que response y response.data existen
      if (!response || !response.data) {
        throw new Error('Respuesta inválida del servidor');
      }
      return response; // Tu backend devuelve { success: true, data: [], pagination: {} }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al obtener miembros'
      );
    }
  }
);

export const getMiembroById = createAsyncThunk(
  'miembros/getMiembroById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await miembrosService.getMiembroById(id);
      if (!response || !response.data) {
        throw new Error('Miembro no encontrado');
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al obtener miembro'
      );
    }
  }
);

export const createMiembro = createAsyncThunk(
  'miembros/createMiembro',
  async (miembroData, { rejectWithValue }) => {
    try {
      const response = await miembrosService.createMiembro(miembroData);
      if (!response || !response.data) {
        throw new Error('Error al crear miembro');
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al crear miembro'
      );
    }
  }
);

export const updateMiembro = createAsyncThunk(
  'miembros/updateMiembro',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await miembrosService.updateMiembro(id, data);
      if (!response || !response.data) {
        throw new Error('Error al actualizar miembro');
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al actualizar miembro'
      );
    }
  }
);

export const deleteMiembro = createAsyncThunk(
  'miembros/deleteMiembro',
  async (id, { rejectWithValue }) => {
    try {
      await miembrosService.deleteMiembro(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al eliminar miembro'
      );
    }
  }
);

const miembrosSlice = createSlice({
  name: 'miembros',
  initialState: {
    miembros: [], // ✅ Siempre inicializado como array
    selectedMiembro: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
    filters: {
      search: '',
      grado: null,
      vigente: null,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        grado: null,
        vigente: null,
      };
    },
    setSelectedMiembro: (state, action) => {
      state.selectedMiembro = action.payload;
    },
    // ✅ Reducer para resetear estado en caso de error
    resetMiembrosState: (state) => {
      state.miembros = [];
      state.selectedMiembro = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Miembros
      .addCase(getMiembros.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMiembros.fulfilled, (state, action) => {
        state.loading = false;
        
        // ✅ Verificar que action.payload existe y tiene la estructura correcta
        if (action.payload && action.payload.data && Array.isArray(action.payload.data)) {
          state.miembros = action.payload.data;
          state.pagination = action.payload.pagination || state.pagination;
        } else {
          // Si no hay datos válidos, usar array vacío
          state.miembros = [];
          state.pagination = {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          };
        }
      })
      .addCase(getMiembros.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // ✅ Asegurar que miembros sea siempre un array, incluso en error
        if (!Array.isArray(state.miembros)) {
          state.miembros = [];
        }
      })
      
      // Get Miembro By ID
      .addCase(getMiembroById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMiembroById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          state.selectedMiembro = action.payload.data;
        }
      })
      .addCase(getMiembroById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedMiembro = null;
      })
      
      // Create Miembro
      .addCase(createMiembro.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMiembro.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          // ✅ Asegurar que miembros es un array antes de modificar
          if (!Array.isArray(state.miembros)) {
            state.miembros = [];
          }
          state.miembros.unshift(action.payload.data);
        }
      })
      .addCase(createMiembro.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Miembro
      .addCase(updateMiembro.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMiembro.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          // ✅ Asegurar que miembros es un array antes de modificar
          if (Array.isArray(state.miembros)) {
            const index = state.miembros.findIndex(m => m.id === action.payload.data.id);
            if (index !== -1) {
              state.miembros[index] = action.payload.data;
            }
          }
          
          if (state.selectedMiembro?.id === action.payload.data.id) {
            state.selectedMiembro = action.payload.data;
          }
        }
      })
      .addCase(updateMiembro.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Miembro
      .addCase(deleteMiembro.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMiembro.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ Asegurar que miembros es un array antes de filtrar
        if (Array.isArray(state.miembros)) {
          state.miembros = state.miembros.filter(m => m.id !== action.payload);
        }
        
        if (state.selectedMiembro?.id === action.payload) {
          state.selectedMiembro = null;
        }
      })
      .addCase(deleteMiembro.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  clearFilters, 
  setSelectedMiembro,
  resetMiembrosState 
} = miembrosSlice.actions;

export default miembrosSlice.reducer;

// ✅ Selectores memoizados y seguros
export const selectMiembros = createSelector(
  [(state) => state.miembros?.miembros],
  (miembros) => Array.isArray(miembros) ? miembros : []
);

export const selectSelectedMiembro = (state) => state.miembros?.selectedMiembro || null;
export const selectMiembrosLoading = (state) => state.miembros?.loading || false;
export const selectMiembrosError = (state) => state.miembros?.error || null;

export const selectMiembrosPagination = createSelector(
  [(state) => state.miembros?.pagination],
  (pagination) => pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
);

export const selectMiembrosFilters = createSelector(
  [(state) => state.miembros?.filters],
  (filters) => filters || { search: '', grado: null, vigente: null }
);

// ✅ Selector para estadísticas seguras
export const selectMiembrosStats = createSelector(
  [selectMiembros],
  (miembros) => {
    if (!Array.isArray(miembros)) {
      return {
        total: 0,
        activos: 0,
        porGrado: { aprendiz: 0, companero: 0, maestro: 0 }
      };
    }

    const total = miembros.length;
    const activos = miembros.filter(m => m && m.vigente).length;
    
    const porGrado = miembros.reduce((acc, miembro) => {
      if (miembro && miembro.grado) {
        acc[miembro.grado] = (acc[miembro.grado] || 0) + 1;
      }
      return acc;
    }, { aprendiz: 0, companero: 0, maestro: 0 });

    return {
      total,
      activos,
      porGrado
    };
  }
);