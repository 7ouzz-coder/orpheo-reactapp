const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { Documento, User } = require('../models');
const logger = require('../utils/logger');
const { canViewGrado, hasPermission, canPerformCRUD } = require('../utils/permissions');
const NotificationService = require('../services/notificationService');

const documentosController = {
  // Obtener todos los documentos
  async getDocumentos(req, res) {
    try {
      const { 
        categoria, 
        tipo, 
        esplancha, 
        search, 
        page = 1, 
        limit = 20, 
        sortBy = 'created_at', 
        sortOrder = 'DESC' 
      } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Construir condiciones de búsqueda
      const where = { activo: true };
      
      // Filtro por categoría con permisos
      if (categoria && categoria !== 'todos') {
        if (!canViewGrado(req.user.grado, categoria)) {
          return res.status(403).json({
            success: false,
            message: 'No tiene permisos para ver documentos de esta categoría'
          });
        }
        where.categoria = categoria;
      } else {
        // Aplicar filtros por permisos de grado
        const allowedCategorias = [];
        if (canViewGrado(req.user.grado, 'aprendiz')) allowedCategorias.push('aprendiz');
        if (canViewGrado(req.user.grado, 'companero')) allowedCategorias.push('companero');
        if (canViewGrado(req.user.grado, 'maestro')) allowedCategorias.push('maestro');
        allowedCategorias.push('general', 'administrativo'); // Todos pueden ver documentos generales
        
        where.categoria = { [Op.in]: allowedCategorias };
      }
      
      // Filtro por tipo de archivo
      if (tipo && tipo !== 'todos') {
        where.tipo = tipo;
      }
      
      // Filtro por planchas
      if (esplancha === 'true') {
        where.es_plancha = true;
      } else if (esplancha === 'false') {
        where.es_plancha = false;
      }
      
      // Búsqueda por texto
      if (search) {
        where[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { descripcion: { [Op.iLike]: `%${search}%` } },
          { palabras_clave: { [Op.iLike]: `%${search}%` } },
          { autor_nombre: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      // Ejecutar consulta
      const { count, rows } = await Documento.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'autor',
            attributes: ['id', 'username', 'member_full_name'],
            required: false
          },
          {
            model: User,
            as: 'subidoPor',
            attributes: ['id', 'username', 'member_full_name'],
            required: false
          }
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      // Formatear respuesta
      const documentos = rows.map(doc => ({
        id: doc.id,
        nombre: doc.nombre,
        tipo: doc.tipo,
        descripcion: doc.descripcion,
        tamano: doc.tamano,
        tamanoFormateado: doc.getTamanoFormateado(),
        categoria: doc.categoria,
        subcategoria: doc.subcategoria,
        palabrasClave: doc.palabras_clave,
        esPlancha: doc.es_plancha,
        planchaId: doc.plancha_id,
        planchaEstado: doc.plancha_estado,
        version: doc.version,
        descargas: doc.descargas,
        visualizaciones: doc.visualizaciones,
        autor: doc.autor ? {
          id: doc.autor.id,
          nombre: doc.autor.member_full_name || doc.autor.username
        } : null,
        subidoPor: doc.subidoPor ? {
          id: doc.subidoPor.id,
          nombre: doc.subidoPor.member_full_name || doc.subidoPor.username
        } : null,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at
      }));
      
      res.json({
        success: true,
        data: documentos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
      
    } catch (error) {
      logger.error('Error al obtener documentos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener un documento por ID
  async getDocumentoById(req, res) {
    try {
      const { id } = req.params;
      
      const documento = await Documento.findByPk(id, {
        include: [
          {
            model: User,
            as: 'autor',
            attributes: ['id', 'username', 'member_full_name', 'email']
          },
          {
            model: User,
            as: 'subidoPor',
            attributes: ['id', 'username', 'member_full_name']
          }
        ]
      });
      
      if (!documento || !documento.activo) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado'
        });
      }
      
      // Verificar permisos
      if (!canViewGrado(req.user.grado, documento.categoria)) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para ver este documento'
        });
      }
      
      // Incrementar visualizaciones
      await documento.incrementarVisualizaciones();
      
      res.json({
        success: true,
        data: {
          id: documento.id,
          nombre: documento.nombre,
          tipo: documento.tipo,
          descripcion: documento.descripcion,
          tamano: documento.tamano,
          tamanoFormateado: documento.getTamanoFormateado(),
          url: documento.url,
          categoria: documento.categoria,
          subcategoria: documento.subcategoria,
          palabrasClave: documento.palabras_clave,
          esPlancha: documento.es_plancha,
          planchaId: documento.plancha_id,
          planchaEstado: documento.plancha_estado,
          planchaComentarios: documento.plancha_comentarios,
          version: documento.version,
          descargas: documento.descargas,
          visualizaciones: documento.visualizaciones,
          autor: documento.autor ? {
            id: documento.autor.id,
            nombre: documento.autor.member_full_name || documento.autor.username,
            email: documento.autor.email
          } : null,
          subidoPor: documento.subidoPor ? {
            id: documento.subidoPor.id,
            nombre: documento.subidoPor.member_full_name || documento.subidoPor.username
          } : null,
          createdAt: documento.created_at,
          updatedAt: documento.updated_at
        }
      });
      
    } catch (error) {
      logger.error('Error al obtener documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Subir nuevo documento
  async uploadDocumento(req, res) {
    try {
      // Verificar permisos
      if (!hasPermission(req.user, 'upload_documents')) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para subir documentos'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      // Generar hash del archivo para verificar integridad
      const fileBuffer = await fs.readFile(req.file.path);
      const hashSum = crypto.createHash('sha256');
      hashSum.update(fileBuffer);
      const hex = hashSum.digest('hex');

      // Crear registro en base de datos
      const nuevoDocumento = await Documento.create({
        nombre: req.body.nombre || req.file.originalname,
        tipo: path.extname(req.file.originalname).slice(1).toLowerCase(),
        descripcion: req.body.descripcion,
        tamano: req.file.size,
        url: `/uploads/${req.file.filename}`,
        ruta_local: req.file.path,
        hash_archivo: hex,
        categoria: req.body.categoria,
        subcategoria: req.body.subcategoria,
        palabras_clave: req.body.palabrasClave,
        es_plancha: req.body.esPlancha === 'true',
        plancha_id: req.body.planchaId,
        autor_id: req.body.autorId || req.user.id,
        autor_nombre: req.body.autorNombre,
        subido_por_id: req.user.id,
        subido_por_nombre: req.user.member_full_name || req.user.username
      });

      logger.info(`Documento subido - ID: ${nuevoDocumento.id}, Archivo: ${req.file.originalname}`);

      // Emitir notificación en tiempo real
      const io = req.app.get('io');
      if (io) {
        io.emit('new_document', {
          type: 'new_document',
          data: {
            id: nuevoDocumento.id,
            nombre: nuevoDocumento.nombre,
            categoria: nuevoDocumento.categoria,
            autor: nuevoDocumento.autor_nombre
          }
        });
      }

      // Enviar notificación automática
      try {
        await NotificationService.notifyNewDocument(nuevoDocumento, req.user.id);
      } catch (notificationError) {
        logger.warn('Error al enviar notificación de nuevo documento:', notificationError);
      }

      res.status(201).json({
        success: true,
        message: 'Documento subido exitosamente',
        data: {
          id: nuevoDocumento.id,
          nombre: nuevoDocumento.nombre,
          tipo: nuevoDocumento.tipo,
          categoria: nuevoDocumento.categoria,
          tamano: nuevoDocumento.tamano
        }
      });

    } catch (error) {
      // Eliminar archivo si hay error
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          logger.error('Error al eliminar archivo:', unlinkError);
        }
      }

      logger.error('Error al subir documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Descargar documento
  async downloadDocumento(req, res) {
    try {
      const { id } = req.params;
      
      const documento = await Documento.findByPk(id);
      
      if (!documento || !documento.activo) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado'
        });
      }
      
      // Verificar permisos
      if (!canViewGrado(req.user.grado, documento.categoria)) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para descargar este documento'
        });
      }
      
      // Verificar que el archivo existe
      if (!documento.ruta_local) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no disponible'
        });
      }

      try {
        await fs.access(documento.ruta_local);
      } catch {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado en el servidor'
        });
      }

      // Incrementar contador de descargas
      await documento.incrementarDescargas();
      
      // Configurar headers para descarga
      res.setHeader('Content-Disposition', `attachment; filename="${documento.nombre}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      // Enviar archivo
      res.sendFile(path.resolve(documento.ruta_local));
      
      logger.info(`Documento descargado - ID: ${documento.id}, Usuario: ${req.user.username}`);
      
    } catch (error) {
      logger.error('Error al descargar documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener estadísticas de documentos
  async getEstadisticas(req, res) {
    try {
      const stats = {};

      // Estadísticas generales
      stats.total = await Documento.count({ where: { activo: true } });
      stats.totalInactivos = await Documento.count({ where: { activo: false } });

      // Por categoría
      const categoriaCounts = await Documento.findAll({
        attributes: [
          'categoria',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        where: { activo: true },
        group: ['categoria'],
        raw: true
      });

      stats.porCategoria = {
        aprendiz: 0,
        companero: 0,
        maestro: 0,
        general: 0,
        administrativo: 0
      };

      categoriaCounts.forEach(item => {
        stats.porCategoria[item.categoria] = parseInt(item.count);
      });

      // Por tipo de archivo
      const tipoCounts = await Documento.findAll({
        attributes: [
          'tipo',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        where: { activo: true },
        group: ['tipo'],
        raw: true
      });

      stats.porTipo = {};
      tipoCounts.forEach(item => {
        stats.porTipo[item.tipo] = parseInt(item.count);
      });

      // Planchas
      stats.planchas = {
        total: await Documento.count({ where: { es_plancha: true, activo: true } }),
        pendientes: await Documento.count({ where: { es_plancha: true, plancha_estado: 'pendiente', activo: true } }),
        aprobadas: await Documento.count({ where: { es_plancha: true, plancha_estado: 'aprobada', activo: true } }),
        rechazadas: await Documento.count({ where: { es_plancha: true, plancha_estado: 'rechazada', activo: true } })
      };

      // Estadísticas de uso
      const usoStats = await Documento.findAll({
        attributes: [
          [require('sequelize').fn('SUM', require('sequelize').col('descargas')), 'totalDescargas'],
          [require('sequelize').fn('SUM', require('sequelize').col('visualizaciones')), 'totalVisualizaciones']
        ],
        where: { activo: true },
        raw: true
      });

      stats.uso = {
        totalDescargas: parseInt(usoStats[0].totalDescargas) || 0,
        totalVisualizaciones: parseInt(usoStats[0].totalVisualizaciones) || 0
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Error al obtener estadísticas de documentos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Actualizar documento
  async updateDocumento(req, res) {
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
      if (!canPerformCRUD(req.user, 'documentos', 'update', documento)) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para actualizar este documento'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      // Actualizar documento
      await documento.update({
        nombre: req.body.nombre || documento.nombre,
        descripcion: req.body.descripcion !== undefined ? req.body.descripcion : documento.descripcion,
        categoria: req.body.categoria || documento.categoria,
        subcategoria: req.body.subcategoria !== undefined ? req.body.subcategoria : documento.subcategoria,
        palabras_clave: req.body.palabrasClave !== undefined ? req.body.palabrasClave : documento.palabras_clave,
        plancha_comentarios: req.body.planchaComentarios !== undefined ? req.body.planchaComentarios : documento.plancha_comentarios
      });

      logger.info(`Documento actualizado - ID: ${documento.id}`);

      res.json({
        success: true,
        message: 'Documento actualizado exitosamente',
        data: {
          id: documento.id,
          nombre: documento.nombre,
          descripcion: documento.descripcion,
          categoria: documento.categoria,
          updatedAt: documento.updated_at
        }
      });

    } catch (error) {
      logger.error('Error al actualizar documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Eliminar documento
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

      // Verificar permisos
      if (!canPerformCRUD(req.user, 'documentos', 'delete', documento)) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para eliminar este documento'
        });
      }

      // Soft delete - marcar como inactivo
      await documento.update({ activo: false });

      logger.info(`Documento eliminado (soft delete) - ID: ${documento.id}`);

      res.json({
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
  },

  // Aprobar/rechazar plancha
  async moderarPlancha(req, res) {
    try {
      const { id } = req.params;
      const { estado, comentarios } = req.body;
      
      // Verificar permisos
      if (!hasPermission(req.user, 'approve_planchas')) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para moderar planchas'
        });
      }

      const documento = await Documento.findByPk(id);
      if (!documento || !documento.es_plancha) {
        return res.status(404).json({
          success: false,
          message: 'Plancha no encontrada'
        });
      }

      if (!['aprobada', 'rechazada'].includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido. Debe ser "aprobada" o "rechazada"'
        });
      }

      await documento.update({
        plancha_estado: estado,
        plancha_comentarios: comentarios
      });

      logger.info(`Plancha ${estado} - ID: ${documento.id}, Moderador: ${req.user.username}`);

      // Notificar al autor
      const io = req.app.get('io');
      if (io && documento.autor_id) {
        io.to(`user_${documento.autor_id}`).emit('plancha_moderated', {
          type: 'plancha_moderated',
          data: {
            planchaId: documento.id,
            nombre: documento.nombre,
            estado: estado,
            comentarios: comentarios
          }
        });
      }

      // Enviar notificación automática
      try {
        await NotificationService.notifyPlanchaModerated(documento, estado, comentarios, req.user.id);
      } catch (notificationError) {
        logger.warn('Error al enviar notificación de plancha moderada:', notificationError);
      }

      res.json({
        success: true,
        message: `Plancha ${estado} exitosamente`,
        data: {
          id: documento.id,
          estado: estado,
          comentarios: comentarios
        }
      });

    } catch (error) {
      logger.error('Error al moderar plancha:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = documentosController;