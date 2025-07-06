import api from './api';

const programasService = {
  // Obtener lista de programas - compatible con GET /api/programas
  getProgramas: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await api.get(`/programas?${queryParams.toString()}`);
    return response.data;
  },
  
  // Obtener programa por ID - compatible con GET /api/programas/:id
  getProgramaById: async (id) => {
    const response = await api.get(`/programas/${id}`);
    return response.data;
  },
  
  // Crear nuevo programa - compatible con POST /api/programas
  createPrograma: async (programaData) => {
    const response = await api.post('/programas', programaData);
    return response.data;
  },
  
  // Actualizar programa - compatible con PUT /api/programas/:id
  updatePrograma: async (id, programaData) => {
    const response = await api.put(`/programas/${id}`, programaData);
    return response.data;
  },
  
  // Eliminar programa - compatible con DELETE /api/programas/:id
  deletePrograma: async (id) => {
    const response = await api.delete(`/programas/${id}`);
    return response.data;
  },
  
  // Gestionar asistencia - compatible con POST /api/programas/:programaId/asistencia
  gestionarAsistencia: async (programaId, asistenciaData) => {
    const response = await api.post(`/programas/${programaId}/asistencia`, asistenciaData);
    return response.data;
  },
  
  // Obtener estadísticas - compatible con GET /api/programas/estadisticas
  getEstadisticas: async () => {
    const response = await api.get('/programas/estadisticas');
    return response.data;
  },
  
  // Confirmar asistencia (para miembros)
  confirmarAsistencia: async (programaId, confirmacion = true) => {
    const response = await api.post(`/programas/${programaId}/confirmar`, {
      confirmado: confirmacion
    });
    return response.data;
  },
  
  // Obtener programas por rango de fechas
  getProgramasByDateRange: async (fechaDesde, fechaHasta) => {
    const params = {
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta
    };
    return programasService.getProgramas(params);
  },
  
  // Obtener programas próximos
  getProgramasProximos: async (limit = 10) => {
    const params = {
      limit,
      sortBy: 'fecha',
      sortOrder: 'ASC',
      estado: 'programado'
    };
    return programasService.getProgramas(params);
  },
  
  // Obtener programas de hoy
  getProgramasHoy: async () => {
    const hoy = new Date().toISOString().split('T')[0];
    return programasService.getProgramasByDateRange(hoy, hoy);
  },
  
  // Obtener asistencia de un programa específico
  getAsistenciaPrograma: async (programaId) => {
    const response = await api.get(`/programas/${programaId}/asistencia`);
    return response.data;
  },
  
  // Marcar asistencia masiva
  marcarAsistenciaMasiva: async (programaId, asistencias) => {
    const response = await api.post(`/programas/${programaId}/asistencia/masiva`, {
      asistencias
    });
    return response.data;
  },
  
  // Exportar reporte de asistencia
  exportarReporteAsistencia: async (programaId, formato = 'excel') => {
    const response = await api.get(`/programas/${programaId}/reporte`, {
      params: { formato },
      responseType: 'blob'
    });
    return response.data;
  },
  
  // Duplicar programa (crear copia)
  duplicarPrograma: async (programaId, nuevaFecha) => {
    const response = await api.post(`/programas/${programaId}/duplicar`, {
      fecha: nuevaFecha
    });
    return response.data;
  },
  
  // Obtener plantillas de programas
  getPlantillas: async () => {
    const response = await api.get('/programas/plantillas');
    return response.data;
  },
  
  // Crear programa desde plantilla
  crearDesdeePlantilla: async (plantillaId, programaData) => {
    const response = await api.post(`/programas/plantillas/${plantillaId}`, programaData);
    return response.data;
  }
};

export default programasService;