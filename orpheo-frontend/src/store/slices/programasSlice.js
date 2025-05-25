import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock service para programas (reemplazar por API real)
const mockProgramasService = {
  async getProgramas(params = {}) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockProgramas = [
      {
        id: 1,
        titulo: 'Tenida Ordinaria Mayo 2025',
        tipo: 'tenida_ordinaria',
        descripcion: 'Tenida ordinaria mensual con orden del día completo',
        fechaInicio: '2025-05-25T19:30:00Z',
        fechaFin: '2025-05-25T22:00:00Z',
        lugar: 'Templo Masónico - Sala Principal',
        estado: 'programado',
        organizador: 'Venerable Maestro',
        organizadorId: 1,
        gradosPermitidos: ['aprendiz', 'companero', 'maestro'],
        maxAsistentes: 50,
        asistenciasConfirmadas: 42,
        asistenciasPendientes: 8,
        requiereConfirmacion: true,
        recordatorioEnviado: false,
        ordenDelDia: [
          'Apertura de los trabajos',
          'Lectura del acta anterior',
          'Correspondencia',
          'Plancha del H∴ Juan Pérez',
          'Asuntos varios',
          'Clausura de los trabajos'
        ],
        asistencias: [
          {
            miembroId: 2,
            miembro: 'Juan Pérez',
            grado: 'maestro',
            estado: 'confirmada',
            fechaConfirmacion: '2025-05-20T10:00:00Z',
            horaLlegada: null,
          },
          {
            miembroId: 3,
            miembro: 'Pedro Martínez',
            grado: 'companero',
            estado: 'pendiente',
            fechaConfirmacion: null,
            horaLlegada: null,
          },
        ],
        createdAt: '2025-05-15T09:00:00Z',
        updatedAt: '2025-05-20T14:30:00Z',
      },
      {
        id: 2,
        titulo: 'Ceremonia de Iniciación - Luis González',
        tipo: 'grado',
        descripcion: 'Ceremonia de iniciación de Luis González como Aprendiz Masón',
        fechaInicio: '2025-05-30T20:00:00Z',
        fechaFin: '2025-05-30T23:00:00Z',
        lugar: 'Templo Masónico - Cámara de Reflexión',
        estado: 'programado',
        organizador: 'Primer Vigilante',
        organizadorId: 2,
        gradosPermitidos: ['maestro'],
        maxAsistentes: 25,
        asistenciasConfirmadas: 18,
        asistenciasPendientes: 7,
        requiereConfirmacion: true,
        recordatorioEnviado: true,
        candidato: {
          nombre: 'Luis González Torres',
          edad: 35,
          profesion: 'Ingeniero Civil',
          padrino: 'Juan Pérez',
        },
        asistencias: [],
        createdAt: '2025-05-10T16:00:00Z',
        updatedAt: '2025-05-22T11:00:00Z',
      },
      {
        id: 3,
        titulo: 'Conferencia: La Geometría Sagrada',
        tipo: 'conferencia',
        descripcion: 'Conferencia magistral sobre la geometría sagrada en la arquitectura masónica',
        fechaInicio: '2025-06-05T19:00:00Z',
        fechaFin: '2025-06-05T21:30:00Z',
        lugar: 'Salón de Conferencias',
        estado: 'programado',
        organizador: 'Orador',
        organizadorId: 3,
        gradosPermitidos: ['aprendiz', 'companero', 'maestro'],
        maxAsistentes: 60,
        asistenciasConfirmadas: 35,
        asistenciasPendientes: 25,
        requiereConfirmacion: true,
        recordatorioEnviado: false,
        conferencista: {
          nombre: 'Dr. María Elena Vásquez',
          titulo: 'Doctora en Arquitectura',
          biografia: 'Especialista en geometría sagrada y simbolismo arquitectónico',
        },
        asistencias: [],
        createdAt: '2025-05-18T13:00:00Z',
        updatedAt: '2025-05-18T13:00:00Z',
      },
      {
        id: 4,
        titulo: 'Reunión Administrativa Junio',
        tipo: 'reunion_administrativa',
        descripcion: 'Reunión mensual del cuerpo de oficiales para asuntos administrativos',
        fechaInicio: '2025-06-08T10:00:00Z',
        fechaFin: '2025-06-08T12:00:00Z',
        lugar: 'Sala de Reuniones',
        estado: 'programado',
        organizador: 'Secretario',
        organizadorId: 4,
        gradosPermitidos: ['maestro'],
        maxAsistentes: 15,
        asistenciasConfirmadas: 12,
        asistenciasPendientes: 3,
        requiereConfirmacion: true,
        recordatorioEnviado: false,
        agenda: [
          'Revisión de cuentas mensuales',
          'Planificación de actividades',
          'Propuestas de nuevos candidatos',
          'Mantenimiento del templo',
        ],
        asistencias: [],
        createdAt: '2025-05-22T08:00:00Z',
        updatedAt: '2025-05-22T08:00:00Z',
      },
    ];

    // Aplicar filtros
    let filteredProgramas = mockProgramas;
    
    if (params.tipo && params.tipo !== 'todos') {
      filteredProgramas = filteredProgramas.filter(p => p.tipo === params.tipo);
    }
    
    if (params.estado && params.estado !== 'todos') {
      filteredProgramas = filteredProgramas.filter(p => p.estado === params.estado);
    }
    
    if (params.mes && params.año) {
      filteredProgramas = filteredProgramas.filter(p => {
        const fecha = new Date(p.fechaInicio);
        return fecha.getMonth() === parseInt(params.mes) - 1 && fecha.getFullYear() === parseInt(params.año);
      });
    }

    return {
      success: true,
      data: filteredProgramas,
      pagination: {
        page: params.page || 1,
        limit: params.limit || 20,
        total: filteredProgramas.length,
        totalPages: Math.ceil(filteredProgramas.length / (params.limit || 20)),
      },
    };
  },

  async getProgramaById(id) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const programa = {
      id: parseInt(id),
      titulo: 'Tenida Ordinaria Mayo 2025',
      tipo: 'tenida_ordinaria',
      descripcion: 'Tenida ordinaria mensual con orden del día completo',
      fechaInicio: '2025-05-25T19:30:00Z',
      fechaFin: '2025-05-25T22:00:00Z',
      lugar: 'Templo Masónico - Sala Principal',
      estado: 'programado',
      organizador: 'Venerable Maestro',
      organizadorId: 1,
      gradosPermitidos: ['aprendiz', 'companero', 'maestro'],
      maxAsistentes: 50,
      asistenciasConfirmadas: 42,
      asistenciasPendientes: 8,
      requiereConfirmacion: true,
      recordatorioEnviado: false,
      ordenDelDia: [
        'Apertura de los trabajos',
        'Lectura del acta anterior',
        'Correspondencia',
        'Plancha del H∴ Juan Pérez',
        'Asuntos varios',
        'Clausura de los trabajos'
      ],
      asistencias: [
        {
          id: 1,
          miembroId: 2,
          miembro: 'Juan Pérez',
          grado: 'maestro',
          cargo: 'primer_vigilante',
          estado: 'confirmada',
          fechaConfirmacion: '2025-05-20T10:00:00Z',
          horaLlegada: null,
          observaciones: '',
        },
        {
          id: 2,
          miembroId: 3,
          miembro: 'Pedro Martínez',
          grado: 'companero',
          cargo: null,
          estado: 'pendiente',
          fechaConfirmacion: null,
          horaLlegada: null,
          observaciones: '',
        },
        {
          id: 3,
          miembroId: 4,
          miembro: 'Ana López',
          grado: 'maestro',
          cargo: 'secretario',
          estado: 'confirmada',
          fechaConfirmacion: '2025-05-21T15:30:00Z',
          horaLlegada: null,
          observaciones: '',
        },
      ],
      createdAt: '2025-05-15T09:00:00Z',
      updatedAt: '2025-05-20T14:30:00Z',
    };

    return { success: true, data: programa };
  },

  async crearPrograma(programaData) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const nuevoPrograma = {
      id: Date.now(),
      ...programaData,
      estado: 'programado',
      asistenciasConfirmadas: 0,
      asistenciasPendientes: 0,
      recordatorioEnviado: false,
      asistencias: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { success: true, data: nuevoPrograma };
  },

  async confirmarAsistencia(programaId, miembroId, estado) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      data: {
        programaId,
        miembroId,
        estado,
        fechaConfirmacion: new Date().toISOString(),
      }
    };
  },

  async marcarAsistencia(programaId, miembroId, horaLlegada) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        programaId,
        miembroId,
        horaLlegada,
        estado: 'presente',
      }
    };
  },

  async getEstadisticas() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: {
        totalProgramas: 24,
        porTipo: {
          tenida_ordinaria: 12,
          tenida_extraordinaria: 3,
          grado: 4,
          reunion_administrativa: 3,
          conferencia: 2,
        },
        porEstado: {
          programado: 18,
          en_curso: 1,
          finalizado: 4,
          cancelado: 1,
        },
        asistenciaPromedio: 87.5,
        proximosEventos: 6,
        miembrosActivos: 156,
      },
    };
  },
};

