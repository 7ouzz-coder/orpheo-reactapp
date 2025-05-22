const { hasPermission } = require('../utils/permissions');
const logger = require('../utils/logger');

const permissionsMiddleware = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Super admin tiene todos los permisos
      if (user.role === 'superadmin') {
        return next();
      }

      // Verificar cada permiso requerido
      const hasAllPermissions = requiredPermissions.every(permission => 
        hasPermission(user, permission)
      );

      if (!hasAllPermissions) {
        logger.warn(`Acceso denegado - Usuario: ${user.username}, Permisos requeridos: ${requiredPermissions.join(', ')}`);
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos suficientes para realizar esta acción'
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

module.exports = permissionsMiddleware;