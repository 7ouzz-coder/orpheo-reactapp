import api from './api';
import { ErrorReporting } from '../utils/errorReporting';

const MOCK_MIEMBROS = [
  {
    id: 1,
    nombres: "Juan Carlos",
    apellidos: "Pérez González",
    nombreCompleto: "Juan Carlos Pérez González",
    rut: "12.345.678-9",
    grado: "maestro",
    cargo: "venerable_maestro",
    email: "juan.perez@email.com",
    telefono: "+56 9 1234 5678",
    vigente: true,
    edad: 45,
    tieneUsuario: true,
    fechaIniciacion: "2020-03-15",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    nombres: "María Esperanza",
    apellidos: "Silva Torres",
    nombreCompleto: "María Esperanza Silva Torres",
    rut: "98.765.432-1",
    grado: "companero",
    cargo: null,
    email: "maria.silva@email.com",
    telefono: "+56 9 8765 4321",
    vigente: true,
    edad: 38,
    tieneUsuario: false,
    fechaIniciacion: "2021-08-20",
    createdAt: "2024-01-10T14:30:00Z",
    updatedAt: "2024-01-10T14:30:00Z"
  }
];

export const miembrosService = {
  // Obtener todos los miembros con filtros y paginación
  async getMiembros(params = {}) {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    data: MOCK_MIEMBROS,
    pagination: {
      page: 1,
      limit: 20,
      total: MOCK_MIEMBROS.length,
      totalPages: 1
    }
  };
},

  // Obtener un miembro por ID
  async getMiembroById(id) {
    try {
      const response = await api.get(`/miembros/${id}`);
      return response.data;
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

      // Limpiar y formatear datos
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
        trabajoNombre: miembroData.trabajoNombre?.trim() || null,
        trabajoDireccion: miembroData.trabajoDireccion?.trim() || null,
        trabajoTelefono: miembroData.trabajoTelefono?.trim() || null,
        trabajoEmail: miembroData.trabajoEmail?.trim() || null,
        parejaNombre: miembroData.parejaNombre?.trim() || null,
        parejaTelefono: miembroData.parejaTelefono?.trim() || null,
        contactoEmergenciaNombre: miembroData.contactoEmergenciaNombre?.trim() || null,
        contactoEmergenciaTelefono: miembroData.contactoEmergenciaTelefono?.trim() || null,
        fechaNacimiento: miembroData.fechaNacimiento || null,
        fechaIniciacion: miembroData.fechaIniciacion || null,
        fechaAumentoSalario: miembroData.fechaAumentoSalario || null,
        fechaExaltacion: miembroData.fechaExaltacion || null,
        situacionSalud: miembroData.situacionSalud?.trim() || null,
        observaciones: miembroData.observaciones?.trim() || null,
      };

      const response = await api.post('/miembros', cleanData);
      return response.data;
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'miembros_service_createMiembro',
        miembroData: { ...miembroData, rut: '[HIDDEN]' }, // Ocultar RUT en logs
      });
      throw error;
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
      return response.data;
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'miembros_service_updateMiembro',
        miembroId: id,
      });
      throw error;
    }
  },

  // Eliminar miembro (soft delete)
  async deleteMiembro(id) {
    try {
      const response = await api.delete(`/miembros/${id}`);
      return response.data;
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'miembros_service_deleteMiembro',
        miembroId: id,
      });
      throw error;
    }
  },

  // Obtener estadísticas de miembros
  async getEstadisticas() {
    try {
      const response = await api.get('/miembros/estadisticas');
      return response.data;
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'miembros_service_getEstadisticas',
      });
      throw error;
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
      return response.data;
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'miembros_service_importarMiembros',
        totalMiembros: miembrosData.length,
      });
      throw error;
    }
  },

  // Exportar miembros a Excel
  async exportarMiembros(filters = {}) {
    try {
      const queryString = new URLSearchParams({
        format: 'excel',
        ...(filters.search && { search: filters.search }),
        ...(filters.grado && filters.grado !== 'todos' && { grado: filters.grado }),
      }).toString();

      const response = await api.get(`/miembros/exportar?${queryString}`, {
        responseType: 'blob',
      });

      // Crear y descargar archivo
      const blob = new Blob([response.data], {
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
      throw error;
    }
  },

  // Buscar miembros (búsqueda rápida)
  async searchMiembros(query, limit = 10) {
    try {
      if (!query || query.trim().length < 2) {
        return { data: [] };
      }

      const response = await api.get(`/miembros/buscar?q=${encodeURIComponent(query.trim())}&limit=${limit}`);
      return response.data;
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'miembros_service_searchMiembros',
        query,
      });
      throw error;
    }
  },

  // Validar RUT único
  async validateRUT(rut, excludeId = null) {
    try {
      const params = new URLSearchParams({ rut: rut.trim() });
      if (excludeId) params.append('excludeId', excludeId);

      const response = await api.get(`/miembros/validate-rut?${params.toString()}`);
      return response.data;
    } catch (error) {
      ErrorReporting.captureException(error, {
        context: 'miembros_service_validateRUT',
        rut: '[HIDDEN]',
      });
      throw error;
    }
  },
};