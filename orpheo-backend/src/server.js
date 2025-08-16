const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { createServer } = require('http');
const { createServer: createHttpsServer } = require('https');
const { Server } = require('socket.io');
const cluster = require('cluster');
const os = require('os');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp'); // Para optimización de imágenes
const winston = require('winston'); // Logging avanzado
const expressWinston = require('express-winston');
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
const authMiddleware = require('./middleware/auth');
//const uploadMiddleware = require('./middleware/upload');

// ==========================================
// CONFIGURACIÓN AVANZADA DEL SERVIDOR
// ==========================================

const app = express();

// ✅ CONFIGURACIÓN DE HOSTING PROFESIONAL
const SERVER_CONFIG = {
  // IP del servidor de hosting
  ip: process.env.SERVER_IP || '192.168.1.100',
  port: process.env.PORT || 3001,
  host: process.env.SERVER_HOST || '0.0.0.0',
  environment: process.env.NODE_ENV || 'development',
  
  // Configuración de dominio (para producción)
  domain: process.env.DOMAIN || null,
  subdomain: process.env.SUBDOMAIN || 'api',
  
  // SSL/HTTPS
  ssl: {
    enabled: process.env.SSL_ENABLED === 'true',
    keyPath: process.env.SSL_KEY_PATH || './ssl/private.key',
    certPath: process.env.SSL_CERT_PATH || './ssl/certificate.crt',
    caPath: process.env.SSL_CA_PATH || './ssl/ca_bundle.crt'
  },
  
  // Configuración de proxy (para hosting con nginx/apache)
  proxy: {
    trust: process.env.TRUST_PROXY === 'true',
    level: process.env.TRUST_PROXY_LEVEL || 1
  },
  
  // Configuración de clustering
  cluster: {
    enabled: process.env.CLUSTER_ENABLED === 'true',
    workers: process.env.CLUSTER_WORKERS || os.cpus().length
  }
};

// ✅ LOGGING AVANZADO CON WINSTON
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'orpheo-api',
    server_ip: SERVER_CONFIG.ip,
    environment: SERVER_CONFIG.environment
  },
  transports: [
    // Logs de error en archivo
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    // Logs combinados en archivo
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true
    })
  ]
});

// En desarrollo, también mostrar en consola
if (SERVER_CONFIG.environment === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// ✅ FUNCIÓN AVANZADA DE DETECCIÓN DE IP
const getNetworkInfo = () => {
  const interfaces = os.networkInterfaces();
  const networkInfo = {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    memory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB',
    ips: []
  };
  
  // Obtener todas las IPs disponibles
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        networkInfo.ips.push({
          interface: name,
          address: interface.address,
          netmask: interface.netmask
        });
      }
    }
  }
  
  return networkInfo;
};

const networkInfo = getNetworkInfo();
const SERVER_IP = SERVER_CONFIG.ip || (networkInfo.ips[0]?.address) || 'localhost';

// ✅ CONFIGURACIÓN DE PROXY PARA HOSTING
if (SERVER_CONFIG.proxy.trust) {
  app.set('trust proxy', SERVER_CONFIG.proxy.level);
  logger.info('🔗 Proxy trust habilitado', { level: SERVER_CONFIG.proxy.level });
}

// ✅ CONFIGURACIÓN CORS AVANZADA PARA HOSTING
const getCorsOrigins = () => {
  const origins = [
    // URLs locales
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    
    // URLs del servidor
    `http://${SERVER_IP}:3000`,
    `http://${SERVER_IP}:3001`,
    `http://${SERVER_IP}:8081`,
    `http://${SERVER_IP}:19000`,
    `http://${SERVER_IP}:19006`,
    
    // URLs con dominio (si está configurado)
    ...(SERVER_CONFIG.domain ? [
      `https://${SERVER_CONFIG.domain}`,
      `https://${SERVER_CONFIG.subdomain}.${SERVER_CONFIG.domain}`,
      `http://${SERVER_CONFIG.domain}`,
      `http://${SERVER_CONFIG.subdomain}.${SERVER_CONFIG.domain}`
    ] : []),
    
    // URLs adicionales desde variables de entorno
    ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [])
  ];
  
  return origins.filter(Boolean);
};

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (apps móviles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = getCorsOrigins();
    
    // Patrones para redes locales y desarrollo
    const localPatterns = [
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:\d+$/,
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^exp:\/\/\d+\.\d+\.\d+\.\d+:\d+$/,
      /^http:\/\/\d+\.\d+\.\d+\.\d+:\d+$/
    ];
    
    // Verificar orígenes permitidos
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // En desarrollo, permitir patrones locales
    if (SERVER_CONFIG.environment === 'development') {
      const isLocalNetwork = localPatterns.some(pattern => pattern.test(origin));
      if (isLocalNetwork) {
        return callback(null, true);
      }
    }
    
    // Log y rechazar
    logger.warn('🚫 CORS: Origen rechazado', { 
      origin, 
      allowed: allowedOrigins,
      ip: SERVER_IP 
    });
    
    callback(new Error('No permitido por CORS'), false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'X-API-Key',
    'X-Client-Version',
    'X-Request-ID'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count', 
    'X-Current-Page',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset'
  ]
};

