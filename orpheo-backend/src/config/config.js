require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'orpheo_user',
    password: process.env.DB_PASSWORD || 'orpheo_secure_2025',
    database: process.env.DB_NAME || 'orpheo_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log, // Mostrar consultas SQL en desarrollo
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: false
    }
  },
  
  test: {
    username: process.env.DB_USERNAME || 'orpheo_user',
    password: process.env.DB_PASSWORD || 'orpheo_secure_2025',
    database: (process.env.DB_NAME || 'orpheo_db') + '_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // No mostrar consultas en tests
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: false
    }
  },
  
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // No mostrar consultas en producción
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Para conectarse a servicios como Heroku Postgres
      }
    }
  }
};