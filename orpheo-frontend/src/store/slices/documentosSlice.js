import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock service para documentos (reemplazar por API real)
const mockDocumentosService = {
  async getDocumentos(params = {}) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockDocumentos = [
      {
        id: 1,
        titulo: 'El Simbolismo del Compás',
        tipo: 'plancha',
        autor: 'Juan Pérez',
        autorId: 2,
        grado: 'maestro',
        estado: 'aprobado',
        fechaCreacion: '2025-05-20T10:00:00Z',
        fechaModificacion: '2025-05-21T14:30:00Z',
        fechaAprobacion: '2025-05-21T16:00:00Z',
        aprobadoPor: 'Venerable Maestro',
        categoria: 'simbolismo',
        tags: ['compás', 'geometría', 'simbolismo'],
        resumen: 'Análisis profundo del simbolismo del compás en la masonería',
        archivo: 'el-simbolismo-del-compas.pdf',
        tamaño: 1024000,
        versiones: 3,
        descargas: 25,
        visibilidad: ['maestro'],
        comentarios: 5,
      },
      {
        id: 2,
        titulo: 'Acta Tenida Ordinaria Mayo 2025',
        tipo: 'acta',
        autor: 'Secretario Logia',
        autorId: 3,
        grado: 'aprendiz',
        estado: 'aprobado',
        fechaCreacion: '2025-05-15T19:00:00Z',
        fechaModificacion: '2025-05-15T19:00:00Z',
        fechaAprobacion: '2025-05-16T10:00:00Z',
        aprobadoPor: 'Venerable Maestro',
        categoria: 'actas',
        tags: ['acta', 'tenida', 'mayo'],
        resumen: 'Acta de la tenida ordinaria del 15 de mayo de 2025',
        archivo: 'acta-mayo-2025.pdf',
        tamaño: 512000,
        versiones: 1,
        descargas: 45,
        visibilidad: ['aprendiz', 'companero', 'maestro'],
        comentarios: 2,
      },
      {
        id: 3,
        titulo: 'Los Tres Grados Simbólicos',
        tipo: 'plancha',
        autor: 'María González',
        autorId: 4,
        grado: 'companero',
        estado: 'pendiente',
        fechaCreacion: '2025-05-22T15:30:00Z',
        fechaModificacion: '2025-05-22T15:30:00Z',
        categoria: 'educacion',
        tags: ['grados', 'aprendiz', 'companero', 'maestro'],
        resumen: 'Estudio comparativo de los tres grados fundamentales',
        archivo: 'tres-grados-simbolicos.pdf',
        tamaño: 2048000,
        versiones: 1,
        descargas: 0,
        visibilidad: ['companero', 'maestro'],
        comentarios: 0,
      },
      {
        id: 4,
        titulo: 'Circular: Nuevos Horarios',
        tipo: 'circular',
        autor: 'Venerable Maestro',
        autorId: 1,
        grado: 'aprendiz',
        estado: 'aprobado',
        fechaCreacion: '2025-05-18T12:00:00Z',
        fechaModificacion: '2025-05-18T12:00:00Z',
        fechaAprobacion: '2025-05-18T12:00:00Z',
        aprobadoPor: 'Venerable Maestro',
        categoria: 'administrativo',
        tags: ['circular', 'horarios', 'administrativo'],
        resumen: 'Información sobre cambios en los horarios de tenidas',
        archivo: 'circular-horarios.pdf',
        tamaño: 256000,
        versiones: 1,
        descargas: 78,
        visibilidad: ['aprendiz', 'companero', 'maestro'],
        comentarios: 8,
      },
    ];

    // Aplicar filtros
    let filteredDocs = mockDocumentos;
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredDocs = filteredDocs.filter(doc => 
        doc.titulo.toLowerCase().includes(searchLower) ||
        doc.autor.toLowerCase().includes(searchLower) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (params.tipo && params.tipo !== 'todos') {
      filteredDocs = filteredDocs.filter(doc => doc.tipo === params.tipo);
    }
    
    if (params.estado && params.estado !== 'todos') {
      filteredDocs = filteredDocs.filter(doc => doc.estado === params.estado);
    }
    
    if (params.categoria && params.categoria !== 'todos') {
      filteredDocs = filteredDocs.filter(doc => doc.categoria === params.categoria);
    }

    return {
      success: true,
      data: filteredDocs,
      pagination: {
        page: params.page || 1,
        limit: params.limit || 20,
        total: filteredDocs.length,
        totalPages: Math.ceil(filteredDocs.length / (params.limit || 20)),
      },
    };
  },

  async getDocumentoById(id) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const documento = {
      id: parseInt(id),
      titulo: 'El Simbolismo del Compás',
      tipo: 'plancha',
      autor: 'Juan Pérez',
      autorId: 2,
      grado: 'maestro',
      estado: 'aprobado',
      fechaCreacion: '2025-05-20T10:00:00Z',
      fechaModificacion: '2025-05-21T14:30:00Z',
      fechaAprobacion: '2025-05-21T16:00:00Z',
      aprobadoPor: 'Venerable Maestro',
      categoria: 'simbolismo',
      tags: ['compás', 'geometría', 'simbolismo'],
      resumen: 'Análisis profundo del simbolismo del compás en la masonería',
      contenido: 'Contenido completo del documento...',
      archivo: 'el-simbolismo-del-compas.pdf',
      tamaño: 1024000,
      versiones: 3,
      descargas: 25,
      visibilidad: ['maestro'],
      comentarios: [
        {
          id: 1,
          autor: 'Pedro Martínez',
          autorId: 5,
          fecha: '2025-05-21T18:00:00Z',
          comentario: 'Excelente análisis del simbolismo masónico.',
          grado: 'maestro',
        },
        {
          id: 2,
          autor: 'Ana López',
          autorId: 6,
          fecha: '2025-05-22T09:30:00Z',
          comentario: 'Muy instructivo, gracias por compartir.',
          grado: 'maestro',
        },
      ],
      historialVersiones: [
        {
          version: 3,
          fecha: '2025-05-21T14:30:00Z',
          autor: 'Juan Pérez',
          cambios: 'Revisión final y correcciones menores',
          actual: true,
        },
        {
          version: 2,
          fecha: '2025-05-21T10:15:00Z',
          autor: 'Juan Pérez',
          cambios: 'Adición de referencias bibliográficas',
          actual: false,
        },
        {
          version: 1,
          fecha: '2025-05-20T10:00:00Z',
          autor: 'Juan Pérez',
          cambios: 'Versión inicial del documento',
          actual: false,
        },
      ],
    };

    return { success: true, data: documento };
  },

  async subirDocumento(documentoData) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const nuevoDocumento = {
      id: Date.now(),
      ...documentoData,
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString(),
      fechaModificacion: new Date().toISOString(),
      versiones: 1,
      descargas: 0,
      comentarios: 0,
    };

    return { success: true, data: nuevoDocumento };
  },

  async getEstadisticas() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: {
        totalDocumentos: 156,
        porTipo: {
          plancha: 45,
          acta: 32,
          circular: 28,
          reglamento: 15,
          informe: 20,
          otro: 16,
        },
        porEstado: {
          aprobado: 120,
          pendiente: 25,
          revision: 8,
          rechazado: 3,
        },
        porGrado: {
          aprendiz: 68,
          companero: 42,
          maestro: 46,
        },
        descargasTotal: 2847,
        documentosRecientes: 12,
      },
    };
  },
};

