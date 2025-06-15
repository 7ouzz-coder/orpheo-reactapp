// Exportar servicios principales
export { default as api, apiGet, apiPost, apiPut, apiPatch, apiDelete, apiUpload, apiDownload, setAuthToken, clearAuthToken, checkConnectivity } from './api';
export { default as storageService } from './storage.service';
export { default as authService } from './auth.service';

// Placeholder para servicios futuros
export const miembrosService = {
  getMiembros: async (params: any, token: string) => {
    // Implementar cuando tengamos el backend
    console.log('getMiembros called with:', params, token);
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  },
  getMiembroById: async (id: string, token: string) => {
    console.log('getMiembroById called with:', id, token);
    return null;
  },
  createMiembro: async (data: any, token: string) => {
    console.log('createMiembro called with:', data, token);
    return null;
  },
  updateMiembro: async (id: string, data: any, token: string) => {
    console.log('updateMiembro called with:', id, data, token);
    return null;
  },
  deleteMiembro: async (id: string, token: string) => {
    console.log('deleteMiembro called with:', id, token);
    return true;
  },
  getMiembrosStats: async (token: string) => {
    console.log('getMiembrosStats called with:', token);
    return {
      total: 0,
      porGrado: { aprendiz: 0, companero: 0, maestro: 0 },
      conEmail: 0,
      conTelefono: 0,
    };
  },
  searchMiembros: async (query: string, token: string) => {
    console.log('searchMiembros called with:', query, token);
    return [];
  },
};

export const documentosService = {
  getDocumentos: async (params: any, token: string) => {
    console.log('getDocumentos called with:', params, token);
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  },
  getDocumentoById: async (id: string, token: string) => {
    console.log('getDocumentoById called with:', id, token);
    return null;
  },
  uploadDocumento: async (data: any, token: string, onProgress?: (progress: number) => void) => {
    console.log('uploadDocumento called with:', data, token);
    if (onProgress) {
      // Simular progreso
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        onProgress(i);
      }
    }
    return null;
  },
  updateDocumento: async (id: string, data: any, token: string) => {
    console.log('updateDocumento called with:', id, data, token);
    return null;
  },
  deleteDocumento: async (id: string, token: string) => {
    console.log('deleteDocumento called with:', id, token);
    return true;
  },
  approveDocumento: async (id: string, token: string) => {
    console.log('approveDocumento called with:', id, token);
    return null;
  },
  rejectDocumento: async (id: string, reason: string | undefined, token: string) => {
    console.log('rejectDocumento called with:', id, reason, token);
    return null;
  },
  downloadDocumento: async (id: string, token: string) => {
    console.log('downloadDocumento called with:', id, token);
    return 'download-url';
  },
  getDocumentosStats: async (token: string) => {
    console.log('getDocumentosStats called with:', token);
    return {
      totalDocumentos: 0,
      porTipo: {},
      porEstado: {},
      porGrado: {},
      descargasTotal: 0,
      documentosRecientes: 0,
    };
  },
  searchDocumentos: async (query: string, token: string) => {
    console.log('searchDocumentos called with:', query, token);
    return [];
  },
};

export const programasService = {
  getProgramas: async (params: any, token: string) => {
    console.log('getProgramas called with:', params, token);
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  },
  getProgramaById: async (id: string, token: string) => {
    console.log('getProgramaById called with:', id, token);
    return null;
  },
  createPrograma: async (data: any, token: string) => {
    console.log('createPrograma called with:', data, token);
    return null;
  },
  updatePrograma: async (id: string, data: any, token: string) => {
    console.log('updatePrograma called with:', id, data, token);
    return null;
  },
  deletePrograma: async (id: string, token: string) => {
    console.log('deletePrograma called with:', id, token);
    return true;
  },
  confirmAsistencia: async (programaId: string, estado: string, token: string) => {
    console.log('confirmAsistencia called with:', programaId, estado, token);
    return null;
  },
  updateAsistencia: async (programaId: string, miembroId: string, data: any, token: string) => {
    console.log('updateAsistencia called with:', programaId, miembroId, data, token);
    return null;
  },
  getProgramasStats: async (token: string) => {
    console.log('getProgramasStats called with:', token);
    return {
      totalProgramas: 0,
      porTipo: {},
      porEstado: {},
      asistenciaPromedio: 0,
      proximosEventos: 0,
      miembrosActivos: 0,
    };
  },
  searchProgramas: async (query: string, token: string) => {
    console.log('searchProgramas called with:', query, token);
    return [];
  },
  getProgramasByDate: async (date: string, token: string) => {
    console.log('getProgramasByDate called with:', date, token);
    return [];
  },
};