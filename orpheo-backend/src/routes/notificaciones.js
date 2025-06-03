const express = require('express');
const { body, param, query } = require('express-validator');
const notificacionesController = require('../controllers/notificacionesController');
const authMiddleware = require('../middleware/auth');
const permissionsMiddleware = require('../middleware/permissions');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// Validaciones
const getNotificacionesValidation = [
  query('includeRead').optional().isIn(['true', 'false']).withMessage('includeRead debe ser true o false'),
  query('tipo').optional().isIn([
    'programa', 'documento', 'miembro', 'administrativo', 'sistema', 'plancha', 'asistencia', 'todos'
  ]).withMessage('Tipo de notificación inválido'),
  query('prioridad').optional().isIn(['baja', 'normal', 'alta', 'urgente', 'todos']).withMessage('Prioridad inválida'),
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número mayor a 0'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100')
];

const crearNotificacionValidation = [
  body('titulo')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Título debe tener entre 1 y 255 caracteres'),
  body('mensaje')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Mensaje debe tener entre 1 y 1000 caracteres'),
  body('tipo')
    .isIn(['programa', 'documento', 'miembro', 'administrativo', 'sistema', 'plancha', 'asistencia'])
    .withMessage('Tipo de notificación inválido'),
  body('prioridad')
    .optional()
    .isIn(['baja', 'normal', 'alta', 'urgente'])
    .withMessage('Prioridad inválida'),
  body('destinatario')
    .isIn(['todos', 'grado', 'admins'])
    .withMessage('Destinatario debe ser: todos, grado o admins'),
  body('gradoDestino')
    .if(body('destinatario').equals('grado'))
    .isIn(['aprendiz', 'companero', 'maestro'])
    .withMessage('Grado destino debe ser: aprendiz, companero o maestro'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Fecha de expiración debe ser válida'),
  body('accionUrl')
    .optional()
    .isURL({ require_protocol: false })
    .withMessage('URL de acción debe ser válida'),
  body('accionTexto')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Texto de acción no puede exceder 100 caracteres')
];

const notificacionIdValidation = [
  param('id').isUUID().withMessage('ID debe ser un UUID válido')
];

// Rutas

// GET /api/notificaciones - Obtener notificaciones del usuario
router.get('/', getNotificacionesValidation, notificacionesController.getNotificaciones);

// GET /api/notificaciones/estadisticas - Obtener estadísticas
router.get('/estadisticas', notificacionesController.getEstadisticas);

// GET /api/notificaciones/count - Obtener conteo de no leídas
router.get('/count', notificacionesController.getConteoNoLeidas);

// POST /api/notificaciones - Crear notificación (solo admins)
router.post('/',
  permissionsMiddleware(['send_notifications']),
  crearNotificacionValidation,
  notificacionesController.crearNotificacion
);

// PUT /api/notificaciones/:id/read - Marcar como leída
router.put('/:id/read',
  notificacionIdValidation,
  notificacionesController.marcarComoLeida
);

// PUT /api/notificaciones/read-all - Marcar todas como leídas
router.put('/read-all', notificacionesController.marcarTodasComoLeidas);

// DELETE /api/notificaciones/:id - Eliminar notificación
router.delete('/:id',
  notificacionIdValidation,
  notificacionesController.eliminarNotificacion
);

module.exports = router;