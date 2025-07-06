import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import programasService from '../../services/programasService';

// Thunks asíncronos
export const getProgramas = createAsyncThunk(
  'programas/getProgramas',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await programasService.getProgramas(params);
      if (!response || !response.data) {
        throw new Error('Respuesta inválida del servidor');
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al obtener programas'
      );
    }
  }
);

export const getProgramaById = createAsyncThunk(
  'programas/getProgramaById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await programasService.getProgramaById(id);
      if (!response || !response.data) {
        throw new Error('Programa no encontrado');
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al obtener programa'
      );
    }
  }
);

export const createPrograma = createAsyncThunk(
  'programas/createPrograma',
  async (programaData, { rejectWithValue }) => {
    try {
      const response = await programasService.createPrograma(programaData);
      if (!response || !response.data) {
        throw new Error('Error al crear programa');
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al crear programa'
      );
    }
  }
);

export const updatePrograma = createAsyncThunk(
  'programas/updatePrograma',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await programasService.updatePrograma(id, data);
      if (!response || !response.data) {
        throw new Error('Error al actualizar programa');
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al actualizar programa'
      );
    }
  }
);

export const deletePrograma = createAsyncThunk(
  'programas/deletePrograma',
  async (id, { rejectWithValue }) => {
    try {
      await programasService.deletePrograma(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al eliminar programa'
      );
    }
  }
);

export const gestionarAsistencia = createAsyncThunk(
  'programas/gestionarAsistencia',
  async ({ programaId, asistenciaData }, { rejectWithValue }) => {
    try {
      const response = await programasService.gestionarAsistencia(programaId, asistenciaData);
      if (!response || !response.data) {
        throw new Error('Error al gestionar asistencia');
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al gestionar asistencia'
      );
    }
  }
);

export const getEstadisticas = createAsyncThunk(
  'programas/getEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await programasService.getEstadisticas();
      if (!response || !response.data) {
        throw new Error('Error al obtener estadísticas');
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al obtener estadísticas'
      );
    }
  }
);

