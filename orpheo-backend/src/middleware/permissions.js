const logger = require('../utils/logger');

// Definición de permisos por rol y grado
const PERMISSIONS = {
  // Permisos por rol
  roles: {
    superadmin: [
      'manage_users',
      'manage_members',
      'manage_documents',
      'manage_programs',
      'approve_planchas',
      'upload_documents',
      'view_all_members',
      'view_all_documents',
      'system_admin',
      'delete_any'
    ],
    admin: [
      'manage_members',
      'manage_documents', 
      'manage_programs',
      'approve_planchas',
      'upload_documents',
      'view_all_members',
      'view_all_documents'
    ],
    general: [
      'upload_documents',
      'view_members_same_grade',
      'view_documents_accessible'
    ]
  },

  // Permisos adicionales por grado masónico
  grados: {
    maestro: [
      'approve_planchas',
      'view_all_documents',
      'manage_programs',
      'moderate_content'
    ],
    companero: [
      'view_companero_content',
      'upload_documents'
    ],
    aprendiz: [
      'view_aprendiz_content'
    ]
  }
};

// Middleware principal de permisos
const permissionsMiddleware = (requiredPermissions = []) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // SuperAdmin tiene todos los permisos
      if (user.rol === 'superadmin') {
        return next();
      }

      // Obtener permisos del usuario
      const userPermissions = getUserPermissions(user);
      
      // Verificar si tiene todos los permisos requeridos
      const hasAllPermissions = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        logger.warn('Acceso denegado por permisos insuficientes', {
          userId: user.id,
          email: user.email,
          rol: user.rol,
          grado: user.grado,
          requiredPermissions,
          userPermissions,
          url: req.originalUrl,
          method: req.method
        });

        return res.status(403).json({
          success: false,
          message: 'No tienes permisos suficientes para realizar esta acción',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: requiredPermissions,
          missing: requiredPermissions.filter(p => !userPermissions.includes(p))
        });
      }

      // Log de acceso autorizado para acciones sensibles
      if (requiredPermissions.length > 0) {
        logger.info('Acceso autorizado con permisos', {
          userId: user.id,
          email: user.email,
          permissions: requiredPermissions,
          url: req.originalUrl,
          method: req.method
        });
      }

      next();

    } catch (error) {
      logger.error('Error en middleware de permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

// Función para obtener todos los permisos de un usuario
const getUserPermissions = (user) => {
  const permissions = new Set();

  // Agregar permisos por rol
  const rolePermissions = PERMISSIONS.roles[user.rol] || [];
  rolePermissions.forEach(permission => permissions.add(permission));

  // Agregar permisos por grado
  const gradePermissions = PERMISSIONS.grados[user.grado] || [];
  gradePermissions.forEach(permission => permissions.add(permission));

  return Array.from(permissions);
};

// Middleware específico para verificar grado mínimo
const requireGrade = (minimumGrade) => {
  const gradeHierarchy = { aprendiz: 1, companero: 2, maestro: 3 };
  
  return (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // SuperAdmin siempre pasa
    if (user.rol === 'superadmin') {
      return next();
    }

    const userGradeLevel = gradeHierarchy[user.grado] || 0;
    const requiredGradeLevel = gradeHierarchy[minimumGrade] || 0;

    if (userGradeLevel < requiredGradeLevel) {
      logger.warn('Acceso denegado por grado insuficiente', {
        userId: user.id,
        email: user.email,
        userGrade: user.grado,
        requiredGrade: minimumGrade,
        url: req.originalUrl
      });

      return res.status(403).json({
        success: false,
        message: `Se requiere grado mínimo de ${minimumGrade}`,
        code: 'INSUFFICIENT_GRADE'
      });
    }

    next();
  };
};

// Middleware para verificar que es el mismo usuario o tiene permisos de admin
const requireSelfOrAdmin = (req, res, next) => {
  const user = req.user;
  const targetUserId = parseInt(req.params.id || req.params.userId);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  // Es el mismo usuario o tiene rol de admin
  if (user.id === targetUserId || ['admin', 'superadmin'].includes(user.rol)) {
    return next();
  }

  logger.warn('Acceso denegado - no es el mismo usuario ni admin', {
    userId: user.id,
    targetUserId,
    url: req.originalUrl
  });

  return res.status(403).json({
    success: false,
    message: 'Solo puedes acceder a tu propia información',
    code: 'ACCESS_DENIED'
  });
};

// Función helper para verificar permisos específicos
const hasPermission = (user, permission) => {
  if (user.rol === 'superadmin') return true;
  
  const userPermissions = getUserPermissions(user);
  return userPermissions.includes(permission);
};

// Función helper para verificar acceso a documentos según grado
const canAccessDocumentCategory = (user, documentCategory) => {
  if (['superadmin', 'admin'].includes(user.rol)) return true;
  
  const gradeHierarchy = { aprendiz: 1, companero: 2, maestro: 3 };
  const userLevel = gradeHierarchy[user.grado] || 0;
  const documentLevel = gradeHierarchy[documentCategory] || 0;
  
  // Puede acceder si su grado es igual o superior al del documento
  // O si el documento es 'general'
  return documentCategory === 'general' || userLevel >= documentLevel;
};

module.exports = {
  permissionsMiddleware,
  requireGrade,
  requireSelfOrAdmin,
  getUserPermissions,
  hasPermission,
  canAccessDocumentCategory,
  PERMISSIONS
};