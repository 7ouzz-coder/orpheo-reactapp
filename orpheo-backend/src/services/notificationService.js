const { Notificacion, User } = require('../models');
const logger = require('../utils/logger');
const { canViewGrado } = require('../utils/permissions');

class NotificationService {
  
  // Crear notificación para un usuario específico
  static async createForUser(usuarioId, data) {
    try {
      const notificacion = await Notificacion.createForUser(usuarioId, data);
      logger.info(`Notificación creada para usuario ${usuarioId}: ${data.titulo}`);
      return notificacion;
    } catch (error) {
      logger.error('Error al crear notificación:', error);
      throw error;
    }
  }

  // Crear notificación para múltiples usuarios
  static async createForMultipleUsers(usuarioIds, data) {
    try {
      const notificaciones = await Notificacion.createForMultipleUsers(usuarioIds, data);
      logger.info(`${notificaciones.length} notificaciones creadas: ${data.titulo}`);
      return notificaciones;
    } catch (error) {
      logger.error('Error al crear notificaciones múltiples:', error);
      throw error;
    }
  }

  // Crear notificación para todos los usuarios de un grado
  static async createForGrado(grado, data, excludeUserId = null) {
    try {
      const whereClause = {
        grado: grado,
        is_active: true
      };
      
      if (excludeUserId) {
        whereClause.id = { [require('sequelize').Op.ne]: excludeUserId };
      }

      const usuarios = await User.findAll({
        where: whereClause,
        attributes: ['id']
      });

      const usuarioIds = usuarios.map(user => user.id);
      
      if (usuarioIds.length > 0) {
        return await this.createForMultipleUsers(usuarioIds, {
          ...data,
          grado_destino: grado
        });
      }
      
      return [];
    } catch (error) {
      logger.error(`Error al crear notificaciones para grado ${grado}:`, error);
      throw error;
    }
  }

  // Crear notificación para administradores
  static async createForAdmins(data, excludeUserId = null) {
    try {
      const whereClause = {
        role: ['admin', 'superadmin'],
        is_active: true
      };
      
      if (excludeUserId) {
        whereClause.id = { [require('sequelize').Op.ne]: excludeUserId };
      }

      const admins = await User.findAll({
        where: whereClause,
        attributes: ['id']
      });

      const adminIds = admins.map(admin => admin.id);
      
      if (adminIds.length > 0) {
        return await this.createForMultipleUsers(adminIds, data);
      }
      
      return [];
    } catch (error) {
      logger.error('Error al crear notificaciones para admins:', error);
      throw error;
    }
  }

  // Notificaciones específicas por evento

  // Nuevo miembro registrado
  static async notifyNewMember(miembro, createdByUserId) {
    const data = {
      titulo: 'Nuevo Miembro Registrado',
      mensaje: `Se ha registrado un nuevo miembro: ${miembro.getNombreCompleto()} (${miembro.grado})`,
      tipo: 'miembro',
      relacionadoTipo: 'miembro',
      relacionadoId: miembro.id,
      prioridad: 'normal',
      accionUrl: `/miembros/${miembro.id}`,
      accionTexto: 'Ver Miembro'
    };

    // Notificar a administradores y secretarios
    await this.createForAdmins(data, createdByUserId);
    
    // Notificar a usuarios con cargo de secretario
    const secretarios = await User.findAll({
      where: {
        cargo: 'secretario',
        is_active: true,
        id: { [require('sequelize').Op.ne]: createdByUserId }
      },
      attributes: ['id']
    });

    if (secretarios.length > 0) {
      const secretarioIds = secretarios.map(s => s.id);
      await this.createForMultipleUsers(secretarioIds, data);
    }
  }

  // Nuevo documento subido
  static async notifyNewDocument(documento, uploadedByUserId) {
    const data = {
      titulo: 'Nuevo Documento Disponible',
      mensaje: `Se ha subido un nuevo documento: ${documento.nombre} (${documento.categoria})`,
      tipo: 'documento',
      relacionadoTipo: 'documento',
      relacionadoId: documento.id,
      prioridad: documento.es_plancha ? 'alta' : 'normal',
      accionUrl: `/documentos/${documento.id}`,
      accionTexto: 'Ver Documento'
    };

    // Determinar a quién notificar basado en la categoría
    if (documento.categoria === 'general' || documento.categoria === 'administrativo') {
      // Notificar a todos los usuarios activos
      const usuarios = await User.findAll({
        where: {
          is_active: true,
          id: { [require('sequelize').Op.ne]: uploadedByUserId }
        },
        attributes: ['id']
      });
      
      const usuarioIds = usuarios.map(user => user.id);
      await this.createForMultipleUsers(usuarioIds, data);
    } else {
      // Notificar por grado
      const usuarios = await User.findAll({
        where: {
          is_active: true,
          id: { [require('sequelize').Op.ne]: uploadedByUserId }
        },
        attributes: ['id', 'grado']
      });

      const usuariosConAcceso = usuarios.filter(user => 
        canViewGrado(user.grado, documento.categoria)
      );

      const usuarioIds = usuariosConAcceso.map(user => user.id);
      if (usuarioIds.length > 0) {
        await this.createForMultipleUsers(usuarioIds, data);
      }
    }
  }

