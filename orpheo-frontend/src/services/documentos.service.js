import api from './api';

export const documentosService = {
  async getDocumentos(params = {}) {
    const response = await api.get('/documentos', { params });
    return response;
  },

  async getDocumentoById(id) {
    const response = await api.get(`/documentos/${id}`);
    return response;
  },

  async uploadDocumento(formData) {
    const response = await api.post('/documentos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  async updateDocumento(id, documentoData) {
    const response = await api.put(`/documentos/${id}`, documentoData);
    return response;
  },

  async deleteDocumento(id) {
    const response = await api.delete(`/documentos/${id}`);
    return response;
  },

  async downloadDocumento(id) {
    const response = await api.get(`/documentos/${id}/download`, {
      responseType: 'blob'
    });
    return response;
  },

  async aprobarDocumento(id, aprobacionData) {
    const response = await api.post(`/documentos/${id}/moderar`, aprobacionData);
    return response;
  },

  async getEstadisticas() {
    const response = await api.get('/documentos/estadisticas');
    return response;
  }
};