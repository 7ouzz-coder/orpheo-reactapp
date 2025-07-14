import api, { handleApiError, createFormData } from './api';

class MiembrosService {
  // Obtener lista de miembros con filtros y paginación
  async getMiembros(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Parámetros de paginación
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Filtros
      if (params.search) queryParams.append('search', params.search);
      if (params.grado) queryParams.append('grado', params.grado);
      if (params.estado) queryParams.append('estado', params.estado);
      
      // Ordenamiento
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await api.get(`/miembros?${queryParams.toString()}`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      }

      return {
        success: false,
        message: response.data.message || 'Error al obtener miembros'
      };

    } catch (error) {
      return handleApiError(error, 'Error al cargar la lista de miembros');
    }
  }

  // Obtener estadísticas de miembros
  async getEstadisticas() {
    try {
      const response = await api.get('/miembros/estadisticas');

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      }

      return {
        success: false,
        message: response.data.message || 'Error al obtener estadísticas'
      };

    } catch (error) {
      return handleApiError(error, 'Error al cargar estadísticas de miembros');
    }
  }

  // Obtener un miembro por ID
  async getMiembroById(id) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'ID de miembro requerido'
        };
      }

      const response = await api.get(`/miembros/${id}`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      }

      return {
        success: false,
        message: response.data.message || 'Miembro no encontrado'
      };

    } catch (error) {
      return handleApiError(error, 'Error al obtener información del miembro');
    }
  }

  // Crear nuevo miembro
  async createMiembro(miembroData) {
    try {
      // Validar datos antes de enviar
      const validation = this.validateMiembroData(miembroData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos inválidos',
          errors: validation.errors
        };
      }

      const response = await api.post('/miembros', miembroData);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Miembro creado exitosamente'
        };
      }

      return {
        success: false,
        message: response.data.message || 'Error al crear miembro',
        errors: response.data.errors || []
      };

    } catch (error) {
      return handleApiError(error, 'Error al crear miembro');
    }
  }

  // Actualizar miembro existente
  async updateMiembro(id, miembroData) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'ID de miembro requerido'
        };
      }

      // Validar datos antes de enviar
      const validation = this.validateMiembroData(miembroData, true);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos inválidos',
          errors: validation.errors
        };
      }

      const response = await api.put(`/miembros/${id}`, miembroData);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Miembro actualizado exitosamente'
        };
      }

      return {
        success: false,
        message: response.data.message || 'Error al actualizar miembro',
        errors: response.data.errors || []
      };

    } catch (error) {
      return handleApiError(error, 'Error al actualizar miembro');
    }
  }

  // Eliminar miembro
  async deleteMiembro(id) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'ID de miembro requerido'
        };
      }

      const response = await api.delete(`/miembros/${id}`);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Miembro eliminado exitosamente'
        };
      }

      return {
        success: false,
        message: response.data.message || 'Error al eliminar miembro'
      };

    } catch (error) {
      return handleApiError(error, 'Error al eliminar miembro');
    }
  }

  // Importar miembros desde archivo Excel
  async importarMiembros(file, progressCallback = null) {
    try {
      if (!file) {
        return {
          success: false,
          message: 'Archivo requerido'
        };
      }

      const formData = createFormData({ archivo: file }, 'archivo');

      const response = await api.post('/miembros/importar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressCallback) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            progressCallback(percentCompleted);
          }
        },
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Importación completada'
        };
      }

      return {
        success: false,
        message: response.data.message || 'Error en la importación',
        errors: response.data.errors || []
      };

    } catch (error) {
      return handleApiError(error, 'Error al importar miembros');
    }
  }

  // Validar datos de miembro
  validateMiembroData(data, isUpdate = false) {
    const errors = {};

    // Campos requeridos (solo en creación o si están presentes en actualización)
    if (!isUpdate || data.nombres !== undefined) {
      if (!data.nombres || data.nombres.trim().length < 2) {
        errors.nombres = 'Los nombres son requeridos (mínimo 2 caracteres)';
      } else if (data.nombres.length > 100) {
        errors.nombres = 'Los nombres no pueden exceder 100 caracteres';
      }
    }

    if (!isUpdate || data.apellidos !== undefined) {
      if (!data.apellidos || data.apellidos.trim().length < 2) {
        errors.apellidos = 'Los apellidos son requeridos (mínimo 2 caracteres)';
      } else if (data.apellidos.length > 100) {
        errors.apellidos = 'Los apellidos no pueden exceder 100 caracteres';
      }
    }

    if (!isUpdate || data.rut !== undefined) {
      if (!data.rut) {
        errors.rut = 'El RUT es requerido';
      } else if (!this.validateRUT(data.rut)) {
        errors.rut = 'El formato del RUT es inválido';
      }
    }

    // Campos opcionales pero con validación si están presentes
    if (data.email && !this.validateEmail(data.email)) {
      errors.email = 'El formato del email es inválido';
    }

    if (data.telefono && !this.validateTelefono(data.telefono)) {
      errors.telefono = 'El formato del teléfono es inválido';
    }

    if (data.grado && !['aprendiz', 'companero', 'maestro'].includes(data.grado)) {
      errors.grado = 'El grado debe ser: aprendiz, companero o maestro';
    }

    if (data.estado && !['activo', 'inactivo', 'suspendido'].includes(data.estado)) {
      errors.estado = 'El estado debe ser: activo, inactivo o suspendido';
    }

    if (data.fecha_nacimiento) {
      const fechaNac = new Date(data.fecha_nacimiento);
      const hoy = new Date();
      if (fechaNac > hoy) {
        errors.fecha_nacimiento = 'La fecha de nacimiento no puede ser futura';
      }
      
      const edad = this.calculateAge(fechaNac);
      if (edad < 18) {
        errors.fecha_nacimiento = 'El miembro debe ser mayor de edad';
      }
    }

    if (data.fecha_ingreso) {
      const fechaIngreso = new Date(data.fecha_ingreso);
      const hoy = new Date();
      if (fechaIngreso > hoy) {
        errors.fecha_ingreso = 'La fecha de ingreso no puede ser futura';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validar RUT chileno
  validateRUT(rut) {
    if (!rut) return false;
    
    // Remover puntos y guiones, convertir a mayúsculas
    const rutLimpio = rut.replace(/[.-]/g, '').toUpperCase();
    
    // Verificar formato básico
    if (!/^[0-9]+[0-9K]$/.test(rutLimpio)) return false;
    if (rutLimpio.length < 8 || rutLimpio.length > 9) return false;
    
    // Separar número y dígito verificador
    const rutNumero = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);
    
    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = rutNumero.length - 1; i >= 0; i--) {
      suma += parseInt(rutNumero[i]) * multiplicador;
      multiplicador = multiplicador < 7 ? multiplicador + 1 : 2;
    }
    
    const resto = suma % 11;
    const dvCalculado = resto < 2 ? resto.toString() : resto === 11 ? '0' : 'K';
    
    return dv === dvCalculado;
  }

  // Validar email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar teléfono chileno
  validateTelefono(telefono) {
    // Aceptar formatos: +56912345678, 56912345678, 912345678, 912345678
    const telefonoRegex = /^(\+?56)?[2-9]\d{8}$|^(\+?56)?9\d{8}$/;
    const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
    return telefonoRegex.test(telefonoLimpio);
  }

  // Calcular edad
  calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  // Formatear RUT para mostrar
  formatRUT(rut) {
    if (!rut) return '';
    
    const rutLimpio = rut.replace(/[.-]/g, '');
    if (rutLimpio.length < 8) return rut;
    
    const rutNumero = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);
    
    // Agregar puntos cada 3 dígitos desde la derecha
    const rutFormateado = rutNumero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${rutFormateado}-${dv}`;
  }

  // Formatear teléfono para mostrar
  formatTelefono(telefono) {
    if (!telefono) return '';
    
    const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
    
    // Formato para móviles: +56 9 1234 5678
    if (telefonoLimpio.length === 11 && telefonoLimpio.startsWith('569')) {
      return `+56 9 ${telefonoLimpio.slice(3, 7)} ${telefonoLimpio.slice(7)}`;
    }
    
    // Formato para fijos: +56 2 1234 5678
    if (telefonoLimpio.length === 10 && telefonoLimpio.startsWith('56')) {
      return `+56 ${telefonoLimpio.slice(2, 3)} ${telefonoLimpio.slice(3, 7)} ${telefonoLimpio.slice(7)}`;
    }
    
    return telefono;
  }

  // Obtener nombre completo
  getNombreCompleto(miembro) {
    if (!miembro) return '';
    return `${miembro.nombres} ${miembro.apellidos}`.trim();
  }

  // Obtener años en la logia
  getAnosEnLogia(fechaIngreso) {
    if (!fechaIngreso) return 0;
    
    const hoy = new Date();
    const ingreso = new Date(fechaIngreso);
    let anos = hoy.getFullYear() - ingreso.getFullYear();
    const monthDiff = hoy.getMonth() - ingreso.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && hoy.getDate() < ingreso.getDate())) {
      anos--;
    }
    
    return Math.max(0, anos);
  }

  // Obtener color del grado
  getGradoColor(grado) {
    const colores = {
      aprendiz: '#10B981', // Verde
      companero: '#F59E0B', // Amarillo/Dorado
      maestro: '#8B5CF6'    // Púrpura
    };
    return colores[grado] || '#6B7280';
  }

  // Obtener icono del grado
  getGradoIcon(grado) {
    const iconos = {
      aprendiz: '🔨',
      companero: '⚒️',
      maestro: '👑'
    };
    return iconos[grado] || '👤';
  }

  // Filtrar miembros por grado accesible para el usuario
  filterByUserAccess(miembros, userGrado, userRol) {
    if (['superadmin', 'admin'].includes(userRol)) {
      return miembros;
    }

    const gradoJerarquia = { aprendiz: 1, companero: 2, maestro: 3 };
    const userLevel = gradoJerarquia[userGrado] || 0;

    return miembros.filter(miembro => {
      const miembroLevel = gradoJerarquia[miembro.grado] || 0;
      return userLevel >= miembroLevel;
    });
  }

  // Generar datos para importación de ejemplo
  generateImportTemplate() {
    return [
      {
        nombres: 'Juan Carlos',
        apellidos: 'Pérez González',
        rut: '12345678-9',
        email: 'juan.perez@email.com',
        telefono: '+56912345678',
        grado: 'aprendiz',
        estado: 'activo',
        fecha_ingreso: '2024-01-15',
        fecha_nacimiento: '1985-05-20',
        direccion: 'Av. Providencia 1234, Santiago',
        ciudad_nacimiento: 'Santiago',
        profesion: 'Ingeniero'
      },
      {
        nombres: 'María Elena',
        apellidos: 'Rodríguez Silva',
        rut: '23456789-0',
        email: 'maria.rodriguez@email.com',
        telefono: '+56987654321',
        grado: 'companero',
        estado: 'activo',
        fecha_ingreso: '2023-06-10',
        fecha_nacimiento: '1980-11-15',
        direccion: 'Calle Los Robles 567, Las Condes',
        ciudad_nacimiento: 'Valparaíso',
        profesion: 'Médico'
      }
    ];
  }

  // Generar resumen de miembro para notificaciones
  generateMemberSummary(miembro) {
    return {
      id: miembro.id,
      nombre: this.getNombreCompleto(miembro),
      rut: this.formatRUT(miembro.rut),
      grado: miembro.grado,
      estado: miembro.estado,
      email: miembro.email,
      telefono: this.formatTelefono(miembro.telefono)
    };
  }

  // Exportar configuración de columnas para Excel
  getExportColumns() {
    return [
      { key: 'nombres', label: 'Nombres', width: 20 },
      { key: 'apellidos', label: 'Apellidos', width: 20 },
      { key: 'rut', label: 'RUT', width: 15 },
      { key: 'email', label: 'Email', width: 25 },
      { key: 'telefono', label: 'Teléfono', width: 15 },
      { key: 'grado', label: 'Grado', width: 12 },
      { key: 'estado', label: 'Estado', width: 12 },
      { key: 'fecha_ingreso', label: 'Fecha Ingreso', width: 15 },
      { key: 'fecha_nacimiento', label: 'Fecha Nacimiento', width: 15 },
      { key: 'profesion', label: 'Profesión', width: 20 },
      { key: 'ciudad_nacimiento', label: 'Ciudad Nacimiento', width: 20 }
    ];
  }
}

export default new MiembrosService();