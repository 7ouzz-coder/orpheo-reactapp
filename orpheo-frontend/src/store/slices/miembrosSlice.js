import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { miembrosService } from '../../services/miembros.service';

// Estado inicial
const initialState = {
  miembros: [],
  currentMiembro: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    grado: 'todos',
    vigente: true,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  stats: {
    total: 0,
    porGrado: {
      aprendiz: 0,
      companero: 0,
      maestro: 0,
    },
    conEmail: 0,
    conTelefono: 0,
  },
};

// Async thunks
export const fetchMiembros = createAsyncThunk(
  'miembros/fetchMiembros',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const { miembros } = getState();
      const queryParams = {
        ...miembros.filters,
        ...miembros.pagination,
        ...params,
      };
      
      const response = await miembrosService.getMiembros(queryParams);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar miembros');
    }
  }
);

export const fetchMiembroById = createAsyncThunk(
  'miembros/fetchMiembroById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await miembrosService.getMiembroById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar miembro');
    }
  }
);

export const createMiembro = createAsyncThunk(
  'miembros/createMiembro',
  async (miembroData, { rejectWithValue, dispatch }) => {
    try {
      const response = await miembrosService.createMiembro(miembroData);
      // Refrescar lista después de crear
      dispatch(fetchMiembros());
      dispatch(fetchEstadisticas());
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear miembro');
    }
  }
);

export const updateMiembro = createAsyncThunk(
  'miembros/updateMiembro',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await miembrosService.updateMiembro(id, data);
      // Refrescar lista después de actualizar
      dispatch(fetchMiembros());
      dispatch(fetchEstadisticas());
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar miembro');
    }
  }
);

export const deleteMiembro = createAsyncThunk(
  'miembros/deleteMiembro',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await miembrosService.deleteMiembro(id);
      // Refrescar lista después de eliminar
      dispatch(fetchMiembros());
      dispatch(fetchEstadisticas());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar miembro');
    }
  }
);

export const fetchEstadisticas = createAsyncThunk(
  'miembros/fetchEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await miembrosService.getEstadisticas();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar estadísticas');
    }
  }
);

export const importarMiembros = createAsyncThunk(
  'miembros/importarMiembros',
  async (miembrosData, { rejectWithValue, dispatch }) => {
    try {
      const response = await miembrosService.importarMiembros(miembrosData);
      // Refrescar lista después de importar
      dispatch(fetchMiembros());
      dispatch(fetchEstadisticas());
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al importar miembros');
    }
  }
);

// Slice
const miembrosSlice = createSlice({
  name: 'miembros',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset page cuando cambian filtros
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearCurrentMiembro: (state) => {
      state.currentMiembro = null;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch miembros
      .addCase(fetchMiembros.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMiembros.fulfilled, (state, action) => {
        state.isLoading = false;
        state.miembros = action.payload.data;
        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination,
        };
        state.error = null;
      })
      .addCase(fetchMiembros.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch miembro by ID
      .addCase(fetchMiembroById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMiembroById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMiembro = action.payload.data;
        state.error = null;
      })
      .addCase(fetchMiembroById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create miembro
      .addCase(createMiembro.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMiembro.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(createMiembro.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update miembro
      .addCase(updateMiembro.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMiembro.fulfilled, (state, action) => {
        state.isLoading = false;
        // Actualizar en la lista local
        const index = state.miembros.findIndex(m => m.id === action.payload.data.id);
        if (index !== -1) {
          state.miembros[index] = { ...state.miembros[index], ...action.payload.data };
        }
        // Actualizar miembro actual si es el mismo
        if (state.currentMiembro?.id === action.payload.data.id) {
          state.currentMiembro = { ...state.currentMiembro, ...action.payload.data };
        }
        state.error = null;
      })
      .addCase(updateMiembro.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete miembro
      .addCase(deleteMiembro.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMiembro.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remover de la lista local
        state.miembros = state.miembros.filter(m => m.id !== action.payload);
        // Limpiar miembro actual si es el mismo
        if (state.currentMiembro?.id === action.payload) {
          state.currentMiembro = null;
        }
        state.error = null;
      })
      .addCase(deleteMiembro.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch estadísticas
      .addCase(fetchEstadisticas.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      })
      
      // Importar miembros
      .addCase(importarMiembros.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(importarMiembros.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(importarMiembros.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setFilters,
  setPagination,
  clearCurrentMiembro,
  resetFilters,
} = miembrosSlice.actions;

export default miembrosSlice.reducer;

// Selectores
export const selectMiembros = (state) => state.miembros.miembros;
export const selectCurrentMiembro = (state) => state.miembros.currentMiembro;
export const selectMiembrosLoading = (state) => state.miembros.isLoading;
export const selectMiembrosError = (state) => state.miembros.error;
export const selectMiembrosFilters = (state) => state.miembros.filters;
export const selectMiembrosPagination = (state) => state.miembros.pagination;
export const selectMiembrosStats = (state) => state.miembros.stats;