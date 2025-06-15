import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Documento, DocumentosState, DocumentosFilters, DocumentoFormData, DocumentoDetalle } from '@/types';
import { documentosService } from '@/services/documentos.service';

// Estado inicial
const initialState: DocumentosState = {
  documentos: [],
  currentDocumento: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    tipo: '',
    estado: '',
    categoria: '',
    grado: '',
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

// Thunks asíncronos
export const fetchDocumentos = createAsyncThunk(
  'documentos/fetchDocumentos',
  async (params: { page?: number; limit?: number; filters?: Partial<DocumentosFilters> } = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const response = await documentosService.getDocumentos({
        page: params.page || 1,
        limit: params.limit || 20,
        ...params.filters,
      }, state.auth.token);

      return response;
    } catch (error: any) {
      console.error('Fetch documentos error:', error);
      return rejectWithValue(error.message || 'Error al cargar documentos');
    }
  }
);

export const fetchDocumentoById = createAsyncThunk(
  'documentos/fetchDocumentoById',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const documento = await documentosService.getDocumentoById(id, state.auth.token);
      return documento;
    } catch (error: any) {
      console.error('Fetch documento error:', error);
      return rejectWithValue(error.message || 'Error al cargar documento');
    }
  }
);

export const uploadDocumento = createAsyncThunk(
  'documentos/uploadDocumento',
  async (
    { formData, onProgress }: { formData: DocumentoFormData; onProgress?: (progress: number) => void },
    { getState, rejectWithValue, dispatch }
  ) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      dispatch(setUploadProgress(0));
      dispatch(setIsUploading(true));

      const documento = await documentosService.uploadDocumento(
        formData,
        state.auth.token,
        (progress) => {
          dispatch(setUploadProgress(progress));
          onProgress?.(progress);
        }
      );

      dispatch(setIsUploading(false));
      dispatch(setUploadProgress(0));
      
      return documento;
    } catch (error: any) {
      console.error('Upload documento error:', error);
      dispatch(setIsUploading(false));
      dispatch(setUploadProgress(0));
      return rejectWithValue(error.message || 'Error al subir documento');
    }
  }
);

export const updateDocumento = createAsyncThunk(
  'documentos/updateDocumento',
  async ({ id, data }: { id: string; data: Partial<DocumentoFormData> }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const updatedDocumento = await documentosService.updateDocumento(id, data, state.auth.token);
      return updatedDocumento;
    } catch (error: any) {
      console.error('Update documento error:', error);
      return rejectWithValue(error.message || 'Error al actualizar documento');
    }
  }
);

export const deleteDocumento = createAsyncThunk(
  'documentos/deleteDocumento',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      await documentosService.deleteDocumento(id, state.auth.token);
      return id;
    } catch (error: any) {
      console.error('Delete documento error:', error);
      return rejectWithValue(error.message || 'Error al eliminar documento');
    }
  }
);

export const approveDocumento = createAsyncThunk(
  'documentos/approveDocumento',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const documento = await documentosService.approveDocumento(id, state.auth.token);
      return documento;
    } catch (error: any) {
      console.error('Approve documento error:', error);
      return rejectWithValue(error.message || 'Error al aprobar documento');
    }
  }
);

export const rejectDocumento = createAsyncThunk(
  'documentos/rejectDocumento',
  async ({ id, reason }: { id: string; reason?: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const documento = await documentosService.rejectDocumento(id, reason, state.auth.token);
      return documento;
    } catch (error: any) {
      console.error('Reject documento error:', error);
      return rejectWithValue(error.message || 'Error al rechazar documento');
    }
  }
);

export const downloadDocumento = createAsyncThunk(
  'documentos/downloadDocumento',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const downloadUrl = await documentosService.downloadDocumento(id, state.auth.token);
      return { id, downloadUrl };
    } catch (error: any) {
      console.error('Download documento error:', error);
      return rejectWithValue(error.message || 'Error al descargar documento');
    }
  }
);

export const fetchDocumentosStats = createAsyncThunk(
  'documentos/fetchDocumentosStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const stats = await documentosService.getDocumentosStats(state.auth.token);
      return stats;
    } catch (error: any) {
      console.error('Fetch documentos stats error:', error);
      return rejectWithValue(error.message || 'Error al cargar estadísticas');
    }
  }
);

