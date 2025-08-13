const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Notificacion, User } = require('../models');
const logger = require('../utils/logger');

class NotificacionesController {

  // GET /api/notificaciones - Obtener notificaciones del usuario con filtros
  async getNotificaciones(req, res) {
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
        includeRead = 'false',
        tipo = 'todos',
        prioridad = 'todos',
        page = 1,
        limit = 20
      } = req.query;

      // Construir condiciones WHERE
      const whereConditions = {
        usuario_id: req.user.id
      };

      // Filtro de leídas/no leídas
      if (includeRead === 'false') {
        whereConditions.leido = false;
      }

      // Filtro por tipo
      if (tipo !== 'todos') {
        whereConditions.tipo = tipo;
      }

      // Filtro por prioridad
      if (prioridad !== 'todos') {
        whereConditions.prioridad = prioridad;
      }

      // Filtrar notificaciones no expiradas
      whereConditions[Op.or] = [
        { expires_at: null },
        { expires_at: { [Op.gt]: new Date() } }
      ];

      // Calcular offset
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Realizar consulta
      const { count, rows: notificaciones } = await Notificacion.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: 'remitente',
            attributes: ['id', 'nombres', 'apellidos'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset,
        order: [
          ['prioridad', 'DESC'], // Urgente primero
          ['created_at', 'DESC']
        ]
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          notificaciones,
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
      logger.error('Error obteniendo notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /api/notificaciones/count - Obtener conteo de notificaciones no leídas
  async getConteoNoLeidas(req, res) {
    try {
      const count = await Notificacion.count({
        where: {
          usuario_id: req.user.id,
          leido: false,
          [Op.or]: [
            { expires_at: null },
            { expires_at: { [Op.gt]: new Date() } }
          ]
        }
      });

      res.status(200).json({
        success: true,
        data: {
          no_leidas: count
        }
      });

    } catch (error) {
      logger.error('Error obteniendo conteo de notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /api/notificaciones/estadisticas - Obtener estadísticas de notificaciones
  async getEstadisticas(req, res) {
    try {
      const userId = req.user.id;

      // Total de notificaciones
      const total = await Notificacion.count({
        where: { usuario_id: userId }
      });

      // Notificaciones no leídas
      const noLeidas = await Notificacion.count({
        where: { 
          usuario_id: userId,
          leido: false,
          [Op.or]: [
            { expires_at: null },
            { expires_at: { [Op.gt]: new Date() } }
          ]
        }
      });

      // Notificaciones por tipo
      const porTipo = await Notificacion.findAll({
        where: { usuario_id: userId },
        attributes: [
          'tipo',
          [Notificacion.sequelize.fn('COUNT', Notificacion.sequelize.col('id')), 'count']
        ],
        group: ['tipo']
      });

      // Notificaciones por prioridad
      const porPrioridad = await Notificacion.findAll({
        where: { usuario_id: userId },
        attributes: [
          'prioridad',
          [Notificacion.sequelize.fn('COUNT', Notificacion.sequelize.col('id')), 'count']
        ],
        group: ['prioridad']
      });

      res.status(200).json({
        success: true,
        data: {
          resumen: {
            total,
            no_leidas: noLeidas,
            leidas: total - noLeidas,
            porcentaje_leidas: total > 0 ? ((total - noLeidas) / total * 100).toFixed(1) : 0
          },
          distribucion: {
            por_tipo: porTipo.map(n => ({
              tipo: n.tipo,
              cantidad: parseInt(n.dataValues.count)
            })),
            por_prioridad: porPrioridad.map(n => ({
              prioridad: n.prioridad,
              cantidad: parseInt(n.dataValues.count)
            }))
          }
        }
      });

    } catch (error) {
      logger.error('Error obteniendo estadísticas de notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/notificaciones - Crear nueva notificación (solo admins)
  async crearNotificacion(req, res) {
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
        titulo,
        mensaje,
        tipo,
        prioridad = 'normal',
        destinatario,
        gradoDestino,
        expiresAt,
        accionUrl,
        accionTexto,
        metadatos
      } = req.body;

      // Determinar usuarios destinatarios
      let usuariosDestino = [];

      if (destinatario === 'todos') {
        usuariosDestino = await User.findAll({
          where: { estado: 'activo' },
          attributes: ['id']
        });
      } else if (destinatario === 'grado' && gradoDestino) {
        usuariosDestino = await User.findAll({
          where: { 
            grado: gradoDestino,
            estado: 'activo'
          },
          attributes: ['id']
        });
      } else if (destinatario === 'admins') {
        usuariosDestino = await User.findAll({
          where: { 
            rol: { [Op.in]: ['admin', 'superadmin'] },
            estado: 'activo'
          },
          attributes: ['id']
        });
      }

      if (usuariosDestino.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se encontraron usuarios destinatarios'
        });
      }

      // Crear notificaciones para todos los usuarios destinatarios
      const notificaciones = usuariosDestino.map(usuario => ({
        titulo: titulo.trim(),
        mensaje: mensaje.trim(),
        tipo,
        prioridad,
        usuario_id: usuario.id,
        remitente_tipo: 'user',
        remitente_id: req.user.id,
        remitente_nombre: `${req.user.nombres} ${req.user.apellidos}`,
        expires_at: expiresAt ? new Date(expiresAt) : null,
        accion_url: accionUrl?.trim(),
        accion_texto: accionTexto?.trim(),
        metadatos: metadatos || null
      }));

      const notificacionesCreadas = await Notificacion.bulkCreate(notificaciones);

      logger.audit('Notificaciones creadas masivamente', {
        cantidad: notificacionesCreadas.length,
        tipo,
        destinatario,
        creadoPor: req.user.id,
        ip: req.ip
      });

      // Emitir eventos WebSocket a cada usuario
      if (req.io) {
        usuariosDestino.forEach(usuario => {
          req.io.to(`user_${usuario.id}`).emit('nueva_notificacion', {
            id: notificacionesCreadas[0].id, // Usar el primer ID como referencia
            titulo,
            mensaje,
            tipo,
            prioridad,
            timestamp: new Date()
          });
        });
      }

      res.status(201).json({
        success: true,
        message: `Notificación enviada a ${notificacionesCreadas.length} usuarios`,
        data: {
          notificaciones_creadas: notificacionesCreadas.length,
          destinatarios: usuariosDestino.map(u => u.id)
        }
      });

    } catch (error) {
      logger.error('Error creando notificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // PUT /api/notificaciones/:id/read - Marcar notificación como leída
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

      if (notificacion.leido) {
        return res.status(200).json({
          success: true,
          message: 'Notificación ya estaba marcada como leída'
        });
      }

      await notificacion.update({
        leido: true,
        leido_at: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Notificación marcada como leída',
        data: notificacion
      });

    } catch (error) {
      logger.error('Error marcando notificación como leída:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // PUT /api/notificaciones/read-all - Marcar todas las notificaciones como leídas
  async marcarTodasComoLeidas(req, res) {
    try {
      const [updatedCount] = await Notificacion.update(
        {
          leido: true,
          leido_at: new Date()
        },
        {
          where: {
            usuario_id: req.user.id,
            leido: false
          }
        }
      );

      logger.audit('Todas las notificaciones marcadas como leídas', {
        userId: req.user.id,
        cantidad: updatedCount,
        ip: req.ip
      });

      res.status(200).json({
        success: true,
        message: `${updatedCount} notificaciones marcadas como leídas`,
        data: {
          notificaciones_actualizadas: updatedCount
        }
      });

    } catch (error) {
      logger.error('Error marcando todas las notificaciones como leídas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // DELETE /api/notificaciones/:id - Eliminar notificación
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

      logger.audit('Notificación eliminada', {
        notificacionId: id,
        userId: req.user.id,
        ip: req.ip
      });

      res.status(200).json({
        success: true,
        message: 'Notificación eliminada exitosamente'
      });

    } catch (error) {
      logger.error('Error eliminando notificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Métodos auxiliares para crear notificaciones del sistema

  // Crear notificación automática
  static async crearNotificacionAutomatica(data) {
    try {
      const notificacion = await Notificacion.create({
        titulo: data.titulo,
        mensaje: data.mensaje,
        tipo: data.tipo || 'sistema',
        prioridad: data.prioridad || 'normal',
        usuario_id: data.usuario_id,
        remitente_tipo: 'system',
        remitente_nombre: 'Sistema Orpheo',
        relacionado_tipo: data.relacionado_tipo || null,
        relacionado_id: data.relacionado_id || null,
        metadatos: data.metadatos || null
      });

      logger.info('Notificación automática creada', {
        notificacionId: notificacion.id,
        usuarioId: data.usuario_id,
        tipo: data.tipo
      });

      return notificacion;

    } catch (error) {
      logger.error('Error creando notificación automática:', error);
      throw error;
    }
  }

  // Crear notificación de bienvenida
  static async crearNotificacionBienvenida(usuario) {
    return this.crearNotificacionAutomatica({
      titulo: '¡Bienvenido a Orpheo!',
      mensaje: `Hola ${usuario.nombres}, bienvenido al sistema de gestión masónica Orpheo. Aquí podrás acceder a documentos, programas y mantenerte al día con las actividades de la logia.`,
      tipo: 'sistema',
      prioridad: 'normal',
      usuario_id: usuario.id,
      metadatos: {
        tipo_bienvenida: 'nuevo_usuario',
        fecha_registro: new Date()
      }
    });
  }

  // Crear notificación de nuevo programa
  static async crearNotificacionNuevoPrograma(programa, usuarios) {
    const notificaciones = usuarios.map(usuario => ({
      titulo: 'Nuevo Programa Programado',
      mensaje: `Se ha programado un nuevo programa: "${programa.tema}" para el ${new Date(programa.fecha).toLocaleDateString()}`,
      tipo: 'programa',
      prioridad: 'normal',
      usuario_id: usuario.id,
      remitente_tipo: 'system',
      remitente_nombre: 'Sistema Orpheo',
      relacionado_tipo: 'programa',
      relacionado_id: programa.id,
      accion_url: `/programas/${programa.id}`,
      accion_texto: 'Ver Programa'
    }));

    await Notificacion.bulkCreate(notificaciones);
    logger.info(`Notificaciones de nuevo programa enviadas a ${usuarios.length} usuarios`);
  }

  // Crear notificación de documento aprobado
  static async crearNotificacionDocumentoAprobado(documento) {
    return this.crearNotificacionAutomatica({
      titulo: 'Documento Aprobado',
      mensaje: `Tu documento "${documento.nombre}" ha sido aprobado y ya está disponible para la comunidad.`,
      tipo: 'documento',
      prioridad: 'normal',
      usuario_id: documento.autor_id,
      relacionado_tipo: 'documento',
      relacionado_id: documento.id,
      accion_url: `/documentos/${documento.id}`,
      accion_texto: 'Ver Documento'
    });
  }

  // Crear notificación de recordatorio de programa
  static async crearNotificacionRecordatorioPrograma(programa, usuarios) {
    const fechaPrograma = new Date(programa.fecha);
    const notificaciones = usuarios.map(usuario => ({
      titulo: 'Recordatorio de Programa',
      mensaje: `Recordatorio: Mañana tienes programado "${programa.tema}" a las ${programa.hora_inicio}`,
      tipo: 'programa',
      prioridad: 'alta',
      usuario_id: usuario.id,
      remitente_tipo: 'system',
      remitente_nombre: 'Sistema Orpheo',
      relacionado_tipo: 'programa',
      relacionado_id: programa.id,
      expires_at: fechaPrograma,
      accion_url: `/programas/${programa.id}`,
      accion_texto: 'Ver Programa'
    }));

    await Notificacion.bulkCreate(notificaciones);
    logger.info(`Recordatorios de programa enviados a ${usuarios.length} usuarios`);
  }
}

module.exports = new NotificacionesController();