  // Nuevo programa creado
  static async notifyNewProgram(programa, createdByUserId) {
    const data = {
      titulo: 'Nuevo Programa Programado',
      mensaje: `Se ha programado: ${programa.tema} para el ${programa.fecha.toLocaleDateString()}`,
      tipo: 'programa',
      relacionadoTipo: 'programa',
      relacionadoId: programa.id,
      prioridad: 'normal',
      accionUrl: `/programas/${programa.id}`,
      accionTexto: 'Ver Programa'
    };

    // Notificar según el grado del programa
    if (programa.grado === 'general') {
      const usuarios = await User.findAll({
        where: {
          is_active: true,
          id: { [require('sequelize').Op.ne]: createdByUserId }
        },
        attributes: ['id']
      });
      
      const usuarioIds = usuarios.map(user => user.id);
      await this.createForMultipleUsers(usuarioIds, data);
    } else {
      const usuarios = await User.findAll({
        where: {
          is_active: true,
          id: { [require('sequelize').Op.ne]: createdByUserId }
        },
        attributes: ['id', 'grado']
      });

      const usuariosConAcceso = usuarios.filter(user => 
        canViewGrado(user.grado, programa.grado)
      );

      const usuarioIds = usuariosConAcceso.map(user => user.id);
      if (usuarioIds.length > 0) {
        await this.createForMultipleUsers(usuarioIds, data);
      }
    }
  }

  // Plancha aprobada/rechazada
  static async notifyPlanchaModerated(documento, estado, comentarios, moderatorUserId) {
    if (!documento.autor_id) return;

    const esAprobada = estado === 'aprobada';
    const data = {
      titulo: `Plancha ${esAprobada ? 'Aprobada' : 'Rechazada'}`,
      mensaje: `Su plancha "${documento.nombre}" ha sido ${estado}${comentarios ? '. Comentarios: ' + comentarios : ''}`,
      tipo: 'plancha',
      relacionadoTipo: 'documento',
      relacionadoId: documento.id,
      prioridad: esAprobada ? 'normal' : 'alta',
      accionUrl: `/documentos/${documento.id}`,
      accionTexto: 'Ver Plancha'
    };

    await this.createForUser(documento.autor_id, data);
  }

  // Recordatorio de programa próximo
  static async notifyUpcomingProgram(programa) {
    const diasRestantes = programa.getDiasRestantes();
    const data = {
      titulo: 'Recordatorio de Programa',
      mensaje: `Recordatorio: ${programa.tema} es ${diasRestantes === 1 ? 'mañana' : `en ${diasRestantes} días`}`,
      tipo: 'programa',
      relacionadoTipo: 'programa',
      relacionadoId: programa.id,
      prioridad: diasRestantes <= 1 ? 'alta' : 'normal',
      accionUrl: `/programas/${programa.id}`,
      accionTexto: 'Ver Programa',
      expiresAt: programa.fecha
    };

    // Notificar a usuarios según el grado del programa
    const usuarios = await User.findAll({
      where: { is_active: true },
      attributes: ['id', 'grado']
    });

    let usuariosConAcceso;
    if (programa.grado === 'general') {
      usuariosConAcceso = usuarios;
    } else {
      usuariosConAcceso = usuarios.filter(user => 
        canViewGrado(user.grado, programa.grado)
      );
    }

    const usuarioIds = usuariosConAcceso.map(user => user.id);
    if (usuarioIds.length > 0) {
      await this.createForMultipleUsers(usuarioIds, data);
    }
  }

  // Limpiar notificaciones expiradas
  static async cleanExpiredNotifications() {
    try {
      const deletedCount = await Notificacion.cleanExpired();
      if (deletedCount > 0) {
        logger.info(`${deletedCount} notificaciones expiradas eliminadas`);
      }
      return deletedCount;
    } catch (error) {
      logger.error('Error al limpiar notificaciones expiradas:', error);
      throw error;
    }
  }

  // Obtener estadísticas de notificaciones
  static async getNotificationStats(usuarioId) {
    try {
      const [total, noLeidas, porTipo] = await Promise.all([
        Notificacion.count({
          where: {
            usuario_id: usuarioId,
            expires_at: {
              [require('sequelize').Op.or]: [
                null,
                { [require('sequelize').Op.gt]: new Date() }
              ]
            }
          }
        }),
        Notificacion.getUnreadCount(usuarioId),
        Notificacion.findAll({
          attributes: [
            'tipo',
            [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
          ],
          where: {
            usuario_id: usuarioId,
            leido: false,
            expires_at: {
              [require('sequelize').Op.or]: [
                null,
                { [require('sequelize').Op.gt]: new Date() }
              ]
            }
          },
          group: ['tipo'],
          raw: true
        })
      ]);

      const porTipoObj = {};
      porTipo.forEach(item => {
        porTipoObj[item.tipo] = parseInt(item.count);
      });

      return {
        total,
        noLeidas,
        porTipo: porTipoObj
      };
    } catch (error) {
      logger.error('Error al obtener estadísticas de notificaciones:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;