export const searchDocumentos = createAsyncThunk(
  'documentos/searchDocumentos',
  async (query: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      
      if (!state.auth.token) {
        return rejectWithValue('No hay sesión activa');
      }

      const results = await documentosService.searchDocumentos(query, state.auth.token);
      return results;
    } catch (error: any) {
      console.error('Search documentos error:', error);
      return rejectWithValue(error.message || 'Error en la búsqueda');
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
    
    setCurrentDocumento: (state, action: PayloadAction<DocumentoDetalle | null>) => {
      state.currentDocumento = action.payload;
    },
    
    setFilters: (state, action: PayloadAction<Partial<DocumentosFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    
    setIsUploading: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload;
    },
    
    // Optimistic updates
    optimisticUpdateDocumento: (state, action: PayloadAction<Documento>) => {
      const index = state.documentos.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.documentos[index] = action.payload;
      }
    },
    
    optimisticDeleteDocumento: (state, action: PayloadAction<string>) => {
      state.documentos = state.documentos.filter(d => d.id !== action.payload);
      if (state.currentDocumento?.id === action.payload) {
        state.currentDocumento = null;
      }
    },
    
    // Incrementar contador de descargas
    incrementDownloadCount: (state, action: PayloadAction<string>) => {
      const documento = state.documentos.find(d => d.id === action.payload);
      if (documento) {
        documento.descargas += 1;
      }
      if (state.currentDocumento?.id === action.payload) {
        state.currentDocumento.descargas += 1;
      }
    },
    
    resetDocumentosState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch Documentos
    builder
      .addCase(fetchDocumentos.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        if (action.meta.arg?.page === 1) {
          state.documentos = [];
        }
      })
      .addCase(fetchDocumentos.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, pagination } = action.payload;
        
        if (pagination.page === 1) {
          state.documentos = data;
        } else {
          state.documentos = [...state.documentos, ...data];
        }
        
        state.pagination = pagination;
      })
      .addCase(fetchDocumentos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Documento by ID
    builder
      .addCase(fetchDocumentoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentoById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDocumento = action.payload;
      })
      .addCase(fetchDocumentoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Upload Documento
    builder
      .addCase(uploadDocumento.fulfilled, (state, action) => {
        state.documentos.unshift(action.payload);
        state.stats.totalDocumentos += 1;
      })
      .addCase(uploadDocumento.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update Documento
    builder
      .addCase(updateDocumento.fulfilled, (state, action) => {
        const index = state.documentos.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.documentos[index] = action.payload;
        }
        if (state.currentDocumento?.id === action.payload.id) {
          state.currentDocumento = { ...state.currentDocumento, ...action.payload };
        }
      })
      .addCase(updateDocumento.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Documento
    builder
      .addCase(deleteDocumento.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.documentos = state.documentos.filter(d => d.id !== deletedId);
        if (state.currentDocumento?.id === deletedId) {
          state.currentDocumento = null;
        }
        state.stats.totalDocumentos = Math.max(0, state.stats.totalDocumentos - 1);
      })
      .addCase(deleteDocumento.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Approve/Reject Documento
    builder
      .addCase(approveDocumento.fulfilled, (state, action) => {
        const index = state.documentos.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.documentos[index] = action.payload;
        }
        if (state.currentDocumento?.id === action.payload.id) {
          state.currentDocumento = { ...state.currentDocumento, ...action.payload };
        }
      })
      .addCase(rejectDocumento.fulfilled, (state, action) => {
        const index = state.documentos.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.documentos[index] = action.payload;
        }
        if (state.currentDocumento?.id === action.payload.id) {
          state.currentDocumento = { ...state.currentDocumento, ...action.payload };
        }
      });

    // Download Documento
    builder
      .addCase(downloadDocumento.fulfilled, (state, action) => {
        const { id } = action.payload;
        const documento = state.documentos.find(d => d.id === id);
        if (documento) {
          documento.descargas += 1;
        }
        if (state.currentDocumento?.id === id) {
          state.currentDocumento.descargas += 1;
        }
      });

    // Stats
    builder
      .addCase(fetchDocumentosStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });

    // Search
    builder
      .addCase(searchDocumentos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchDocumentos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documentos = action.payload;
        state.pagination = {
          page: 1,
          limit: action.payload.length,
          total: action.payload.length,
          totalPages: 1,
        };
      })
      .addCase(searchDocumentos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentDocumento,
  setFilters,
  clearFilters,
  setUploadProgress,
  setIsUploading,
  optimisticUpdateDocumento,
  optimisticDeleteDocumento,
  incrementDownloadCount,
  resetDocumentosState,
} = documentosSlice.actions;

export default documentosSlice.reducer;