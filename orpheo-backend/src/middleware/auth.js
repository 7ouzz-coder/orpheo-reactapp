const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar formato: "Bearer TOKEN"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    // Verificar y decodificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado',
          code: 'TOKEN_EXPIRED'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido',
          code: 'TOKEN_INVALID'
        });
      } else {
        throw error;
      }
    }

    // Buscar usuario en base de datos
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password', 'refresh_token'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar estado del usuario
    if (user.estado !== 'activo') {
      return res.status(423).json({
        success: false,
        message: 'Cuenta inactiva',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    if (user.cuenta_bloqueada) {
      return res.status(423).json({
        success: false,
        message: 'Cuenta bloqueada',
        code: 'ACCOUNT_BLOCKED'
      });
    }

    // Agregar información del usuario a la request
    req.user = {
      id: user.id,
      nombres: user.nombres,
      apellidos: user.apellidos,
      email: user.email,
      rol: user.rol,
      grado: user.grado,
      estado: user.estado
    };

    // Log para auditoría (solo en rutas importantes)
    if (req.method !== 'GET' || req.originalUrl.includes('/admin/')) {
      logger.info('Acceso autorizado', {
        userId: user.id,
        email: user.email,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    next();

  } catch (error) {
    logger.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = authMiddleware;