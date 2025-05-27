require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'orpheo_user',
    password: process.env.DB_PASSWORD || 'orpheo_secure_2025', // ✅ CORREGIDO
    database: process.env.DB_NAME || 'orpheo_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    }
  },
  test: {
    username: process.env.DB_USERNAME || 'orpheo_user',
    password: process.env.DB_PASSWORD || 'orpheo_secure_2025', // ✅ CORREGIDO
    database: process.env.DB_NAME_TEST || 'orpheo_db_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    }
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
    }
  }
};