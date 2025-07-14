const { Sequelize } = require('sequelize');
const config = require('../config/database.js')[process.env.NODE_ENV || 'development'];

// Crear instancia de Sequelize
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: config.logging,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// Importar modelos
const User = require('./User.js')(sequelize, Sequelize.DataTypes);
const Miembro = require('./Miembro')(sequelize, Sequelize.DataTypes);
const Documento = require('./Documento')(sequelize, Sequelize.DataTypes);
const Programa = require('./Programa')(sequelize, Sequelize.DataTypes);
const Asistencia = require('./Asistencia')(sequelize, Sequelize.DataTypes);
const Notificacion = require('./Notificacion')(sequelize, Sequelize.DataTypes);

// Definir asociaciones
const db = {
  sequelize,
  Sequelize,
  User,
  Miembro,
  Documento,
  Programa,
  Asistencia,
  Notificacion
};

// Asociaciones User
User.hasMany(Miembro, { foreignKey: 'creado_por', as: 'miembrosCreados' });
User.hasMany(Documento, { foreignKey: 'autor_id', as: 'documentosCreados' });
User.hasMany(Programa, { foreignKey: 'creado_por', as: 'programasCreados' });
User.hasMany(Notificacion, { foreignKey: 'usuario_id', as: 'notificaciones' });

// Asociaciones Miembro
Miembro.belongsTo(User, { foreignKey: 'creado_por', as: 'creador' });
Miembro.hasMany(Asistencia, { foreignKey: 'miembro_id', as: 'asistencias' });

// Asociaciones Documento
Documento.belongsTo(User, { foreignKey: 'autor_id', as: 'autor' });
Documento.belongsTo(User, { foreignKey: 'moderado_por', as: 'moderador' });

// Asociaciones Programa
Programa.belongsTo(User, { foreignKey: 'creado_por', as: 'creador' });
Programa.hasMany(Asistencia, { foreignKey: 'programa_id', as: 'asistencias' });

// Asociaciones Asistencia (tabla intermedia)
Asistencia.belongsTo(Miembro, { foreignKey: 'miembro_id', as: 'miembro' });
Asistencia.belongsTo(Programa, { foreignKey: 'programa_id', as: 'programa' });

// Asociaciones Notificacion
Notificacion.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = db;