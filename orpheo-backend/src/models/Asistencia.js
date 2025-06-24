const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Asistencia = sequelize.define('Asistencia', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  programa_id: {
    type: DataTypes.UUID, // ✅ CORREGIDO: UUID, no INTEGER
    allowNull: false,
    references: {
      model: 'programas',
      key: 'id'
    }
  },
  miembro_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'miembros',
      key: 'id'
    }
  },
  asistio: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'true si asistió, false si no asistió'
  },
  confirmado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'true si confirmó asistencia previamente'
  },
  justificacion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Justificación en caso de no asistir'
  },
  
  // Registro de quien toma la asistencia
  registrado_por_id: {
    type: DataTypes.UUID, // ✅ CORREGIDO: UUID, no INTEGER
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  registrado_por_nombre: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  hora_registro: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  
  // Metadatos adicionales
  hora_llegada: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Hora de llegada al evento'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Datos adicionales para UI (desnormalizados para performance)
  nombre_miembro: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Nombre completo del miembro (cache)'
  },
  grado_miembro: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Grado del miembro (cache)'
  }
}, {
  tableName: 'asistencias',
  indexes: [
    {
      unique: true,
      fields: ['programa_id', 'miembro_id'],
      name: 'asistencias_programa_miembro_unique'
    },
    {
      fields: ['programa_id']
    },
    {
      fields: ['miembro_id']
    },
    {
      fields: ['asistio']
    },
    {
      fields: ['confirmado']
    },
    {
      fields: ['hora_registro']
    }
  ]
});

// Métodos de instancia
Asistencia.prototype.getTipoAsistencia = function() {
  if (this.asistio) {
    return 'presente';
  } else if (this.justificacion && this.justificacion.trim() !== '') {
    return 'justificado';
  } else {
    return 'ausente';
  }
};

Asistencia.prototype.esJustificada = function() {
  return !this.asistio && this.justificacion && this.justificacion.trim() !== '';
};

// Métodos estáticos corregidos
Asistencia.findByPrograma = function(programaId) {
  return this.findAll({
    where: { programa_id: programaId },
    include: [
      {
        association: 'miembro',
        attributes: ['id', 'nombres', 'apellidos', 'grado']
      },
      {
        association: 'registradoPor',
        attributes: ['id', 'username', 'member_full_name'],
        required: false
      }
    ],
    order: [['nombre_miembro', 'ASC']]
  });
};

Asistencia.findByMiembro = function(miembroId, limit = 10) {
  return this.findAll({
    where: { miembro_id: miembroId },
    include: [
      {
        association: 'programa',
        attributes: ['id', 'tema', 'fecha', 'tipo', 'grado']
      }
    ],
    order: [['hora_registro', 'DESC']],
    limit
  });
};

Asistencia.getEstadisticasByPrograma = function(programaId) {
  return this.findAll({
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
      [sequelize.fn('COUNT', sequelize.literal('CASE WHEN asistio = true THEN 1 END')), 'presentes'],
      [sequelize.fn('COUNT', sequelize.literal('CASE WHEN asistio = false AND justificacion IS NOT NULL AND justificacion != \'\' THEN 1 END')), 'justificados'],
      [sequelize.fn('COUNT', sequelize.literal('CASE WHEN asistio = false AND (justificacion IS NULL OR justificacion = \'\') THEN 1 END')), 'ausentes'],
      [sequelize.fn('COUNT', sequelize.literal('CASE WHEN confirmado = true THEN 1 END')), 'confirmados']
    ],
    where: { programa_id: programaId },
    raw: true
  }).then(results => {
    const stats = results[0];
    return {
      total: parseInt(stats.total) || 0,
      presentes: parseInt(stats.presentes) || 0,
      justificados: parseInt(stats.justificados) || 0,
      ausentes: parseInt(stats.ausentes) || 0,
      confirmados: parseInt(stats.confirmados) || 0,
      porcentajeAsistencia: stats.total > 0 ? Math.round((stats.presentes / stats.total) * 100) : 0
    };
  });
};

// Hooks corregidos
Asistencia.addHook('beforeCreate', async (asistencia) => {
  // Cachear datos del miembro para performance
  if (asistencia.miembro_id) {
    const Miembro = require('./Miembro');
    const miembro = await Miembro.findByPk(asistencia.miembro_id);
    if (miembro) {
      asistencia.nombre_miembro = miembro.getNombreCompleto();
      asistencia.grado_miembro = miembro.grado;
    }
  }
});

module.exports = Asistencia;