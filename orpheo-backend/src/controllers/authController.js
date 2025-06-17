const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const logger = require('../utils/logger');

const generateTokens = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    grado: user.grado,
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '30d' }
  );

  return { accessToken, refreshToken };
};

const authController = {
  // Login
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

      const { username, password } = req.body;
      
      // Buscar usuario
      const user = await User.findByLogin(username);
      
      if (!user) {
        logger.warn(`Intento de login fallido: usuario no encontrado - ${username}`);
        return res.status(401).json({
          success: false,
          message: 'Credenciales incorrectas'
        });
      }

      // Verificar si la cuenta está bloqueada
      /*if (user.isLocked()) {
        logger.warn(`Intento de login en cuenta bloqueada - ${username}`);
        return res.status(423).json({
          success: false,
          message: 'Cuenta temporalmente bloqueada debido a múltiples intentos fallidos'
        });
      }*/

      // Verificar si la cuenta está activa
      if (!user.is_active) {
        logger.warn(`Intento de login en cuenta inactiva - ${username}`);
        return res.status(403).json({
          success: false,
          message: 'Cuenta desactivada'
        });
      }

      // Verificar contraseña
      const isValidPassword = await user.comparePassword(password);
      
      if (!isValidPassword) {
        logger.warn(`Intento de login fallido: contraseña incorrecta - ${username}`);
        await user.incLoginAttempts();
        return res.status(401).json({
          success: false,
          message: 'Credenciales incorrectas'
        });
      }

      // Login exitoso
      await user.resetLoginAttempts();
      
      const { accessToken, refreshToken } = generateTokens(user);
      
      // Información del usuario para el frontend
      const userInfo = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        grado: user.grado,
        cargo: user.cargo,
        memberFullName: user.member_full_name,
        miembroId: user.miembro_id,
        isActive: user.is_active,
      };

      logger.info(`Login exitoso - ${username}`);

      res.json({
        success: true,
        message: 'Login exitoso',
        user: userInfo,
        token: accessToken,
        refreshToken: refreshToken
      });

    } catch (error) {
      logger.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Registro
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { username, email, password, grado, cargo, memberFullName } = req.body;
      
      // Verificar si el usuario ya existe
      const existingUser = await User.findByLogin(username);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'El usuario ya existe'
        });
      }

      // Crear nuevo usuario
      const newUser = await User.create({
        username,
        email,
        password,
        grado,
        cargo,
        member_full_name: memberFullName,
        role: 'general' // Por defecto
      });

      logger.info(`Nuevo usuario registrado - ${username}`);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          grado: newUser.grado
        }
      });

    } catch (error) {
      logger.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Verificar token
  async verifyToken(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no válido'
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          grado: user.grado,
          cargo: user.cargo,
          memberFullName: user.member_full_name,
          miembroId: user.miembro_id,
        }
      });

    } catch (error) {
      logger.error('Error en verificación de token:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token requerido'
        });
      }

      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no válido'
        });
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

      res.json({
        success: true,
        token: accessToken,
        refreshToken: newRefreshToken
      });

    } catch (error) {
      logger.error('Error en refresh token:', error);
      res.status(401).json({
        success: false,
        message: 'Refresh token inválido'
      });
    }
  },

  // Logout
  async logout(req, res) {
    try {
      // En una implementación más completa, aquí podrías invalidar el token
      // agregándolo a una blacklist en Redis o similar
      
      logger.info(`Logout - usuario ID: ${req.user?.id}`);

      res.json({
        success: true,
        message: 'Logout exitoso'
      });

    } catch (error) {
      logger.error('Error en logout:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = authController;