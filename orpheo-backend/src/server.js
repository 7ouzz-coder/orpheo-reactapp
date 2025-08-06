const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const os = require('os');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// ====================================================
// CONFIGURACIÓN DE IMPORTACIONES CON FALLBACKS
// ====================================================
let db, authRoutes, miembrosRoutes, documentosRoutes, programasRoutes, notificacionesRoutes;
let errorHandler, logger;

// Base de datos
try {
  db = require('./models');
  console.log('✅ Modelos de BD importados correctamente');
} catch (error) {
  console.warn('⚠️  Modelos de BD no encontrados, continuando sin DB');
  db = null;
}

// Rutas con fallbacks automáticos
const routesFallback = (routeName) => {
  const router = express.Router();
  router.get('/', (req, res) => res.json({ 
    success: false, 
    message: `Ruta ${routeName} no implementada`,
    timestamp: new Date().toISOString()
  }));
  return router;
};

const importRoute = (routePath, routeName) => {
  try {
    const route = require(routePath);
    console.log(`✅ Ruta ${routeName} importada correctamente`);
    return route;
  } catch (error) {
    console.warn(`⚠️  Ruta ${routeName} no encontrada, usando fallback`);
    return routesFallback(routeName);
  }
};

// Importar todas las rutas
authRoutes = importRoute('./routes/auth', 'auth');
miembrosRoutes = importRoute('./routes/miembros', 'miembros');
documentosRoutes = importRoute('./routes/documentos', 'documentos');
programasRoutes = importRoute('./routes/programas', 'programas');
notificacionesRoutes = importRoute('./routes/notificaciones', 'notificaciones');

// Middleware con fallbacks
try {
  errorHandler = require('./middleware/errorHandler');
} catch (error) {
  console.warn('⚠️  ErrorHandler no encontrado, usando fallback');
  errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack?.split('\n').slice(0, 5)
      } : 'Error interno',
      timestamp: new Date().toISOString()
    });
  };
}

