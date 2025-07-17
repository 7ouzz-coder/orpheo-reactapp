const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Importar base de datos
const db = require('./models');

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
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.SERVER_HOST || '0.0.0.0';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: false, // Desactivar CSP en desarrollo
}));

app.use(compression());
app.use(morgan('combined', { 
  stream: { write: message => logger.info(message.trim()) }
}));

// CORS permisivo para desarrollo
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', limiter);

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Middleware para Socket.IO
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
    server_ip: '192.168.1.14',
    port: PORT,
    database: 'connected',
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
    server_ip: '192.168.1.14',
    port: PORT,
    endpoints: {
      auth: '/api/auth',
      miembros: '/api/miembros',
      documentos: '/api/documentos',
      programas: '/api/programas',
      notificaciones: '/api/notificaciones'
    }
  });
});

// Socket.IO
io.on('connection', (socket) => {
  logger.info(`Cliente conectado: ${socket.id}`);
  
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`Usuario ${userId} se unió a su sala`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Cliente desconectado: ${socket.id}`);
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    const dbConnected = await db.testConnection();
    
    if (!dbConnected) {
      logger.error('No se pudo conectar a la base de datos');
      process.exit(1);
    }
    
    // Sincronizar modelos en desarrollo
    if (process.env.NODE_ENV === 'development') {
      await db.syncModels();
    }
    
    // Iniciar servidor en todas las interfaces
    server.listen(PORT, HOST, () => {
      console.log(`🚀 Servidor Orpheo ejecutándose en puerto ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Local: http://localhost:${PORT}/api`);
      console.log(`🌐 Red: http://192.168.1.14:${PORT}/api`);
      console.log(`🏥 Health: http://192.168.1.14:${PORT}/health`);
      logger.info(`Servidor iniciado en ${HOST}:${PORT}`);
    });
    
  } catch (error) {
    logger.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// Manejo de errores
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar servidor
startServer();

module.exports = { app, server, io };