const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const logger = require('../utils/logger');

class AuthController {
  // Iniciar sesión
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Buscar usuario por email
      const user = await User.findOne({ 
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        logger.security('Intento de login con email no existente', {
          email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar si la cuenta está activa
      if (user.estado !== 'activo') {
        logger.security('Intento de login con cuenta inactiva', {
          userId: user.id,
          email: user.email,
          estado: user.estado,
          ip: req.ip
        });

        return res.status(423).json({
          success: false,
          message: 'Cuenta inactiva'
        });
      }

      // Verificar si la cuenta está bloqueada
      if (user.cuenta_bloqueada) {
        logger.security('Intento de login con cuenta bloqueada', {
          userId: user.id,
          email: user.email,
          ip: req.ip
        });

        return res.status(423).json({
          success: false,
          message: 'Cuenta bloqueada. Contacte al administrador.'
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        // Incrementar intentos fallidos
        await user.increment('intentos_fallidos');
        
        // Bloquear cuenta si excede el límite
        if (user.intentos_fallidos >= 4) {
          await user.update({ 
            cuenta_bloqueada: true,
            bloqueada_hasta: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
          });
        }

        logger.security('Intento de login con contraseña incorrecta', {
          userId: user.id,
          email: user.email,
          intentos: user.intentos_fallidos + 1,
          ip: req.ip
        });

        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Login exitoso - resetear intentos fallidos
      await user.update({ 
        intentos_fallidos: 0,
        cuenta_bloqueada: false,
        bloqueada_hasta: null,
        ultimo_acceso: new Date()
      });

      // Generar tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        rol: user.rol,
        grado: user.grado
      };

      const accessToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '1h' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '30d' }
      );

      // Guardar refresh token en base de datos
      await user.update({ refresh_token: refreshToken });

      logger.audit('Usuario autenticado exitosamente', {
        userId: user.id,
        email: user.email,
        rol: user.rol,
        grado: user.grado,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Autenticación exitosa',
        data: {
          user: {
            id: user.id,
            nombres: user.nombres,
            apellidos: user.apellidos,
            email: user.email,
            rol: user.rol,
            grado: user.grado,
            avatar: user.avatar,
            estado: user.estado
          },
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

  // Renovar token de acceso
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
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token inválido'
        });
      }

      // Buscar usuario y verificar refresh token
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

      // Verificar estado del usuario
      if (user.estado !== 'activo') {
        return res.status(423).json({
          success: false,
          message: 'Cuenta inactiva'
        });
      }

      // Generar nuevo access token
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        rol: user.rol,
        grado: user.grado
      };

      const accessToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '1h' }
      );

      res.json({
        success: true,
        data: {
          accessToken
        }
      });

    } catch (error) {
      logger.error('Error al renovar token:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener usuario actual
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

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            nombres: user.nombres,
            apellidos: user.apellidos,
            email: user.email,
            rol: user.rol,
            grado: user.grado,
            avatar: user.avatar,
            estado: user.estado,
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        }
      });

    } catch (error) {
      logger.error('Error al obtener usuario actual:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Cerrar sesión
  async logout(req, res) {
    try {
      // Limpiar refresh token
      await User.update(
        { refresh_token: null },
        { where: { id: req.user.id } }
      );

      logger.audit('Usuario cerró sesión', {
        userId: req.user.id,
        email: req.user.email,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });

    } catch (error) {
      logger.error('Error al cerrar sesión:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Cambiar contraseña
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Buscar usuario
      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isValidPassword) {
        logger.security('Intento de cambio de contraseña con contraseña actual incorrecta', {
          userId: user.id,
          email: user.email,
          ip: req.ip
        });

        return res.status(401).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }

      // Verificar que la nueva contraseña no sea igual a la actual
      const isSamePassword = await bcrypt.compare(newPassword, user.password);

      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe ser diferente a la actual'
        });
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Actualizar contraseña
      await user.update({ 
        password: hashedPassword,
        password_changed_at: new Date(),
        refresh_token: null // Invalidar refresh token
      });

      logger.audit('Contraseña cambiada', {
        userId: user.id,
        email: user.email,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Contraseña cambiada exitosamente'
      });

    } catch (error) {
      logger.error('Error al cambiar contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = new AuthController();