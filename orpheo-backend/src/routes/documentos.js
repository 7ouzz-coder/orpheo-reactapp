const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, param, query } = require('express-validator');
const documentosController = require('../controllers/documentosController');
const authMiddleware = require('../middleware/auth');
const permissionsMiddleware = require('../middleware/permissions');

const router = express.Router();

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'txt'];
  const fileExtension = path.extname(file.originalname).slice(1).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter
});

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// Validaciones
const uploadDocumentoValidation = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Nombre debe tener entre 1 y 255 caracteres'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descripción no puede exceder 1000 caracteres'),
  body('categoria')
    .isIn(['aprendiz', 'companero', 'maestro', 'general', 'administrativo'])
    .withMessage('Categoría debe ser aprendiz, companero, maestro, general o administrativo'),
  body('subcategoria')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Subcategoría no puede exceder 100 caracteres'),
  body('palabrasClave')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Palabras clave no pueden exceder 500 caracteres'),
  body('esPlancha')
    .optional()
    .isBoolean()
    .withMessage('esPlancha debe ser true o false'),
  body('planchaId')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('ID de plancha no puede exceder 50 caracteres'),
  body('autorId')
    .optional()
    .isInt()
    .withMessage('ID de autor debe ser un número entero'),
  body('autorNombre')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nombre de autor no puede exceder 100 caracteres')
];

const updateDocumentoValidation = [
  param('id').isInt().withMessage('ID debe ser un número entero'),
  ...uploadDocumentoValidation.map(validation => validation.optional())
];

const getDocumentoValidation = [
  param('id').isInt().withMessage('ID debe ser un número entero')
];

const getDocumentosValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número mayor a 0'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
  query('categoria').optional().isIn(['aprendiz', 'companero', 'maestro', 'general', 'administrativo', 'todos']).withMessage('Categoría inválida'),
  query('tipo').optional().isAlpha().withMessage('Tipo debe contener solo letras'),
  query('esplancha').optional().isBoolean().withMessage('esPlancha debe ser true o false'),
  query('sortBy').optional().isIn(['nombre', 'tipo', 'categoria', 'created_at', 'descargas']).withMessage('Campo de ordenamiento inválido'),
  query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Orden debe ser ASC o DESC')
];

const moderarPlanchaValidation = [
  param('id').isInt().withMessage('ID debe ser un número entero'),
  body('estado')
    .isIn(['aprobada', 'rechazada'])
    .withMessage('Estado debe ser aprobada o rechazada'),
  body('comentarios')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comentarios no pueden exceder 1000 caracteres')
];

// Rutas

// GET /api/documentos - Obtener todos los documentos
router.get('/', getDocumentosValidation, documentosController.getDocumentos);

// GET /api/documentos/estadisticas - Obtener estadísticas
router.get('/estadisticas', documentosController.getEstadisticas);

// GET /api/documentos/:id - Obtener un documento por ID
router.get('/:id', getDocumentoValidation, documentosController.getDocumentoById);

// GET /api/documentos/:id/download - Descargar documento
router.get('/:id/download', getDocumentoValidation, documentosController.downloadDocumento);

// POST /api/documentos - Subir nuevo documento
router.post('/', 
  permissionsMiddleware(['upload_documents']),
  upload.single('archivo'),
  uploadDocumentoValidation,
  documentosController.uploadDocumento
);

// PUT /api/documentos/:id - Actualizar documento
router.put('/:id', 
  updateDocumentoValidation,
  documentosController.updateDocumento
);

// DELETE /api/documentos/:id - Eliminar documento
router.delete('/:id', 
  getDocumentoValidation,
  documentosController.deleteDocumento
);

// POST /api/documentos/:id/moderar - Aprobar/rechazar plancha
router.post('/:id/moderar',
  permissionsMiddleware(['approve_planchas']),
  moderarPlanchaValidation,
  documentosController.moderarPlancha
);

module.exports = router;