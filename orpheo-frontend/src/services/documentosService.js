import api, { handleApiError, createFormData } from './api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

class DocumentosService {
  // Obtener lista de documentos con filtros
  async getDocumentos(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Parámetros de paginación
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Filtros
      if (params.search) queryParams.append('search', params.search);
      if (params.categoria) queryParams.append('categoria', params.categoria);
      if (params.tipo) queryParams.append('tipo', params.tipo);
      if (params.estado) queryParams.append('estado', params.estado);
      
      // Ordenamiento
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await api.get(`/documentos?${queryParams.toString()}`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      }

      return {
        success: false,
        message: response.data.message || 'Error al obtener documentos'
      };

    } catch (error) {
      return handleApiError(error, 'Error al cargar la lista de documentos');
    }
  }

  // Obtener estadísticas de documentos
  async getEstadisticas() {
    try {
      const response = await api.get('/documentos/estadisticas');

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
      return handleApiError(error, 'Error al cargar estadísticas de documentos');
    }
  }

  // Obtener un documento por ID
  async getDocumentoById(id) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'ID de documento requerido'
        };
      }

      const response = await api.get(`/documentos/${id}`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      }

      return {
        success: false,
        message: response.data.message || 'Documento no encontrado'
      };

    } catch (error) {
      return handleApiError(error, 'Error al obtener información del documento');
    }
  }

  // Subir nuevo documento
  async uploadDocumento(documentoData, progressCallback = null) {
    try {
      // Validar datos antes de enviar
      const validation = this.validateDocumentoData(documentoData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos inválidos',
          errors: validation.errors
        };
      }

      const formData = createFormData(documentoData, 'archivo');

      const response = await api.post('/documentos', formData, {
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
          message: response.data.message || 'Documento subido exitosamente'
        };
      }

      return {
        success: false,
        message: response.data.message || 'Error al subir documento',
        errors: response.data.errors || []
      };

    } catch (error) {
      return handleApiError(error, 'Error al subir documento');
    }
  }

  // Actualizar documento existente
  async updateDocumento(id, documentoData) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'ID de documento requerido'
        };
      }

      const response = await api.put(`/documentos/${id}`, documentoData);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Documento actualizado exitosamente'
        };
      }

      return {
        success: false,
        message: response.data.message || 'Error al actualizar documento',
        errors: response.data.errors || []
      };

    } catch (error) {
      return handleApiError(error, 'Error al actualizar documento');
    }
  }

  // Eliminar documento
  async deleteDocumento(id) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'ID de documento requerido'
        };
      }

      const response = await api.delete(`/documentos/${id}`);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Documento eliminado exitosamente'
        };
      }

      return {
        success: false,
        message: response.data.message || 'Error al eliminar documento'
      };

    } catch (error) {
      return handleApiError(error, 'Error al eliminar documento');
    }
  }

  // Descargar documento
  async downloadDocumento(id, nombre = 'documento') {
    try {
      if (!id) {
        return {
          success: false,
          message: 'ID de documento requerido'
        };
      }

      const response = await api.get(`/documentos/${id}/download`, {
        responseType: 'blob'
      });

      if (response.status === 200) {
        // En React Native/Expo, manejar la descarga
        const downloadResumable = FileSystem.createDownloadResumable(
          `${api.defaults.baseURL}/documentos/${id}/download`,
          FileSystem.documentDirectory + nombre,
          {
            headers: response.config.headers
          }
        );

        const result = await downloadResumable.downloadAsync();
        
        if (result && result.uri) {
          // Compartir el archivo descargado
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(result.uri);
          }

          return {
            success: true,
            message: 'Documento descargado exitosamente',
            data: { uri: result.uri }
          };
        }
      }

      return {
        success: false,
        message: 'Error al descargar documento'
      };

    } catch (error) {
      return handleApiError(error, 'Error al descargar documento');
    }
  }

  // Moderar plancha (aprobar/rechazar)
  async moderarPlancha(id, moderacionData) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'ID de documento requerido'
        };
      }

      const validation = this.validateModeracionData(moderacionData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos de moderación inválidos',
          errors: validation.errors
        };
      }

      const response = await api.post(`/documentos/${id}/moderar`, moderacionData);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Plancha moderada exitosamente'
        };
      }

      return {
        success: false,
        message: response.data.message || 'Error al moderar plancha',
        errors: response.data.errors || []
      };

    } catch (error) {
      return handleApiError(error, 'Error al moderar plancha');
    }
  }

  // Validar datos de documento
  validateDocumentoData(data) {
    const errors = {};

    // Validar archivo
    if (!data.archivo) {
      errors.archivo = 'El archivo es requerido';
    } else {
      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'text/plain'
      ];

      if (!allowedTypes.includes(data.archivo.type)) {
        errors.archivo = 'Tipo de archivo no permitido';
      }

      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (data.archivo.size > maxSize) {
        errors.archivo = 'El archivo es demasiado grande (máximo 10MB)';
      }
    }

    // Validar nombre (opcional, se puede usar el nombre del archivo)
    if (data.nombre && data.nombre.length > 255) {
      errors.nombre = 'El nombre no puede exceder 255 caracteres';
    }

    // Validar descripción
    if (data.descripcion && data.descripcion.length > 1000) {
      errors.descripcion = 'La descripción no puede exceder 1000 caracteres';
    }

    // Validar categoría
    const categoriasValidas = ['aprendiz', 'companero', 'maestro', 'general', 'administrativo'];
    if (data.categoria && !categoriasValidas.includes(data.categoria)) {
      errors.categoria = 'Categoría inválida';
    }

    // Validar tipo
    const tiposValidos = ['documento', 'plancha', 'acta', 'reglamento', 'ritual', 'otro'];
    if (data.tipo && !tiposValidos.includes(data.tipo)) {
      errors.tipo = 'Tipo de documento inválido';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validar datos de moderación
  validateModeracionData(data) {
    const errors = {};

    // Validar estado
    if (!data.estado) {
      errors.estado = 'El estado es requerido';
    } else if (!['aprobada', 'rechazada'].includes(data.estado)) {
      errors.estado = 'El estado debe ser "aprobada" o "rechazada"';
    }

    // Validar comentarios (opcional)
    if (data.comentarios && data.comentarios.length > 1000) {
      errors.comentarios = 'Los comentarios no pueden exceder 1000 caracteres';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Obtener extensión del archivo
  getFileExtension(filename) {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
  }

  // Verificar si es un archivo de imagen
  isImageFile(filename) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes(this.getFileExtension(filename));
  }

  // Verificar si es un archivo PDF
  isPDFFile(filename) {
    return this.getFileExtension(filename) === 'pdf';
  }

  // Verificar si es un archivo de Office
  isOfficeFile(filename) {
    const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    return officeExtensions.includes(this.getFileExtension(filename));
  }

  // Formatear tamaño de archivo
  formatFileSize(bytes) {
    if (!bytes) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Obtener icono según tipo de archivo
  getFileIcon(filename) {
    const extension = this.getFileExtension(filename);
    
    const icons = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '📽️',
      pptx: '📽️',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      txt: '📝'
    };
    
    return icons[extension] || '📁';
  }

  // Obtener color según categoría
  getCategoriaColor(categoria) {
    const colores = {
      aprendiz: '#10B981',     // Verde
      companero: '#F59E0B',    // Amarillo/Dorado
      maestro: '#8B5CF6',      // Púrpura
      general: '#6B7280',      // Gris
      administrativo: '#3B82F6' // Azul
    };
    return colores[categoria] || '#6B7280';
  }

  // Obtener color según estado
  getEstadoColor(estado) {
    const colores = {
      pendiente: '#F59E0B',    // Amarillo
      aprobado: '#10B981',     // Verde
      rechazado: '#EF4444'     // Rojo
    };
    return colores[estado] || '#6B7280';
  }

  // Obtener color según tipo
  getTipoColor(tipo) {
    const colores = {
      documento: '#6B7280',    // Gris
      plancha: '#8B5CF6',      // Púrpura
      acta: '#3B82F6',         // Azul
      reglamento: '#DC2626',   // Rojo
      ritual: '#7C2D12',       // Marrón
      otro: '#6B7280'          // Gris
    };
    return colores[tipo] || '#6B7280';
  }

  // Filtrar documentos por acceso del usuario
  filterByUserAccess(documentos, userGrado, userRol) {
    if (['superadmin', 'admin'].includes(userRol)) {
      return documentos;
    }

    const gradoJerarquia = { aprendiz: 1, companero: 2, maestro: 3 };
    const userLevel = gradoJerarquia[userGrado] || 0;

    return documentos.filter(documento => {
      // Documentos generales y administrativos son accesibles para todos
      if (['general', 'administrativo'].includes(documento.categoria)) {
        return true;
      }

      const documentoLevel = gradoJerarquia[documento.categoria] || 0;
      return userLevel >= documentoLevel;
    });
  }

  // Generar resumen de documento para notificaciones
  generateDocumentSummary(documento) {
    return {
      id: documento.id,
      nombre: documento.nombre,
      tipo: documento.tipo,
      categoria: documento.categoria,
      estado: documento.estado,
      autor: documento.autor ? `${documento.autor.nombres} ${documento.autor.apellidos}` : 'Desconocido',
      tamano: this.formatFileSize(documento.tamano_archivo),
      fecha: documento.created_at
    };
  }

  // Obtener tipos de archivo permitidos para UI
  getAllowedFileTypes() {
    return [
      { type: 'application/pdf', extension: 'pdf', label: 'PDF' },
      { type: 'application/msword', extension: 'doc', label: 'Word 97-2003' },
      { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extension: 'docx', label: 'Word' },
      { type: 'application/vnd.ms-excel', extension: 'xls', label: 'Excel 97-2003' },
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension: 'xlsx', label: 'Excel' },
      { type: 'application/vnd.ms-powerpoint', extension: 'ppt', label: 'PowerPoint 97-2003' },
      { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', extension: 'pptx', label: 'PowerPoint' },
      { type: 'image/jpeg', extension: 'jpg', label: 'JPEG' },
      { type: 'image/png', extension: 'png', label: 'PNG' },
      { type: 'text/plain', extension: 'txt', label: 'Texto' }
    ];
  }

  // Obtener configuración de categorías
  getCategorias() {
    return [
      { value: 'general', label: 'General', description: 'Accesible para todos los grados' },
      { value: 'aprendiz', label: 'Aprendiz', description: 'Solo para Aprendices' },
      { value: 'companero', label: 'Compañero', description: 'Para Compañeros y superiores' },
      { value: 'maestro', label: 'Maestro', description: 'Solo para Maestros' },
      { value: 'administrativo', label: 'Administrativo', description: 'Documentos administrativos' }
    ];
  }

  // Obtener configuración de tipos
  getTipos() {
    return [
      { value: 'documento', label: 'Documento', description: 'Documento general' },
      { value: 'plancha', label: 'Plancha', description: 'Plancha masónica (requiere moderación)' },
      { value: 'acta', label: 'Acta', description: 'Acta de reunión' },
      { value: 'reglamento', label: 'Reglamento', description: 'Reglamento oficial' },
      { value: 'ritual', label: 'Ritual', description: 'Ritual masónico' },
      { value: 'otro', label: 'Otro', description: 'Otro tipo de documento' }
    ];
  }
}

export default new DocumentosService();