import api from './api';

const miembrosService = {
  // Obtener lista de miembros - compatible con GET /api/miembros
  getMiembros: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await api.get(`/miembros?${queryParams.toString()}`);
    return response.data;
  },
  
  // Obtener miembro por ID - compatible con GET /api/miembros/:id
  getMiembroById: async (id) => {
    const response = await api.get(`/miembros/${id}`);
    return response.data;
  },
  
  // Crear nuevo miembro - compatible con POST /api/miembros
  createMiembro: async (miembroData) => {
    const response = await api.post('/miembros', miembroData);
    return response.data;
  },
  
  // Actualizar miembro - compatible con PUT /api/miembros/:id
  updateMiembro: async (id, miembroData) => {
    const response = await api.put(`/miembros/${id}`, miembroData);
    return response.data;
  },
  
  // Eliminar miembro - compatible con DELETE /api/miembros/:id
  deleteMiembro: async (id) => {
    const response = await api.delete(`/miembros/${id}`);
    return response.data;
  },
  
  // Obtener estadísticas - compatible con GET /api/miembros/estadisticas
  getEstadisticas: async () => {
    const response = await api.get('/miembros/estadisticas');
    return response.data;
  },
  
  // Importar miembros desde Excel - compatible con POST /api/miembros/importar
  importarMiembros: async (fileUri) => {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      name: 'miembros.xlsx',
    });
    
    const response = await api.post('/miembros/importar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

export default miembrosService;