const logger = require('../utils/logger');

// Definir permisos por rol
const ROLE_PERMISSIONS = {
  superadmin: [
    'manage_users',
    'manage_members',
    'manage_documents',
    'manage_programs',
    'manage_notifications',
    'view_audit_logs',
    'manage_system',
    'access_all_grades',
    'create_programs',
    'manage_attendance',
    'send_notifications'
  ],
  admin: [
    'manage_members',
    'manage_documents',
    'manage_programs',
    'manage_notifications',
    'view_reports',
    'access_all_grades',
    'create_programs',
    'manage_attendance',
    'send_notifications'
  ],
  general: [
    'view_members',
    'view_documents',
    'view_programs',
    'create_documents',
    'access_own_grade'
  ]
};

// Definir permisos por grado masónico
const GRADE_PERMISSIONS = {
  maestro: [
    'view_all_documents',
    'moderate_documents',
    'access_master_content',
    'access_companero_content',
    'access_aprendiz_content'
  ],
  companero: [
    'view_companero_documents',
    'access_companero_content',
    'access_aprendiz_content'
  ],
  aprendiz: [
    'view_aprendiz_documents',
    'access_aprendiz_content'
  ]
};

/**
 * Middleware para verificar permisos específicos
 * @param {string|string[]} requiredPermissions - Permisos requeridos
 * @param {Object} options - Opciones adicionales
 * @returns {Function} Middleware function
 */
const permissionsMiddleware = (requiredPermissions = [], options = {}) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Convertir a array si es string
      const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

      // Obtener permisos del usuario basado en su rol
      const userPermissions = ROLE_PERMISSIONS[user.rol] || [];
      
      // Obtener permisos del usuario basado en su grado
      const gradePermissions = GRADE_PERMISSIONS[user.grado] || [];
      
      // Combinar permisos
      const allUserPermissions = [...userPermissions, ...gradePermissions];

      // Verificar si el usuario tiene todos los permisos requeridos
      const hasAllPermissions = permissions.every(permission => 
        allUserPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        logger.security('Acceso denegado por permisos insuficientes', {
          userId: user.id,
          email: user.email,
          rol: user.rol,
          grado: user.grado,
          requiredPermissions: permissions,
          userPermissions: allUserPermissions,
          url: req.originalUrl,
          method: req.method,
          ip: req.ip
        });

        return res.status(403).json({
          success: false,
          message: 'Permisos insuficientes para realizar esta acción',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      // Log de acceso autorizado para acciones importantes
      if (req.method !== 'GET') {
        logger.audit('Acceso autorizado a acción protegida', {
          userId: user.id,
          email: user.email,
          rol: user.rol,
          grado: user.grado,
          permissions: permissions,
          url: req.originalUrl,
          method: req.method,
          ip: req.ip
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

/**
 * Verificar si un usuario tiene un permiso específico
 * @param {Object} user - Usuario
 * @param {string} permission - Permiso a verificar
 * @returns {boolean}
 */
const hasPermission = (user, permission) => {
  if (!user || !permission) return false;

  const userPermissions = ROLE_PERMISSIONS[user.rol] || [];
  const gradePermissions = GRADE_PERMISSIONS[user.grado] || [];
  
  return [...userPermissions, ...gradePermissions].includes(permission);
};

/**
 * Verificar si un usuario puede acceder a contenido de cierto grado
 * @param {Object} user - Usuario
 * @param {string} requiredGrade - Grado requerido
 * @returns {boolean}
 */
const canAccessGrade = (user, requiredGrade) => {
  if (!user || !requiredGrade) return false;

  // SuperAdmin y Admin pueden acceder a todo
  if (['superadmin', 'admin'].includes(user.rol)) {
    return true;
  }

  const gradoJerarquia = { aprendiz: 1, companero: 2, maestro: 3 };
  const userGradeLevel = gradoJerarquia[user.grado] || 0;
  const requiredGradeLevel = gradoJerarquia[requiredGrade] || 0;

  return userGradeLevel >= requiredGradeLevel;
};

/**
 * Middleware para verificar que el usuario pueda acceder a contenido de cierto grado
 * @param {string} requiredGrade - Grado requerido
 * @returns {Function} Middleware function
 */
const requireGrade = (requiredGrade) => {
  return (req, res, next) => {
    const user = req.user;

    if (!canAccessGrade(user, requiredGrade)) {
      logger.security('Acceso denegado por grado insuficiente', {
        userId: user.id,
        userGrade: user.grado,
        requiredGrade: requiredGrade,
        url: req.originalUrl
      });

      return res.status(403).json({
        success: false,
        message: `Grado ${requiredGrade} requerido para acceder a este contenido`,
        code: 'INSUFFICIENT_GRADE'
      });
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario sea administrador
 */
const requireAdmin = permissionsMiddleware(['manage_members', 'manage_documents']);

/**
 * Middleware para verificar que el usuario sea super administrador
 */
const requireSuperAdmin = permissionsMiddleware(['manage_system']);

module.exports = {
  permissionsMiddleware,
  hasPermission,
  canAccessGrade,
  requireGrade,
  requireAdmin,
  requireSuperAdmin,
  ROLE_PERMISSIONS,
  GRADE_PERMISSIONS
};