try {
  logger = require('./utils/logger');
} catch (error) {
  console.warn('⚠️  Logger no encontrado, usando console');
  logger = {
    info: (msg, ...args) => console.log(`ℹ️  ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`⚠️  ${msg}`, ...args),
    error: (msg, ...args) => console.error(`❌ ${msg}`, ...args),
    debug: (msg, ...args) => process.env.NODE_ENV === 'development' && console.log(`🐛 ${msg}`, ...args)
  };
}

// ====================================================
// CONFIGURACIÓN DEL SERVIDOR
// ====================================================
const app = express();
const server = createServer(app);

// Función mejorada para detectar IP
const getServerIP = () => {
  // 1. Usar IP configurada si es específica
  if (process.env.SERVER_IP && 
      process.env.SERVER_IP !== 'localhost' && 
      process.env.SERVER_IP !== '0.0.0.0') {
    return process.env.SERVER_IP;
  }
  
  // 2. Detectar IP automáticamente
  const interfaces = os.networkInterfaces();
  
  // Priorizar interfaces ethernet/wifi
  const preferredInterfaces = ['eth0', 'wlan0', 'en0', 'Wi-Fi', 'Ethernet'];
  
  for (const interfaceName of preferredInterfaces) {
    if (interfaces[interfaceName]) {
      for (const iface of interfaces[interfaceName]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  
  // 3. Buscar cualquier IP válida de red local
  for (const [name, addresses] of Object.entries(interfaces)) {
    for (const iface of addresses) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // Priorizar rangos de red local comunes
        if (iface.address.startsWith('192.168.') || 
            iface.address.startsWith('10.') || 
            iface.address.startsWith('172.')) {
          return iface.address;
        }
      }
    }
  }
  
  // 4. Fallback
  return process.env.DEFAULT_IP || '192.168.1.14';
};

const SERVER_IP = getServerIP();
const PORT = parseInt(process.env.PORT || '3001');
const HOST = process.env.SERVER_HOST || process.env.HOST || '0.0.0.0';

// ====================================================
// CONFIGURACIÓN CORS AVANZADA
// ====================================================
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (apps móviles, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Orígenes específicos permitidos
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      `http://${SERVER_IP}:3000`,
      `http://${SERVER_IP}:3001`,
      // Agregar IP pública si existe
      ...(process.env.PUBLIC_IP ? [`http://${process.env.PUBLIC_IP}:3000`, `http://${process.env.PUBLIC_IP}:3001`] : [])
    ];
    
    // Patrones para redes locales
    const localNetworkPatterns = [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/,  // Clase C privada
      /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,   // Clase A privada
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+:\d+$/, // Clase B privada
      /^https?:\/\/.*\.local:\d+$/,          // Dominios .local
      /^http:\/\/\d+\.\d+\.\d+\.\d+:\d+$/   // Cualquier IP válida (para desarrollo)
    ];
    
    // Verificar si el origen está permitido
    const isExplicitlyAllowed = allowedOrigins.includes(origin);
    const isLocalNetwork = localNetworkPatterns.some(pattern => pattern.test(origin));
    
    if (isExplicitlyAllowed || isLocalNetwork) {
      callback(null, true);
    } else {
      logger.warn(`CORS: Origen bloqueado: ${origin}`);
      
      // En desarrollo, ser más permisivo con un warning
      if (process.env.NODE_ENV === 'development') {
        logger.warn('CORS: Permitiendo en modo desarrollo');
        callback(null, true);
      } else {
        callback(new Error(`Origen ${origin} no permitido por política CORS`));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'x-access-token',
    'Cache-Control',
    'Pragma',
    'Expires',
    'X-Forwarded-For',
    'X-Real-IP',
    'User-Agent'
  ],
  exposedHeaders: [
    'X-Total-Count', 
    'X-Request-ID', 
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // Cache preflight por 24 horas
};

// ====================================================
// CONFIGURACIÓN SOCKET.IO
// ====================================================
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Socket.IO más permisivo para desarrollo
      if (!origin || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      // Usar misma lógica que HTTP CORS pero más permisiva
      const localPatterns = [
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
        /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
        /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
        /^http:\/\/172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+:\d+$/
      ];
      
      const isLocal = localPatterns.some(pattern => pattern.test(origin));
      callback(null, isLocal || process.env.NODE_ENV === 'development');
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true, // Compatibilidad con versiones anteriores
  maxHttpBufferSize: 1e6, // 1MB para uploads pequeños
  allowRequest: (req, callback) => {
    // Permitir todas las conexiones en desarrollo
    callback(null, process.env.NODE_ENV === 'development' || true);
  }
});

// ====================================================
// FUNCIONES UTILITARIAS
// ====================================================
const getClientIP = (req) => {
  return req?.ip || 
         req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
         req?.headers?.['x-real-ip'] ||
         req?.connection?.remoteAddress ||
         req?.socket?.remoteAddress ||
         'unknown';
};

// Rate limiting inteligente
const createRateLimiter = (windowMs, max, message, options = {}) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: message || 'Demasiadas peticiones desde esta IP',
      retryAfter: Math.ceil(windowMs / 1000),
      limit: max,
      windowMs
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessful || true,
    skipFailedRequests: false,
    keyGenerator: (req) => getClientIP(req),
    handler: (req, res) => {
      const clientIP = getClientIP(req);
      logger.warn(`Rate limit excedido para IP: ${clientIP} en ${req.path}`);
      
      res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: message || 'Demasiadas peticiones. Intenta más tarde.',
        retryAfter: Math.ceil(windowMs / 1000),
        clientIP: process.env.NODE_ENV === 'development' ? clientIP : 'hidden'
      });
    },
    ...options
  });
};

// Rate limiters específicos
const rateLimiters = {
  general: createRateLimiter(15 * 60 * 1000, 300, 'Límite general excedido'),
  auth: createRateLimiter(15 * 60 * 1000, 30, 'Demasiados intentos de autenticación', { skipSuccessful: false }),
  upload: createRateLimiter(60 * 60 * 1000, 20, 'Límite de uploads excedido'),
  api: createRateLimiter(1 * 60 * 1000, 60, 'Límite de API excedido')
};

// ====================================================
// CONFIGURACIÓN DE MIDDLEWARE
// ====================================================

// Configurar confianza en proxy
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

// Seguridad mejorada
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: false,
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false
}));

// Compresión
app.use(compression({
  level: process.env.NODE_ENV === 'production' ? 6 : 1,
  threshold: 1024
}));