const programasSlice = createSlice({
  name: 'programas',
  initialState: {
    programas: [],
    selectedPrograma: null,
    asistencias: [],
    estadisticas: null,
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
      tipo: null,
      estado: null,
      fecha_desde: null,
      fecha_hasta: null,
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
        tipo: null,
        estado: null,
        fecha_desde: null,
        fecha_hasta: null,
      };
    },
    setSelectedPrograma: (state, action) => {
      state.selectedPrograma = action.payload;
    },
    resetProgramasState: (state) => {
      state.programas = [];
      state.selectedPrograma = null;
      state.asistencias = [];
      state.error = null;
      state.loading = false;
    },
    // Actualizar asistencia en tiempo real
    updateAsistenciaInState: (state, action) => {
      const { programaId, asistenciaData } = action.payload;
      
      // Actualizar en el programa seleccionado
      if (state.selectedPrograma?.id === programaId) {
        const asistenciaIndex = state.selectedPrograma.asistencias?.findIndex(
          a => a.miembro.id === asistenciaData.miembroId
        );
        
        if (asistenciaIndex !== -1) {
          state.selectedPrograma.asistencias[asistenciaIndex] = {
            ...state.selectedPrograma.asistencias[asistenciaIndex],
            ...asistenciaData
          };
        } else {
          // Agregar nueva asistencia
          state.selectedPrograma.asistencias = state.selectedPrograma.asistencias || [];
          state.selectedPrograma.asistencias.push(asistenciaData);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Programas
      .addCase(getProgramas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProgramas.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action.payload && action.payload.data && Array.isArray(action.payload.data)) {
          state.programas = action.payload.data;
          state.pagination = action.payload.pagination || state.pagination;
        } else {
          state.programas = [];
          state.pagination = {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          };
        }
      })
      .addCase(getProgramas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (!Array.isArray(state.programas)) {
          state.programas = [];
        }
      })
      
      // Get Programa By ID
      .addCase(getProgramaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProgramaById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          state.selectedPrograma = action.payload.data;
          state.asistencias = action.payload.data.asistencias || [];
        }
      })
      .addCase(getProgramaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedPrograma = null;
      })
      
      // Create Programa
      .addCase(createPrograma.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPrograma.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          if (!Array.isArray(state.programas)) {
            state.programas = [];
          }
          state.programas.unshift(action.payload.data);
        }
      })
      .addCase(createPrograma.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Programa
      .addCase(updatePrograma.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePrograma.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          if (Array.isArray(state.programas)) {
            const index = state.programas.findIndex(p => p.id === action.payload.data.id);
            if (index !== -1) {
              state.programas[index] = action.payload.data;
            }
          }
          
          if (state.selectedPrograma?.id === action.payload.data.id) {
            state.selectedPrograma = { ...state.selectedPrograma, ...action.payload.data };
          }
        }
      })
      .addCase(updatePrograma.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Programa
      .addCase(deletePrograma.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePrograma.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(state.programas)) {
          state.programas = state.programas.filter(p => p.id !== action.payload);
        }
        
        if (state.selectedPrograma?.id === action.payload) {
          state.selectedPrograma = null;
        }
      })
      .addCase(deletePrograma.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Gestionar Asistencia
      .addCase(gestionarAsistencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(gestionarAsistencia.fulfilled, (state, action) => {
        state.loading = false;
        // La asistencia se actualiza en tiempo real mediante updateAsistenciaInState
      })
      .addCase(gestionarAsistencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Estadísticas
      .addCase(getEstadisticas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEstadisticas.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          state.estadisticas = action.payload.data;
        }
      })
      .addCase(getEstadisticas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  clearFilters, 
  setSelectedPrograma,
  resetProgramasState,
  updateAsistenciaInState
} = programasSlice.actions;

export default programasSlice.reducer;

// Selectores seguros
export const selectProgramas = createSelector(
  [(state) => state.programas?.programas],
  (programas) => Array.isArray(programas) ? programas : []
);

export const selectSelectedPrograma = (state) => state.programas?.selectedPrograma || null;
export const selectProgramasLoading = (state) => state.programas?.loading || false;
export const selectProgramasError = (state) => state.programas?.error || null;
export const selectAsistencias = (state) => state.programas?.asistencias || [];
export const selectEstadisticas = (state) => state.programas?.estadisticas || null;

export const selectProgramasPagination = createSelector(
  [(state) => state.programas?.pagination],
  (pagination) => pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
);

export const selectProgramasFilters = createSelector(
  [(state) => state.programas?.filters],
  (filters) => filters || { search: '', grado: null, tipo: null, estado: null, fecha_desde: null, fecha_hasta: null }
);

// Selectores derivados
export const selectProgramasProximos = createSelector(
  [selectProgramas],
  (programas) => {
    const now = new Date();
    return programas.filter(programa => {
      const fechaPrograma = new Date(programa.fecha);
      return fechaPrograma > now && programa.estado !== 'cancelado';
    }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }
);

export const selectProgramasPorTipo = createSelector(
  [selectProgramas],
  (programas) => {
    return programas.reduce((acc, programa) => {
      if (programa && programa.tipo) {
        acc[programa.tipo] = (acc[programa.tipo] || 0) + 1;
      }
      return acc;
    }, {});
  }
);

export const selectProgramasPorGrado = createSelector(
  [selectProgramas],
  (programas) => {
    return programas.reduce((acc, programa) => {
      if (programa && programa.grado) {
        acc[programa.grado] = (acc[programa.grado] || 0) + 1;
      }
      return acc;
    }, { aprendiz: 0, companero: 0, maestro: 0, general: 0 });
  }
);

export const selectProgramasStats = createSelector(
  [selectProgramas, selectProgramasProximos, selectProgramasPorTipo],
  (programas, proximos, porTipo) => {
    const now = new Date();
    const completados = programas.filter(p => p.estado === 'completado').length;
    const cancelados = programas.filter(p => p.estado === 'cancelado').length;
    const enCurso = programas.filter(p => {
      const fechaPrograma = new Date(p.fecha);
      return fechaPrograma <= now && p.estado === 'programado';
    }).length;

    return {
      total: programas.length,
      proximos: proximos.length,
      completados,
      cancelados,
      enCurso,
      porTipo
    };
  }
);