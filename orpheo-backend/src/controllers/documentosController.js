const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Documento, User } = require('../models');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class DocumentosController {
  
  // GET /api/documentos - Obtener todos los documentos con filtros y paginación
  async getDocumentos(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const {
        page = 1,
        limit = 10,
        search = '',
        categoria = '',
        tipo = '',
        estado = '',
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      // Construir condiciones WHERE dinámicamente
      const whereConditions = {};

      // Filtro de búsqueda por nombre o descripción
      if (search) {
        whereConditions[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { descripcion: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Filtros específicos
      if (categoria) whereConditions.categoria = categoria;
      if (tipo) whereConditions.tipo = tipo;
      if (estado) whereConditions.estado = estado;

      // Permisos por grado: Aprendices solo ven documentos de su categoría o general
      if (req.user.grado === 'aprendiz') {
        whereConditions.categoria = { [Op.in]: ['aprendiz', 'general'] };
      } else if (req.user.grado === 'companero') {
        whereConditions.categoria = { [Op.in]: ['aprendiz', 'companero', 'general'] };
      }
      // Maestros pueden ver todo

      const offset = (page - 1) * limit;

      const { count, rows: documentos } = await Documento.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: 'autor',
            attributes: ['id', 'nombres', 'apellidos', 'grado']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const totalPages = Math.ceil(count / limit);

      logger.info(`Documentos consultados por usuario ${req.user.id}`, {
        userId: req.user.id,
        filters: { search, categoria, tipo, estado },
        totalResults: count
      });

      res.status(200).json({
        success: true,
        data: {
          documentos,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      logger.error('Error al obtener documentos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /api/documentos/estadisticas - Obtener estadísticas de documentos
  async getEstadisticas(req, res) {
    try {
      const whereCondition = {};

      // Aplicar restricciones de grado
      if (req.user.grado === 'aprendiz') {
        whereCondition.categoria = { [Op.in]: ['aprendiz', 'general'] };
      } else if (req.user.grado === 'companero') {
        whereCondition.categoria = { [Op.in]: ['aprendiz', 'companero', 'general'] };
      }

      const [
        totalDocumentos,
        documentosAprobados,
        documentosPendientes,
        documentosRechazados,
        planchasTotal,
        planchasPendientes
      ] = await Promise.all([
        Documento.count({ where: whereCondition }),
        Documento.count({ where: { ...whereCondition, estado: 'aprobado' } }),
        Documento.count({ where: { ...whereCondition, estado: 'pendiente' } }),
        Documento.count({ where: { ...whereCondition, estado: 'rechazado' } }),
        Documento.count({ where: { ...whereCondition, tipo: 'plancha' } }),
        Documento.count({ where: { ...whereCondition, tipo: 'plancha', estado: 'pendiente' } })
      ]);

      const estadisticasPorCategoria = await Documento.findAll({
        where: whereCondition,
        attributes: [
          'categoria',
          [require('sequelize').fn('COUNT', '*'), 'total']
        ],
        group: ['categoria'],
        raw: true
      });

      res.status(200).json({
        success: true,
        data: {
          totalDocumentos,
          documentosAprobados,
          documentosPendientes,
          documentosRechazados,
          planchasTotal,
          planchasPendientes,
          porcentajeAprobados: totalDocumentos > 0 ? ((documentosAprobados / totalDocumentos) * 100).toFixed(1) : 0,
          distribucionPorCategoria: estadisticasPorCategoria.reduce((acc, item) => {
            acc[item.categoria] = parseInt(item.total);
            return acc;
          }, {})
        }
      });

    } catch (error) {
      logger.error('Error al obtener estadísticas de documentos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /api/documentos/:id - Obtener un documento por ID
  async getDocumentoById(req, res) {
    try {
      const { id } = req.params;

      const documento = await Documento.findByPk(id, {
        include: [
          {
            model: User,
            as: 'autor',
            attributes: ['id', 'nombres', 'apellidos', 'grado']
          }
        ]
      });

      if (!documento) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado'
        });
      }

      // Verificar permisos de acceso según grado
      if (!this.canAccessDocument(req.user, documento)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este documento'
        });
      }

      // Incrementar contador de vistas
      await documento.update({ vistas: documento.vistas + 1 });

      res.status(200).json({
        success: true,
        data: documento
      });

    } catch (error) {
      logger.error('Error al obtener documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /api/documentos/:id/download - Descargar documento
  async downloadDocumento(req, res) {
    try {
      const { id } = req.params;

      const documento = await Documento.findByPk(id);

      if (!documento) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado'
        });
      }

      // Verificar permisos
      if (!this.canAccessDocument(req.user, documento)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para descargar este documento'
        });
      }

      const filePath = path.join(__dirname, '../../uploads', documento.ruta_archivo);
      
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado en el servidor'
        });
      }

      // Incrementar contador de descargas
      await documento.update({ descargas: documento.descargas + 1 });

      logger.info('Documento descargado', {
        documentoId: documento.id,
        usuarioId: req.user.id,
        nombreArchivo: documento.nombre_archivo
      });

      res.download(filePath, documento.nombre_archivo);

    } catch (error) {
      logger.error('Error al descargar documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/documentos - Subir nuevo documento
  async uploadDocumento(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo'
        });
      }

      const {
        nombre = req.file.originalname,
        descripcion = '',
        categoria = 'general',
        tipo = 'documento'
      } = req.body;

      // Verificar permisos para subir documentos de cierta categoría
      if (!this.canUploadToCategory(req.user, categoria)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para subir documentos a esta categoría'
        });
      }

      const nuevoDocumento = await Documento.create({
        nombre,
        descripcion,
        categoria,
        tipo,
        nombre_archivo: req.file.originalname,
        ruta_archivo: req.file.filename,
        tamano_archivo: req.file.size,
        tipo_mime: req.file.mimetype,
        estado: tipo === 'plancha' ? 'pendiente' : 'aprobado', // Planchas requieren aprobación
        autor_id: req.user.id,
        vistas: 0,
        descargas: 0
      });

      logger.info('Documento subido exitosamente', {
        documentoId: nuevoDocumento.id,
        autorId: req.user.id,
        nombreArchivo: req.file.originalname,
        categoria,
        tipo
      });

      // Si es una plancha, notificar a los maestros para moderación
      if (tipo === 'plancha') {
        const io = req.app.get('io');
        if (io) {
          io.emit('nueva_plancha_pendiente', {
            documentoId: nuevoDocumento.id,
            nombre: nuevoDocumento.nombre,
            autor: `${req.user.nombres} ${req.user.apellidos}`
          });
        }
      }

      res.status(201).json({
        success: true,
        message: 'Documento subido exitosamente',
        data: nuevoDocumento
      });

    } catch (error) {
      logger.error('Error al subir documento:', error);
      
      // Si hay error, eliminar el archivo subido
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          logger.error('Error al eliminar archivo tras fallo:', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // PUT /api/documentos/:id - Actualizar documento
  async updateDocumento(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const updateData = req.body;

      const documento = await Documento.findByPk(id);
      if (!documento) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado'
        });
      }

      // Verificar permisos para modificar
      if (!this.canModifyDocument(req.user, documento)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar este documento'
        });
      }

      await documento.update(updateData);

      logger.info('Documento actualizado exitosamente', {
        documentoId: documento.id,
        actualizadoPor: req.user.id,
        cambios: Object.keys(updateData)
      });

      res.status(200).json({
        success: true,
        message: 'Documento actualizado exitosamente',
        data: documento
      });

    } catch (error) {
      logger.error('Error al actualizar documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // DELETE /api/documentos/:id - Eliminar documento
  async deleteDocumento(req, res) {
    try {
      const { id } = req.params;

      const documento = await Documento.findByPk(id);
      if (!documento) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado'
        });
      }

      // Verificar permisos para eliminar
      if (!this.canDeleteDocument(req.user, documento)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar este documento'
        });
      }

      // Eliminar archivo físico
      const filePath = path.join(__dirname, '../../uploads', documento.ruta_archivo);
      try {
        await fs.unlink(filePath);
      } catch (fileError) {
        logger.warn('No se pudo eliminar el archivo físico:', fileError);
      }

      await documento.destroy();

      logger.info('Documento eliminado exitosamente', {
        documentoId: id,
        eliminadoPor: req.user.id,
        nombreArchivo: documento.nombre_archivo
      });

      // Notificar via WebSocket
      const io = req.app.get('io');
      if (io) {
        io.emit('documento_eliminado', {
          documentoId: id,
          nombre: documento.nombre,
          eliminadoPor: `${req.user.nombres} ${req.user.apellidos}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Documento eliminado exitosamente'
      });

    } catch (error) {
      logger.error('Error al eliminar documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/documentos/:id/moderar - Aprobar/rechazar plancha
  async moderarPlancha(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { estado, comentarios = '' } = req.body;

      const documento = await Documento.findByPk(id, {
        include: [
          {
            model: User,
            as: 'autor',
            attributes: ['id', 'nombres', 'apellidos', 'email']
          }
        ]
      });

      if (!documento) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado'
        });
      }

      if (documento.tipo !== 'plancha') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden moderar planchas'
        });
      }

      if (documento.estado !== 'pendiente') {
        return res.status(400).json({
          success: false,
          message: 'Esta plancha ya ha sido moderada'
        });
      }

      await documento.update({
        estado,
        comentarios_moderador: comentarios,
        moderado_por: req.user.id,
        fecha_moderado: new Date()
      });

      logger.info('Plancha moderada', {
        documentoId: documento.id,
        estado,
        moderadoPor: req.user.id,
        autorId: documento.autor_id
      });

      // Notificar al autor del resultado
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${documento.autor_id}`).emit('plancha_moderada', {
          documentoId: documento.id,
          nombre: documento.nombre,
          estado,
          comentarios,
          moderadoPor: `${req.user.nombres} ${req.user.apellidos}`
        });
      }

      res.status(200).json({
        success: true,
        message: `Plancha ${estado} exitosamente`,
        data: documento
      });

    } catch (error) {
      logger.error('Error al moderar plancha:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/documentos/:id/comentario - Agregar comentario a documento
  async addComentario(req, res) {
    try {
      const { id } = req.params;
      const { comentario } = req.body;

      if (!comentario || comentario.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El comentario es requerido'
        });
      }

      const documento = await Documento.findByPk(id);
      if (!documento) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado'
        });
      }

      // Verificar permisos de acceso
      if (!this.canAccessDocument(req.user, documento)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para comentar este documento'
        });
      }

      // Obtener comentarios existentes o crear array vacío
      const comentarios = documento.comentarios || [];
      const nuevoComentario = {
        id: Date.now(),
        usuario: `${req.user.nombres} ${req.user.apellidos}`,
        usuario_id: req.user.id,
        comentario: comentario.trim(),
        fecha: new Date(),
        grado: req.user.grado
      };

      comentarios.push(nuevoComentario);

      await documento.update({ comentarios });

      logger.info('Comentario agregado a documento', {
        documentoId: documento.id,
        usuarioId: req.user.id,
        comentarioId: nuevoComentario.id
      });

      res.status(201).json({
        success: true,
        message: 'Comentario agregado exitosamente',
        data: nuevoComentario
      });

    } catch (error) {
      logger.error('Error al agregar comentario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /api/documentos/busqueda-avanzada - Búsqueda avanzada
  async busquedaAvanzada(req, res) {
    try {
      const {
        texto,
        categoria,
        tipo,
        estado,
        fechaDesde,
        fechaHasta,
        autor,
        tags,
        page = 1,
        limit = 10
      } = req.query;

      const whereConditions = {};
      const includeConditions = [];

      // Filtro de texto en nombre, descripción y tags
      if (texto) {
        whereConditions[Op.or] = [
          { nombre: { [Op.iLike]: `%${texto}%` } },
          { descripcion: { [Op.iLike]: `%${texto}%` } }
        ];
      }

      // Filtros específicos
      if (categoria) whereConditions.categoria = categoria;
      if (tipo) whereConditions.tipo = tipo;
      if (estado) whereConditions.estado = estado;

      // Filtro de fechas
      if (fechaDesde || fechaHasta) {
        whereConditions.created_at = {};
        if (fechaDesde) whereConditions.created_at[Op.gte] = new Date(fechaDesde);
        if (fechaHasta) whereConditions.created_at[Op.lte] = new Date(fechaHasta);
      }

      // Filtro por autor
      if (autor) {
        includeConditions.push({
          model: User,
          as: 'autor',
          where: {
            [Op.or]: [
              { nombres: { [Op.iLike]: `%${autor}%` } },
              { apellidos: { [Op.iLike]: `%${autor}%` } }
            ]
          }
        });
      } else {
        includeConditions.push({
          model: User,
          as: 'autor',
          attributes: ['id', 'nombres', 'apellidos', 'grado']
        });
      }

      // Aplicar restricciones de grado
      if (req.user.grado === 'aprendiz') {
        whereConditions.categoria = { [Op.in]: ['aprendiz', 'general'] };
      } else if (req.user.grado === 'companero') {
        whereConditions.categoria = { [Op.in]: ['aprendiz', 'companero', 'general'] };
      }

      const offset = (page - 1) * limit;

      const { count, rows: documentos } = await Documento.findAndCountAll({
        where: whereConditions,
        include: includeConditions,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const totalPages = Math.ceil(count / limit);

      logger.info('Búsqueda avanzada realizada', {
        userId: req.user.id,
        parametros: { texto, categoria, tipo, estado, autor, tags },
        resultados: count
      });

      res.status(200).json({
        success: true,
        data: {
          documentos,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      logger.error('Error en búsqueda avanzada:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Métodos auxiliares para permisos
  canAccessDocument(user, document) {
    // SuperAdmin y Admin pueden ver todo
    if (['superadmin', 'admin'].includes(user.rol)) {
      return true;
    }

    // El autor siempre puede ver su documento
    if (document.autor_id === user.id) {
      return true;
    }

    // Verificar acceso por grado
    const gradoJerarquia = { aprendiz: 1, companero: 2, maestro: 3 };
    
    // Si el documento es general, todos pueden verlo
    if (document.categoria === 'general') {
      return true;
    }

    // Solo pueden ver documentos de su grado o menor
    return gradoJerarquia[user.grado] >= gradoJerarquia[document.categoria];
  }

  canModifyDocument(user, document) {
    // SuperAdmin y Admin pueden modificar todo
    if (['superadmin', 'admin'].includes(user.rol)) {
      return true;
    }

    // El autor puede modificar su documento si está pendiente
    return document.autor_id === user.id && document.estado === 'pendiente';
  }

  canDeleteDocument(user, document) {
    // Solo SuperAdmin y Admin pueden eliminar
    if (['superadmin', 'admin'].includes(user.rol)) {
      return true;
    }

    // El autor puede eliminar su documento si está pendiente
    return document.autor_id === user.id && document.estado === 'pendiente';
  }

  canUploadToCategory(user, categoria) {
    // SuperAdmin y Admin pueden subir a cualquier categoría
    if (['superadmin', 'admin'].includes(user.rol)) {
      return true;
    }

    // Todos pueden subir a general
    if (categoria === 'general') {
      return true;
    }

    // Solo pueden subir a su propia categoría de grado
    return user.grado === categoria;
  }
}

module.exports = new DocumentosController();