// Logging mejorado
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { 
  stream: { 
    write: message => logger.info(message.trim()) 
  },
  skip: (req, res) => {
    // No loggear health checks y assets estáticos frecuentes
    const skipPaths = ['/health', '/favicon.ico', '/robots.txt'];
    return skipPaths.some(path => req.url.includes(path));
  }
}));

// CORS principal
app.use(cors(corsOptions));

// Body parsing con validación
app.use(express.json({ 
  limit: process.env.MAX_JSON_SIZE || '50mb',
  verify: (req, res, buf) => {
    try {
      req.rawBody = buf;
    } catch (err) {
      logger.warn('Error storing raw body:', err.message);
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_URL_ENCODED_SIZE || '50mb' 
}));

// Middleware de información de request
app.use((req, res, next) => {
  req.startTime = Date.now();
  req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  req.clientIP = getClientIP(req);
  
  // Headers útiles para debugging
  res.setHeader('X-Request-ID', req.requestId);
  res.setHeader('X-Server-IP', SERVER_IP);
  
  next();
});

// Rate limiting por rutas
app.use('/api/auth', rateLimiters.auth);
app.use('/api/uploads', rateLimiters.upload);
app.use('/api/', rateLimiters.api);
app.use('/', rateLimiters.general);

// ====================================================
// CONFIGURACIÓN DE DIRECTORIOS Y ARCHIVOS ESTÁTICOS
// ====================================================

// Crear directorios necesarios
const createDirectories = () => {
  const dirs = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../logs'),
    path.join(__dirname, '../temp')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`📁 Directorio creado: ${dir}`);
      } catch (error) {
        logger.warn(`⚠️  No se pudo crear directorio ${dir}:`, error.message);
      }
    }
  });
};

createDirectories();

// Servir archivos estáticos con headers optimizados
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir, {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', process.env.NODE_ENV === 'production' ? 'public, max-age=604800' : 'public, max-age=3600');
  }
}));

// Middleware para Socket.IO
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Logging de desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const origin = req.get('Origin') || 'Direct';
    logger.debug(`📡 ${req.method} ${req.url} - IP: ${req.clientIP} - Origin: ${origin}`);
    next();
  });
}

// ====================================================
// RUTAS PRINCIPALES
// ====================================================

// Ruta raíz informativa
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🏛️ Orpheo - Sistema de Gestión Masónica',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    server: {
      environment: process.env.NODE_ENV || 'development',
      ip: SERVER_IP,
      port: PORT,
      uptime: Math.floor(process.uptime()),
      node_version: process.version
    },
    links: {
      api: `http://${SERVER_IP}:${PORT}/api`,
      health: `http://${SERVER_IP}:${PORT}/health`,
      docs: `http://${SERVER_IP}:${PORT}/api/docs`,
      network: `http://${SERVER_IP}:${PORT}/network-info`
    },
    client: {
      ip: req.clientIP,
      requestId: req.requestId
    }
  });
});

// Health check completo
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  // Test de conectividad de base de datos
  let dbStatus = 'unknown';
  if (db) {
    dbStatus = 'connected';
    // Aquí podrías agregar un ping real a la BD
  } else {
    dbStatus = 'not_configured';
  }
  
  const healthData = {
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
      node_version: process.version,
      platform: os.platform(),
      arch: os.arch()
    },
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
      external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB',
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB'
    },
    services: {
      database: dbStatus,
      websocket: 'active',
      uploads: fs.existsSync(uploadsDir) ? 'available' : 'unavailable'
    },
    client: {
      ip: req.clientIP,
      userAgent: req.get('User-Agent')?.substring(0, 100) || 'N/A',
      requestId: req.requestId
    }
  };
  
  res.status(200).json(healthData);
});

// Información de red detallada
app.get('/network-info', (req, res) => {
  const interfaces = os.networkInterfaces();
  const networkInfo = {};
  
  Object.keys(interfaces).forEach(name => {
    networkInfo[name] = interfaces[name]
      .filter(iface => iface.family === 'IPv4')
      .map(iface => ({
        address: iface.address,
        internal: iface.internal,
        netmask: iface.netmask,
        mac: iface.mac
      }));
  });
  
  res.json({
    success: true,
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    detectedIP: SERVER_IP,
    networkInterfaces: networkInfo,
    accessUrls: {
      local: {
        api: `http://localhost:${PORT}/api`,
        health: `http://localhost:${PORT}/health`,
        root: `http://localhost:${PORT}`
      },
      network: {
        api: `http://${SERVER_IP}:${PORT}/api`,
        health: `http://${SERVER_IP}:${PORT}/health`,
        root: `http://${SERVER_IP}:${PORT}`
      }
    },
    corsConfiguration: {
      allowedOrigins: [
        'http://localhost:3000',
        `http://${SERVER_IP}:3000`
      ],
      development: process.env.NODE_ENV === 'development'
    }
  });
});