app.use(cors(corsOptions));

// ✅ MIDDLEWARE DE SEGURIDAD AVANZADO
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", `ws://${SERVER_IP}:*`, `wss://${SERVER_IP}:*`],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// ✅ RATE LIMITING AVANZADO
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      resetTime: new Date(Date.now() + windowMs)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('🚨 Rate limit excedido', {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        path: req.path
      });
      res.status(429).json({
        success: false,
        message,
        resetTime: new Date(Date.now() + windowMs)
      });
    }
  });
};

// Rate limiters específicos
const apiLimiter = createRateLimiter(15 * 60 * 1000, 1000, 'Demasiadas peticiones a la API');
const authLimiter = createRateLimiter(15 * 60 * 1000, 50, 'Demasiados intentos de autenticación');
const uploadLimiter = createRateLimiter(60 * 60 * 1000, 100, 'Demasiadas subidas de archivos');

// Aplicar rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/upload/', uploadLimiter);

// ✅ SLOW DOWN MIDDLEWARE (reducir velocidad en lugar de bloquear)
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 100, // Permitir 100 requests a velocidad normal
  delayMs: 500 // Agregar 500ms de delay por request adicional
});
app.use('/api/', speedLimiter);

// ✅ COMPRESSION AVANZADA
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));

// ✅ BODY PARSING CON LÍMITES SEGUROS
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

// ✅ LOGGING DE REQUESTS CON WINSTON
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  colorize: false,
  ignoreRoute: (req, res) => {
    // Ignorar health checks en logs
    return req.url === '/health' || req.url === '/ping';
  }
}));

// ✅ CONFIGURACIÓN DE UPLOADS AVANZADA
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads', getUploadFolder(file.mimetype));
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    files: 10
  }
});

function getUploadFolder(mimetype) {
  if (mimetype.startsWith('image/')) return 'images';
  if (mimetype === 'application/pdf') return 'documents';
  if (mimetype.includes('word') || mimetype.includes('document')) return 'documents';
  if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'spreadsheets';
  if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return 'presentations';
  return 'others';
}

// ✅ WEBSOCKET CONFIGURACIÓN AVANZADA
const createSocketServer = (server) => {
  const io = new Server(server, {
    cors: corsOptions,
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e6,
    allowEIO3: true
  });
  
  // Middleware de autenticación para sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      if (!token) {
        return next(new Error('Token de autenticación requerido'));
      }
      
      // Validar token aquí
      // const user = await validateToken(token);
      // socket.userId = user.id;
      
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });
  
  io.on('connection', (socket) => {
    logger.info('🔌 Cliente conectado', {
      socketId: socket.id,
      ip: socket.handshake.address,
      userAgent: socket.handshake.headers['user-agent']
    });
    
    socket.on('join-room', (room) => {
      socket.join(room);
      logger.info('📋 Cliente se unió a sala', {
        socketId: socket.id,
        room
      });
    });
    
    socket.on('leave-room', (room) => {
      socket.leave(room);
      logger.info('📋 Cliente salió de sala', {
        socketId: socket.id,
        room
      });
    });
    
    socket.on('disconnect', (reason) => {
      logger.info('🔌 Cliente desconectado', {
        socketId: socket.id,
        reason
      });
    });
    
    socket.on('error', (error) => {
      logger.error('🔌 Error en socket', {
        socketId: socket.id,
        error: error.message
      });
    });
  });
  
  return io;
};

