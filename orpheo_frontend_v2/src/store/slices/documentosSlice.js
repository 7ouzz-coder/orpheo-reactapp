import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Toast from 'react-native-toast-message';
import api from '../../services/api';

// Estado inicial
const initialState = {
  documentos: [],
  selectedDocumento: null,
  isLoading: false,
  isLoadingDetail: false,
  isUploading: false,
  error: null,
  
  // Filtros y búsqueda
  filters: {
    search: '',
    categoria: null,
    tipo: null,
    estado: 'activo',
  },
  
  // Estadísticas
  estadisticas: {
    total: 0,
    porCategoria: {
      aprendiz: 0,
      companero: 0,
      maestro: 0,
      general: 0,
    },
    porTipo: {
      plancha: 0,
      documento: 0,
      reglamento: 0,
      acta: 0,
    },
    recientes: 0,
  },
  
  // Cache
  lastFetch: null,
};

// Thunks asíncronos

// Fetch documentos
export const fetchDocumentos = createAsyncThunk(
  'documentos/fetchDocumentos',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().documentos;
      const filters = { ...state.filters, ...params.filters };
      
      console.log('📄 Cargando documentos...', filters);
      
      const response = await api.get('/documentos', {
        params: {
          search: filters.search,
          categoria: filters.categoria,
          tipo: filters.tipo,
          estado: filters.estado,
        },
      });
      
      if (response.data && response.data.success) {
        console.log(`✅ Documentos cargados: ${response.data.data.documentos.length}`);
        return {
          documentos: response.data.data.documentos,
          filters,
        };
      } else {
        throw new Error(response.data?.message || 'Error al cargar documentos');
      }
    } catch (error) {
      console.error('❌ Error al cargar documentos:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error de conexión';
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `No se pudieron cargar los documentos: ${errorMessage}`,
        visibilityTime: 4000,
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch estadísticas de documentos
export const fetchEstadisticas = createAsyncThunk(
  'documentos/fetchEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📈 Cargando estadísticas de documentos...');
      
      const response = await api.get('/documentos/estadisticas');
      
      if (response.data && response.data.success) {
        console.log('✅ Estadísticas de documentos cargadas');
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Error al cargar estadísticas');
      }
    } catch (error) {
      console.warn('⚠️ Error al cargar estadísticas de documentos:', error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch documento por ID
export const fetchDocumentoById = createAsyncThunk(
  'documentos/fetchDocumentoById',
  async (id, { rejectWithValue }) => {
    try {
      console.log(`📄 Cargando documento ID: ${id}`);
      
      const response = await api.get(`/documentos/${id}`);
      
      if (response.data && response.data.success) {
        console.log(`✅ Documento cargado: ${response.data.data.titulo}`);
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Documento no encontrado');
      }
    } catch (error) {
      console.error('❌ Error al cargar documento:', error);
      const errorMessage = error.response?.data?.message || error.message;
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `No se pudo cargar el documento: ${errorMessage}`,
        visibilityTime: 4000,
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Upload documento
export const uploadDocumento = createAsyncThunk(
  'documentos/uploadDocumento',
  async (documentoData, { dispatch, rejectWithValue }) => {
    try {
      console.log('📤 Subiendo documento:', documentoData.titulo);
      
      // Crear FormData para subida de archivo
      const formData = new FormData();
      
      // Agregar metadatos
      Object.keys(documentoData).forEach(key => {
        if (key !== 'archivo') {
          formData.append(key, documentoData[key]);
        }
      });
      
      // Agregar archivo si existe
      if (documentoData.archivo) {
        formData.append('archivo', documentoData.archivo);
      }
      
      const response = await api.post('/documentos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data && response.data.success) {
        console.log('✅ Documento subido exitosamente');
        
        Toast.show({
          type: 'success',
          text1: 'Documento Subido',
          text2: `${documentoData.titulo} ha sido agregado`,
          visibilityTime: 3000,
        });
        
        // Recargar lista de documentos
        dispatch(fetchDocumentos());
        dispatch(fetchEstadisticas());
        
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Error al subir documento');
      }
    } catch (error) {
      console.error('❌ Error al subir documento:', error);
      const errorMessage = error.response?.data?.message || error.message;
      
      Toast.show({
        type: 'error',
        text1: 'Error al Subir',
        text2: errorMessage,
        visibilityTime: 4000,
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const documentosSlice = createSlice({
  name: 'documentos',
  initialState,
  reducers: {
    // Limpiar errores
    clearError: (state) => {
      state.error = null;
    },
    
    // Actualizar filtros
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Limpiar filtros
    clearFilters: (state) => {
      state.filters = {
        search: '',
        categoria: null,
        tipo: null,
        estado: 'activo',
      };
    },
    
    // Seleccionar documento
    setSelectedDocumento: (state, action) => {
      state.selectedDocumento = action.payload;
    },
    
    // Limpiar documento seleccionado
    clearSelectedDocumento: (state) => {
      state.selectedDocumento = null;
    },
    
    // Invalidar cache
    invalidateCache: (state) => {
      state.lastFetch = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch documentos
    builder
      .addCase(fetchDocumentos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documentos = action.payload.documentos;
        state.filters = action.payload.filters;
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchDocumentos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch estadísticas
    builder
      .addCase(fetchEstadisticas.fulfilled, (state, action) => {
        state.estadisticas = action.payload;
      });

    // Fetch documento by ID
    builder
      .addCase(fetchDocumentoById.pending, (state) => {
        state.isLoadingDetail = true;
        state.error = null;
      })
      .addCase(fetchDocumentoById.fulfilled, (state, action) => {
        state.isLoadingDetail = false;
        state.selectedDocumento = action.payload;
      })
      .addCase(fetchDocumentoById.rejected, (state, action) => {
        state.isLoadingDetail = false;
        state.error = action.payload;
      });

    // Upload documento
    builder
      .addCase(uploadDocumento.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadDocumento.fulfilled, (state) => {
        state.isUploading = false;
      })
      .addCase(uploadDocumento.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const {
  clearError,
  setFilters,
  clearFilters,
  setSelectedDocumento,
  clearSelectedDocumento,
  invalidateCache,
} = documentosSlice.actions;

// Selectores
export const selectDocumentos = (state) => state.documentos.documentos;
export const selectDocumentosLoading = (state) => state.documentos.isLoading;
export const selectDocumentosError = (state) => state.documentos.error;
export const selectDocumentosFilters = (state) => state.documentos.filters;
export const selectDocumentosEstadisticas = (state) => state.documentos.estadisticas;
export const selectSelectedDocumento = (state) => state.documentos.selectedDocumento;
export const selectDocumentosDetailLoading = (state) => state.documentos.isLoadingDetail;
export const selectDocumentosUploading = (state) => state.documentos.isUploading;

// Selectores derivados
export const selectPlanchasPendientes = (state) => {
  const documentos = selectDocumentos(state);
  return documentos.filter(doc => doc.tipo === 'plancha' && doc.estado === 'pendiente');
};

export const selectDocumentosRecientes = (state) => {
  const documentos = selectDocumentos(state);
  const unMesAtras = new Date();
  unMesAtras.setMonth(unMesAtras.getMonth() - 1);
  
  return documentos.filter(doc => new Date(doc.created_at) > unMesAtras);
};

export default documentosSlice.reducer;