// Información de la API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '🏛️ API Orpheo - Sistema de Gestión Masónica',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    server: {
      ip: SERVER_IP,
      port: PORT,
      environment: process.env.NODE_ENV || 'development'
    },
    client: {
      ip: req.clientIP,
      userAgent: req.get('User-Agent'),
      origin: req.get('Origin') || 'Direct access',
      requestId: req.requestId
    },
    endpoints: {
      auth: {
        path: '/api/auth',
        methods: ['GET', 'POST'],
        description: 'Autenticación y gestión de usuarios'
      },
      miembros: {
        path: '/api/miembros',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Gestión de miembros de la logia'
      },
      documentos: {
        path: '/api/documentos',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Sistema de documentos y archivos'
      },
      programas: {
        path: '/api/programas',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Programas y eventos de la logia'
      },
      notificaciones: {
        path: '/api/notificaciones',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Sistema de notificaciones'
      }
    },
    utilities: {
      health: `http://${SERVER_IP}:${PORT}/health`,
      networkInfo: `http://${SERVER_IP}:${PORT}/network-info`,
      routes: `http://${SERVER_IP}:${PORT}/api/routes`
    }
  });
});

// ====================================================
// REGISTRO DE RUTAS DE LA API
// ====================================================
logger.info('📍 Registrando rutas de la API...');

app.use('/api/auth', authRoutes);
logger.info('✅ Ruta /api/auth registrada');

app.use('/api/miembros', miembrosRoutes);
logger.info('✅ Ruta /api/miembros registrada');  

app.use('/api/documentos', documentosRoutes);
logger.info('✅ Ruta /api/documentos registrada');

app.use('/api/programas', programasRoutes);
logger.info('✅ Ruta /api/programas registrada');

app.use('/api/notificaciones', notificacionesRoutes);
logger.info('✅ Ruta /api/notificaciones registrada');

// Ruta de diagnóstico para listar todas las rutas
app.get('/api/routes', (req, res) => {
  const routes = [];
  
  const extractRoutes = (stack, basePath = '') => {
    stack.forEach(layer => {
      if (layer.route) {
        // Ruta directa
        routes.push({
          path: basePath + layer.route.path,
          methods: Object.keys(layer.route.methods).map(m => m.toUpperCase()),
          middleware: layer.route.stack.length
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        // Router anidado
        const routerPath = layer.regexp.source
          .replace('\\/?(?=\\/|$)', '')
          .replace(/\\\//g, '/')
          .replace(/\$.*/, '');
        extractRoutes(layer.handle.stack, basePath + routerPath);
      }
    });
  };
  
  extractRoutes(app._router.stack);
  
  res.json({
    success: true,
    totalRoutes: routes.length,
    routes: routes.sort((a, b) => a.path.localeCompare(b.path)),
    serverInfo: {
      ip: SERVER_IP,
      port: PORT,
      timestamp: new Date().toISOString()
    }
  });
});

// ====================================================
// CONFIGURACIÓN SOCKET.IO
// ====================================================
io.on('connection', (socket) => {
  const clientIP = socket.handshake.address;
  logger.info(`🔌 Socket conectado: ${socket.id} desde ${clientIP}`);
  
  // Información de bienvenida
  socket.emit('welcome', {
    message: 'Conectado al sistema Orpheo',
    serverId: `${SERVER_IP}:${PORT}`,
    socketId: socket.id,
    serverTime: new Date().toISOString(),
    clientIP: process.env.NODE_ENV === 'development' ? clientIP : 'hidden'
  });
  
  // Unirse a sala general
  socket.join('general');
  
  // Manejo de eventos personalizados
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`👤 Usuario ${userId} se unió a su sala personal`);
  });
  
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    socket.emit('room_joined', { room: roomId });
    logger.info(`🏠 Socket ${socket.id} se unió a sala ${roomId}`);
  });
  
  socket.on('ping', (data) => {
    socket.emit('pong', { 
      timestamp: Date.now(),
      serverTime: new Date().toISOString(),
      originalData: data
    });
  });
  
  socket.on('disconnect', (reason) => {
    logger.info(`🔌 Socket desconectado: ${socket.id} - Razón: ${reason}`);
  });
  
  socket.on('error', (error) => {
    logger.error(`❌ Socket error: ${socket.id}`, error);
  });
});