// ✅ HEALTH CHECKS AVANZADOS
app.get('/health', async (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  try {
    // Verificar conexión a base de datos
    let dbStatus = 'disconnected';
    let dbLatency = null;
    
    try {
      const start = Date.now();
      await db.sequelize.authenticate();
      dbLatency = Date.now() - start;
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
    }
    
    const healthData = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime),
        human: formatUptime(uptime)
      },
      server: {
        ip: SERVER_IP,
        hostname: networkInfo.hostname,
        port: SERVER_CONFIG.port,
        environment: SERVER_CONFIG.environment,
        platform: networkInfo.platform,
        arch: networkInfo.arch,
        cpus: networkInfo.cpus,
        node_version: process.version,
        ssl_enabled: SERVER_CONFIG.ssl.enabled,
        domain: SERVER_CONFIG.domain || 'none'
      },
      network: {
        interfaces: networkInfo.ips,
        cors_origins: getCorsOrigins().length
      },
      database: {
        status: dbStatus,
        latency: dbLatency ? `${dbLatency}ms` : null
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
        external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB',
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
        system_total: networkInfo.memory
      },
      services: {
        api: 'running',
        websocket: 'active',
        database: dbStatus,
        uploads: fs.existsSync('./uploads') ? 'ready' : 'not_configured'
      }
    };
    
    res.json(healthData);
    
  } catch (error) {
    logger.error('❌ Health check falló', { error: error.message });
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// ✅ ENDPOINT DE MÉTRICAS AVANZADAS
app.get('/metrics', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  res.json({
    success: true,
    metrics: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heap_used: memoryUsage.heapUsed,
        heap_total: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      system: {
        load_average: os.loadavg(),
        free_memory: os.freemem(),
        total_memory: os.totalmem()
      }
    }
  });
});

// ✅ ENDPOINT DE INFORMACIÓN DE RED AVANZADO
app.get('/network-info', (req, res) => {
  res.json({
    success: true,
    network: networkInfo,
    server: {
      ip: SERVER_IP,
      configured_ip: SERVER_CONFIG.ip,
      domain: SERVER_CONFIG.domain,
      ssl_enabled: SERVER_CONFIG.ssl.enabled
    },
    access_urls: {
      local: {
        api: `http://localhost:${SERVER_CONFIG.port}/api`,
        health: `http://localhost:${SERVER_CONFIG.port}/health`,
        metrics: `http://localhost:${SERVER_CONFIG.port}/metrics`
      },
      network: {
        api: `http://${SERVER_IP}:${SERVER_CONFIG.port}/api`,
        health: `http://${SERVER_IP}:${SERVER_CONFIG.port}/health`,
        metrics: `http://${SERVER_IP}:${SERVER_CONFIG.port}/metrics`
      },
      ...(SERVER_CONFIG.domain && {
        domain: {
          api: `https://${SERVER_CONFIG.subdomain}.${SERVER_CONFIG.domain}/api`,
          health: `https://${SERVER_CONFIG.subdomain}.${SERVER_CONFIG.domain}/health`
        }
      })
    },
    cors: {
      origins_count: getCorsOrigins().length,
      origins: getCorsOrigins()
    }
  });
});

// ✅ PING ENDPOINT SIMPLE
app.get('/ping', (req, res) => {
  res.json({ 
    success: true, 
    message: 'pong', 
    timestamp: new Date().toISOString(),
    server_ip: SERVER_IP
  });
});

// ✅ RUTAS DE LA API
app.use('/api/auth', authRoutes);
app.use('/api/miembros', miembrosRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/programas', programasRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

// ✅ RUTA RAÍZ DE LA API MEJORADA
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API Orpheo - Sistema de Gestión Masónica',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    server: {
      ip: SERVER_IP,
      hostname: networkInfo.hostname,
      port: SERVER_CONFIG.port,
      environment: SERVER_CONFIG.environment,
      uptime: formatUptime(process.uptime()),
      domain: SERVER_CONFIG.domain || null
    },
    client: {
      ip: req.ip,
      origin: req.headers.origin,
      user_agent: req.headers['user-agent'],
      real_ip: req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip
    },
    endpoints: {
      health: `http://${SERVER_IP}:${SERVER_CONFIG.port}/health`,
      metrics: `http://${SERVER_IP}:${SERVER_CONFIG.port}/metrics`,
      network_info: `http://${SERVER_IP}:${SERVER_CONFIG.port}/network-info`,
      ping: `http://${SERVER_IP}:${SERVER_CONFIG.port}/ping`,
      api: {
        auth: `http://${SERVER_IP}:${SERVER_CONFIG.port}/api/auth`,
        miembros: `http://${SERVER_IP}:${SERVER_CONFIG.port}/api/miembros`,
        documentos: `http://${SERVER_IP}:${SERVER_CONFIG.port}/api/documentos`,
        programas: `http://${SERVER_IP}:${SERVER_CONFIG.port}/api/programas`,
        notificaciones: `http://${SERVER_IP}:${SERVER_CONFIG.port}/api/notificaciones`
      }
    },
    features: {
      ssl: SERVER_CONFIG.ssl.enabled,
      cors: true,
      rate_limiting: true,
      compression: true,
      websocket: true,
      file_upload: true,
      logging: true
    }
  });
});

