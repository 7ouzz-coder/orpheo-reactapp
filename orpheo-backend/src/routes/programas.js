const express = require('express');
const { body, param, query } = require('express-validator');
const programasController = require('../controllers/programasController');
const authMiddleware = require('../middleware/auth');
const { permissionsMiddleware } = require('../middleware/permissions');


const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// Validaciones
const createProgramaValidation = [
  body('tema')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Tema debe tener entre 3 y 255 caracteres'),
  body('fecha')
    .isISO8601()
    .withMessage('Fecha debe ser válida')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fecha < hoy) {
        throw new Error('La fecha debe ser futura');
      }
      return true;
    }),
  body('encargado')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Encargado debe tener entre 2 y 100 caracteres'),
  body('quienImparte')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Quien imparte no puede exceder 100 caracteres'),
  body('resumen')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Resumen no puede exceder 1000 caracteres'),
  body('grado')
    .isIn(['aprendiz', 'companero', 'maestro', 'general'])
    .withMessage('Grado debe ser aprendiz, companero, maestro o general'),
  body('tipo')
    .isIn(['tenida', 'instruccion', 'camara', 'trabajo', 'ceremonia', 'reunion'])
    .withMessage('Tipo de programa inválido'),
  body('estado')
    .optional()
    .isIn(['pendiente', 'programado', 'completado', 'cancelado'])
    .withMessage('Estado inválido'),
  body('ubicacion')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Ubicación no puede exceder 200 caracteres'),
  body('detallesAdicionales')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Detalles adicionales no pueden exceder 1000 caracteres'),
  body('requiereConfirmacion')
    .optional()
    .isBoolean()
    .withMessage('Requiere confirmación debe ser true o false'),
  body('limiteAsistentes')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Límite de asistentes debe ser un número mayor a 0'),
  body('observaciones')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Observaciones no pueden exceder 1000 caracteres')
];

const updateProgramaValidation = [
  param('id').isUUID().withMessage('ID debe ser un UUID válido'),
  ...createProgramaValidation.map(validation => validation.optional())
];

const getProgramaValidation = [
  param('id').isUUID().withMessage('ID debe ser un UUID válido')
];

const getProgramasValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número mayor a 0'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
  query('grado').optional().isIn(['aprendiz', 'companero', 'maestro', 'general', 'todos']).withMessage('Grado inválido'),
  query('tipo').optional().isIn(['tenida', 'instruccion', 'camara', 'trabajo', 'ceremonia', 'reunion', 'todos']).withMessage('Tipo inválido'),
  query('estado').optional().isIn(['pendiente', 'programado', 'completado', 'cancelado', 'todos']).withMessage('Estado inválido'),
  query('fecha_desde').optional().isISO8601().withMessage('Fecha desde debe ser válida'),
  query('fecha_hasta').optional().isISO8601().withMessage('Fecha hasta debe ser válida'),
  query('sortBy').optional().isIn(['fecha', 'tema', 'grado', 'tipo', 'estado', 'created_at']).withMessage('Campo de ordenamiento inválido'),
  query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Orden debe ser ASC o DESC')
];

const gestionarAsistenciaValidation = [
  param('programaId').isUUID().withMessage('ID de programa debe ser un UUID válido'),
  body('miembroId')
    .isUUID()
    .withMessage('ID de miembro debe ser un UUID válido'),
  body('asistio')
    .isBoolean()
    .withMessage('Asistio debe ser true o false'),
  body('justificacion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Justificación no puede exceder 500 caracteres'),
  body('horaLlegada')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora de llegada debe tener formato HH:MM')
];

// Rutas

// GET /api/programas - Obtener todos los programas
router.get('/', getProgramasValidation, programasController.getProgramas);

// GET /api/programas/estadisticas - Obtener estadísticas
router.get('/estadisticas', programasController.getEstadisticas);

// GET /api/programas/:id - Obtener un programa por ID
router.get('/:id', getProgramaValidation, programasController.getProgramaById);

// POST /api/programas - Crear nuevo programa
router.post('/', 
  permissionsMiddleware(['create_programs']),
  createProgramaValidation,
  programasController.createPrograma
);

// PUT /api/programas/:id - Actualizar programa
router.put('/:id', 
  updateProgramaValidation,
  programasController.updatePrograma
);

// DELETE /api/programas/:id - Eliminar programa
router.delete('/:id', 
  getProgramaValidation,
  programasController.deletePrograma
);

// POST /api/programas/:programaId/asistencia - Gestionar asistencia
router.post('/:programaId/asistencia',
  permissionsMiddleware(['manage_attendance']),
  gestionarAsistenciaValidation,
  programasController.gestionarAsistencia
);

module.exports = router;