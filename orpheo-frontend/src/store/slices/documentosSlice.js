import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import documentosService from '../../services/documentosService';
import Toast from 'react-native-toast-message';

// Estado inicial
const initialState = {
  // Lista de documentos
  documentos: [],
  
  // Paginación
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  },
  
  // Filtros y búsqueda
  filters: {
    search: '',
    categoria: '',
    tipo: '',
    estado: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  },
  
  // Estados de carga
  isLoading: false,
  isLoadingDetail: false,
  isUploading: false,
  isUpdating: false,
  isDeleting: false,
  isDownloading: false,
  isModerating: false,
  
  // Documento seleccionado
  selectedDocumento: null,
  
  // Estadísticas
  estadisticas: {
    totalDocumentos: 0,
    documentosAprobados: 0,
    documentosPendientes: 0,
    documentosRechazados: 0,
    planchasTotal: 0,
    planchasPendientes: 0,
    porcentajeAprobados: 0,
    distribucionPorCategoria: {}
  },
  
  // Errores
  error: null,
  
  // Progreso de subida
  uploadProgress: 0,
  
  // Cache
  lastFetch: null,
  cacheExpiry: 5 * 60 * 1000 // 5 minutos
};

// Thunks asíncronos

// Obtener lista de documentos
export const fetchDocumentos = createAsyncThunk(
  'documentos/fetchDocumentos',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentFilters = state.documentos.filters;
      
      const requestParams = {
        page: params.page || state.documentos.pagination.currentPage,
        limit: params.limit || state.documentos.pagination.itemsPerPage,
        search: params.search !== undefined ? params.search : currentFilters.search,
        categoria: params.categoria !== undefined ? params.categoria : currentFilters.categoria,
        tipo: params.tipo !== undefined ? params.tipo : currentFilters.tipo,
        estado: params.estado !== undefined ? params.estado : currentFilters.estado,
        sortBy: params.sortBy || currentFilters.sortBy,
        sortOrder: params.sortOrder || currentFilters.sortOrder
      };

      const result = await documentosService.getDocumentos(requestParams);
      
      if (result.success) {
        return {
          ...result.data,
          filters: requestParams
        };
      } else {
        return rejectWithValue(result.message || 'Error al obtener documentos');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error inesperado');
    }
  }
);

// Obtener estadísticas
export const fetchEstadisticas = createAsyncThunk(
  'documentos/fetchEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      const result = await documentosService.getEstadisticas();
      
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message || 'Error al obtener estadísticas');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error inesperado');
    }
  }
);

// Obtener documento por ID
export const fetchDocumentoById = createAsyncThunk(
  'documentos/fetchDocumentoById',
  async (id, { rejectWithValue }) => {
    try {
      const result = await documentosService.getDocumentoById(id);
      
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.message || 'Documento no encontrado');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error inesperado');
    }
  }
);

// Subir documento
export const uploadDocumento = createAsyncThunk(
  'documentos/uploadDocumento',
  async (documentoData, { dispatch, rejectWithValue }) => {
    try {
      const result = await documentosService.uploadDocumento(
        documentoData,
        (progress) => {
          dispatch(setUploadProgress(progress));
        }
      );
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Documento Subido',
          text2: result.message || 'Documento subido exitosamente',
          visibilityTime: 3000,
        });
        
        // Refrescar lista
        dispatch(fetchDocumentos());
        dispatch(fetchEstadisticas());
        
        return result.data;
      } else {
        return rejectWithValue({
          message: result.message || 'Error al subir documento',
          errors: result.errors || []
        });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Error inesperado',
        errors: []
      });
    }
  }
);

// Actualizar documento
export const updateDocumento = createAsyncThunk(
  'documentos/updateDocumento',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const result = await documentosService.updateDocumento(id, data);
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Documento Actualizado',
          text2: result.message || 'Documento actualizado exitosamente',
          visibilityTime: 3000,
        });
        
        dispatch(fetchDocumentos());
        dispatch(fetchEstadisticas());
        
        return result.data;
      } else {
        return rejectWithValue({
          message: result.message || 'Error al actualizar documento',
          errors: result.errors || []
        });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Error inesperado',
        errors: []
      });
    }
  }
);

// Eliminar documento
export const deleteDocumento = createAsyncThunk(
  'documentos/deleteDocumento',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const result = await documentosService.deleteDocumento(id);
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Documento Eliminado',
          text2: result.message || 'Documento eliminado exitosamente',
          visibilityTime: 3000,
        });
        
        dispatch(fetchDocumentos());
        dispatch(fetchEstadisticas());
        
        return id;
      } else {
        return rejectWithValue(result.message || 'Error al eliminar documento');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error inesperado');
    }
  }
);

// Descargar documento
export const downloadDocumento = createAsyncThunk(
  'documentos/downloadDocumento',
  async ({ id, nombre }, { rejectWithValue }) => {
    try {
      const result = await documentosService.downloadDocumento(id, nombre);
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Descarga Completada',
          text2: result.message || 'Documento descargado exitosamente',
          visibilityTime: 3000,
        });
        
        return result.data;
      } else {
        return rejectWithValue(result.message || 'Error al descargar documento');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error inesperado');
    }
  }
);

