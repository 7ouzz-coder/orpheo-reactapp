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
  dialectOptions: {
    // Configuración específica para PostgreSQL
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
  },
  timezone: 'America/Santiago', // Zona horaria de Chile
};

// Crear instancia de Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente.');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
    return false;
  }
};

// Función para cerrar la conexión
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('✅ Conexión a PostgreSQL cerrada correctamente.');
  } catch (error) {
    console.error('❌ Error al cerrar conexión:', error.message);
  }
};

// Función para sincronizar modelos (solo en desarrollo)
const syncModels = async (force = false) => {
  if (process.env.NODE_ENV === 'development') {
    try {
      await sequelize.sync({ force, alter: true });
      console.log('✅ Modelos sincronizados con la base de datos.');
    } catch (error) {
      console.error('❌ Error al sincronizar modelos:', error.message);
    }
  }
};

module.exports = {
  sequelize,
  testConnection,
  closeConnection,
  syncModels,
  config
};

// Exportar también la instancia directamente para compatibilidad
module.exports.default = sequelize;