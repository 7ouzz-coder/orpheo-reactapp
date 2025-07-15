module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombres: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [8, 255]
      }
    },
    
    // Información masónica
    rol: {
      type: DataTypes.ENUM('superadmin', 'admin', 'general'),
      allowNull: false,
      defaultValue: 'general'
    },
    grado: {
      type: DataTypes.ENUM('aprendiz', 'companero', 'maestro'),
      allowNull: false,
      defaultValue: 'aprendiz'
    },
    
    // Estado de la cuenta
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo', 'suspendido'),
      allowNull: false,
      defaultValue: 'activo'
    },
    
    // Seguridad
    intentos_fallidos: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    cuenta_bloqueada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    bloqueada_hasta: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Tokens
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Información adicional
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[+]?[0-9\s\-\(\)]+$/
      }
    },
    
    // Timestamps de actividad
    ultimo_acceso: {
      type: DataTypes.DATE,
      allowNull: true
    },
    password_changed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Información de verificación
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Configuraciones de usuario
    configuraciones: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        notificaciones: {
          email: true,
          push: true,
          programas: true,
          documentos: true,
          miembros: true
        },
        privacidad: {
          mostrar_email: false,
          mostrar_telefono: false
        },
        interfaz: {
          tema: 'oscuro',
          idioma: 'es'
        }
      }
    },
    
    // Información de auditoría
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    
    // Índices
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['rol']
      },
      {
        fields: ['grado']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['created_at']
      }
    ],
    
    // Hooks
    hooks: {
      beforeCreate: (user) => {
        user.email = user.email.toLowerCase();
      },
      beforeUpdate: (user) => {
        if (user.changed('email')) {
          user.email = user.email.toLowerCase();
        }
      }
    }
  });

  // Métodos de instancia
  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.refresh_token;
    return values;
  };

  User.prototype.getNombreCompleto = function() {
    return `${this.nombres} ${this.apellidos}`;
  };

  User.prototype.esAdmin = function() {
    return ['admin', 'superadmin'].includes(this.rol);
  };

  User.prototype.esSuperAdmin = function() {
    return this.rol === 'superadmin';
  };

  User.prototype.puedeAccederGrado = function(grado) {
    const jerarquia = { aprendiz: 1, companero: 2, maestro: 3 };
    return jerarquia[this.grado] >= jerarquia[grado];
  };

  User.prototype.actualizarUltimoAcceso = function() {
    return this.update({ ultimo_acceso: new Date() });
  };

  User.prototype.isAccountLocked = function() {
    if (!this.cuenta_bloqueada) return false;
    if (!this.bloqueada_hasta) return true;
    return new Date() < this.bloqueada_hasta;
  };

  User.prototype.unlockAccount = function() {
    return this.update({
      cuenta_bloqueada: false,
      bloqueada_hasta: null,
      intentos_fallidos: 0
    });
  };

  // Métodos estáticos
  User.findByEmail = function(email) {
    return this.findOne({
      where: { email: email.toLowerCase() }
    });
  };

  User.findActiveUsers = function() {
    return this.findAll({
      where: { estado: 'activo' },
      order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
    });
  };

  User.findByRol = function(rol) {
    return this.findAll({
      where: { rol },
      order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
    });
  };

  User.findByGrado = function(grado) {
    return this.findAll({
      where: { grado },
      order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
    });
  };

  User.getAdmins = function() {
    return this.findAll({
      where: { 
        rol: ['admin', 'superadmin'],
        estado: 'activo'
      },
      order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
    });
  };

  User.countByRol = function() {
    return this.findAll({
      attributes: [
        'rol',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['rol'],
      raw: true
    });
  };

  User.countByGrado = function() {
    return this.findAll({
      attributes: [
        'grado',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['grado'],
      raw: true
    });
  };

  User.getRecentUsers = function(limit = 10) {
    return this.findAll({
      limit,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'nombres', 'apellidos', 'email', 'rol', 'grado', 'created_at']
    });
  };

  User.searchUsers = function(query) {
    const { Op } = require('sequelize');
    return this.findAll({
      where: {
        [Op.or]: [
          { nombres: { [Op.iLike]: `%${query}%` } },
          { apellidos: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } }
        ]
      },
      order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
    });
  };

  return User;
};