// Moderar plancha
export const moderarPlancha = createAsyncThunk(
  'documentos/moderarPlancha',
  async ({ id, moderacionData }, { dispatch, rejectWithValue }) => {
    try {
      const result = await documentosService.moderarPlancha(id, moderacionData);
      
      if (result.success) {
        const accion = moderacionData.estado === 'aprobada' ? 'aprobada' : 'rechazada';
        
        Toast.show({
          type: 'success',
          text1: `Plancha ${accion}`,
          text2: result.message || `Plancha ${accion} exitosamente`,
          visibilityTime: 3000,
        });
        
        dispatch(fetchDocumentos());
        dispatch(fetchEstadisticas());
        
        return result.data;
      } else {
        return rejectWithValue({
          message: result.message || 'Error al moderar plancha',
          errors: result.errors || []
        });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Error inesperado',
        errors: []
      });
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
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Reset filtros
    resetFilters: (state) => {
      state.filters = {
        search: '',
        categoria: '',
        tipo: '',
        estado: '',
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };
    },

    // Seleccionar documento
    selectDocumento: (state, action) => {
      state.selectedDocumento = action.payload;
    },

    // Limpiar documento seleccionado
    clearSelectedDocumento: (state) => {
      state.selectedDocumento = null;
    },

    // Actualizar progreso de subida
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },

    // Reset progreso de subida
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },

    // Actualizar página
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },

    // Actualizar items por página
    setItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
    },

    // Invalidar cache
    invalidateCache: (state) => {
      state.lastFetch = null;
    }
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
        state.pagination = action.payload.pagination;
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
        state.uploadProgress = 0;
      })
      .addCase(uploadDocumento.fulfilled, (state) => {
        state.isUploading = false;
        state.uploadProgress = 100;
      })
      .addCase(uploadDocumento.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload;
      });

    // Update documento
    builder
      .addCase(updateDocumento.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateDocumento.fulfilled, (state, action) => {
        state.isUpdating = false;
        
        const index = state.documentos.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.documentos[index] = action.payload;
        }
        
        if (state.selectedDocumento?.id === action.payload.id) {
          state.selectedDocumento = action.payload;
        }
      })
      .addCase(updateDocumento.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });

    // Delete documento
    builder
      .addCase(deleteDocumento.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteDocumento.fulfilled, (state, action) => {
        state.isDeleting = false;
        
        state.documentos = state.documentos.filter(d => d.id !== action.payload);
        
        if (state.selectedDocumento?.id === action.payload) {
          state.selectedDocumento = null;
        }
      })
      .addCase(deleteDocumento.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      });

    // Download documento
    builder
      .addCase(downloadDocumento.pending, (state) => {
        state.isDownloading = true;
      })
      .addCase(downloadDocumento.fulfilled, (state) => {
        state.isDownloading = false;
      })
      .addCase(downloadDocumento.rejected, (state, action) => {
        state.isDownloading = false;
        state.error = action.payload;
      });

    // Moderar plancha
    builder
      .addCase(moderarPlancha.pending, (state) => {
        state.isModerating = true;
        state.error = null;
      })
      .addCase(moderarPlancha.fulfilled, (state, action) => {
        state.isModerating = false;
        
        const index = state.documentos.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.documentos[index] = action.payload;
        }
        
        if (state.selectedDocumento?.id === action.payload.id) {
          state.selectedDocumento = action.payload;
        }
      })
      .addCase(moderarPlancha.rejected, (state, action) => {
        state.isModerating = false;
        state.error = action.payload;
      });
  }
});

// Selectores
export const selectDocumentos = (state) => state.documentos.documentos;
export const selectDocumentosPagination = (state) => state.documentos.pagination;
export const selectDocumentosFilters = (state) => state.documentos.filters;
export const selectDocumentosLoading = (state) => state.documentos.isLoading;
export const selectDocumentosError = (state) => state.documentos.error;
export const selectSelectedDocumento = (state) => state.documentos.selectedDocumento;
export const selectDocumentosEstadisticas = (state) => state.documentos.estadisticas;
export const selectIsUploadingDocumento = (state) => state.documentos.isUploading;
export const selectIsUpdatingDocumento = (state) => state.documentos.isUpdating;
export const selectIsDeletingDocumento = (state) => state.documentos.isDeleting;
export const selectIsDownloadingDocumento = (state) => state.documentos.isDownloading;
export const selectIsModeratingPlancha = (state) => state.documentos.isModerating;
export const selectUploadProgress = (state) => state.documentos.uploadProgress;
export const selectIsLoadingDetail = (state) => state.documentos.isLoadingDetail;

// Selectores con lógica
export const selectDocumentoById = (id) => (state) => {
  return state.documentos.documentos.find(doc => doc.id === id);
};

export const selectDocumentosByCategoria = (categoria) => (state) => {
  return state.documentos.documentos.filter(doc => doc.categoria === categoria);
};

export const selectDocumentosByTipo = (tipo) => (state) => {
  return state.documentos.documentos.filter(doc => doc.tipo === tipo);
};

export const selectPlanchasPendientes = (state) => {
  return state.documentos.documentos.filter(doc => 
    doc.tipo === 'plancha' && doc.estado === 'pendiente'
  );
};

export const selectDocumentosAprobados = (state) => {
  return state.documentos.documentos.filter(doc => doc.estado === 'aprobado');
};

// Acciones
export const {
  clearError,
  updateFilters,
  resetFilters,
  selectDocumento,
  clearSelectedDocumento,
  setUploadProgress,
  resetUploadProgress,
  setCurrentPage,
  setItemsPerPage,
  invalidateCache
} = documentosSlice.actions;

export default documentosSlice.reducer;