// ✅ SERVIR ARCHIVOS ESTÁTICOS CON OPTIMIZACIÓN
app.use('/uploads', express.static('uploads', {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  cacheControl: true
}));

// ✅ MIDDLEWARE DE LOGGING DE ERRORES
app.use(expressWinston.errorLogger({
  winstonInstance: logger,
  meta: true,
  msg: 'Error {{err.message}}'
}));

// ✅ MIDDLEWARE DE MANEJO DE ERRORES AVANZADO
app.use((error, req, res, next) => {
  logger.error('🚨 Error en aplicación', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido',
      error: 'Bad Request'
    });
  }
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Archivo muy grande',
      error: 'Payload Too Large'
    });
  }
  
  res.status(error.status || 500).json({
    success: false,
    message: SERVER_CONFIG.environment === 'production' 
      ? 'Error interno del servidor' 
      : error.message,
    ...(SERVER_CONFIG.environment === 'development' && { 
      stack: error.stack,
      details: error 
    })
  });
});

// ✅ MANEJO DE RUTAS NO ENCONTRADAS
app.use('*', (req, res) => {
  logger.warn('🔍 Ruta no encontrada', {
    path: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method,
    server_ip: SERVER_IP,
    available_endpoints: [
      `http://${SERVER_IP}:${SERVER_CONFIG.port}/api`,
      `http://${SERVER_IP}:${SERVER_CONFIG.port}/health`,
      `http://${SERVER_IP}:${SERVER_CONFIG.port}/network-info`,
      `http://${SERVER_IP}:${SERVER_CONFIG.port}/metrics`
    ]
  });
});

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

async function initializeDatabase() {
  try {
    logger.info('🔍 Verificando conexión a la base de datos...');
    await db.sequelize.authenticate();
    logger.info('✅ Conexión a PostgreSQL establecida correctamente');
    
    if (SERVER_CONFIG.environment === 'development') {
      logger.info('🔄 Sincronizando modelos de base de datos...');
      await db.sequelize.sync({ alter: true });
      logger.info('✅ Modelos sincronizados correctamente');
    }
    
    return true;
  } catch (error) {
    logger.error('❌ Error conectando a la base de datos', { 
      error: error.message,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME
    });
    return false;
  }
}

function createAppServer() {
  let server;
  
  if (SERVER_CONFIG.ssl.enabled) {
    try {
      const sslOptions = {
        key: fs.readFileSync(SERVER_CONFIG.ssl.keyPath),
        cert: fs.readFileSync(SERVER_CONFIG.ssl.certPath)
      };
      
      if (fs.existsSync(SERVER_CONFIG.ssl.caPath)) {
        sslOptions.ca = fs.readFileSync(SERVER_CONFIG.ssl.caPath);
      }
      
      server = createHttpsServer(sslOptions, app);
      logger.info('🔒 Servidor HTTPS configurado');
    } catch (error) {
      logger.warn('⚠️ No se pudo configurar SSL, usando HTTP', { error: error.message });
      server = createServer(app);
    }
  } else {
    server = createServer(app);
  }
  
  return server;
}

// ==========================================
// INICIALIZACIÓN DEL SERVIDOR
// ==========================================

