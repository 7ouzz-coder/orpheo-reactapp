module.exports = (sequelize, DataTypes) => {
  const Notificacion = sequelize.define('Notificacion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    relacionado_tipo: {
      type: DataTypes.ENUM('programa', 'documento', 'miembro', 'user', 'asistencia'),
      allowNull: true,
    },
    relacionado_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    leido: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    leido_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    grado_destino: {
      type: DataTypes.ENUM('aprendiz', 'companero', 'maestro', 'todos'),
      allowNull: true,
    },
    remitente_tipo: {
      type: DataTypes.ENUM('system', 'user', 'admin'),
      defaultValue: 'system',
    },
    remitente_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    remitente_nombre: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    prioridad: {
      type: DataTypes.ENUM('baja', 'normal', 'alta', 'urgente'),
      defaultValue: 'normal',
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    accion_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    accion_texto: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    metadatos: {
      type: DataTypes.JSONB,
      allowNull: true,
    }
  }, {
    tableName: 'notificaciones',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
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
        fields: ['created_at']
      },
      {
        fields: ['expires_at']
      }
    ]
  });

  // Métodos estáticos
  Notificacion.getUnreadCount = function(usuarioId) {
    return this.count({
      where: {
        usuario_id: usuarioId,
        leido: false,
        expires_at: {
          [require('sequelize').Op.or]: [
            null,
            { [require('sequelize').Op.gt]: new Date() }
          ]
        }
      }
    });
  };

  Notificacion.createForUser = function(usuarioId, data) {
    return this.create({
      ...data,
      usuario_id: usuarioId
    });
  };

  Notificacion.createForMultipleUsers = function(usuarioIds, data) {
    const notifications = usuarioIds.map(usuarioId => ({
      ...data,
      usuario_id: usuarioId
    }));
    return this.bulkCreate(notifications);
  };

  return Notificacion;
};
