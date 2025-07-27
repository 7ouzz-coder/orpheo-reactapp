import { apiClient } from './apiClient';

class MiembrosService {
  
  // Obtener lista de miembros con filtros y paginación
  async getMiembros(params = {}) {
    try {
      console.log('📋 MiembrosService: Obteniendo lista de miembros', params);
      
      const response = await apiClient.get('/miembros', { params });
      
      console.log('✅ MiembrosService: Lista obtenida exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ MiembrosService: Error al obtener miembros:', error);
      throw error;
    }
  }

  // Obtener miembro por ID
  async getMiembroById(id) {
    try {
      console.log(`🔍 MiembrosService: Obteniendo miembro ID: ${id}`);
      
      const response = await apiClient.get(`/miembros/${id}`);
      
      console.log('✅ MiembrosService: Miembro obtenido exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ MiembrosService: Error al obtener miembro:', error);
      throw error;
    }
  }

  // Crear nuevo miembro
  async createMiembro(miembroData) {
    try {
      console.log('➕ MiembrosService: Creando nuevo miembro');
      
      const response = await apiClient.post('/miembros', miembroData);
      
      console.log('✅ MiembrosService: Miembro creado exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ MiembrosService: Error al crear miembro:', error);
      throw error;
    }
  }

  // Actualizar miembro
  async updateMiembro(id, miembroData) {
    try {
      console.log(`✏️ MiembrosService: Actualizando miembro ID: ${id}`);
      
      const response = await apiClient.put(`/miembros/${id}`, miembroData);
      
      console.log('✅ MiembrosService: Miembro actualizado exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ MiembrosService: Error al actualizar miembro:', error);
      throw error;
    }
  }

  // Eliminar miembro
  async deleteMiembro(id) {
    try {
      console.log(`🗑️ MiembrosService: Eliminando miembro ID: ${id}`);
      
      const response = await apiClient.delete(`/miembros/${id}`);
      
      console.log('✅ MiembrosService: Miembro eliminado exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ MiembrosService: Error al eliminar miembro:', error);
      throw error;
    }
  }

  // Obtener estadísticas de miembros
  async getEstadisticas() {
    try {
      console.log('📊 MiembrosService: Obteniendo estadísticas');
      
      const response = await apiClient.get('/miembros/estadisticas');
      
      console.log('✅ MiembrosService: Estadísticas obtenidas exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ MiembrosService: Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // Buscar miembros (método auxiliar para búsqueda rápida)
  async searchMiembros(searchTerm, limit = 10) {
    try {
      console.log(`🔍 MiembrosService: Buscando miembros: "${searchTerm}"`);
      
      const params = {
        search: searchTerm,
        limit,
        sortBy: 'apellidos',
        sortOrder: 'ASC'
      };
      
      const response = await apiClient.get('/miembros', { params });
      
      console.log('✅ MiembrosService: Búsqueda completada');
      return response.data;
    } catch (error) {
      console.error('❌ MiembrosService: Error en búsqueda:', error);
      throw error;
    }
  }

  // Obtener miembros por grado
  async getMiembrosByGrado(grado) {
    try {
      console.log(`📋 MiembrosService: Obteniendo miembros por grado: ${grado}`);
      
      const params = {
        grado,
        sortBy: 'apellidos',
        sortOrder: 'ASC'
      };
      
      const response = await apiClient.get('/miembros', { params });
      
      console.log('✅ MiembrosService: Miembros por grado obtenidos');
      return response.data;
    } catch (error) {
      console.error('❌ MiembrosService: Error al obtener miembros por grado:', error);
      throw error;
    }
  }

  // Importar miembros desde Excel (para uso futuro)
  async importarMiembros(fileData) {
    try {
      console.log('📁 MiembrosService: Importando miembros desde Excel');
      
      const formData = new FormData();
      formData.append('archivo', fileData);
      
      const response = await apiClient.post('/miembros/importar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ MiembrosService: Importación completada');
      return response.data;
    } catch (error) {
      console.error('❌ MiembrosService: Error en importación:', error);
      throw error;
    }
  }

  // Validar RUT chileno
  validateRUT(rut) {
    if (!rut) return false;
    
    // Limpiar RUT
    const cleanRUT = rut.replace(/[^0-9kK]/g, '');
    
    if (cleanRUT.length < 8 || cleanRUT.length > 9) return false;
    
    const body = cleanRUT.slice(0, -1);
    const dv = cleanRUT.slice(-1).toLowerCase();
    
    let sum = 0;
    let multiplier = 2;
    
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    const remainder = sum % 11;
    const calculatedDV = remainder === 0 ? '0' : remainder === 1 ? 'k' : (11 - remainder).toString();
    
    return dv === calculatedDV;
  }

  // Formatear RUT para mostrar
  formatRUT(rut) {
    if (!rut) return '';
    
    const clean = rut.replace(/[^0-9kK]/g, '');
    
    if (clean.length <= 1) return clean;
    
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);
    
    const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${formatted}-${dv}`;
  }

  // Validar email
  validateEmail(email) {
    if (!email) return true; // Email es opcional
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar datos del miembro antes de enviar
  validateMiembroData(data) {
    const errors = [];

    // Validaciones requeridas
    if (!data.nombres?.trim()) {
      errors.push('Los nombres son requeridos');
    }

    if (!data.apellidos?.trim()) {
      errors.push('Los apellidos son requeridos');
    }

    if (!data.rut?.trim()) {
      errors.push('El RUT es requerido');
    } else if (!this.validateRUT(data.rut)) {
      errors.push('El RUT no es válido');
    }

    // Validaciones opcionales
    if (data.email && !this.validateEmail(data.email)) {
      errors.push('El email no es válido');
    }

    if (data.grado && !['aprendiz', 'companero', 'maestro'].includes(data.grado)) {
      errors.push('El grado debe ser: aprendiz, compañero o maestro');
    }

    if (data.estado && !['activo', 'inactivo', 'suspendido', 'irradiado'].includes(data.estado)) {
      errors.push('El estado no es válido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Exportar instancia única
export const miembrosService = new MiembrosService();