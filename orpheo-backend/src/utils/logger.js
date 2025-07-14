const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Crear directorio de logs si no existe
const fs = require('fs');
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Configuración de formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Configuración de formato para consola
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // Agregar metadata si existe
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return msg;
  })
);

// Configuración de transports
const transports = [];

// Console transport (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: consoleFormat,
      handleExceptions: true,
      handleRejections: true
    })
  );
}

// File transport para todos los logs
transports.push(
  new DailyRotateFile({
    filename: path.join(logDir, 'app-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    handleExceptions: true,
    handleRejections: true
  })
);

// File transport para errores
transports.push(
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: customFormat,
    maxSize: '20m',
    maxFiles: '30d',
    handleExceptions: true,
    handleRejections: true
  })
);

// File transport para auditoría (acciones importantes)
transports.push(
  new DailyRotateFile({
    filename: path.join(logDir, 'audit-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    format: customFormat,
    maxSize: '50m',
    maxFiles: '90d'
  })
);

// Crear instancia de logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: {
    service: 'orpheo-backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports,
  exitOnError: false
});

// Métodos auxiliares para diferentes tipos de logs
logger.audit = (message, meta = {}) => {
  logger.info(message, { 
    ...meta, 
    type: 'audit',
    timestamp: new Date().toISOString()
  });
};

logger.security = (message, meta = {}) => {
  logger.warn(message, { 
    ...meta, 
    type: 'security',
    timestamp: new Date().toISOString()
  });
};

logger.performance = (message, meta = {}) => {
  logger.info(message, { 
    ...meta, 
    type: 'performance',
    timestamp: new Date().toISOString()
  });
};

logger.database = (message, meta = {}) => {
  logger.debug(message, { 
    ...meta, 
    type: 'database',
    timestamp: new Date().toISOString()
  });
};

logger.request = (message, meta = {}) => {
  logger.info(message, { 
    ...meta, 
    type: 'request',
    timestamp: new Date().toISOString()
  });
};

logger.response = (message, meta = {}) => {
  logger.info(message, { 
    ...meta, 
    type: 'response',
    timestamp: new Date().toISOString()
  });
};

// Middleware para Express
logger.expressMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Log de request
  logger.request('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous'
  });

  // Interceptar respuesta
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    // Log de response
    logger.response('Outgoing response', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'anonymous'
    });

    originalSend.call(this, data);
  };

  next();
};

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM. Graceful shutdown...');
  process.exit(0);
});

module.exports = logger;