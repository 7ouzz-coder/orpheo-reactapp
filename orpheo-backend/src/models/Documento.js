const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const path = require('path');

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
  tipo: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      isIn: [['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'txt']]
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tamano: {
    type: DataTypes.BIGINT,
    allowNull: true,
    validate: {
      min: 0,
      max: 52428800 // 50MB máximo
    }
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  ruta_local: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  hash_archivo: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: 'SHA-256 hash del archivo para verificar integridad'
  },
  
  // Clasificación
  categoria: {
    type: DataTypes.ENUM('aprendiz', 'companero', 'maestro', 'general', 'administrativo'),
    allowNull: false,
  },
  subcategoria: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  palabras_clave: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Si es plancha
  es_plancha: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  plancha_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  plancha_estado: {
    type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada'),
    allowNull: true,
  },
  plancha_comentarios: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Autor y subido por
  autor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  autor_nombre: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  subido_por_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  subido_por_nombre: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  
  // Versioning
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  documento_padre_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'documentos',
      key: 'id'
    }
  },
  
  // Metadatos
  descargas: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  visualizaciones: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'documentos',
  indexes: [
    {
      fields: ['categoria']
    },
    {
      fields: ['es_plancha']
    },
    {
      fields: ['plancha_estado']
    },
    {
      fields: ['autor_id']
    },
    {
      fields: ['subido_por_id']
    },
    {
      fields: ['activo']
    },
    {
      fields: ['created_at']
    },
    {
      type: 'FULLTEXT',
      fields: ['nombre', 'descripcion', 'palabras_clave']
    }
  ]
});

// Métodos de instancia
Documento.prototype.getExtension = function() {
  return this.tipo;
};

Documento.prototype.getTamanoFormateado = function() {
  if (!this.tamano) return 'Desconocido';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = this.tamano;
  
  while (size >= 1024 && i < sizes.length - 1) {
    size /= 1024;
    i++;
  }
  
  return `${size.toFixed(1)} ${sizes[i]}`;
};

Documento.prototype.incrementarDescargas = async function() {
  return this.increment('descargas');
};

Documento.prototype.incrementarVisualizaciones = async function() {
  return this.increment('visualizaciones');
};

// Métodos estáticos
Documento.findByCategoria = function(categoria) {
  return this.findAll({
    where: { categoria, activo: true },
    order: [['created_at', 'DESC']]
  });
};

Documento.findPlanchas = function(estado = null) {
  const where = { es_plancha: true, activo: true };
  if (estado) where.plancha_estado = estado;
  
  return this.findAll({
    where,
    order: [['created_at', 'DESC']]
  });
};

// Scopes
Documento.addScope('activos', {
  where: { activo: true }
});

Documento.addScope('porCategoria', (categoria) => ({
  where: { categoria, activo: true }
}));

Documento.addScope('planchas', {
  where: { es_plancha: true, activo: true }
});

Documento.addScope('conAutor', {
  include: [{
    association: 'autor',
    attributes: ['id', 'username', 'member_full_name']
  }]
});

// Hooks
Documento.addHook('beforeDestroy', async (documento) => {
  // Eliminar archivo físico al borrar registro
  if (documento.ruta_local) {
    const fs = require('fs').promises;
    try {
      await fs.unlink(documento.ruta_local);
    } catch (error) {
      console.warn(`No se pudo eliminar archivo: ${documento.ruta_local}`);
    }
  }
});

module.exports = Documento;