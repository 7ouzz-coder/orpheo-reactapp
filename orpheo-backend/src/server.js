const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const os = require('os');
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

// Función para detectar IP automáticamente
const getServerIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return '192.168.1.14'; // Fallback a tu IP actual
};

const SERVER_IP = process.env.SERVER_IP || getServerIP();
const PORT = process.env.PORT || 3001;
const HOST = process.env.SERVER_HOST || '0.0.0.0';

// Configuración CORS avanzada para múltiples dispositivos
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (apps móviles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      `http://${SERVER_IP}:3000`,
      `http://${SERVER_IP}:3001`,
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    // Patrones para redes locales
    const localNetworkPatterns = [
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // 192.168.x.x
      /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/, // 10.x.x.x
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+:\d+$/, // 172.16.x.x - 172.31.x.x
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/
    ];
    
    // Verificar si el origen está permitido
    const isAllowed = allowedOrigins.includes(origin) || 
                     localNetworkPatterns.some(pattern => pattern.test(origin));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn(`CORS: Origen bloqueado: ${origin}`);
      // En desarrollo, permitir todo - en producción bloquear
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'x-access-token',
    'Cache-Control'
  ],
  exposedHeaders: ['X-Total-Count'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Socket.IO con configuración mejorada
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Usar la misma lógica que CORS principal pero más permisiva para sockets
      if (!origin || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return corsOptions.origin(origin, callback);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Rate limiting configurable
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Demasiadas peticiones desde esta IP.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Considerar proxy y headers de forwarding
      return req.ip || 
             req.connection.remoteAddress ||
             req.socket.remoteAddress ||
             (req.connection.socket ? req.connection.socket.remoteAddress : null);
    }
  });
};

// Diferentes límites para diferentes rutas
const generalLimiter = createRateLimiter(15 * 60 * 1000, 100, 'Demasiadas peticiones generales');
const authLimiter = createRateLimiter(15 * 60 * 1000, 20, 'Demasiados intentos de autenticación');
const uploadLimiter = createRateLimiter(60 * 60 * 1000, 10, 'Demasiadas subidas de archivos');

// Middleware de seguridad mejorado
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression());

// Logging mejorado con información de red
app.use(morgan('combined', { 
  stream: { 
    write: message => logger.info(message.trim()) 
  },
  skip: (req, res) => {
    // No loggear health checks en desarrollo
    return process.env.NODE_ENV === 'development' && req.url === '/health';
  }
}));

// Configurar proxy trust para obtener IPs reales
app.set('trust proxy', true);

// CORS
app.use(cors(corsOptions));

// Body parsing con límites configurables
app.use(express.json({ 
  limit: process.env.MAX_JSON_SIZE || '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_URL_ENCODED_SIZE || '10mb' 
}));

// Rate limiting específico por ruta
app.use('/api/auth', authLimiter);
app.use('/api/uploads', uploadLimiter);
app.use('/api/', generalLimiter);

// Servir archivos estáticos con cache headers
app.use('/uploads', express.static('uploads', {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Middleware para Socket.IO
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware para logging de requests en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url} - IP: ${req.ip} - Origin: ${req.get('Origin') || 'N/A'}`);
    next();
  });
}

// Health check expandido
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      readable: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
    },
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    server: {
      host: HOST,
      port: PORT,
      ip: SERVER_IP,
      platform: os.platform(),
      arch: os.arch(),
      node_version: process.version
    },
    network: {
      local_urls: [
        `http://localhost:${PORT}/api`,
        `http://127.0.0.1:${PORT}/api`
      ],
      network_urls: [
        `http://${SERVER_IP}:${PORT}/api`
      ]
    },
    database: 'connected', // Se actualizará dinámicamente
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB'
    },
    services: {
      database: 'connected',
      server: 'running',
      websocket: 'active'
    }
  });
});

// Endpoint para información de red
app.get('/network-info', (req, res) => {
  const interfaces = os.networkInterfaces();
  const networkInfo = {};
  
  for (const [name, addresses] of Object.entries(interfaces)) {
    networkInfo[name] = addresses
      .filter(addr => addr.family === 'IPv4')
      .map(addr => ({
        address: addr.address,
        internal: addr.internal,
        netmask: addr.netmask
      }));
  }
  
  res.json({
    success: true,
    server_ip: SERVER_IP,
    hostname: os.hostname(),
    network_interfaces: networkInfo,
    access_urls: {
      local: `http://localhost:${PORT}/api`,
      network: `http://${SERVER_IP}:${PORT}/api`,
      health: `http://${SERVER_IP}:${PORT}/health`
    }
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/miembros', miembrosRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/programas', programasRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

// Ruta raíz de la API mejorada
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API Orpheo - Sistema de Gestión Masónica',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    server: {
      ip: SERVER_IP,
      port: PORT,
      environment: process.env.NODE_ENV || 'development'
    },
    client_info: {
      ip: req.ip,
      user_agent: req.get('User-Agent'),
      origin: req.get('Origin') || 'Direct access'
    },
    endpoints: {
      auth: '/api/auth',
      miembros: '/api/miembros',
      documentos: '/api/documentos',
      programas: '/api/programas',
      notificaciones: '/api/notificaciones'
    },
    access_info: {
      local: `http://localhost:${PORT}/api`,
      network: `http://${SERVER_IP}:${PORT}/api`,
      health: `http://${SERVER_IP}:${PORT}/health`,
      network_info: `http://${SERVER_IP}:${PORT}/network-info`
    }
  });
});

