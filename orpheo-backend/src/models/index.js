const sequelize = require('../config/database');

// Importar todos los modelos
const User = require('./user');
const Miembro = require('./Miembro');
const Documento = require('./Documento');
const Programa = require('./Programa');
const Asistencia = require('./Asistencia');
const Notificacion = require('./Notificacion');

// Definir asociaciones
const initAssociations = () => {
  // Usuario - Miembro (1:1)
  User.belongsTo(Miembro, { 
    foreignKey: 'miembro_id', 
    as: 'miembro',
    onDelete: 'SET NULL'
  });
  Miembro.hasOne(User, { 
    foreignKey: 'miembro_id', 
    as: 'usuario' 
  });

  // Documento - Usuario (Many:1 - autor)
  Documento.belongsTo(User, { 
    foreignKey: 'autor_id', 
    as: 'autor',
    onDelete: 'SET NULL'
  });
  User.hasMany(Documento, { 
    foreignKey: 'autor_id', 
    as: 'documentosAutor' 
  });

  // Documento - Usuario (Many:1 - subido por)
  Documento.belongsTo(User, { 
    foreignKey: 'subido_por_id', 
    as: 'subidoPor',
    onDelete: 'CASCADE'
  });
  User.hasMany(Documento, { 
    foreignKey: 'subido_por_id', 
    as: 'documentosSubidos' 
  });

  // Programa - Usuario (Many:1 - responsable)
  Programa.belongsTo(User, { 
    foreignKey: 'responsable_id', 
    as: 'responsable',
    onDelete: 'SET NULL'
  });
  User.hasMany(Programa, { 
    foreignKey: 'responsable_id', 
    as: 'programasResponsable' 
  });

  // Asistencia - Programa (Many:1)
  Asistencia.belongsTo(Programa, { 
    foreignKey: 'programa_id', 
    as: 'programa',
    onDelete: 'CASCADE'
  });
  Programa.hasMany(Asistencia, { 
    foreignKey: 'programa_id', 
    as: 'asistencias' 
  });

  // Asistencia - Miembro (Many:1)
  Asistencia.belongsTo(Miembro, { 
    foreignKey: 'miembro_id', 
    as: 'miembro',
    onDelete: 'CASCADE'
  });
  Miembro.hasMany(Asistencia, { 
    foreignKey: 'miembro_id', 
    as: 'asistencias' 
  });

  // Asistencia - Usuario (Many:1 - registrado por)
  Asistencia.belongsTo(User, { 
    foreignKey: 'registrado_por_id', 
    as: 'registradoPor',
    onDelete: 'SET NULL'
  });

  // Notificacion - Usuario (Many:1)
  Notificacion.belongsTo(User, { 
    foreignKey: 'usuario_id', 
    as: 'usuario',
    onDelete: 'CASCADE'
  });
  User.hasMany(Notificacion, { 
    foreignKey: 'usuario_id', 
    as: 'notificaciones' 
  });
};

// Inicializar asociaciones
initAssociations();

module.exports = {
  sequelize,
  User,
  Miembro,
  Documento,
  Programa,
  Asistencia,
  Notificacion
};