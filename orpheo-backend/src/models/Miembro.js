module.exports = (sequelize, DataTypes) => {
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
        notEmpty: true,
        len: [8, 12]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
      type: DataTypes.ENUM('activo', 'inactivo', 'suspendido', 'irradiado'),
      allowNull: false,
      defaultValue: 'activo'
    },
    fecha_iniciacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_ingreso: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ciudad_nacimiento: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    profesion: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    fecha_nacimiento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    creado_por: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'miembros',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['rut']
      },
      {
        fields: ['grado']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['fecha_ingreso']
      },
      {
        fields: ['creado_por']
      }
    ]
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

  // Métodos estáticos
  Miembro.findByRut = function(rut) {
    return this.findOne({ where: { rut } });
  };

  Miembro.findByGrado = function(grado) {
    return this.findAll({
      where: { grado, estado: 'activo' },
      order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
    });
  };

  Miembro.countByGrado = function() {
    return this.findAll({
      attributes: [
        'grado',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { estado: 'activo' },
      group: ['grado'],
      raw: true
    });
  };

  return Miembro;
};
