import api from './api';
import { ErrorReporting } from '../utils/errorReporting';

export const miembrosService = {
  // Obtener todos los miembros con filtros y paginación
  async getMiembros(params = {}) {
    try {
      const response = await api.get('/miembros', { params });
      return response; // El backend ya devuelve { success: true, data: [], pagination: {} }
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'miembros_service_getMiembros',
        params,
      });
      throw error;
    }
  },

  // Obtener un miembro por ID
  async getMiembroById(id) {
    try {
      const response = await api.get(`/miembros/${id}`);
      return response; // El backend devuelve { success: true, data: miembro }
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'miembros_service_getMiembroById',
        miembroId: id,
      });
      throw error;
    }
  },

  // Crear nuevo miembro
  async createMiembro(miembroData) {
    try {
      // Validar datos obligatorios
      const requiredFields = ['nombres', 'apellidos', 'rut', 'grado'];
      const missingFields = requiredFields.filter(field => !miembroData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos obligatorios faltantes: ${missingFields.join(', ')}`);
      }

      // Limpiar y formatear datos - mapear a formato del backend
      const cleanData = {
        nombres: miembroData.nombres.trim(),
        apellidos: miembroData.apellidos.trim(),
        rut: miembroData.rut.trim(),
        grado: miembroData.grado,
        cargo: miembroData.cargo?.trim() || null,
        email: miembroData.email?.trim() || null,
        telefono: miembroData.telefono?.trim() || null,
        direccion: miembroData.direccion?.trim() || null,
        profesion: miembroData.profesion?.trim() || null,
        ocupacion: miembroData.ocupacion?.trim() || null,
        
        // Mapear campos de trabajo (frontend -> backend)
        trabajoNombre: miembroData.trabajoNombre?.trim() || null,
        trabajoDireccion: miembroData.trabajoDireccion?.trim() || null,
        trabajoTelefono: miembroData.trabajoTelefono?.trim() || null,
        trabajoEmail: miembroData.trabajoEmail?.trim() || null,
        
        // Mapear campos familiares
        parejaNombre: miembroData.parejaNombre?.trim() || null,
        parejaTelefono: miembroData.parejaTelefono?.trim() || null,
        contactoEmergenciaNombre: miembroData.contactoEmergenciaNombre?.trim() || null,
        contactoEmergenciaTelefono: miembroData.contactoEmergenciaTelefono?.trim() || null,
        
        // Fechas
        fechaNacimiento: miembroData.fechaNacimiento || null,
        fechaIniciacion: miembroData.fechaIniciacion || null,
        fechaAumentoSalario: miembroData.fechaAumentoSalario || null,
        fechaExaltacion: miembroData.fechaExaltacion || null,
        
        // Información confidencial
        situacionSalud: miembroData.situacionSalud?.trim() || null,
        observaciones: miembroData.observaciones?.trim() || null,
      };

      const response = await api.post('/miembros', cleanData);
      return response; // Backend devuelve { success: true, data: miembro, message: '...' }
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'miembros_service_createMiembro',
        miembroData: { ...miembroData, rut: '[HIDDEN]' }, // Ocultar RUT en logs
      });
      
      // Manejar errores específicos del backend
      if (error.response?.status === 409) {
        throw new Error('Ya existe un miembro con este RUT');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Datos de entrada inválidos');
      } else if (error.response?.status === 403) {
        throw new Error('No tiene permisos para crear miembros');
      }
      
      throw new Error(error.response?.data?.message || 'Error al crear miembro');
    }
  },

  // Actualizar miembro
  async updateMiembro(id, miembroData) {
    try {
      // Limpiar y formatear datos (similar a createMiembro)
      const cleanData = Object.keys(miembroData).reduce((acc, key) => {
        const value = miembroData[key];
        if (typeof value === 'string') {
          acc[key] = value.trim() || null;
        } else {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await api.put(`/miembros/${id}`, cleanData);
      return response;
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'miembros_service_updateMiembro',
        miembroId: id,
      });
      
      if (error.response?.status === 404) {
        throw new Error('Miembro no encontrado');
      } else if (error.response?.status === 409) {
        throw new Error('Ya existe un miembro con este RUT');
      } else if (error.response?.status === 403) {
        throw new Error('No tiene permisos para actualizar miembros');
      }
      
      throw new Error(error.response?.data?.message || 'Error al actualizar miembro');
    }
  },

  // Eliminar miembro (soft delete)
  async deleteMiembro(id) {
    try {
      const response = await api.delete(`/miembros/${id}`);
      return response;
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'miembros_service_deleteMiembro',
        miembroId: id,
      });
      
      if (error.response?.status === 404) {
        throw new Error('Miembro no encontrado');
      } else if (error.response?.status === 403) {
        throw new Error('No tiene permisos para eliminar miembros');
      }
      
      throw new Error(error.response?.data?.message || 'Error al eliminar miembro');
    }
  },

  // Obtener estadísticas de miembros
  async getEstadisticas() {
    try {
      const response = await api.get('/miembros/estadisticas');
      return response;
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'miembros_service_getEstadisticas',
      });
      
      if (error.response?.status === 403) {
        throw new Error('No tiene permisos para ver estadísticas');
      }
      
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  // Importar miembros desde Excel
  async importarMiembros(miembrosData) {
    try {
      if (!Array.isArray(miembrosData) || miembrosData.length === 0) {
        throw new Error('Debe proporcionar un array de miembros válido');
      }

      // Validar estructura básica de cada miembro
      const validatedData = miembrosData.map((miembro, index) => {
        const requiredFields = ['nombres', 'apellidos', 'rut', 'grado'];
        const missingFields = requiredFields.filter(field => !miembro[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Fila ${index + 1}: Campos obligatorios faltantes: ${missingFields.join(', ')}`);
        }

        return {
          nombres: miembro.nombres.trim(),
          apellidos: miembro.apellidos.trim(),
          rut: miembro.rut.trim(),
          grado: miembro.grado,
          cargo: miembro.cargo?.trim() || null,
          email: miembro.email?.trim() || null,
          telefono: miembro.telefono?.trim() || null,
          direccion: miembro.direccion?.trim() || null,
          profesion: miembro.profesion?.trim() || null,
          fechaNacimiento: miembro.fechaNacimiento || null,
          fechaIniciacion: miembro.fechaIniciacion || null,
        };
      });

      const response = await api.post('/miembros/importar', {
        miembros: validatedData
      });
      return response; // Backend devuelve { success: true, data: { exitosos: N, errores: N, detalles: [] } }
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'miembros_service_importarMiembros',
        totalMiembros: miembrosData.length,
      });
      
      if (error.response?.status === 403) {
        throw new Error('No tiene permisos para importar miembros');
      }
      
      throw new Error(error.response?.data?.message || 'Error al importar miembros');
    }
  },

  // Exportar miembros a Excel
  async exportarMiembros(filters = {}) {
    try {
      const queryString = new URLSearchParams({
        format: 'excel',
        ...(filters.search && { search: filters.search }),
        ...(filters.grado && filters.grado !== 'todos' && { grado: filters.grado }),
        ...(filters.vigente !== undefined && { vigente: filters.vigente }),
      }).toString();

      const response = await api.get(`/miembros/exportar?${queryString}`, {
        responseType: 'blob',
      });

      // Crear y descargar archivo
      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `miembros_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Archivo descargado exitosamente' };
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'miembros_service_exportarMiembros',
        filters,
      });
      
      if (error.response?.status === 403) {
        throw new Error('No tiene permisos para exportar miembros');
      }
      
      throw new Error(error.response?.data?.message || 'Error al exportar miembros');
    }
  },

  // Buscar miembros (búsqueda rápida)
  async searchMiembros(query, limit = 10) {
    try {
      if (!query || query.trim().length < 2) {
        return { data: [] };
      }

      const response = await api.get('/miembros', {
        params: {
          search: query.trim(),
          limit,
          page: 1
        }
      });
      
      return {
        data: response.data || []
      };
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'miembros_service_searchMiembros',
        query,
      });
      throw error;
    }
  },

  // Validar RUT único (usando endpoint de búsqueda)
  async validateRUT(rut, excludeId = null) {
    try {
      const response = await api.get('/miembros', {
        params: {
          search: rut.trim(),
          limit: 1
        }
      });
      
      const existingMember = response.data?.find(m => m.rut === rut.trim());
      
      if (existingMember && existingMember.id !== excludeId) {
        return {
          isValid: false,
          message: 'Ya existe un miembro con este RUT',
          existingMember: existingMember
        };
      }
      
      return {
        isValid: true,
        message: 'RUT disponible'
      };
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'miembros_service_validateRUT',
        rut: '[HIDDEN]',
      });
      
      // En caso de error, permitir continuar
      return {
        isValid: true,
        message: 'No se pudo validar el RUT, pero puede continuar'
      };
    }
  },

  // Método auxiliar para formatear datos del backend al frontend
  formatMiembroFromBackend(miembro) {
    if (!miembro) return null;
    
    return {
      id: miembro.id,
      nombres: miembro.nombres,
      apellidos: miembro.apellidos,
      nombreCompleto: miembro.nombreCompleto || `${miembro.nombres} ${miembro.apellidos}`,
      rut: miembro.rut,
      grado: miembro.grado,
      cargo: miembro.cargo,
      email: miembro.email,
      telefono: miembro.telefono,
      direccion: miembro.direccion,
      profesion: miembro.profesion,
      ocupacion: miembro.ocupacion,
      
      // Información laboral
      trabajoNombre: miembro.trabajoNombre || miembro.trabajo_nombre,
      trabajoDireccion: miembro.trabajoDireccion || miembro.trabajo_direccion,
      trabajoTelefono: miembro.trabajoTelefono || miembro.trabajo_telefono,
      trabajoEmail: miembro.trabajoEmail || miembro.trabajo_email,
      
      // Información familiar
      parejaNombre: miembro.parejaNombre || miembro.pareja_nombre,
      parejaTelefono: miembro.parejaTelefono || miembro.pareja_telefono,
      contactoEmergenciaNombre: miembro.contactoEmergenciaNombre || miembro.contacto_emergencia_nombre,
      contactoEmergenciaTelefono: miembro.contactoEmergenciaTelefono || miembro.contacto_emergencia_telefono,
      
      // Fechas
      fechaNacimiento: miembro.fechaNacimiento || miembro.fecha_nacimiento,
      fechaIniciacion: miembro.fechaIniciacion || miembro.fecha_iniciacion,
      fechaAumentoSalario: miembro.fechaAumentoSalario || miembro.fecha_aumento_salario,
      fechaExaltacion: miembro.fechaExaltacion || miembro.fecha_exaltacion,
      
      // Información adicional
      situacionSalud: miembro.situacionSalud || miembro.situacion_salud,
      observaciones: miembro.observaciones,
      vigente: miembro.vigente,
      edad: miembro.edad,
      tieneUsuario: miembro.tieneUsuario || miembro.tiene_usuario,
      
      // Metadatos
      createdAt: miembro.createdAt || miembro.created_at,
      updatedAt: miembro.updatedAt || miembro.updated_at,
    };
  },

  // Método auxiliar para formatear múltiples miembros
  formatMiembrosFromBackend(miembros) {
    if (!Array.isArray(miembros)) return [];
    return miembros.map(miembro => this.formatMiembroFromBackend(miembro));
  }
};