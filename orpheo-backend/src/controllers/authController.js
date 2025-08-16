const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const logger = require('../utils/logger');
//const emailService = require('../services/emailService');
const crypto = require('crypto');

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
        logger.audit('Intento de login con email inexistente', {
          email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar si la cuenta está bloqueada
      if (user.cuenta_bloqueada && user.bloqueada_hasta && new Date() < user.bloqueada_hasta) {
        return res.status(423).json({
          success: false,
          message: 'Cuenta temporalmente bloqueada. Intenta más tarde.',
          code: 'ACCOUNT_LOCKED'
        });
      }

      // Verificar contraseña
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        // Incrementar intentos fallidos
        await user.increment('intentos_fallidos');
        
        // Bloquear cuenta si supera el límite
        if (user.intentos_fallidos + 1 >= 5) {
          await user.update({
            cuenta_bloqueada: true,
            bloqueada_hasta: new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
          });
        }

        logger.audit('Intento de login fallido', {
          userId: user.id,
          email,
          intentos: user.intentos_fallidos + 1,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar estado del usuario
      if (user.estado !== 'activo') {
        return res.status(423).json({
          success: false,
          message: 'Cuenta inactiva. Contacta al administrador.',
          code: 'ACCOUNT_INACTIVE'
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
      const accessToken = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          rol: user.rol,
          grado: user.grado
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '1h' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '30d' }
      );

      // Guardar refresh token en la base de datos
      await user.update({ refresh_token: refreshToken });

      // Preparar datos del usuario para respuesta
      const userData = {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        rol: user.rol,
        grado: user.grado,
        estado: user.estado,
        avatar: user.avatar,
        ultimo_acceso: user.ultimo_acceso
      };

      logger.audit('Login exitoso', {
        userId: user.id,
        email: user.email,
        rol: user.rol,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Emitir evento WebSocket de login
      if (req.io) {
        req.io.emit('user_logged_in', {
          userId: user.id,
          nombre: `${user.nombres} ${user.apellidos}`,
          timestamp: new Date()
        });
      }

      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: userData,
          accessToken,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRY || '1h'
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

  // POST /api/auth/register - Registrar nuevo usuario
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { nombres, apellidos, email, password, grado, rol = 'general' } = req.body;

      // Verificar si el email ya existe
      const existingUser = await User.findOne({ 
        where: { email: email.toLowerCase() } 
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }

      // Encriptar contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear nuevo usuario
      const newUser = await User.create({
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        rol,
        grado,
        estado: 'activo',
        email_verified: false
      });

      // Enviar email de bienvenida
      try {
        await emailService.sendWelcomeEmail(newUser);
      } catch (emailError) {
        logger.error('Error enviando email de bienvenida:', emailError);
        // No fallar el registro por error de email
      }

      logger.audit('Usuario registrado', {
        newUserId: newUser.id,
        email: newUser.email,
        rol: newUser.rol,
        registeredBy: req.user?.id || 'self',
        ip: req.ip
      });

      // Respuesta sin contraseña
      const userData = {
        id: newUser.id,
        nombres: newUser.nombres,
        apellidos: newUser.apellidos,
        email: newUser.email,
        rol: newUser.rol,
        grado: newUser.grado,
        estado: newUser.estado
      };

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: userData
      });

    } catch (error) {
      logger.error('Error en registro:', error);
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
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token inválido',
          code: 'INVALID_REFRESH_TOKEN'
        });
      }

      // Buscar usuario y verificar que el refresh token coincida
      const user = await User.findByPk(decoded.userId);
      
      if (!user || user.refresh_token !== refreshToken) {
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
      const newAccessToken = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          rol: user.rol,
          grado: user.grado
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '1h' }
      );

      // Opcionalmente generar nuevo refresh token
      const newRefreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '30d' }
      );

      // Actualizar refresh token en la base de datos
      await user.update({ refresh_token: newRefreshToken });

      res.status(200).json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: process.env.JWT_EXPIRY || '1h'
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
      logger.error('Error obteniendo usuario actual:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/auth/logout - Cerrar sesión
  async logout(req, res) {
    try {
      // Invalidar refresh token
      await User.update(
        { refresh_token: null },
        { where: { id: req.user.id } }
      );

      logger.audit('Logout exitoso', {
        userId: req.user.id,
        email: req.user.email,
        ip: req.ip
      });

      // Emitir evento WebSocket de logout
      if (req.io) {
        req.io.emit('user_logged_out', {
          userId: req.user.id,
          timestamp: new Date()
        });
      }

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

      // Buscar usuario actual
      const user = await User.findByPk(req.user.id);

      // Verificar contraseña actual
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!validPassword) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }

      // Verificar que la nueva contraseña sea diferente
      const samePassword = await bcrypt.compare(newPassword, user.password);
      if (samePassword) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe ser diferente a la actual'
        });
      }

      // Encriptar nueva contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña
      await user.update({
        password: hashedPassword,
        password_changed_at: new Date(),
        refresh_token: null // Invalidar tokens existentes
      });

      logger.audit('Contraseña cambiada', {
        userId: user.id,
        email: user.email,
        ip: req.ip
      });

      res.status(200).json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });

    } catch (error) {
      logger.error('Error cambiando contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/auth/forgot-password - Solicitar recuperación de contraseña
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ 
        where: { email: email.toLowerCase() } 
      });

      // Siempre responder con éxito por seguridad
      const response = {
        success: true,
        message: 'Si el email existe, se enviaron las instrucciones de recuperación'
      };

      if (!user) {
        logger.audit('Intento de recuperación con email inexistente', {
          email,
          ip: req.ip
        });
        return res.status(200).json(response);
      }

      // Generar token de recuperación
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      // Guardar token en la base de datos
      await user.update({
        reset_password_token: resetToken,
        reset_password_expires: resetTokenExpiry
      });

      // Enviar email de recuperación
      try {
        await emailService.sendPasswordResetEmail(user, resetToken);
        
        logger.audit('Email de recuperación enviado', {
          userId: user.id,
          email: user.email,
          ip: req.ip
        });
      } catch (emailError) {
        logger.error('Error enviando email de recuperación:', emailError);
      }

      res.status(200).json(response);

    } catch (error) {
      logger.error('Error en forgot password:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/auth/reset-password - Resetear contraseña con token
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      const user = await User.findOne({
        where: {
          reset_password_token: token,
          reset_password_expires: { [Op.gt]: new Date() }
        }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido o expirado'
        });
      }

      // Encriptar nueva contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña y limpiar tokens
      await user.update({
        password: hashedPassword,
        password_changed_at: new Date(),
        reset_password_token: null,
        reset_password_expires: null,
        refresh_token: null
      });

      logger.audit('Contraseña reseteada', {
        userId: user.id,
        email: user.email,
        ip: req.ip
      });

      res.status(200).json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });

    } catch (error) {
      logger.error('Error en reset password:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // PUT /api/auth/profile - Actualizar perfil
  async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { nombres, apellidos } = req.body;
      const updateData = {};

      if (nombres) updateData.nombres = nombres.trim();
      if (apellidos) updateData.apellidos = apellidos.trim();

      const user = await User.findByPk(req.user.id);
      await user.update(updateData);

      logger.audit('Perfil actualizado', {
        userId: user.id,
        cambios: updateData,
        ip: req.ip
      });

      const userData = {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        rol: user.rol,
        grado: user.grado,
        estado: user.estado,
        avatar: user.avatar
      };

      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: userData
      });

    } catch (error) {
      logger.error('Error actualizando perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /api/auth/login-history - Historial de accesos
  async getLoginHistory(req, res) {
    try {
      // Implementar según tu sistema de logging
      // Por ahora retornar datos básicos
      res.status(200).json({
        success: true,
        data: {
          ultimo_acceso: req.user.ultimo_acceso,
          intentos_fallidos: req.user.intentos_fallidos || 0,
          cuenta_bloqueada: req.user.cuenta_bloqueada || false
        }
      });

    } catch (error) {
      logger.error('Error obteniendo historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = new AuthController();