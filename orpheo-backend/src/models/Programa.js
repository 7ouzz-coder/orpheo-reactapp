module.exports = (sequelize, DataTypes) => {
  const Programa = sequelize.define('Programa', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tema: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255]
      }
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfter: new Date().toISOString().split('T')[0]
      }
    },
    encargado: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    quien_imparte: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    resumen: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      }
    },
    grado: {
      type: DataTypes.ENUM('aprendiz', 'companero', 'maestro', 'general'),
      allowNull: false,
      defaultValue: 'general'
    },
    tipo: {
      type: DataTypes.ENUM('tenida', 'instruccion', 'camara', 'trabajo', 'ceremonia', 'reunion'),
      allowNull: false,
      defaultValue: 'tenida'
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'programado', 'completado', 'cancelado'),
      allowNull: false,
      defaultValue: 'programado'
    },
    ubicacion: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        len: [0, 200]
      }
    },
    detalles_adicionales: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      }
    },
    requiere_confirmacion: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    limite_asistentes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1
      }
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      }
    },
    responsable_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    responsable_nombre: {
      type: DataTypes.STRING(200),
      allowNull: false
    }
  }, {
    tableName: 'programas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        fields: ['fecha']
      },
      {
        fields: ['grado']
      },
      {
        fields: ['tipo']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['responsable_id']
      }
    ]
  });

  // Métodos de instancia
  Programa.prototype.puedeSerEditado = function() {
    return this.estado === 'programado' || this.estado === 'pendiente';
  };

  Programa.prototype.esFuturo = function() {
    return new Date(this.fecha) > new Date();
  };

  // Métodos estáticos
  Programa.getPorGrado = function(grado) {
    return this.findAll({
      where: { grado: grado === 'general' ? ['general'] : [grado, 'general'] },
      order: [['fecha', 'ASC']]
    });
  };

  Programa.getProximos = function(limit = 5) {
    return this.findAll({
      where: {
        fecha: {
          [require('sequelize').Op.gte]: new Date()
        },
        estado: ['programado', 'pendiente']
      },
      order: [['fecha', 'ASC']],
      limit
    });
  };

  return Programa;
};
