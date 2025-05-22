const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validaciones
const loginValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username debe tener entre 3 y 50 caracteres'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password debe tener al menos 6 caracteres')
];

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username solo puede contener letras, números y guiones bajos'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password debe tener al menos 6 caracteres'),
  body('grado')
    .isIn(['aprendiz', 'companero', 'maestro'])
    .withMessage('Grado debe ser aprendiz, companero o maestro'),
  body('cargo')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Cargo no puede exceder 50 caracteres'),
  body('memberFullName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Nombre completo no puede exceder 100 caracteres')
];

// Rutas
router.post('/login', loginValidation, authController.login);
router.post('/register', registerValidation, authController.register);
router.get('/verify', authMiddleware, authController.verifyToken);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;