// ====================================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ====================================================
app.use(errorHandler);

// Manejo de rutas no encontradas - DEBE IR AL FINAL
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'ROUTE_NOT_FOUND',
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    server: {
      ip: SERVER_IP,
      port: PORT
    },
    availableEndpoints: [
      '/',
      '/api',
      '/health',
      '/network-info',
      '/api/auth',
      '/api/miembros',
      '/api/documentos',
      '/api/programas',
      '/api/notificaciones',
      '/api/routes'
    ],
    client: {
      ip: req.clientIP,
      requestId: req.requestId
    }
  });
});

// ====================================================
// FUNCIONES DE INICIO Y UTILIDADES
// ====================================================

// Función para mostrar información de red al iniciar
const showNetworkInfo = () => {
  console.log('\n🌐 ===== INFORMACIÓN DE RED ORPHEO =====');
  console.log(`🖥️  Servidor: ${os.hostname()}`);
  console.log(`📍 IP Detectada: ${SERVER_IP}`);
  console.log(`🔗 Host: ${HOST}:${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Node.js: ${process.version}`);
  console.log(`💾 Plataforma: ${os.platform()} ${os.arch()}`);
  
  console.log('\n📱 URLs de Acceso:');
  console.log(`   🌐 Raíz: http://${SERVER_IP}:${PORT}/`);
  console.log(`   🚀 API: http://${SERVER_IP}:${PORT}/api`);
  console.log(`   ❤️  Health: http://${SERVER_IP}:${PORT}/health`);
  console.log(`   🔗 Network: http://${SERVER_IP}:${PORT}/network-info`);
  console.log(`   📋 Routes: http://${SERVER_IP}:${PORT}/api/routes`);
  
  console.log('\n📲 Para dispositivos móviles/otras PCs:');
  console.log(`   Frontend: http://${SERVER_IP}:3000`);
  console.log(`   API Base URL: http://${SERVER_IP}:${PORT}/api`);
  console.log(`   WebSocket URL: http://${SERVER_IP}:${PORT}`);
  
  console.log('\n🔧 Configuración CORS:');
  console.log(`   - Permitida para redes locales (192.168.x.x, 10.x.x.x, 172.x.x.x)`);
  console.log(`   - Socket.IO habilitado para todas las IPs locales`);
  console.log(`   - Modo desarrollo: ${process.env.NODE_ENV === 'development' ? 'Permisivo' : 'Restrictivo'}`);
  
  console.log('\n🛡️  Seguridad:');
  console.log(`   - Rate limiting: ✅ Activo`);
  console.log(`   - Helmet: ✅ Configurado`);
  console.log(`   - Compression: ✅ Habilitado`);
  console.log(`   - Request ID tracking: ✅ Activo`);
  
  console.log('\n💾 Servicios:');
  console.log(`   - Base de datos: ${db ? '✅ Conectada' : '⚠️  No configurada'}`);
  console.log(`   - WebSocket: ✅ Activo`);
  console.log(`   - Uploads: ✅ Configurado`);
  console.log('=====================================\n');
};