async function startServer() {
  try {
    // Crear directorio de logs
    fs.mkdirSync('logs', { recursive: true });
    
    // Crear directorio de uploads
    fs.mkdirSync('uploads', { recursive: true });
    
    // Inicializar base de datos
    const dbConnected = await initializeDatabase();
    
    if (!dbConnected && SERVER_CONFIG.environment === 'production') {
      logger.error('❌ Base de datos requerida en producción');
      process.exit(1);
    }
    
    if (!dbConnected) {
      logger.warn('⚠️ Continuando sin base de datos (modo desarrollo)');
    }
    
    // Crear servidor
    const server = createServer();
    
    // Configurar WebSocket
    const io = createSocketServer(server);
    app.set('io', io);
    
    // Iniciar servidor
    server.listen(SERVER_CONFIG.port, SERVER_CONFIG.host, () => {
      logger.info('\n🚀 ===== SERVIDOR ORPHEO INICIADO =====');
      logger.info('📡 Configuración del servidor', {
        environment: SERVER_CONFIG.environment,
        host: SERVER_CONFIG.host,
        port: SERVER_CONFIG.port,
        ip_configurada: SERVER_CONFIG.ip,
        ip_detectada: networkInfo.ips[0]?.address || 'N/A',
        hostname: networkInfo.hostname,
        ssl_enabled: SERVER_CONFIG.ssl.enabled,
        domain: SERVER_CONFIG.domain || 'N/A',
        cluster_enabled: SERVER_CONFIG.cluster.enabled
      });
      
      logger.info('🔗 URLs de acceso', {
        local: `http://localhost:${SERVER_CONFIG.port}/api`,
        network: `http://${SERVER_IP}:${SERVER_CONFIG.port}/api`,
        health: `http://${SERVER_IP}:${SERVER_CONFIG.port}/health`,
        metrics: `http://${SERVER_IP}:${SERVER_CONFIG.port}/metrics`,
        ...(SERVER_CONFIG.domain && {
          domain: `https://${SERVER_CONFIG.subdomain}.${SERVER_CONFIG.domain}/api`
        })
      });
      
      logger.info('📱 URLs para frontend', {
        web: `http://${SERVER_IP}:3000`,
        expo_metro: `http://${SERVER_IP}:8081`,
        expo_web: `http://${SERVER_IP}:19006`
      });
      
      logger.info('✅ Servidor listo para recibir conexiones');
      logger.info('=====================================\n');
    });
    
    // Manejo de errores del servidor
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Puerto ${SERVER_CONFIG.port} ya está en uso`);
      } else {
        logger.error('❌ Error en servidor', { error: error.message });
      }
      process.exit(1);
    });
    
    return { server, io };
    
  } catch (error) {
    logger.error('❌ Error al iniciar el servidor', { error: error.message });
    process.exit(1);
  }
}

// ==========================================
// MANEJO DE PROCESOS Y CLUSTERING
// ==========================================

// Manejo de cierre graceful
function gracefulShutdown(signal) {
  logger.info(`🛑 ${signal} recibido, iniciando cierre graceful...`);
  
  // Cerrar servidor HTTP
  if (global.server) {
    global.server.close(() => {
      logger.info('✅ Servidor HTTP cerrado');
      
      // Cerrar conexiones de base de datos
      if (db && db.sequelize) {
        db.sequelize.close().then(() => {
          logger.info('✅ Conexiones de base de datos cerradas');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    });
    
    // Forzar cierre después de 30 segundos
    setTimeout(() => {
      logger.error('⏰ Tiempo de espera agotado, forzando cierre');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('🚨 Excepción no capturada', { 
    error: error.message, 
    stack: error.stack 
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('🚨 Promise rechazada no manejada', { 
    reason: reason?.message || reason,
    promise 
  });
  process.exit(1);
});

// ==========================================
// CLUSTERING (OPCIONAL)
// ==========================================

if (SERVER_CONFIG.cluster.enabled && cluster.isMaster) {
  logger.info(`🔄 Iniciando ${SERVER_CONFIG.cluster.workers} workers`);
  
  for (let i = 0; i < SERVER_CONFIG.cluster.workers; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    logger.error('💥 Worker murió', { 
      pid: worker.process.pid, 
      code, 
      signal 
    });
    
    if (!worker.exitedAfterDisconnect) {
      logger.info('🔄 Reiniciando worker...');
      cluster.fork();
    }
  });
  
} else {
  // Iniciar aplicación (worker o proceso único)
  startServer().then(({ server, io }) => {
    global.server = server;
    global.io = io;
  });
}

module.exports = { app };