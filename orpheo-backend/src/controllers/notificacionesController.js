const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Notificacion, User } = require('../models');
const logger = require('../utils/logger');
const NotificationService = require('../services/notificationService');

const notificacionesController = {
  // Obtener notificaciones del usuario
  async getNotificaciones(req, res) {
    try {
      const { 
        includeRead = 'true',
        tipo,
        prioridad,
        page = 1, 
        limit = 50 
      } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Construir condiciones de búsqueda
      const where = { 
        usuario_id: req.user.id,
        expires_at: {
          [Op.or]: [
            null,
            { [Op.gt]: new Date() }
          ]
        }
      };
      
      // Filtros adicionales
      if (includeRead === 'false') {
        where.leido = false;
      }
      
      if (tipo && tipo !== 'todos') {
        where.tipo = tipo;
      }
      
      if (prioridad && prioridad !== 'todos') {
        where.prioridad = prioridad;
      }
      
      // Ejecutar consulta
      const { count, rows } = await Notificacion.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'remitente',
            attributes: ['id', 'username', 'member_full_name'],
            required: false
          }
        ],
        order: [
          ['prioridad', 'DESC'],
          ['created_at', 'DESC']
        ],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      // Formatear respuesta
      const notificaciones = rows.map(notif => ({
        id: notif.id,
        titulo: notif.titulo,
        mensaje: notif.mensaje,
        tipo: notif.tipo,
        prioridad: notif.prioridad,
        leido: notif.leido,
        leidoAt: notif.leido_at,
        accionUrl: notif.accion_url,
        accionTexto: notif.accion_texto,
        relacionadoTipo: notif.relacionado_tipo,
        relacionadoId: notif.relacionado_id,
        expiresAt: notif.expires_at,
        isExpired: notif.isExpired(),
        metadatos: notif.getMetadatos(),
        remitente: notif.remitente ? {
          id: notif.remitente.id,
          nombre: notif.remitente.member_full_name || notif.remitente.username
        } : null,
        createdAt: notif.created_at
      }));
      
      res.json({
        success: true,
        data: notificaciones,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
      
    } catch (error) {
      logger.error('Error al obtener notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Marcar notificación como leída
  async marcarComoLeida(req, res) {
    try {
      const { id } = req.params;
      
      const notificacion = await Notificacion.findOne({
        where: { 
          id, 
          usuario_id: req.user.id 
        }
      });
      
      if (!notificacion) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }
      
      await notificacion.markAsRead();
      
      res.json({
        success: true,
        message: 'Notificación marcada como leída'
      });
      
    } catch (error) {
      logger.error('Error al marcar notificación como leída:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Marcar todas las notificaciones como leídas
  async marcarTodasComoLeidas(req, res) {
    try {
      await Notificacion.markAllAsRead(req.user.id);
      
      res.json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas'
      });
      
    } catch (error) {
      logger.error('Error al marcar todas las notificaciones como leídas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener conteo de notificaciones no leídas
  async getConteoNoLeidas(req, res) {
    try {
      const count = await Notificacion.getUnreadCount(req.user.id);
      
      res.json({
        success: true,
        data: { count }
      });
      
    } catch (error) {
      logger.error('Error al obtener conteo de notificaciones no leídas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Crear notificación (solo para admins)
  async crearNotificacion(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { 
        titulo, 
        mensaje, 
        tipo, 
        prioridad,
        destinatario,
        gradoDestino,
        expiresAt,
        accionUrl,
        accionTexto,
        metadatos 
      } = req.body;

      let notificaciones = [];

      if (destinatario === 'todos') {
        // Crear para todos los usuarios activos
        const usuarios = await User.findAll({
          where: { is_active: true },
          attributes: ['id']
        });
        
        const usuarioIds = usuarios.map(user => user.id);
        notificaciones = await NotificationService.createForMultipleUsers(usuarioIds, {
          titulo,
          mensaje,
          tipo,
          prioridad,
          expiresAt,
          accionUrl,
          accionTexto,
          remitenteId: req.user.id,
          remitenteNombre: req.user.member_full_name || req.user.username,
          metadatos
        });
        
      } else if (destinatario === 'grado' && gradoDestino) {
        // Crear para usuarios de un grado específico
        notificaciones = await NotificationService.createForGrado(gradoDestino, {
          titulo,
          mensaje,
          tipo,
          prioridad,
          expiresAt,
          accionUrl,
          accionTexto,
          remitenteId: req.user.id,
          remitenteNombre: req.user.member_full_name || req.user.username,
          metadatos
        }, req.user.id);
        
      } else if (destinatario === 'admins') {
        // Crear para administradores
        notificaciones = await NotificationService.createForAdmins({
          titulo,
          mensaje,
          tipo,
          prioridad,
          expiresAt,
          accionUrl,
          accionTexto,
          remitenteId: req.user.id,
          remitenteNombre: req.user.member_full_name || req.user.username,
          metadatos
        }, req.user.id);
      }

      logger.info(`${notificaciones.length} notificaciones creadas por usuario ${req.user.username}`);

      res.status(201).json({
        success: true,
        message: `${notificaciones.length} notificaciones creadas exitosamente`,
        data: { count: notificaciones.length }
      });

    } catch (error) {
      logger.error('Error al crear notificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener estadísticas de notificaciones
  async getEstadisticas(req, res) {
    try {
      const stats = await NotificationService.getNotificationStats(req.user.id);
      
      res.json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      logger.error('Error al obtener estadísticas de notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Eliminar notificación
  async eliminarNotificacion(req, res) {
    try {
      const { id } = req.params;
      
      const notificacion = await Notificacion.findOne({
        where: { 
          id, 
          usuario_id: req.user.id 
        }
      });
      
      if (!notificacion) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }
      
      await notificacion.destroy();
      
      res.json({
        success: true,
        message: 'Notificación eliminada exitosamente'
      });
      
    } catch (error) {
      logger.error('Error al eliminar notificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = notificacionesController;