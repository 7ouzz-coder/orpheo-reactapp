module.exports = (sequelize, DataTypes) => {
  const Documento = sequelize.define('Documento', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      }
    },
    tipo: {
      type: DataTypes.ENUM('documento', 'plancha', 'acta', 'reglamento', 'instructivo'),
      allowNull: false,
      defaultValue: 'documento'
    },
    categoria: {
      type: DataTypes.ENUM('aprendiz', 'companero', 'maestro', 'general', 'administrativo'),
      allowNull: false,
      defaultValue: 'general'
    },
    archivo_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    archivo_nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    archivo_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    archivo_tipo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado', 'archivado'),
      allowNull: false,
      defaultValue: 'pendiente'
    },
    autor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    moderado_por: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    fecha_moderacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    comentarios_moderacion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    documento_padre_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'documentos',
        key: 'id'
      }
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      allowNull: true,
    },
    descargas: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    publico: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fecha_caducidad: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'documentos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        fields: ['autor_id']
      },
      {
        fields: ['categoria']
      },
      {
        fields: ['tipo']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['tags'],
        using: 'gin'
      }
    ]
  });

  // Métodos de instancia
  Documento.prototype.getExtension = function() {
    return this.archivo_nombre.split('.').pop().toLowerCase();
  };

  Documento.prototype.esImagen = function() {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes(this.getExtension());
  };

  Documento.prototype.esPDF = function() {
    return this.getExtension() === 'pdf';
  };

  // Métodos estáticos
  Documento.getPorCategoria = function(categoria, estado = 'aprobado') {
    return this.findAll({
      where: { categoria, estado },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: sequelize.models.User,
          as: 'autor',
          attributes: ['id', 'nombres', 'apellidos']
        }
      ]
    });
  };

  return Documento;
};
