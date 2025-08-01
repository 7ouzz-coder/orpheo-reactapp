const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de la base de datos
const config = {
  username: process.env.DB_USERNAME || 'orpheo_user',
  password: process.env.DB_PASSWORD || 'orpheo_secure_2025',
  database: process.env.DB_NAME || 'orpheo_db',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
  timezone: 'America/Santiago',
};

// Crear instancia de Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// Importar modelos
const User = require('./User')(sequelize, Sequelize.DataTypes);
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

// Asociaciones Asistencia
Asistencia.belongsTo(Miembro, { foreignKey: 'miembro_id', as: 'miembro' });
Asistencia.belongsTo(Programa, { foreignKey: 'programa_id', as: 'programa' });

// Asociaciones Notificacion
Notificacion.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

// Función para probar la conexión
db.testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente.');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
    return false;
  }
};

// Función para sincronizar modelos - FORZAR CREACIÓN
db.syncModels = async (force = false) => {
  try {
    console.log('��� Iniciando sincronización de modelos...');
    
    // Forzar recreación de todas las tablas
    await sequelize.sync({ force: true });
    
    console.log('✅ Todas las tablas creadas correctamente.');
    
    // Crear usuario admin por defecto
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await User.create({
      nombres: 'Administrador',
      apellidos: 'Sistema',
      email: 'admin@orpheo.local',
      password: hashedPassword,
      rol: 'admin',
      grado: 'maestro',
      estado: 'activo'
    });
    
    console.log('✅ Usuario admin creado: admin@orpheo.local / admin123');
    
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error.message);
  }
};

module.exports = db;
