const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validaciones para login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email debe ser válido'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Contraseña es requerida')
];

// Validaciones para cambio de contraseña
const changePasswordValidation = [
  body('currentPassword')
    .isLength({ min: 1 })
    .withMessage('Contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Nueva contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial')
];

// Rutas públicas (sin autenticación)

// POST /api/auth/login - Iniciar sesión
router.post('/login', loginValidation, authController.login);

// POST /api/auth/refresh - Renovar token de acceso
router.post('/refresh', authController.refreshToken);

// Rutas protegidas (requieren autenticación)

// GET /api/auth/me - Obtener información del usuario actual
router.get('/me', authMiddleware, authController.getCurrentUser);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', authMiddleware, authController.logout);

// POST /api/auth/change-password - Cambiar contraseña
router.post('/change-password', authMiddleware, changePasswordValidation, authController.changePassword);

module.exports = router;