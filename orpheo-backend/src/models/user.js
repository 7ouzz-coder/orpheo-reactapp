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
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo', 'suspendido'),
      allowNull: false,
      defaultValue: 'activo'
    },
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
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ultimo_acceso: {
      type: DataTypes.DATE,
      allowNull: true
    },
    password_changed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
    // Removí created_by para evitar referencia circular
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
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
      }
    ]
  });

  return User;
};