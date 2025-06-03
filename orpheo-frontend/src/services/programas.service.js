import api from './api';

export const programasService = {
  async getProgramas(params = {}) {
    const response = await api.get('/programas', { params });
    return response;
  },

  async getProgramaById(id) {
    const response = await api.get(`/programas/${id}`);
    return response;
  },

  async createPrograma(programaData) {
    const response = await api.post('/programas', programaData);
    return response;
  },

  async updatePrograma(id, programaData) {
    const response = await api.put(`/programas/${id}`, programaData);
    return response;
  },

  async deletePrograma(id) {
    const response = await api.delete(`/programas/${id}`);
    return response;
  },

  async getCalendario(params = {}) {
    const response = await api.get('/programas/calendario', { params });
    return response;
  },

  async getEstadisticas() {
    const response = await api.get('/programas/estadisticas');
    return response;
  },

  // Asistencia
  async getAsistencia(programaId) {
    const response = await api.get(`/asistencia/${programaId}`);
    return response;
  },

  async confirmarAsistencia(programaId, miembroId, confirmacion) {
    const response = await api.post(`/asistencia/${programaId}`, {
      miembroId,
      confirmacion
    });
    return response;
  },

  async marcarAsistencia(programaId, miembroId, asistenciaData) {
    const response = await api.put(`/asistencia/${programaId}/${miembroId}`, asistenciaData);
    return response;
  },

  async generarReporteAsistencia(programaId) {
    const response = await api.post(`/asistencia/${programaId}/reportes`, {}, {
      responseType: 'blob'
    });
    return response;
  }
};