// Socket.IO con manejo mejorado
io.on('connection', (socket) => {
  const clientIP = socket.handshake.address;
  logger.info(`🔌 Cliente conectado: ${socket.id} desde ${clientIP}`);
  
  // Enviar información de conexión al cliente
  socket.emit('connection_info', {
    server_ip: SERVER_IP,
    client_ip: clientIP,
    timestamp: new Date().toISOString()
  });
  
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`👤 Usuario ${userId} se unió a su sala desde ${clientIP}`);
  });
  
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    logger.info(`🏠 Cliente ${socket.id} se unió a sala ${roomId}`);
  });
  
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });
  
  socket.on('disconnect', (reason) => {
    logger.info(`🔌 Cliente desconectado: ${socket.id} - Razón: ${reason}`);
  });
  
  socket.on('error', (error) => {
    logger.error(`❌ Socket error: ${socket.id}`, error);
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    available_endpoints: [
      '/api',
      '/health',
      '/network-info',
      '/api/auth',
      '/api/miembros',
      '/api/documentos',
      '/api/programas',
      '/api/notificaciones'
    ]
  });
});

// Función para mostrar información de red al iniciar
const showNetworkInfo = () => {
  console.log('\n🌐 ===== INFORMACIÓN DE RED =====');
  console.log(`🖥️  Servidor: ${os.hostname()}`);
  console.log(`📍 IP Detectada: ${SERVER_IP}`);
  console.log(`🔗 Host: ${HOST}:${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n📱 URLs de Acceso:');
  console.log(`   Local: http://localhost:${PORT}/api`);
  console.log(`   Red: http://${SERVER_IP}:${PORT}/api`);
  console.log(`   Health: http://${SERVER_IP}:${PORT}/health`);
  console.log(`   Network Info: http://${SERVER_IP}:${PORT}/network-info`);
  console.log('\n📲 Para dispositivos móviles/otras PCs:');
  console.log(`   API Base URL: http://${SERVER_IP}:${PORT}/api`);
  console.log(`   WebSocket URL: http://${SERVER_IP}:${PORT}`);
  console.log('\n🔧 Configuración CORS: Permitida para redes locales');
  console.log('================================\n');
};

// Inicializar servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    logger.info('🔌 Conectando a la base de datos...');
    const dbConnected = await db.testConnection();
    
    if (!dbConnected) {
      logger.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }
    logger.info('✅ Base de datos conectada exitosamente');
    
    // Sincronizar modelos en desarrollo
    if (process.env.NODE_ENV === 'development') {
      logger.info('🔄 Sincronizando modelos de base de datos...');
      await db.syncModels();
      logger.info('✅ Modelos sincronizados');
    }
    
    // Iniciar servidor en todas las interfaces
    server.listen(PORT, HOST, () => {
      console.log('🚀 ===== SERVIDOR ORPHEO INICIADO =====');
      showNetworkInfo();
      logger.info(`Servidor iniciado en ${HOST}:${PORT}`);
    });
    
  } catch (error) {
    logger.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales del sistema
const gracefulShutdown = (signal) => {
  logger.info(`📴 Señal ${signal} recibida. Cerrando servidor...`);
  
  server.close(() => {
    logger.info('✅ Servidor cerrado correctamente');
    
    // Cerrar conexiones de base de datos
    if (db && db.close) {
      db.close().then(() => {
        logger.info('✅ Conexiones de base de datos cerradas');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
  
  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    logger.error('❌ Forzando cierre del servidor');
    process.exit(1);
  }, 10000);
};

// Manejo de errores y señales
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
  console.log('Unhandled Rejection at:', promise);
  // No salir inmediatamente, permitir que el proceso continúe
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  console.log('Uncaught Exception:', error);
  // En producción, deberíamos salir
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Manejo de warning de memoria
process.on('warning', (warning) => {
  logger.warn('Node.js Warning:', warning);
});

// Iniciar servidor
startServer();

module.exports = { app, server, io };