import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import miembrosService from '../../services/miembrosService';

// Thunks asíncronos
export const getMiembros = createAsyncThunk(
  'miembros/getMiembros',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await miembrosService.getMiembros(params);
      return response.data; // Tu backend devuelve { success: true, data: [], pagination: {} }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener miembros'
      );
    }
  }
);

export const getMiembroById = createAsyncThunk(
  'miembros/getMiembroById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await miembrosService.getMiembroById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener miembro'
      );
    }
  }
);

export const createMiembro = createAsyncThunk(
  'miembros/createMiembro',
  async (miembroData, { rejectWithValue }) => {
    try {
      const response = await miembrosService.createMiembro(miembroData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al crear miembro'
      );
    }
  }
);

export const updateMiembro = createAsyncThunk(
  'miembros/updateMiembro',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await miembrosService.updateMiembro(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al actualizar miembro'
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
        error.response?.data?.message || 'Error al eliminar miembro'
      );
    }
  }
);

const miembrosSlice = createSlice({
  name: 'miembros',
  initialState: {
    miembros: [],
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
        state.miembros = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMiembros.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Miembro By ID
      .addCase(getMiembroById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMiembroById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMiembro = action.payload.data;
      })
      .addCase(getMiembroById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Miembro
      .addCase(createMiembro.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMiembro.fulfilled, (state, action) => {
        state.loading = false;
        state.miembros.unshift(action.payload.data);
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
        const index = state.miembros.findIndex(m => m.id === action.payload.data.id);
        if (index !== -1) {
          state.miembros[index] = action.payload.data;
        }
        if (state.selectedMiembro?.id === action.payload.data.id) {
          state.selectedMiembro = action.payload.data;
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
        state.miembros = state.miembros.filter(m => m.id !== action.payload);
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

export const { clearError, setFilters, clearFilters, setSelectedMiembro } = miembrosSlice.actions;
export default miembrosSlice.reducer;

// Selectores
export const selectMiembros = (state) => state.miembros.miembros;
export const selectSelectedMiembro = (state) => state.miembros.selectedMiembro;
export const selectMiembrosLoading = (state) => state.miembros.loading;
export const selectMiembrosError = (state) => state.miembros.error;
export const selectMiembrosPagination = (state) => state.miembros.pagination;
export const selectMiembrosFilters = (state) => state.miembros.filters;