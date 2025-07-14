const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
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
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[+]?[0-9\s\-\(\)]+$/
      }
    },
    fecha_nacimiento: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString()
      }
    },
    ultimo_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    intentos_login_fallidos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    cuenta_bloqueada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    fecha_bloqueo: {
      type: DataTypes.DATE,
      allowNull: true
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha_cambio_password: {
      type: DataTypes.DATE,
      allowNull: true
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    configuraciones: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        notificaciones_email: true,
        notificaciones_push: true,
        tema: 'dark',
        idioma: 'es'
      }
    }
  }, {
    tableName: 'users',
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
        fields: ['ultimo_login']
      }
    ],
    hooks: {
      beforeValidate: (user) => {
        // Normalizar email
        if (user.email) {
          user.email = user.email.toLowerCase().trim();
        }
        
        // Capitalizar nombres y apellidos
        if (user.nombres) {
          user.nombres = user.nombres.trim().replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
        }
        
        if (user.apellidos) {
          user.apellidos = user.apellidos.trim().replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
        }
      },
      
      beforeCreate: async (user) => {
        if (user.password) {
          const saltRounds = 12;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
      
      beforeUpdate: async (user) => {
        // Solo hashear si la contraseña cambió
        if (user.changed('password')) {
          const saltRounds = 12;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      }
    }
  });

  // Métodos de instancia
  User.prototype.getNombreCompleto = function() {
    return `${this.nombres} ${this.apellidos}`;
  };

  User.prototype.verificarPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.puedeAccederGrado = function(grado) {
    const jerarquia = { aprendiz: 1, companero: 2, maestro: 3 };
    return jerarquia[this.grado] >= jerarquia[grado];
  };

  User.prototype.esAdmin = function() {
    return ['admin', 'superadmin'].includes(this.rol);
  };

  User.prototype.esSuperAdmin = function() {
    return this.rol === 'superadmin';
  };

  User.prototype.tienePermiso = function(permiso) {
    // Implementar lógica de permisos según rol y grado
    const permisosPorRol = {
      superadmin: ['*'], // Todos los permisos
      admin: ['manage_members', 'manage_documents', 'approve_planchas'],
      general: ['view_documents', 'upload_documents']
    };

    const permisosPorGrado = {
      maestro: ['approve_planchas', 'moderate_content'],
      companero: ['view_companero_content'],
      aprendiz: ['view_aprendiz_content']
    };

    const permisosRol = permisosPorRol[this.rol] || [];
    const permisosGrado = permisosPorGrado[this.grado] || [];

    return permisosRol.includes('*') || 
           permisosRol.includes(permiso) || 
           permisosGrado.includes(permiso);
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.refresh_token;
    return values;
  };

  // Métodos estáticos
  User.buscarPorEmail = function(email) {
    return this.findOne({
      where: { email: email.toLowerCase() }
    });
  };

  User.obtenerAdministradores = function() {
    return this.findAll({
      where: { 
        rol: ['admin', 'superadmin'],
        estado: 'activo'
      },
      order: [['nombres', 'ASC']]
    });
  };

  User.obtenerPorGrado = function(grado) {
    return this.findAll({
      where: { 
        grado,
        estado: 'activo'
      },
      order: [['nombres', 'ASC']]
    });
  };

  User.obtenerMaestros = function() {
    return this.findAll({
      where: { 
        grado: 'maestro',
        estado: 'activo'
      },
      order: [['nombres', 'ASC']]
    });
  };

  User.bloquearCuenta = async function(userId, razon = 'Múltiples intentos fallidos') {
    return await this.update(
      { 
        cuenta_bloqueada: true,
        fecha_bloqueo: new Date(),
        refresh_token: null
      },
      { where: { id: userId } }
    );
  };

  User.desbloquearCuenta = async function(userId) {
    return await this.update(
      { 
        cuenta_bloqueada: false,
        fecha_bloqueo: null,
        intentos_login_fallidos: 0
      },
      { where: { id: userId } }
    );
  };

  return User;
};