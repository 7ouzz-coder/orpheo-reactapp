const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      notEmpty: true,
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255],
    }
  },
  role: {
    type: DataTypes.ENUM('general', 'admin', 'superadmin'),
    defaultValue: 'general',
    allowNull: false,
  },
  grado: {
    type: DataTypes.ENUM('aprendiz', 'companero', 'maestro'),
    allowNull: false,
  },
  cargo: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  member_full_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  miembro_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'miembros', // ✅ CORREGIDO: minúscula
      key: 'id'
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  failed_login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['username']
    },
    {
      unique: true,
      fields: ['email']
    }
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Métodos de instancia
User.prototype.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

User.prototype.isLocked = function() {
  return this.locked_until && this.locked_until > Date.now();
};

User.prototype.incLoginAttempts = async function() {
  // Si ya pasó el tiempo de bloqueo, resetear intentos
  if (this.locked_until && this.locked_until < Date.now()) {
    return this.update({
      failed_login_attempts: 1,
      locked_until: null
    });
  }
  
  const updates = { failed_login_attempts: this.failed_login_attempts + 1 };
  
  // Bloquear cuenta después de 5 intentos fallidos por 2 horas
  if (updates.failed_login_attempts >= 5 && !this.isLocked()) {
    updates.locked_until = Date.now() + (2 * 60 * 60 * 1000); // 2 horas
  }
  
  return this.update(updates);
};

User.prototype.resetLoginAttempts = async function() {
  return this.update({
    failed_login_attempts: 0,
    locked_until: null,
    last_login: new Date()
  });
};

// Método estático para buscar por username o email
User.findByLogin = function(login) {
  return this.findOne({
    where: {
      [sequelize.Sequelize.Op.or]: [
        { username: login },
        { email: login }
      ]
    }
  });
};

module.exports = User;