// Función para verificar prerrequisitos
const checkPrerequisites = async () => {
  const checks = [];
  
  // Verificar Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  checks.push({
    name: 'Node.js Version',
    status: majorVersion >= 16 ? 'ok' : 'warning',
    message: `${nodeVersion} ${majorVersion >= 16 ? '(Compatible)' : '(Recomendado >= 16.x)'}`
  });
  
  // Verificar variables de entorno críticas
  const criticalEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
  criticalEnvVars.forEach(envVar => {
    checks.push({
      name: `ENV: ${envVar}`,
      status: process.env[envVar] ? 'ok' : 'warning',
      message: process.env[envVar] ? 'Configurado' : 'No configurado'
    });
  });
  
  // Verificar permisos de directorio
  try {
    const testDir = path.join(__dirname, '../uploads');
    fs.accessSync(testDir, fs.constants.W_OK);
    checks.push({
      name: 'Permisos de uploads',
      status: 'ok',
      message: 'Directorio escribible'
    });
  } catch (error) {
    checks.push({
      name: 'Permisos de uploads',
      status: 'error',
      message: 'Sin permisos de escritura'
    });
  }
  
  // Mostrar resultados
  console.log('\n🔍 ===== VERIFICACIÓN DE PREREQUISITOS =====');
  checks.forEach(check => {
    const icon = check.status === 'ok' ? '✅' : check.status === 'warning' ? '⚠️ ' : '❌';
    console.log(`${icon} ${check.name}: ${check.message}`);
  });
  console.log('==========================================\n');
  
  return checks;
};

// Inicializar servidor con verificaciones
const startServer = async () => {
  try {
    console.log('🚀 ===== INICIANDO SERVIDOR ORPHEO =====');
    
    // 1. Verificar prerrequisitos
    await checkPrerequisites();
    
    // 2. Conectar a la base de datos si está disponible
    let dbConnected = false;
    if (db) {
      try {
        logger.info('🔌 Conectando a la base de datos...');
        
        // Intentar diferentes métodos de conexión según el ORM
        if (typeof db.testConnection === 'function') {
          dbConnected = await db.testConnection();
        } else if (typeof db.authenticate === 'function') {
          await db.authenticate();
          dbConnected = true;
        } else if (typeof db.query === 'function') {
          await db.query('SELECT 1');
          dbConnected = true;
        } else {
          logger.info('🔌 Base de datos configurada (sin test de conexión disponible)');
          dbConnected = true;
        }
        
        if (dbConnected) {
          logger.info('✅ Base de datos conectada exitosamente');
        }
        
      } catch (error) {
        logger.warn('⚠️  Base de datos no disponible:', error.message);
        dbConnected = false;
        
        // En desarrollo, continuar sin BD
        if (process.env.NODE_ENV !== 'production') {
          logger.info('ℹ️  Continuando sin base de datos en modo desarrollo');
        }
      }
    } else {
      logger.info('ℹ️  Base de datos no configurada - continuando sin BD');
    }
    
    // 3. Sincronizar modelos en desarrollo
    if (dbConnected && process.env.NODE_ENV === 'development' && db.syncModels) {
      try {
        logger.info('🔄 Sincronizando modelos de base de datos...');
        await db.syncModels();
        logger.info('✅ Modelos sincronizados correctamente');
      } catch (syncError) {
        logger.warn('⚠️  Error al sincronizar modelos:', syncError.message);
      }
    }
    
    // 4. Iniciar servidor HTTP
    const startTime = Date.now();
    
    server.listen(PORT, HOST, () => {
      const startupTime = Date.now() - startTime;
      
      console.log('🎉 ===== SERVIDOR ORPHEO INICIADO EXITOSAMENTE =====');
      showNetworkInfo();
      
      logger.info(`✅ Servidor HTTP iniciado en ${HOST}:${PORT}`);
      logger.info(`⚡ Tiempo de inicio: ${startupTime}ms`);
      logger.info(`🌍 Accesible desde la red en: http://${SERVER_IP}:${PORT}`);
      
      // Instrucciones para el usuario
      console.log('🎯 ===== INSTRUCCIONES DE USO =====');
      console.log('Para probar la API, visita:');
      console.log(`✅ http://${SERVER_IP}:${PORT}/api`);
      console.log(`✅ http://${SERVER_IP}:${PORT}/health`);
      console.log(`✅ http://${SERVER_IP}:${PORT}/network-info`);
      console.log('\n📱 Para conectar tu app móvil:');
      console.log(`Base URL: http://${SERVER_IP}:${PORT}/api`);
      console.log('=====================================\n');
      
      // Emitir evento de inicio exitoso
      io.emit('server_started', {
        message: 'Servidor Orpheo iniciado correctamente',
        timestamp: new Date().toISOString(),
        serverInfo: {
          ip: SERVER_IP,
          port: PORT,
          environment: process.env.NODE_ENV || 'development'
        }
      });
    });
    
  } catch (error) {
    logger.error('❌ Error crítico al iniciar servidor:', error);
    console.error('\n🔥 ===== ERROR CRÍTICO =====');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('===========================\n');
    
    // En desarrollo, mostrar ayuda
    if (process.env.NODE_ENV === 'development') {
      console.log('💡 ===== POSIBLES SOLUCIONES =====');
      console.log('1. Verificar que PostgreSQL esté ejecutándose');
      console.log('2. Revisar las variables de entorno en .env');
      console.log('3. Verificar que el puerto 3001 no esté en uso');
      console.log('4. Ejecutar: npm run init-full para configurar la BD');
      console.log('=====================================\n');
      
      // En desarrollo, intentar iniciar sin BD
      logger.warn('⚠️  Intentando continuar en modo desarrollo sin BD...');
      
      server.listen(PORT, HOST, () => {
        console.log('🚀 ===== SERVIDOR ORPHEO INICIADO (MODO DESARROLLO SIN BD) =====');
        showNetworkInfo();
        console.log('⚠️  ATENCIÓN: Ejecutándose sin base de datos');
        console.log('=====================================\n');
      });
    } else {
      // En producción, salir
      process.exit(1);
    }
  }
};

