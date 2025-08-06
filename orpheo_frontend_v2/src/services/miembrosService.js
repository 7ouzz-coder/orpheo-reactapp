import apiClient from './apiClient';

// Endpoints de la API de miembros
const ENDPOINTS = {
  MIEMBROS: '/miembros',
  MIEMBRO_BY_ID: (id) => `/miembros/${id}`,
  ESTADISTICAS: '/miembros/estadisticas',
  BUSCAR: '/miembros/buscar',
  EXPORTAR: '/miembros/exportar',
};

/**
 * Servicio para gestión de miembros
 */
class MiembrosService {
  
  /**
   * Obtener lista de miembros con filtros y paginación
   */
  async getMiembros(params = {}) {
    try {
      console.log('🔍 MiembrosService: Obteniendo miembros con params:', params);
      
      // Construir query params
      const queryParams = new URLSearchParams();
      
      // Paginación
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Búsqueda
      if (params.search) queryParams.append('search', params.search);
      
      // Filtros
      if (params.grado) queryParams.append('grado', params.grado);
      if (params.estado) queryParams.append('estado', params.estado);
      if (params.fechaIngreso) queryParams.append('fechaIngreso', params.fechaIngreso);
      
      // Ordenamiento
      if (params.ordenarPor) queryParams.append('sortBy', params.ordenarPor);
      if (params.orden) queryParams.append('sortOrder', params.orden);
      
      const url = `${ENDPOINTS.MIEMBROS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get(url);
      
      console.log('✅ MiembrosService: Miembros obtenidos:', response.data);
      
      // Manejar diferentes estructuras de respuesta del backend
      if (response.data.success) {
        return {
          data: response.data.data || response.data.miembros || [],
          pagination: response.data.pagination || {},
          total: response.data.total || response.data.pagination?.total || 0,
        };
      } else if (Array.isArray(response.data)) {
        // Respuesta directa con array
        return {
          data: response.data,
          pagination: {},
          total: response.data.length,
        };
      } else {
        return {
          data: response.data.miembros || [],
          pagination: response.data.pagination || {},
          total: response.data.total || 0,
        };
      }
      
    } catch (error) {
      console.error('❌ MiembrosService: Error obteniendo miembros:', error);
      
      // Si hay error de red, devolver datos mock para desarrollo
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
        console.warn('⚠️ MiembrosService: Modo offline, devolviendo datos mock');
        return this.getMockMiembros(params);
      }
      
      throw this.handleApiError(error);
    }
  }

  /**
   * Obtener miembro por ID
   */
  async getMiembroById(id) {
    try {
      console.log(`🔍 MiembrosService: Obteniendo miembro ID: ${id}`);
      
      const response = await apiClient.get(ENDPOINTS.MIEMBRO_BY_ID(id));
      
      console.log('✅ MiembrosService: Miembro obtenido:', response.data);
      
      if (response.data.success) {
        return response.data.data || response.data.miembro;
      } else {
        return response.data;
      }
      
    } catch (error) {
      console.error(`❌ MiembrosService: Error obteniendo miembro ${id}:`, error);
      
      // Modo offline
      if (error.code === 'NETWORK_ERROR') {
        return this.getMockMiembroById(id);
      }
      
      throw this.handleApiError(error);
    }
  }

  /**
   * Crear nuevo miembro
   */
  async createMiembro(miembroData) {
    try {
      console.log('🔍 MiembrosService: Creando miembro:', miembroData);
      
      const response = await apiClient.post(ENDPOINTS.MIEMBROS, miembroData);
      
      console.log('✅ MiembrosService: Miembro creado:', response.data);
      
      if (response.data.success) {
        return response.data.data || response.data.miembro;
      } else {
        return response.data;
      }
      
    } catch (error) {
      console.error('❌ MiembrosService: Error creando miembro:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Actualizar miembro existente
   */
  async updateMiembro(id, miembroData) {
    try {
      console.log(`🔍 MiembrosService: Actualizando miembro ${id}:`, miembroData);
      
      const response = await apiClient.put(ENDPOINTS.MIEMBRO_BY_ID(id), miembroData);
      
      console.log('✅ MiembrosService: Miembro actualizado:', response.data);
      
      if (response.data.success) {
        return response.data.data || response.data.miembro;
      } else {
        return response.data;
      }
      
    } catch (error) {
      console.error(`❌ MiembrosService: Error actualizando miembro ${id}:`, error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Eliminar miembro
   */
  async deleteMiembro(id) {
    try {
      console.log(`🔍 MiembrosService: Eliminando miembro ID: ${id}`);
      
      const response = await apiClient.delete(ENDPOINTS.MIEMBRO_BY_ID(id));
      
      console.log('✅ MiembrosService: Miembro eliminado:', response.data);
      
      return response.data;
      
    } catch (error) {
      console.error(`❌ MiembrosService: Error eliminando miembro ${id}:`, error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Obtener estadísticas de miembros
   */
  async getEstadisticas() {
    try {
      console.log('🔍 MiembrosService: Obteniendo estadísticas');
      
      const response = await apiClient.get(ENDPOINTS.ESTADISTICAS);
      
      console.log('✅ MiembrosService: Estadísticas obtenidas:', response.data);
      
      if (response.data.success) {
        return response.data.data || response.data.estadisticas;
      } else {
        return response.data;
      }
      
    } catch (error) {
      console.error('❌ MiembrosService: Error obteniendo estadísticas:', error);
      
      // Modo offline
      if (error.code === 'NETWORK_ERROR') {
        return this.getMockEstadisticas();
      }
      
      throw this.handleApiError(error);
    }
  }

  /**
   * Buscar miembros
   */
  async buscarMiembros(query, filtros = {}) {
    try {
      console.log('🔍 MiembrosService: Buscando miembros:', { query, filtros });
      
      const params = {
        q: query,
        ...filtros,
      };
      
      const response = await apiClient.get(ENDPOINTS.BUSCAR, { params });
      
      console.log('✅ MiembrosService: Búsqueda completada:', response.data);
      
      if (response.data.success) {
        return response.data.data || response.data.results || [];
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        return response.data.results || [];
      }
      
    } catch (error) {
      console.error('❌ MiembrosService: Error en búsqueda:', error);
      
      // Modo offline
      if (error.code === 'NETWORK_ERROR') {
        return this.searchMockMiembros(query, filtros);
      }
      
      throw this.handleApiError(error);
    }
  }

  /**
   * Exportar miembros
   */
  async exportarMiembros(formato = 'excel', filtros = {}) {
    try {
      console.log('🔍 MiembrosService: Exportando miembros:', { formato, filtros });
      
      const params = {
        format: formato,
        ...filtros,
      };
      
      const response = await apiClient.get(ENDPOINTS.EXPORTAR, { 
        params,
        responseType: 'blob',
      });
      
      console.log('✅ MiembrosService: Exportación completada');
      
      return response.data;
      
    } catch (error) {
      console.error('❌ MiembrosService: Error exportando:', error);
      throw this.handleApiError(error);
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Manejar errores de la API
   */
  handleApiError(error) {
    if (error.response) {
      // Error de respuesta del servidor
      const { status, data } = error.response;
      return {
        message: data.message || `Error ${status}`,
        status,
        code: data.code || 'API_ERROR',
        details: data.details || null,
      };
    } else if (error.request) {
      // Error de red
      return {
        message: 'Error de conexión. Verifica tu conexión a internet.',
        status: 0,
        code: 'NETWORK_ERROR',
        details: null,
      };
    } else {
      // Error desconocido
      return {
        message: error.message || 'Error desconocido',
        status: 0,
        code: 'UNKNOWN_ERROR',
        details: null,
      };
    }
  }

  // ===== DATOS MOCK PARA DESARROLLO =====

  getMockMiembros(params = {}) {
    const mockMiembros = [
      {
        id: 1,
        nombres: 'Juan Carlos',
        apellidos: 'Pérez González',
        rut: '12345678-9',
        email: 'juan.perez@email.com',
        telefono: '+56912345678',
        grado: 'maestro',
        estado: 'activo',
        fecha_ingreso: '2020-05-15',
        fecha_nacimiento: '1980-03-12',
        direccion: 'Av. Libertador 1234, Santiago',
        ciudad_nacimiento: 'Santiago',
        profesion: 'Ingeniero Civil',
        observaciones: 'Miembro destacado',
        stats: {
          asistencias: 45,
          eventos: 12,
          anos: 4,
        },
      },
      {
        id: 2,
        nombres: 'María Elena',
        apellidos: 'Silva Rodriguez',
        rut: '23456789-0',
        email: 'maria.silva@email.com',
        telefono: '+56987654321',
        grado: 'companero',
        estado: 'activo',
        fecha_ingreso: '2021-08-20',
        fecha_nacimiento: '1985-07-25',
        direccion: 'Calle Los Robles 567, Las Condes',
        ciudad_nacimiento: 'Valparaíso',
        profesion: 'Médico Cirujano',
        observaciones: null,
        stats: {
          asistencias: 32,
          eventos: 8,
          anos: 3,
        },
      },
      {
        id: 3,
        nombres: 'Roberto Luis',
        apellidos: 'Mendoza Torres',
        rut: '34567890-1',
        email: 'roberto.mendoza@email.com',
        telefono: '+56965432109',
        grado: 'aprendiz',
        estado: 'activo',
        fecha_ingreso: '2023-01-10',
        fecha_nacimiento: '1990-11-08',
        direccion: 'Pasaje Central 890, Ñuñoa',
        ciudad_nacimiento: 'Concepción',
        profesion: 'Contador Auditor',
        observaciones: 'Nuevo miembro',
        stats: {
          asistencias: 18,
          eventos: 4,
          anos: 1,
        },
      },
    ];

    // Aplicar filtros básicos
    let filteredMiembros = [...mockMiembros];
    
    if (params.search) {
      const search = params.search.toLowerCase();
      filteredMiembros = filteredMiembros.filter(m => 
        m.nombres.toLowerCase().includes(search) ||
        m.apellidos.toLowerCase().includes(search) ||
        m.email.toLowerCase().includes(search) ||
        m.rut.includes(search)
      );
    }

    if (params.grado) {
      filteredMiembros = filteredMiembros.filter(m => m.grado === params.grado);
    }

    if (params.estado) {
      filteredMiembros = filteredMiembros.filter(m => m.estado === params.estado);
    }

    return {
      data: filteredMiembros,
      pagination: {
        page: params.page || 1,
        limit: params.limit || 10,
        total: filteredMiembros.length,
        totalPages: Math.ceil(filteredMiembros.length / (params.limit || 10)),
      },
      total: filteredMiembros.length,
    };
  }

  getMockMiembroById(id) {
    const mockMiembros = this.getMockMiembros().data;
    return mockMiembros.find(m => m.id === parseInt(id)) || null;
  }

  getMockEstadisticas() {
    return {
      total: 3,
      aprendices: 1,
      companeros: 1,
      maestros: 1,
      activos: 3,
      inactivos: 0,
      suspendidos: 0,
      nuevosEsteAno: 1,
      promedioEdad: 35,
      promedioAnosMembresia: 2.7,
    };
  }

  searchMockMiembros(query, filtros) {
    const allMiembros = this.getMockMiembros(filtros).data;
    if (!query) return allMiembros;
    
    const search = query.toLowerCase();
    return allMiembros.filter(m => 
      m.nombres.toLowerCase().includes(search) ||
      m.apellidos.toLowerCase().includes(search) ||
      m.email.toLowerCase().includes(search) ||
      m.profesion.toLowerCase().includes(search)
    );
  }
}

// Exportar instancia única
const miembrosService = new MiembrosService();
export default miembrosService;