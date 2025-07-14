module.exports = (sequelize, DataTypes) => {
  const Documento = sequelize.define('Documento', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
      allowNull: true
    },
    categoria: {
      type: DataTypes.ENUM('aprendiz', 'companero', 'maestro', 'general', 'administrativo'),
      allowNull: false,
      defaultValue: 'general'
    },
    tipo: {
      type: DataTypes.ENUM('documento', 'plancha', 'acta', 'reglamento', 'ritual', 'otro'),
      allowNull: false,
      defaultValue: 'documento'
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
      allowNull: false,
      defaultValue: 'pendiente'
    },
    nombre_archivo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ruta_archivo: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    tamano_archivo: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    tipo_mime: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    vistas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    descargas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    autor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    moderado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    fecha_moderado: {
      type: DataTypes.DATE,
      allowNull: true
    },
    comentarios_moderador: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    es_confidencial: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    fecha_expiracion: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
        isAfter: new Date().toISOString()
      }
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    }
  }, {
    tableName: 'documentos',
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
        fields: ['nombre']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['tags'],
        using: 'gin'
      }
    ],
    hooks: {
      beforeValidate: (documento) => {
        // Normalizar nombre
        if (documento.nombre) {
          documento.nombre = documento.nombre.trim();
        }
        
        // Limpiar tags
        if (documento.tags && Array.isArray(documento.tags)) {
          documento.tags = documento.tags
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0);
        }
      },
      
      beforeUpdate: (documento) => {
        // Si se está moderando, establecer fecha
        if (documento.changed('estado') && 
            ['aprobado', 'rechazado'].includes(documento.estado) &&
            documento.estado !== documento._previousDataValues.estado) {
          documento.fecha_moderado = new Date();
        }
      }
    }
  });

  // Métodos de instancia
  Documento.prototype.getTamanoLegible = function() {
    const bytes = this.tamano_archivo;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  Documento.prototype.getExtension = function() {
    return this.nombre_archivo.split('.').pop().toLowerCase();
  };

  Documento.prototype.esImagen = function() {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes(this.getExtension());
  };

  Documento.prototype.esPDF = function() {
    return this.getExtension() === 'pdf';
  };

  Documento.prototype.esEditable = function() {
    const editableExtensions = ['doc', 'docx', 'txt', 'rtf'];
    return editableExtensions.includes(this.getExtension());
  };

  Documento.prototype.puedeSerModerado = function() {
    return this.tipo === 'plancha' && this.estado === 'pendiente';
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

  Documento.getPendientesModeración = function() {
    return this.findAll({
      where: { 
        tipo: 'plancha',
        estado: 'pendiente' 
      },
      order: [['created_at', 'ASC']],
      include: [
        {
          model: sequelize.models.User,
          as: 'autor',
          attributes: ['id', 'nombres', 'apellidos', 'grado']
        }
      ]
    });
  };

  Documento.buscarPorTexto = function(texto, categoria = null) {
    const { Op } = require('sequelize');
    const whereCondition = {
      [Op.and]: [
        {
          [Op.or]: [
            { nombre: { [Op.iLike]: `%${texto}%` } },
            { descripcion: { [Op.iLike]: `%${texto}%` } },
            { tags: { [Op.contains]: [texto.toLowerCase()] } }
          ]
        },
        { estado: 'aprobado' }
      ]
    };

    if (categoria) {
      whereCondition[Op.and].push({ categoria });
    }

    return this.findAll({
      where: whereCondition,
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