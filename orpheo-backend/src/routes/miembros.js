const express = require('express');
const { body, param, query } = require('express-validator');
const miembrosController = require('../controllers/miembrosController');
const authMiddleware = require('../middleware/auth');
const permissionsMiddleware = require('../middleware/permissions');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// Validaciones
const createMiembroValidation = [
  body('nombres')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombres debe tener entre 2 y 100 caracteres'),
  body('apellidos')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Apellidos debe tener entre 2 y 100 caracteres'),
  body('rut')
    .trim()
    .matches(/^[0-9]+-[0-9kK]{1}$/)
    .withMessage('RUT debe tener formato válido (ej: 12345678-9)'),
  body('grado')
    .isIn(['aprendiz', 'companero', 'maestro'])
    .withMessage('Grado debe ser aprendiz, companero o maestro'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido'),
  body('telefono')
    .optional()
    .isMobilePhone('es-CL')
    .withMessage('Debe ser un teléfono válido'),
  body('fechaNacimiento')
    .optional()
    .isISO8601()
    .withMessage('Fecha de nacimiento debe ser una fecha válida'),
  body('fechaIniciacion')
    .optional()
    .isISO8601()
    .withMessage('Fecha de iniciación debe ser una fecha válida')
];

const updateMiembroValidation = [
  param('id').isInt().withMessage('ID debe ser un número entero'),
  ...createMiembroValidation.map(validation => validation.optional())
];

const getMiembroValidation = [
  param('id').isInt().withMessage('ID debe ser un número entero')
];

const getMiembrosValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número mayor a 0'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
  query('grado').optional().isIn(['aprendiz', 'companero', 'maestro', 'todos']).withMessage('Grado inválido'),
  query('sortBy').optional().isIn(['nombres', 'apellidos', 'grado', 'created_at']).withMessage('Campo de ordenamiento inválido'),
  query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Orden debe ser ASC o DESC')
];

// Rutas

// GET /api/miembros - Obtener todos los miembros
router.get('/', getMiembrosValidation, miembrosController.getMiembros);

// GET /api/miembros/estadisticas - Obtener estadísticas
router.get('/estadisticas', miembrosController.getEstadisticas);

// GET /api/miembros/:id - Obtener un miembro por ID
router.get('/:id', getMiembroValidation, miembrosController.getMiembroById);

// POST /api/miembros - Crear nuevo miembro
router.post('/', 
  permissionsMiddleware(['manage_members']),
  createMiembroValidation, 
  miembrosController.createMiembro
);

// PUT /api/miembros/:id - Actualizar miembro
router.put('/:id', 
  permissionsMiddleware(['manage_members']),
  updateMiembroValidation, 
  miembrosController.updateMiembro
);

// DELETE /api/miembros/:id - Eliminar miembro
router.delete('/:id', 
  permissionsMiddleware(['manage_members']),
  getMiembroValidation, 
  miembrosController.deleteMiembro
);

// POST /api/miembros/importar - Importar miembros desde Excel
router.post('/importar', 
  permissionsMiddleware(['manage_members']),
  miembrosController.importarMiembros
);

module.exports = router;