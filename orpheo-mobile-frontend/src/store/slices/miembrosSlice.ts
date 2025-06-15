import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Miembro, MiembrosState, MiembrosFilters, MiembroFormData, ApiResponse, Pagination } from '@/types';
import { miembrosService } from '../../services/miembros.service';

// Estado inicial
const initialState: MiembrosState = {
  miembros: [],
  currentMiembro: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    grado: '',
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

// Thunks asíncronos
export const fetchMiembros = createAsyncThunk(
  'miembros/fetchMiembros',
  async (params: { page?: number; limit?: number; filters?: Partial<MiembrosFilters> } = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const response = await miembrosService.getMiembros({
        page: params.page || 1,
        limit: params.limit || 20,
        ...params.filters,
      }, state.auth.token);

      return response;
    } catch (error: any) {
      console.error('Fetch miembros error:', error);
      return rejectWithValue(error.message || 'Error al cargar miembros');
    }
  }
);

export const fetchMiembroById = createAsyncThunk(
  'miembros/fetchMiembroById',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const miembro = await miembrosService.getMiembroById(id, state.auth.token);
      return miembro;
    } catch (error: any) {
      console.error('Fetch miembro error:', error);
      return rejectWithValue(error.message || 'Error al cargar miembro');
    }
  }
);

export const createMiembro = createAsyncThunk(
  'miembros/createMiembro',
  async (miembroData: MiembroFormData, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const newMiembro = await miembrosService.createMiembro(miembroData, state.auth.token);
      return newMiembro;
    } catch (error: any) {
      console.error('Create miembro error:', error);
      return rejectWithValue(error.message || 'Error al crear miembro');
    }
  }
);

export const updateMiembro = createAsyncThunk(
  'miembros/updateMiembro',
  async ({ id, data }: { id: string; data: Partial<MiembroFormData> }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const updatedMiembro = await miembrosService.updateMiembro(id, data, state.auth.token);
      return updatedMiembro;
    } catch (error: any) {
      console.error('Update miembro error:', error);
      return rejectWithValue(error.message || 'Error al actualizar miembro');
    }
  }
);

export const deleteMiembro = createAsyncThunk(
  'miembros/deleteMiembro',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      await miembrosService.deleteMiembro(id, state.auth.token);
      return id;
    } catch (error: any) {
      console.error('Delete miembro error:', error);
      return rejectWithValue(error.message || 'Error al eliminar miembro');
    }
  }
);

export const fetchMiembrosStats = createAsyncThunk(
  'miembros/fetchMiembrosStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const stats = await miembrosService.getMiembrosStats(state.auth.token);
      return stats;
    } catch (error: any) {
      console.error('Fetch miembros stats error:', error);
      return rejectWithValue(error.message || 'Error al cargar estadísticas');
    }
  }
);

export const searchMiembros = createAsyncThunk(
  'miembros/searchMiembros',
  async (query: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const results = await miembrosService.searchMiembros(query, state.auth.token);
      return results;
    } catch (error: any) {
      console.error('Search miembros error:', error);
      return rejectWithValue(error.message || 'Error en la búsqueda');
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
    
    setCurrentMiembro: (state, action: PayloadAction<Miembro | null>) => {
      state.currentMiembro = action.payload;
    },
    
    setFilters: (state, action: PayloadAction<Partial<MiembrosFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    setPagination: (state, action: PayloadAction<Partial<Pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Optimistic updates para mejor UX
    optimisticUpdateMiembro: (state, action: PayloadAction<Miembro>) => {
      const index = state.miembros.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.miembros[index] = action.payload;
      }
      if (state.currentMiembro?.id === action.payload.id) {
        state.currentMiembro = action.payload;
      }
    },
    
    optimisticDeleteMiembro: (state, action: PayloadAction<string>) => {
      state.miembros = state.miembros.filter(m => m.id !== action.payload);
      if (state.currentMiembro?.id === action.payload) {
        state.currentMiembro = null;
      }
    },
    
    // Reset state
    resetMiembrosState: (state) => {
      return initialState;
    },
    
    // Actualizar miembro específico desde otras pantallas
    updateMiembroInList: (state, action: PayloadAction<Miembro>) => {
      const index = state.miembros.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.miembros[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Miembros
    builder
      .addCase(fetchMiembros.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        // Si es primera página, limpiar lista actual
        if (action.meta.arg?.page === 1) {
          state.miembros = [];
        }
      })
      .addCase(fetchMiembros.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, pagination } = action.payload;
        
        // Si es primera página, reemplazar. Si no, concatenar (infinite scroll)
        if (pagination.page === 1) {
          state.miembros = data;
        } else {
          state.miembros = [...state.miembros, ...data];
        }
        
        state.pagination = pagination;
      })
      .addCase(fetchMiembros.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Miembro by ID
    builder
      .addCase(fetchMiembroById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMiembroById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMiembro = action.payload;
      })
      .addCase(fetchMiembroById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.currentMiembro = null;
      });

    // Create Miembro
    builder
      .addCase(createMiembro.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMiembro.fulfilled, (state, action) => {
        state.isLoading = false;
        // Agregar al inicio de la lista
        state.miembros.unshift(action.payload);
        // Actualizar stats
        state.stats.total += 1;
        const grado = action.payload.grado as keyof typeof state.stats.porGrado;
        if (state.stats.porGrado[grado] !== undefined) {
          state.stats.porGrado[grado] += 1;
        }
      })
      .addCase(createMiembro.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Miembro
    builder
      .addCase(updateMiembro.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMiembro.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.miembros.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.miembros[index] = action.payload;
        }
        if (state.currentMiembro?.id === action.payload.id) {
          state.currentMiembro = action.payload;
        }
      })
      .addCase(updateMiembro.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Miembro
    builder
      .addCase(deleteMiembro.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMiembro.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload;
        const deletedMiembro = state.miembros.find(m => m.id === deletedId);
        
        // Remover de la lista
        state.miembros = state.miembros.filter(m => m.id !== deletedId);
        
        // Actualizar stats
        if (deletedMiembro) {
          state.stats.total = Math.max(0, state.stats.total - 1);
          const grado = deletedMiembro.grado as keyof typeof state.stats.porGrado;
          if (state.stats.porGrado[grado] !== undefined) {
            state.stats.porGrado[grado] = Math.max(0, state.stats.porGrado[grado] - 1);
          }
        }
        
        // Limpiar current si es el mismo
        if (state.currentMiembro?.id === deletedId) {
          state.currentMiembro = null;
        }
      })
      .addCase(deleteMiembro.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Stats
    builder
      .addCase(fetchMiembrosStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchMiembrosStats.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Search Miembros
    builder
      .addCase(searchMiembros.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchMiembros.fulfilled, (state, action) => {
        state.isLoading = false;
        state.miembros = action.payload;
        // Reset pagination para búsquedas
        state.pagination = {
          page: 1,
          limit: action.payload.length,
          total: action.payload.length,
          totalPages: 1,
        };
      })
      .addCase(searchMiembros.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentMiembro,
  setFilters,
  clearFilters,
  setPagination,
  optimisticUpdateMiembro,
  optimisticDeleteMiembro,
  resetMiembrosState,
  updateMiembroInList,
} = miembrosSlice.actions;

export default miembrosSlice.reducer;