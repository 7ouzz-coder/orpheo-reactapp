const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    body: req.body
  });

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400
    };
  }

  // Error de clave única de Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Recurso duplicado. El valor ya existe.';
    error = {
      message,
      statusCode: 409
    };
  }

  // Error de clave foránea de Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Error de referencia. El recurso referenciado no existe.';
    error = {
      message,
      statusCode: 400
    };
  }

  // Error de conexión a la base de datos
  if (err.name === 'SequelizeConnectionError') {
    const message = 'Error de conexión a la base de datos';
    error = {
      message,
      statusCode: 503
    };
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = {
      message,
      statusCode: 401
    };
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = {
      message,
      statusCode: 401
    };
  }

  // Error de Multer (archivos)
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Archivo demasiado grande';
    error = {
      message,
      statusCode: 400
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Tipo de archivo no permitido';
    error = {
      message,
      statusCode: 400
    };
  }

  // Error de rate limiting
  if (err.status === 429) {
    const message = 'Demasiadas peticiones. Intente más tarde.';
    error = {
      message,
      statusCode: 429
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};

module.exports = errorHandler;