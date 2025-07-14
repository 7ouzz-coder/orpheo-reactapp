module.exports = (sequelize, DataTypes) => {
  const Miembro = sequelize.define('Miembro', {
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
    rut: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        is: /^[0-9]+[-|‐]{1}[0-9kK]{1}$/
      }
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[+]?[0-9\s\-\(\)]+$/
      }
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
    fecha_ingreso: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    fecha_nacimiento: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString()
      }
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ciudad_nacimiento: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    profesion: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    foto_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    creado_por: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    actualizado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'miembros',
    indexes: [
      {
        unique: true,
        fields: ['rut']
      },
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['grado']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['nombres', 'apellidos']
      }
    ],
    hooks: {
      beforeValidate: (miembro) => {
        // Normalizar RUT
        if (miembro.rut) {
          miembro.rut = miembro.rut.replace(/\./g, '').toUpperCase();
        }
        
        // Normalizar email
        if (miembro.email) {
          miembro.email = miembro.email.toLowerCase().trim();
        }
        
        // Capitalizar nombres y apellidos
        if (miembro.nombres) {
          miembro.nombres = miembro.nombres.trim().replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
        }
        
        if (miembro.apellidos) {
          miembro.apellidos = miembro.apellidos.trim().replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
        }
      }
    }
  });

  // Métodos de instancia
  Miembro.prototype.getNombreCompleto = function() {
    return `${this.nombres} ${this.apellidos}`;
  };

  Miembro.prototype.getEdad = function() {
    if (!this.fecha_nacimiento) return null;
    
    const today = new Date();
    const birthDate = new Date(this.fecha_nacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  Miembro.prototype.getAnosEnLogia = function() {
    const today = new Date();
    const ingresoDate = new Date(this.fecha_ingreso);
    let years = today.getFullYear() - ingresoDate.getFullYear();
    const monthDiff = today.getMonth() - ingresoDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < ingresoDate.getDate())) {
      years--;
    }
    
    return Math.max(0, years);
  };

  // Métodos estáticos
  Miembro.getByGrado = function(grado) {
    return this.findAll({
      where: { grado, estado: 'activo' },
      order: [['nombres', 'ASC']]
    });
  };

  Miembro.buscarPorTexto = function(texto) {
    const { Op } = require('sequelize');
    return this.findAll({
      where: {
        [Op.or]: [
          { nombres: { [Op.iLike]: `%${texto}%` } },
          { apellidos: { [Op.iLike]: `%${texto}%` } },
          { rut: { [Op.iLike]: `%${texto}%` } }
        ]
      },
      order: [['nombres', 'ASC']]
    });
  };

  return Miembro;
};