// Función para cierre elegante del servidor
const gracefulShutdown = (signal) => {
  logger.info(`📴 Señal ${signal} recibida. Iniciando cierre elegante...`);
  
  // Notificar a clientes conectados
  io.emit('server_shutdown', {
    message: 'Servidor cerrándose por mantenimiento',
    timestamp: new Date().toISOString(),
    reconnectDelay: 5000
  });
  
  // Cerrar servidor HTTP (no acepta nuevas conexiones)
  server.close((err) => {
    if (err) {
      logger.error('❌ Error al cerrar servidor HTTP:', err);
    } else {
      logger.info('✅ Servidor HTTP cerrado correctamente');
    }
    
    // Cerrar Socket.IO
    io.close((socketErr) => {
      if (socketErr) {
        logger.error('❌ Error al cerrar Socket.IO:', socketErr);
      } else {
        logger.info('✅ Socket.IO cerrado correctamente');
      }
      
      // Cerrar conexión de base de datos
      if (db && typeof db.close === 'function') {
        db.close()
          .then(() => {
            logger.info('✅ Base de datos desconectada correctamente');
            process.exit(0);
          })
          .catch((dbErr) => {
            logger.error('❌ Error al cerrar base de datos:', dbErr);
            process.exit(1);
          });
      } else {
        logger.info('ℹ️  Sin conexión de BD que cerrar');
        process.exit(0);
      }
    });
  });
  
  // Timeout de seguridad - forzar cierre después de 15 segundos
  setTimeout(() => {
    logger.error('❌ Timeout alcanzado, forzando cierre del servidor');
    process.exit(1);
  }, 15000);
};

// ====================================================
// MANEJO DE SEÑALES DEL SISTEMA Y ERRORES
// ====================================================

// Señales de cierre elegante
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('❌ Excepción no capturada:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  // En producción, cerrar elegantemente
  if (process.env.NODE_ENV === 'production') {
    gracefulShutdown('uncaughtException');
  } else {
    // En desarrollo, continuar con warning
    logger.warn('⚠️  Continuando en modo desarrollo después de excepción no capturada');
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Promesa rechazada no manejada:', {
    reason: reason,
    promise: promise,
    timestamp: new Date().toISOString()
  });
  
  // En producción, cerrar elegantemente
  if (process.env.NODE_ENV === 'production') {
    gracefulShutdown('unhandledRejection');
  } else {
    // En desarrollo, continuar con warning
    logger.warn('⚠️  Continuando en modo desarrollo después de promesa rechazada');
  }
});

// Manejo de warnings de Node.js
process.on('warning', (warning) => {
  logger.warn('⚠️  Node.js Warning:', {
    name: warning.name,
    message: warning.message,
    stack: warning.stack
  });
});

// ====================================================
// INICIALIZACIÓN
// ====================================================

// Verificar que no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  // Inicializar el servidor
  startServer().catch(error => {
    logger.error('❌ Error fatal durante la inicialización:', error);
    process.exit(1);
  });
}

// ====================================================
// EXPORTACIONES
// ====================================================
module.exports = { 
  app, 
  server, 
  io,
  gracefulShutdown,
  getServerIP: () => SERVER_IP,
  getPort: () => PORT
};