// Estado inicial
const initialState = {
  programas: [],
  currentPrograma: null,
  isLoading: false,
  error: null,
  filters: {
    tipo: 'todos',
    estado: 'todos',
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
  vistaCalendario: 'mes', // 'mes', 'semana', 'dia'
  fechaSeleccionada: new Date().toISOString(),
  isCreating: false,
  isUpdatingAsistencia: false,
};

// Async thunks
export const fetchProgramas = createAsyncThunk(
  'programas/fetchProgramas',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const { programas } = getState();
      const queryParams = {
        ...programas.filters,
        ...programas.pagination,
        ...params,
      };
      
      const response = await mockProgramasService.getProgramas(queryParams);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al cargar programas');
    }
  }
);

export const fetchProgramaById = createAsyncThunk(
  'programas/fetchProgramaById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await mockProgramasService.getProgramaById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al cargar programa');
    }
  }
);

export const crearPrograma = createAsyncThunk(
  'programas/crearPrograma',
  async (programaData, { rejectWithValue, dispatch }) => {
    try {
      const response = await mockProgramasService.crearPrograma(programaData);
      
      // Refrescar lista después de crear
      dispatch(fetchProgramas());
      dispatch(fetchEstadisticas());
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al crear programa');
    }
  }
);

export const confirmarAsistencia = createAsyncThunk(
  'programas/confirmarAsistencia',
  async ({ programaId, miembroId, estado }, { rejectWithValue, dispatch }) => {
    try {
      const response = await mockProgramasService.confirmarAsistencia(programaId, miembroId, estado);
      
      // Refrescar programa actual
      dispatch(fetchProgramaById(programaId));
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al confirmar asistencia');
    }
  }
);

