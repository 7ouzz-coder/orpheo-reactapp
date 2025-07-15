module.exports = (sequelize, DataTypes) => {
  const Asistencia = sequelize.define('Asistencia', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    miembro_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'miembros',
        key: 'id'
      }
    },
    programa_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'programas',
        key: 'id'
      }
    },
    asistio: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    confirmado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    justificacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    hora_llegada: {
      type: DataTypes.TIME,
      allowNull: true,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    registrado_por: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'asistencias',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['miembro_id', 'programa_id']
      },
      {
        fields: ['programa_id']
      },
      {
        fields: ['miembro_id']
      },
      {
        fields: ['asistio']
      }
    ]
  });

  // Métodos estáticos
  Asistencia.getByPrograma = function(programaId) {
    return this.findAll({
      where: { programa_id: programaId },
      include: [
        {
          model: sequelize.models.Miembro,
          as: 'miembro',
          attributes: ['nombres', 'apellidos', 'grado']
        }
      ],
      order: [['created_at', 'ASC']]
    });
  };

  Asistencia.getByMiembro = function(miembroId) {
    return this.findAll({
      where: { miembro_id: miembroId },
      include: [
        {
          model: sequelize.models.Programa,
          as: 'programa',
          attributes: ['tema', 'fecha', 'tipo']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  };

  return Asistencia;
};
