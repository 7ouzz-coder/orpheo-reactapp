const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// ✅ CORREGIDO: Importar desde models en lugar de config/database
const { sequelize } = require('./models');

// Importar rutas
const authRoutes = require('./routes/auth');
const miembrosRoutes = require('./routes/miembros');
const documentosRoutes = require('./routes/documentos');
const programasRoutes = require('./routes/programas');
const notificacionesRoutes = require('./routes/notificaciones');

// Importar middleware
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Demasiados intentos de login, intenta de nuevo más tarde.'
  },
  skipSuccessfulRequests: true,
});

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

app.use(compression());
app.use(morgan('combined', { 
  stream: { write: message => logger.info(message.trim()) }
}));

// CORS optimizado
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (apps móviles)
    if (!origin) return callback(null, true);
    
    // Permitir desarrollo local
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || 
          origin.includes('127.0.0.1') || 
          origin.includes('192.168.') || 
          origin.includes('10.0.') ||
          origin.includes('expo.dev') ||
          origin.includes('exp://')) {
        return callback(null, true);
      }
    }
    
    // En producción, usar CORS_ORIGIN del .env
    if (origin === process.env.CORS_ORIGIN) {
      return callback(null, true);
    }
    
    callback(new Error('No permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', limiter);
app.use('/api/auth/login', loginLimiter);

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Middleware para hacer IO disponible en las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: sequelize.options.database,
    services: {
      database: 'connected',
      server: 'running'
    }
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/miembros', miembrosRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/programas', programasRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

// Ruta raíz de la API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API Orpheo - Sistema de Gestión Masónica',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      miembros: '/api/miembros',
      documentos: '/api/documentos',
      programas: '/api/programas',
      notificaciones: '/api/notificaciones'
    },
    docs: {
      health: '/health',
      uploads: '/uploads'
    }
  });
});

// Socket.io para notificaciones en tiempo real
io.on('connection', (socket) => {
  logger.info(`Cliente conectado: ${socket.id}`);
  
  // Unir usuario a su sala personal
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`Usuario ${userId} se unió a su sala personal`);
  });
  
  // Unir por grado masónico
  socket.on('join-grado', (grado) => {
    socket.join(`grado_${grado}`);
    logger.info(`Socket ${socket.id} se unió a grado_${grado}`);
  });
  
  // Heartbeat
  socket.on('ping', () => {
    socket.emit('pong');
  });
  
  socket.on('disconnect', () => {
    logger.info(`Cliente desconectado: ${socket.id}`);
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Función para inicializar la base de datos
const initializeDatabase = async () => {
  try {
    // Probar conexión
    await sequelize.authenticate();
    logger.info('✅ Conexión a PostgreSQL establecida correctamente');
    
    // En desarrollo, sincronizar modelos
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('✅ Modelos sincronizados con la base de datos');
    }
    
    return true;
  } catch (error) {
    logger.error('❌ Error al conectar con la base de datos:', error);
    return false;
  }
};

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    const dbConnected = await initializeDatabase();
    
    if (!dbConnected) {
      logger.error('No se pudo conectar a la base de datos. El servidor no se iniciará.');
      process.exit(1);
    }
    
    // Iniciar servidor
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Servidor Orpheo ejecutándose en puerto ${PORT}`);
      logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 URL: http://localhost:${PORT}`);
      logger.info(`📖 API Docs: http://localhost:${PORT}/api`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
      
      if (process.env.NODE_ENV === 'development') {
        logger.info(`📁 Uploads: http://localhost:${PORT}/uploads`);
        logger.info('💡 Usa migraciones: npm run migrate');
      }
    });
    
  } catch (error) {
    logger.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Manejo de señales de terminación
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido, cerrando servidor gracefully...');
  server.close(async () => {
    await sequelize.close();
    logger.info('Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT recibido, cerrando servidor gracefully...');
  server.close(async () => {
    await sequelize.close();
    logger.info('Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Iniciar el servidor solo si este archivo es el principal
if (require.main === module) {
  startServer();
}

module.exports = { app, server, io };