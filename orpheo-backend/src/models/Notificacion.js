const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notificacion = sequelize.define('Notificacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 1000]
    }
  },
  tipo: {
    type: DataTypes.ENUM(
      'programa', 
      'documento', 
      'miembro', 
      'administrativo', 
      'sistema', 
      'plancha', 
      'asistencia'
    ),
    allowNull: false,
  },
  
  // Relacionado con otros objetos
  relacionado_tipo: {
    type: DataTypes.ENUM('programa', 'documento', 'miembro', 'user', 'asistencia'),
    allowNull: true,
  },
  relacionado_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  
  // Estado de la notificación
  leido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  leido_at: {
   type: DataTypes.DATE,
   allowNull: true,
 },
 
 // Usuario destino
 usuario_id: {
   type: DataTypes.INTEGER,
   allowNull: false,
   references: {
     model: 'users',
     key: 'id'
   }
 },
 grado_destino: {
   type: DataTypes.ENUM('aprendiz', 'companero', 'maestro', 'todos'),
   allowNull: true,
   comment: 'Si se especifica, solo usuarios de este grado pueden ver la notificación'
 },
 
 // Remitente
 remitente_tipo: {
   type: DataTypes.ENUM('system', 'user', 'admin'),
   defaultValue: 'system',
 },
 remitente_id: {
   type: DataTypes.INTEGER,
   allowNull: true,
   references: {
     model: 'users',
     key: 'id'
   }
 },
 remitente_nombre: {
   type: DataTypes.STRING(100),
   allowNull: true,
 },
 
 // Metadatos
 prioridad: {
   type: DataTypes.ENUM('baja', 'normal', 'alta', 'urgente'),
   defaultValue: 'normal',
 },
 expires_at: {
   type: DataTypes.DATE,
   allowNull: true,
   comment: 'Fecha de expiración de la notificación'
 },
 accion_url: {
   type: DataTypes.STRING(500),
   allowNull: true,
   comment: 'URL para acción relacionada con la notificación'
 },
 accion_texto: {
   type: DataTypes.STRING(100),
   allowNull: true,
   comment: 'Texto del botón de acción'
 },
 metadatos_json: {
   type: DataTypes.TEXT,
   allowNull: true,
   comment: 'Metadatos adicionales en formato JSON'
 }
}, {
 tableName: 'notificaciones',
 indexes: [
   {
     fields: ['usuario_id']
   },
   {
     fields: ['leido']
   },
   {
     fields: ['tipo']
   },
   {
     fields: ['prioridad']
   },
   {
     fields: ['created_at']
   },
   {
     fields: ['expires_at']
   },
   {
     fields: ['relacionado_tipo', 'relacionado_id']
   }
 ]
});

// Métodos de instancia
Notificacion.prototype.isExpired = function() {
 return this.expires_at && new Date() > this.expires_at;
};

Notificacion.prototype.markAsRead = async function() {
 if (!this.leido) {
   await this.update({
     leido: true,
     leido_at: new Date()
   });
 }
};

Notificacion.prototype.getMetadatos = function() {
 if (!this.metadatos_json) return {};
 
 try {
   return JSON.parse(this.metadatos_json);
 } catch (error) {
   return {};
 }
};

Notificacion.prototype.setMetadatos = function(metadatos) {
 this.metadatos_json = JSON.stringify(metadatos);
};

// Métodos estáticos
Notificacion.findByUser = function(usuarioId, options = {}) {
 const {
   includeRead = true,
   limit = 50,
   tipo = null,
   prioridad = null
 } = options;
 
 const where = { usuario_id: usuarioId };
 
 if (!includeRead) {
   where.leido = false;
 }
 
 if (tipo) {
   where.tipo = tipo;
 }
 
 if (prioridad) {
   where.prioridad = prioridad;
 }
 
 // Excluir notificaciones expiradas
 where.expires_at = {
   [sequelize.Sequelize.Op.or]: [
     null,
     { [sequelize.Sequelize.Op.gt]: new Date() }
   ]
 };
 
 return this.findAll({
   where,
   order: [
     ['prioridad', 'DESC'],
     ['created_at', 'DESC']
   ],
   limit,
   include: [
     {
       model: require('./user'),
       as: 'remitente',
       attributes: ['id', 'username', 'member_full_name'],
       required: false
     }
   ]
 });
};