export const marcarAsistencia = createAsyncThunk(
  'programas/marcarAsistencia',
  async ({ programaId, miembroId, horaLlegada }, { rejectWithValue, dispatch }) => {
    try {
      const response = await mockProgramasService.marcarAsistencia(programaId, miembroId, horaLlegada);
      
      // Refrescar programa actual
      dispatch(fetchProgramaById(programaId));
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al marcar asistencia');
    }
  }
);

export const fetchEstadisticas = createAsyncThunk(
  'programas/fetchEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mockProgramasService.getEstadisticas();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al cargar estadísticas');
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
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    clearCurrentPrograma: (state) => {
      state.currentPrograma = null;
    },
    
    setVistaCalendario: (state, action) => {
      state.vistaCalendario = action.payload;
    },
    
    setFechaSeleccionada: (state, action) => {
      state.fechaSeleccionada = action.payload;
    },
    
    resetFilters: (state) => {
      state.filters = {
        tipo: 'todos',
        estado: 'todos',
        mes: new Date().getMonth() + 1,
        año: new Date().getFullYear(),
      };
      state.pagination.page = 1;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch programas
      .addCase(fetchProgramas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProgramas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.programas = action.payload.data;
        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination,
        };
        state.error = null;
      })
      .addCase(fetchProgramas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch programa by ID
      .addCase(fetchProgramaById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProgramaById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPrograma = action.payload.data;
        state.error = null;
      })
      .addCase(fetchProgramaById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Crear programa
      .addCase(crearPrograma.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(crearPrograma.fulfilled, (state) => {
        state.isCreating = false;
        state.error = null;
      })
      .addCase(crearPrograma.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Confirmar asistencia
      .addCase(confirmarAsistencia.pending, (state) => {
        state.isUpdatingAsistencia = true;
        state.error = null;
      })
      .addCase(confirmarAsistencia.fulfilled, (state) => {
        state.isUpdatingAsistencia = false;
        state.error = null;
      })
      .addCase(confirmarAsistencia.rejected, (state, action) => {
        state.isUpdatingAsistencia = false;
        state.error = action.payload;
      })
      
      // Marcar asistencia
      .addCase(marcarAsistencia.pending, (state) => {
        state.isUpdatingAsistencia = true;
        state.error = null;
      })
      .addCase(marcarAsistencia.fulfilled, (state) => {
        state.isUpdatingAsistencia = false;
        state.error = null;
      })
      .addCase(marcarAsistencia.rejected, (state, action) => {
        state.isUpdatingAsistencia = false;
        state.error = action.payload;
      })
      
      // Fetch estadísticas
      .addCase(fetchEstadisticas.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      });
  },
});

export const {
  clearError,
  setFilters,
  setPagination,
  clearCurrentPrograma,
  setVistaCalendario,
  setFechaSeleccionada,
  resetFilters,
} = programasSlice.actions;

export default programasSlice.reducer;

// Selectores
export const selectProgramas = (state) => state.programas.programas;
export const selectCurrentPrograma = (state) => state.programas.currentPrograma;
export const selectProgramasLoading = (state) => state.programas.isLoading;
export const selectProgramasError = (state) => state.programas.error;
export const selectProgramasFilters = (state) => state.programas.filters;
export const selectProgramasPagination = (state) => state.programas.pagination;
export const selectProgramasStats = (state) => state.programas.stats;
export const selectVistaCalendario = (state) => state.programas.vistaCalendario;
export const selectFechaSeleccionada = (state) => state.programas.fechaSeleccionada;
export const selectIsCreating = (state) => state.programas.isCreating;
export const selectIsUpdatingAsistencia = (state) => state.programas.isUpdatingAsistencia;