// Estado inicial
const initialState = {
  documentos: [],
  currentDocumento: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    tipo: 'todos',
    estado: 'todos',
    categoria: 'todos',
    grado: 'todos',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  stats: {
    totalDocumentos: 0,
    porTipo: {},
    porEstado: {},
    porGrado: {},
    descargasTotal: 0,
    documentosRecientes: 0,
  },
  uploadProgress: 0,
  isUploading: false,
};

// Async thunks
export const fetchDocumentos = createAsyncThunk(
  'documentos/fetchDocumentos',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const { documentos } = getState();
      const queryParams = {
        ...documentos.filters,
        ...documentos.pagination,
        ...params,
      };
      
      const response = await mockDocumentosService.getDocumentos(queryParams);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al cargar documentos');
    }
  }
);

export const fetchDocumentoById = createAsyncThunk(
  'documentos/fetchDocumentoById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await mockDocumentosService.getDocumentoById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al cargar documento');
    }
  }
);

export const subirDocumento = createAsyncThunk(
  'documentos/subirDocumento',
  async (documentoData, { rejectWithValue, dispatch }) => {
    try {
      const response = await mockDocumentosService.subirDocumento(documentoData);
      
      // Refrescar lista después de subir
      dispatch(fetchDocumentos());
      dispatch(fetchEstadisticas());
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al subir documento');
    }
  }
);

export const fetchEstadisticas = createAsyncThunk(
  'documentos/fetchEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mockDocumentosService.getEstadisticas();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al cargar estadísticas');
    }
  }
);

// Slice
const documentosSlice = createSlice({
  name: 'documentos',
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
    
    clearCurrentDocumento: (state) => {
      state.currentDocumento = null;
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    
    setIsUploading: (state, action) => {
      state.isUploading = action.payload;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch documentos
      .addCase(fetchDocumentos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documentos = action.payload.data;
        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination,
        };
        state.error = null;
      })
      .addCase(fetchDocumentos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch documento by ID
      .addCase(fetchDocumentoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentoById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDocumento = action.payload.data;
        state.error = null;
      })
      .addCase(fetchDocumentoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Subir documento
      .addCase(subirDocumento.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(subirDocumento.fulfilled, (state) => {
        state.isUploading = false;
        state.uploadProgress = 100;
        state.error = null;
      })
      .addCase(subirDocumento.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
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
  clearCurrentDocumento,
  resetFilters,
  setUploadProgress,
  setIsUploading,
} = documentosSlice.actions;

export default documentosSlice.reducer;

// Selectores
export const selectDocumentos = (state) => state.documentos.documentos;
export const selectCurrentDocumento = (state) => state.documentos.currentDocumento;
export const selectDocumentosLoading = (state) => state.documentos.isLoading;
export const selectDocumentosError = (state) => state.documentos.error;
export const selectDocumentosFilters = (state) => state.documentos.filters;
export const selectDocumentosPagination = (state) => state.documentos.pagination;
export const selectDocumentosStats = (state) => state.documentos.stats;
export const selectUploadProgress = (state) => state.documentos.uploadProgress;
export const selectIsUploading = (state) => state.documentos.isUploading;