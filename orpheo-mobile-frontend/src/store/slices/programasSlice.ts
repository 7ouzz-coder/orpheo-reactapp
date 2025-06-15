import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Programa, ProgramasState, ProgramasFilters, ProgramaFormData, ProgramaDetalle, Asistencia } from '@/types';
import { programasService } from '@/services/programas.service';

// Estado inicial
const initialState: ProgramasState = {
  programas: [],
  currentPrograma: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    tipo: '',
    estado: '',
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear(),
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  stats: {
    totalProgramas: 0,
    porTipo: {},
    porEstado: {},
    asistenciaPromedio: 0,
    proximosEventos: 0,
    miembrosActivos: 0,
  },
  vistaCalendario: 'mes',
  fechaSeleccionada: new Date().toISOString().split('T')[0],
  isCreating: false,
  isUpdatingAsistencia: false,
};

// Thunks asíncronos
export const fetchProgramas = createAsyncThunk(
  'programas/fetchProgramas',
  async (params: { page?: number; limit?: number; filters?: Partial<ProgramasFilters> } = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const response = await programasService.getProgramas({
        page: params.page || 1,
        limit: params.limit || 20,
        ...params.filters,
      }, state.auth.token);

      return response;
    } catch (error: any) {
      console.error('Fetch programas error:', error);
      return rejectWithValue(error.message || 'Error al cargar programas');
    }
  }
);

export const fetchProgramaById = createAsyncThunk(
  'programas/fetchProgramaById',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const programa = await programasService.getProgramaById(id, state.auth.token);
      return programa;
    } catch (error: any) {
      console.error('Fetch programa error:', error);
      return rejectWithValue(error.message || 'Error al cargar programa');
    }
  }
);

export const createPrograma = createAsyncThunk(
  'programas/createPrograma',
  async (programaData: ProgramaFormData, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const newPrograma = await programasService.createPrograma(programaData, state.auth.token);
      return newPrograma;
    } catch (error: any) {
      console.error('Create programa error:', error);
      return rejectWithValue(error.message || 'Error al crear programa');
    }
  }
);

export const updatePrograma = createAsyncThunk(
  'programas/updatePrograma',
  async ({ id, data }: { id: string; data: Partial<ProgramaFormData> }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const updatedPrograma = await programasService.updatePrograma(id, data, state.auth.token);
      return updatedPrograma;
    } catch (error: any) {
      console.error('Update programa error:', error);
      return rejectWithValue(error.message || 'Error al actualizar programa');
    }
  }
);

export const deletePrograma = createAsyncThunk(
  'programas/deletePrograma',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      await programasService.deletePrograma(id, state.auth.token);
      return id;
    } catch (error: any) {
      console.error('Delete programa error:', error);
      return rejectWithValue(error.message || 'Error al eliminar programa');
    }
  }
);

export const confirmAsistencia = createAsyncThunk(
  'programas/confirmAsistencia',
  async ({ programaId, estado }: { programaId: string; estado: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const asistencia = await programasService.confirmAsistencia(programaId, estado, state.auth.token);
      return { programaId, asistencia };
    } catch (error: any) {
      console.error('Confirm asistencia error:', error);
      return rejectWithValue(error.message || 'Error al confirmar asistencia');
    }
  }
);

export const updateAsistencia = createAsyncThunk(
  'programas/updateAsistencia',
  async (
    { programaId, miembroId, estado, observaciones }: 
    { programaId: string; miembroId: string; estado: string; observaciones?: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const asistencia = await programasService.updateAsistencia(
        programaId,
        miembroId,
        { estado, observaciones },
        state.auth.token
      );
      
      return { programaId, asistencia };
    } catch (error: any) {
      console.error('Update asistencia error:', error);
      return rejectWithValue(error.message || 'Error al actualizar asistencia');
    }
  }
);