Notificacion.getUnreadCount = function(usuarioId) {
 return this.count({
   where: {
     usuario_id: usuarioId,
     leido: false,
     expires_at: {
       [sequelize.Sequelize.Op.or]: [
         null,
         { [sequelize.Sequelize.Op.gt]: new Date() }
       ]
     }
   }
 });
};

Notificacion.markAllAsRead = function(usuarioId) {
 return this.update(
   {
     leido: true,
     leido_at: new Date()
   },
   {
     where: {
       usuario_id: usuarioId,
       leido: false
     }
   }
 );
};

Notificacion.createForUser = async function(usuarioId, data) {
 return this.create({
   usuario_id: usuarioId,
   titulo: data.titulo,
   mensaje: data.mensaje,
   tipo: data.tipo,
   relacionado_tipo: data.relacionadoTipo,
   relacionado_id: data.relacionadoId,
   prioridad: data.prioridad || 'normal',
   expires_at: data.expiresAt,
   accion_url: data.accionUrl,
   accion_texto: data.accionTexto,
   remitente_tipo: data.remitenteTipo || 'system',
   remitente_id: data.remitenteId,
   remitente_nombre: data.remitenteNombre,
   metadatos_json: data.metadatos ? JSON.stringify(data.metadatos) : null
 });
};

Notificacion.createForMultipleUsers = async function(usuarioIds, data) {
 const notificaciones = usuarioIds.map(usuarioId => ({
   usuario_id: usuarioId,
   titulo: data.titulo,
   mensaje: data.mensaje,
   tipo: data.tipo,
   relacionado_tipo: data.relacionadoTipo,
   relacionado_id: data.relacionadoId,
   prioridad: data.prioridad || 'normal',
   expires_at: data.expiresAt,
   accion_url: data.accionUrl,
   accion_texto: data.accionTexto,
   remitente_tipo: data.remitenteTipo || 'system',
   remitente_id: data.remitenteId,
   remitente_nombre: data.remitenteNombre,
   metadatos_json: data.metadatos ? JSON.stringify(data.metadatos) : null
 }));
 
 return this.bulkCreate(notificaciones);
};

Notificacion.cleanExpired = function() {
 return this.destroy({
   where: {
     expires_at: {
       [sequelize.Sequelize.Op.lt]: new Date()
     }
   }
 });
};

// Scopes
Notificacion.addScope('noLeidas', {
 where: { leido: false }
});

Notificacion.addScope('vigentes', {
 where: {
   expires_at: {
     [sequelize.Sequelize.Op.or]: [
       null,
       { [sequelize.Sequelize.Op.gt]: new Date() }
     ]
   }
 }
});

Notificacion.addScope('porTipo', (tipo) => ({
 where: { tipo }
}));

Notificacion.addScope('porPrioridad', (prioridad) => ({
 where: { prioridad }
}));

Notificacion.addScope('conRemitente', {
 include: [{
   model: require('./user'),
   as: 'remitente',
   attributes: ['id', 'username', 'member_full_name']
 }]
});

// Hooks
Notificacion.addHook('afterCreate', async (notificacion) => {
 // Emitir notificación en tiempo real vía WebSocket
 const io = global.io; // Asumiendo que io está disponible globalmente
 if (io) {
   io.to(`user_${notificacion.usuario_id}`).emit('new_notification', {
     id: notificacion.id,
     titulo: notificacion.titulo,
     mensaje: notificacion.mensaje,
     tipo: notificacion.tipo,
     prioridad: notificacion.prioridad,
     createdAt: notificacion.created_at
   });
 }
});

module.exports = Notificacion;