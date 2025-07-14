const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const logger = require('../utils/logger');

class AuthController {
  // POST /api/auth/login - Iniciar sesión
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Buscar usuario por email
      const user = await User.findOne({ 
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        logger.warn('Intento de login con email inexistente', { email });
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar si la cuenta está bloqueada
      if (user.cuenta_bloqueada) {
        logger.warn('Intento de login en cuenta bloqueada', { 
          userId: user.id, 
          email 
        });
        return res.status(423).json({
          success: false,
          message: 'Cuenta bloqueada. Contacta al administrador.'
        });
      }

      // Verificar contraseña
      const passwordValida = await bcrypt.compare(password, user.password);
      
      if (!passwordValida) {
        // Incrementar intentos fallidos
        await user.increment('intentos_login_fallidos');
        
        // Bloquear cuenta si excede el límite
        if (user.intentos_login_fallidos >= 4) { // 5 intentos total
          await user.update({ 
            cuenta_bloqueada: true,
            fecha_bloqueo: new Date()
          });
          logger.warn('Cuenta bloqueada por múltiples intentos fallidos', {
            userId: user.id,
            email
          });
        }

        logger.warn('Intento de login con contraseña incorrecta', { 
          userId: user.id, 
          email,
          intentos: user.intentos_login_fallidos + 1
        });

        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Login exitoso - resetear intentos fallidos
      if (user.intentos_login_fallidos > 0) {
        await user.update({ 
          intentos_login_fallidos: 0,
          ultimo_login: new Date()
        });
      } else {
        await user.update({ ultimo_login: new Date() });
      }

      // Generar tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Guardar refresh token en base de datos
      await user.update({ refresh_token: refreshToken });

      logger.info('Login exitoso', {
        userId: user.id,
        email: user.email,
        rol: user.rol,
        grado: user.grado
      });

      // Respuesta sin incluir datos sensibles
      const userData = {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        rol: user.rol,
        grado: user.grado,
        estado: user.estado,
        ultimo_login: user.ultimo_login
      };

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: userData,
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      logger.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/auth/refresh - Renovar token de acceso
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token requerido'
        });
      }

      // Verificar refresh token
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token inválido'
        });
      }

      // Buscar usuario y verificar que el refresh token coincida
      const user = await User.findOne({
        where: { 
          id: decoded.userId,
          refresh_token: refreshToken
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token inválido'
        });
      }

      // Verificar estado de cuenta
      if (user.cuenta_bloqueada || user.estado !== 'activo') {
        return res.status(423).json({
          success: false,
          message: 'Cuenta inactiva'
        });
      }

      // Generar nuevo access token
      const newAccessToken = this.generateAccessToken(user);

      logger.info('Token renovado exitosamente', {
        userId: user.id,
        email: user.email
      });

      res.status(200).json({
        success: true,
        data: {
          accessToken: newAccessToken
        }
      });

    } catch (error) {
      logger.error('Error en refresh token:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/auth/logout - Cerrar sesión
  async logout(req, res) {
    try {
      const userId = req.user.id;

      // Invalidar refresh token
      await User.update(
        { refresh_token: null },
        { where: { id: userId } }
      );

      logger.info('Logout exitoso', { userId });

      res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });

    } catch (error) {
      logger.error('Error en logout:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /api/auth/me - Obtener información del usuario actual
  async getCurrentUser(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password', 'refresh_token'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });

    } catch (error) {
      logger.error('Error al obtener usuario actual:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/auth/change-password - Cambiar contraseña
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar contraseña actual
      const passwordValida = await bcrypt.compare(currentPassword, user.password);
      if (!passwordValida) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }

      // Encriptar nueva contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña e invalidar refresh tokens
      await user.update({
        password: hashedPassword,
        refresh_token: null,
        fecha_cambio_password: new Date()
      });

      logger.info('Contraseña cambiada exitosamente', {
        userId: user.id,
        email: user.email
      });

      res.status(200).json({
        success: true,
        message: 'Contraseña cambiada exitosamente. Por favor, inicia sesión nuevamente.'
      });

    } catch (error) {
      logger.error('Error al cambiar contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Métodos auxiliares para generar tokens
  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        rol: user.rol,
        grado: user.grado
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        issuer: 'orpheo-api',
        audience: 'orpheo-frontend'
      }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET,
      { 
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: 'orpheo-api',
        audience: 'orpheo-frontend'
      }
    );
  }
}

module.exports = new AuthController();