export const fetchProgramasStats = createAsyncThunk(
  'programas/fetchProgramasStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const stats = await programasService.getProgramasStats(state.auth.token);
      return stats;
    } catch (error: any) {
      console.error('Fetch programas stats error:', error);
      return rejectWithValue(error.message || 'Error al cargar estadísticas');
    }
  }
);

export const searchProgramas = createAsyncThunk(
  'programas/searchProgramas',
  async (query: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const results = await programasService.searchProgramas(query, state.auth.token);
      return results;
    } catch (error: any) {
      console.error('Search programas error:', error);
      return rejectWithValue(error.message || 'Error en la búsqueda');
    }
  }
);

export const fetchProgramasByDate = createAsyncThunk(
  'programas/fetchProgramasByDate',
  async (date: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const programas = await programasService.getProgramasByDate(date, state.auth.token);
      return { date, programas };
    } catch (error: any) {
      console.error('Fetch programas by date error:', error);
      return rejectWithValue(error.message || 'Error al cargar programas por fecha');
    }
  }
);

// Slice
const programasSlice = createSlice({
  name: 'programas',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    setCurrentPrograma: (state, action: PayloadAction<ProgramaDetalle | null>) => {
      state.currentPrograma = action.payload;
    },
    
    setFilters: (state, action: PayloadAction<Partial<ProgramasFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {
        ...initialState.filters,
        mes: new Date().getMonth() + 1,
        año: new Date().getFullYear(),
      };
    },
    
    setVistaCalendario: (state, action: PayloadAction<'mes' | 'semana' | 'dia'>) => {
      state.vistaCalendario = action.payload;
    },
    
    setFechaSeleccionada: (state, action: PayloadAction<string>) => {
      state.fechaSeleccionada = action.payload;
    },
    
    setIsCreating: (state, action: PayloadAction<boolean>) => {
      state.isCreating = action.payload;
    },
    
    setIsUpdatingAsistencia: (state, action: PayloadAction<boolean>) => {
      state.isUpdatingAsistencia = action.payload;
    },
    
    // Optimistic updates
    optimisticUpdatePrograma: (state, action: PayloadAction<Programa>) => {
      const index = state.programas.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.programas[index] = action.payload;
      }
      if (state.currentPrograma?.id === action.payload.id) {
        state.currentPrograma = { ...state.currentPrograma, ...action.payload };
      }
    },
    
    optimisticDeletePrograma: (state, action: PayloadAction<string>) => {
      state.programas = state.programas.filter(p => p.id !== action.payload);
      if (state.currentPrograma?.id === action.payload) {
        state.currentPrograma = null;
      }
    },
    
    optimisticUpdateAsistencia: (state, action: PayloadAction<{ programaId: string; asistencia: Asistencia }>) => {
      const { programaId, asistencia } = action.payload;
      
      // Actualizar en la lista
      const programa = state.programas.find(p => p.id === programaId);
      if (programa) {
        // Actualizar contadores básicos si necesario
        programa.asistenciasConfirmadas = programa.asistenciasConfirmadas || 0;
      }
      
      // Actualizar en el programa actual si tiene asistencias
      if (state.currentPrograma?.id === programaId && state.currentPrograma.asistencias) {
        const asistenciaIndex = state.currentPrograma.asistencias.findIndex(a => a.id === asistencia.id);
        if (asistenciaIndex !== -1) {
          state.currentPrograma.asistencias[asistenciaIndex] = asistencia;
        }
      }
    },
    
    resetProgramasState: (state) => {
      return {
        ...initialState,
        fechaSeleccionada: new Date().toISOString().split('T')[0],
        filters: {
          ...initialState.filters,
          mes: new Date().getMonth() + 1,
          año: new Date().getFullYear(),
        },
      };
    },
  },
  extraReducers: (builder) => {
    // Fetch Programas
    builder
      .addCase(fetchProgramas.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        if (action.meta.arg?.page === 1) {
          state.programas = [];
        }
      })
      .addCase(fetchProgramas.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, pagination } = action.payload;
        
        if (pagination.page === 1) {
          state.programas = data;
        } else {
          state.programas = [...state.programas, ...data];
        }
        
        state.pagination = pagination;
      })
      .addCase(fetchProgramas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Programa by ID
    builder
      .addCase(fetchProgramaById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProgramaById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPrograma = action.payload;
      })
      .addCase(fetchProgramaById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Programa
    builder
      .addCase(createPrograma.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createPrograma.fulfilled, (state, action) => {
        state.isCreating = false;
        state.programas.unshift(action.payload);
        state.stats.totalProgramas += 1;
      })
      .addCase(createPrograma.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update Programa
    builder
      .addCase(updatePrograma.fulfilled, (state, action) => {
        const index = state.programas.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.programas[index] = action.payload;
        }
        if (state.currentPrograma?.id === action.payload.id) {
          state.currentPrograma = { ...state.currentPrograma, ...action.payload };
        }
      })
      .addCase(updatePrograma.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Programa
    builder
      .addCase(deletePrograma.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.programas = state.programas.filter(p => p.id !== deletedId);
        if (state.currentPrograma?.id === deletedId) {
          state.currentPrograma = null;
        }
        state.stats.totalProgramas = Math.max(0, state.stats.totalProgramas - 1);
      })
      .addCase(deletePrograma.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Confirm/Update Asistencia
    builder
      .addCase(confirmAsistencia.pending, (state) => {
        state.isUpdatingAsistencia = true;
      })
      .addCase(confirmAsistencia.fulfilled, (state, action) => {
        state.isUpdatingAsistencia = false;
        const { programaId, asistencia } = action.payload;
        
        // Actualizar asistencia en el programa actual
        if (state.currentPrograma?.id === programaId && state.currentPrograma.asistencias) {
          const index = state.currentPrograma.asistencias.findIndex(a => a.miembroId === asistencia.miembroId);
          if (index !== -1) {
            state.currentPrograma.asistencias[index] = asistencia;
          } else {
            state.currentPrograma.asistencias.push(asistencia);
          }
        }
      })
      .addCase(confirmAsistencia.rejected, (state, action) => {
        state.isUpdatingAsistencia = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateAsistencia.pending, (state) => {
        state.isUpdatingAsistencia = true;
      })
      .addCase(updateAsistencia.fulfilled, (state, action) => {
        state.isUpdatingAsistencia = false;
        const { programaId, asistencia } = action.payload;
        
        if (state.currentPrograma?.id === programaId && state.currentPrograma.asistencias) {
          const index = state.currentPrograma.asistencias.findIndex(a => a.id === asistencia.id);
          if (index !== -1) {
            state.currentPrograma.asistencias[index] = asistencia;
          }
        }
      })
      .addCase(updateAsistencia.rejected, (state, action) => {
        state.isUpdatingAsistencia = false;
        state.error = action.payload as string;
      });

    // Stats
    builder
      .addCase(fetchProgramasStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });

    // Search
    builder
      .addCase(searchProgramas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProgramas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.programas = action.payload;
        state.pagination = {
          page: 1,
          limit: action.payload.length,
          total: action.payload.length,
          totalPages: 1,
        };
      })
      .addCase(searchProgramas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch by date
    builder
      .addCase(fetchProgramasByDate.fulfilled, (state, action) => {
        // Esto podría usarse para vista de calendario
        // Por ahora solo actualizamos los programas
        state.programas = action.payload.programas;
      });
  },
});

export const {
  clearError,
  setCurrentPrograma,
  setFilters,
  clearFilters,
  setVistaCalendario,
  setFechaSeleccionada,
  setIsCreating,
  setIsUpdatingAsistencia,
  optimisticUpdatePrograma,
  optimisticDeletePrograma,
  optimisticUpdateAsistencia,
  resetProgramasState,
} = programasSlice.actions;

export default programasSlice.reducer;