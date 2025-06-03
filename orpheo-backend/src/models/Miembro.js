const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Miembro = sequelize.define('Miembro', {
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
  rut: {
    type: DataTypes.STRING(12),
    allowNull: false,
    unique: true,
    validate: {
      isValidRUT(value) {
        // Validación básica de RUT chileno
        const rutRegex = /^[0-9]+-[0-9kK]{1}$/;
        if (!rutRegex.test(value)) {
          throw new Error('RUT debe tener formato válido (ej: 12345678-9)');
        }
      }
    }
  },
  grado: {
    type: DataTypes.ENUM('aprendiz', 'companero', 'maestro'),
    allowNull: false,
  },
  cargo: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  vigente: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  
  // Información de contacto
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true,
    }
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Información profesional
  profesion: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  ocupacion: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  trabajo_nombre: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  trabajo_direccion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  trabajo_telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  trabajo_email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true,
    }
  },
  
  // Información familiar
  pareja_nombre: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  pareja_telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  contacto_emergencia_nombre: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  contacto_emergencia_telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  
  // Fechas importantes
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  fecha_iniciacion: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  fecha_aumento_salario: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  fecha_exaltacion: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  
  // Salud
  situacion_salud: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Metadatos
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'miembros',
  indexes: [
    {
      unique: true,
      fields: ['rut']
    },
    {
      fields: ['grado']
    },
    {
      fields: ['vigente']
    },
    {
      fields: ['nombres', 'apellidos']
    }
  ]
});

// Método de instancia para obtener nombre completo
Miembro.prototype.getNombreCompleto = function() {
  return `${this.nombres} ${this.apellidos}`;
};

// Método de instancia para obtener edad
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

// Método estático para buscar por RUT
Miembro.findByRUT = function(rut) {
  return this.findOne({ where: { rut } });
};

// Método estático para buscar por grado
Miembro.findByGrado = function(grado) {
  return this.findAll({ 
    where: { grado, vigente: true },
    order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
  });
};

// Scopes
Miembro.addScope('vigentes', {
  where: { vigente: true }
});

Miembro.addScope('porGrado', (grado) => ({
  where: { grado, vigente: true }
}));

Miembro.addScope('conContacto', {
  where: {
    [sequelize.Sequelize.Op.or]: [
      { email: { [sequelize.Sequelize.Op.ne]: null } },
      { telefono: { [sequelize.Sequelize.Op.ne]: null } }
    ]
  }
});

module.exports = Miembro;