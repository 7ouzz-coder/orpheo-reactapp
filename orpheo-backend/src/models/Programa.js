const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
      isAfter: {
        args: new Date().toISOString().split('T')[0],
        msg: 'La fecha debe ser futura'
      }
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
  },
  resumen: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Clasificación
  grado: {
    type: DataTypes.ENUM('aprendiz', 'companero', 'maestro', 'general'),
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('tenida', 'instruccion', 'camara', 'trabajo', 'ceremonia', 'reunion'),
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'programado', 'completado', 'cancelado'),
    defaultValue: 'pendiente',
  },
  
  // Items relacionados
  documentos_json: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON con IDs de documentos relacionados'
  },
  
  // Responsable
  responsable_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  responsable_nombre: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  
  // Ubicación y detalles
  ubicacion: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  detalles_adicionales: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Control de asistencia
  requiere_confirmacion: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  limite_asistentes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  
  // Metadatos
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'programas',
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
    },
    {
      fields: ['activo']
    }
  ]
});

// Métodos de instancia
Programa.prototype.esFuturo = function() {
  return this.fecha > new Date();
};

Programa.prototype.esPasado = function() {
  return this.fecha < new Date();
};

Programa.prototype.getDiasRestantes = function() {
  if (!this.esFuturo()) return 0;
  
  const diffTime = this.fecha - new Date();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

Programa.prototype.getDocumentosRelacionados = function() {
  if (!this.documentos_json) return [];
  
  try {
    return JSON.parse(this.documentos_json);
  } catch (error) {
    return [];
  }
};

Programa.prototype.setDocumentosRelacionados = function(documentos) {
  this.documentos_json = JSON.stringify(documentos);
};

// Métodos estáticos
Programa.findByGrado = function(grado) {
  return this.findAll({
    where: { grado, activo: true },
    order: [['fecha', 'ASC']]
  });
};

Programa.findProximos = function(limit = 10) {
  return this.findAll({
    where: {
      fecha: { [sequelize.Sequelize.Op.gt]: new Date() },
      activo: true
    },
    order: [['fecha', 'ASC']],
    limit
  });
};

Programa.findByDateRange = function(startDate, endDate) {
  return this.findAll({
    where: {
      fecha: {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      },
      activo: true
    },
    order: [['fecha', 'ASC']]
  });
};

// Scopes
Programa.addScope('activos', {
  where: { activo: true }
});

Programa.addScope('futuros', {
  where: {
    fecha: { [sequelize.Sequelize.Op.gt]: new Date() },
    activo: true
  }
});

Programa.addScope('porGrado', (grado) => ({
  where: { grado, activo: true }
}));

Programa.addScope('porTipo', (tipo) => ({
  where: { tipo, activo: true }
}));

Programa.addScope('conResponsable', {
  include: [{
    association: 'responsable',
    attributes: ['id', 'username', 'member_full_name']
  }]
});

// Hooks
Programa.addHook('beforeSave', (programa) => {
  // Actualizar estado automáticamente basado en la fecha
  const now = new Date();
  const programaDate = new Date(programa.fecha);
  
  if (programaDate < now && programa.estado === 'programado') {
    programa.estado = 'completado';
  }
});

module.exports = Programa;