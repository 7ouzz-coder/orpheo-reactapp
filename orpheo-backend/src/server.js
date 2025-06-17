const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const db = require('./config/database');
const authRoutes = require('./routes/auth');
const miembrosRoutes = require('./routes/miembros');
const documentosRoutes = require('./routes/documentos');
const programasRoutes = require('./routes/programas');
const notificacionesRoutes = require('./routes/notificaciones');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "192.168.195.117:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana de tiempo por IP
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // límite de 5 intentos de login por IP
  message: 'Demasiados intentos de login, intenta de nuevo más tarde.',
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
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// CORS optimizado para Expo React Native
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (Expo/React Native)
    if (!origin) return callback(null, true);
    
    // Permitir localhost y IPs locales para desarrollo
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
    
    // Rechazar otros orígenes
    callback(new Error('No permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200 // Para navegadores legacy
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', limiter);
app.use('/api/auth/login', loginLimiter);

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/miembros', miembrosRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/programas', programasRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Socket.io para notificaciones en tiempo real
io.on('connection', (socket) => {
  logger.info(`Usuario conectado: ${socket.id}`);
  
  // Unir usuario a su sala personal (basado en su ID de usuario)
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`Usuario ${userId} se unió a su sala personal`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Usuario desconectado: ${socket.id}`);
  });
});

// Hacer io disponible en todas las rutas
app.set('io', io);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Headers adicionales para React Native/Expo
app.use((req, res, next) => {
  // Permitir todos los orígenes en desarrollo
  if (process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header('Access-Control-Max-Age', '86400'); // Cache preflight por 24h
  
  // Responder inmediatamente a preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Inicializar base de datos y servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await db.authenticate();
    logger.info('✅ Conexión a base de datos establecida');
    
    // Iniciar servidor
    server.listen(PORT, () => {
      logger.info(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 URL: 192.168.195.117:${PORT}`);
      logger.info('💡 Usa migraciones para crear/actualizar tablas: npm run migrate');
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
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor gracefully...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando servidor gracefully...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

startServer();

module.exports = app;