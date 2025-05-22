// Definición de permisos por grado y rol
const PERMISSIONS = {
  // Permisos por grado
  grado: {
    aprendiz: [
      'read_own_profile',
      'read_aprendiz_documents',
      'read_aprendiz_programs',
      'confirm_attendance'
    ],
    companero: [
      'read_own_profile',
      'read_aprendiz_documents',
      'read_companero_documents', 
      'read_aprendiz_programs',
      'read_companero_programs',
      'confirm_attendance'
    ],
    maestro: [
      'read_all_profiles',
      'read_all_documents',
      'read_all_programs',
      'upload_documents',
      'create_programs',
      'manage_attendance',
      'confirm_attendance'
    ]
  },
  
  // Permisos por rol
  role: {
    general: [], // Solo permisos de grado
    admin: [
      'manage_members',
      'manage_users',
      'manage_all_documents',
      'manage_all_programs',
      'view_all_reports',
      'system_configuration',
      'backup_restore',
      'audit_logs'
    ],
    superadmin: [
      '*' // Todos los permisos
    ]
  },
  
  // Permisos por cargo específico
  cargo: {
    venerable_maestro: [
      'approve_planchas',
      'manage_all_programs',
      'view_all_reports',
      'send_notifications'
    ],
    primer_vigilante: [
      'manage_aprendiz_programs',
      'manage_aprendiz_attendance'
    ],
    segundo_vigilante: [
      'manage_companero_programs',
      'manage_companero_attendance'
    ],
    secretario: [
      'manage_members',
      'manage_attendance',
      'export_reports',
      'send_notifications'
    ],
    tesorero: [
      'view_financial_reports',
      'manage_member_status'
    ],
    orador: [
      'upload_documents',
      'approve_planchas'
    ],
    maestro_ceremonias: [
      'manage_programs',
      'coordinate_events'
    ],
    hospitalario: [
      'view_member_health',
      'send_health_notifications'
    ]
  }
};

/**
 * Verificar si un usuario tiene un permiso específico
 * @param {Object} user - Usuario con propiedades: role, grado, cargo
 * @param {string} permission - Permiso a verificar
 * @returns {boolean}
 */
const hasPermission = (user, permission) => {
  if (!user || !permission) return false;
  
  // Super admin tiene todos los permisos
  if (user.role === 'superadmin') return true;
  
  // Admin tiene permisos específicos
  if (user.role === 'admin') {
    return PERMISSIONS.role.admin.includes(permission);
  }
  
  // Verificar permisos por grado
  const gradoPermissions = PERMISSIONS.grado[user.grado] || [];
  
  // Verificar permisos por cargo
  const cargoPermissions = user.cargo ? (PERMISSIONS.cargo[user.cargo] || []) : [];
  
  // Combinar todos los permisos
  const allPermissions = [...gradoPermissions, ...cargoPermissions];
  
  return allPermissions.includes(permission);
};

/**
 * Verificar si un usuario puede ver contenido de un grado específico
 * @param {string} userGrado - Grado del usuario
 * @param {string} targetGrado - Grado objetivo a verificar
 * @returns {boolean}
 */
const canViewGrado = (userGrado, targetGrado) => {
  if (!userGrado || !targetGrado) return false;
  
  const gradoHierarchy = ['aprendiz', 'companero', 'maestro'];
  const userLevel = gradoHierarchy.indexOf(userGrado);
  const targetLevel = gradoHierarchy.indexOf(targetGrado);
  
  // Si algún grado no está en la jerarquía, denegar acceso
  if (userLevel === -1 || targetLevel === -1) return false;
  
  // Usuario puede ver su grado y los inferiores
  return userLevel >= targetLevel;
};

/**
 * Verificar si un usuario puede gestionar a otro usuario
 * @param {Object} managerUser - Usuario que quiere gestionar
 * @param {Object} targetUser - Usuario objetivo
 * @returns {boolean}
 */
const canManageUser = (managerUser, targetUser) => {
  if (!managerUser || !targetUser) return false;
  
  // Super admin puede gestionar a todos
  if (managerUser.role === 'superadmin') return true;
  
  // Admin puede gestionar usuarios generales
  if (managerUser.role === 'admin' && targetUser.role === 'general') return true;
  
  // Secretario puede gestionar miembros de su grado o inferior
  if (managerUser.cargo === 'secretario') {
    return canViewGrado(managerUser.grado, targetUser.grado);
  }
  
  return false;
};

/**
 * Obtener todos los permisos de un usuario
 * @param {Object} user - Usuario
 * @returns {Array} Array de permisos
 */
const getUserPermissions = (user) => {
  if (!user) return [];
  
  // Super admin tiene todos los permisos
  if (user.role === 'superadmin') return ['*'];
  
  let permissions = [];
  
  // Permisos por rol
  if (PERMISSIONS.role[user.role]) {
    permissions = [...permissions, ...PERMISSIONS.role[user.role]];
  }
  
  // Permisos por grado
  if (PERMISSIONS.grado[user.grado]) {
    permissions = [...permissions, ...PERMISSIONS.grado[user.grado]];
  }
  
  // Permisos por cargo
  if (user.cargo && PERMISSIONS.cargo[user.cargo]) {
    permissions = [...permissions, ...PERMISSIONS.cargo[user.cargo]];
  }
  
  // Eliminar duplicados
  return [...new Set(permissions)];
};

/**
 * Verificar múltiples permisos
 * @param {Object} user - Usuario
 * @param {Array} requiredPermissions - Array de permisos requeridos
 * @param {string} operator - 'AND' (todos) o 'OR' (al menos uno)
 * @returns {boolean}
 */
const hasMultiplePermissions = (user, requiredPermissions, operator = 'AND') => {
  if (!user || !Array.isArray(requiredPermissions)) return false;
  
  if (operator === 'OR') {
    return requiredPermissions.some(permission => hasPermission(user, permission));
  } else {
    return requiredPermissions.every(permission => hasPermission(user, permission));
  }
};

/**
 * Filtrar datos basado en permisos de grado
 * @param {Array} data - Array de datos a filtrar
 * @param {Object} user - Usuario
 * @param {string} gradoField - Campo que contiene el grado en los datos
 * @returns {Array} Datos filtrados
 */
const filterByGradoPermissions = (data, user, gradoField = 'grado') => {
  if (!Array.isArray(data) || !user) return [];
  
  // Super admin y admin ven todo
  if (user.role === 'superadmin' || user.role === 'admin') return data;
  
  return data.filter(item => {
    const itemGrado = item[gradoField];
    return canViewGrado(user.grado, itemGrado);
  });
};

/**
 * Verificar permisos para operaciones CRUD
 * @param {Object} user - Usuario
 * @param {string} resource - Recurso (miembros, documentos, programas)
 * @param {string} operation - Operación (create, read, update, delete)
 * @param {Object} target - Objeto objetivo (opcional)
 * @returns {boolean}
 */
const canPerformCRUD = (user, resource, operation, target = null) => {
  if (!user || !resource || !operation) return false;
  
  // Super admin puede todo
  if (user.role === 'superadmin') return true;
  
  const permission = `${operation}_${resource}`;
  
  // Verificar permiso específico
  if (hasPermission(user, permission)) return true;
  
  // Verificaciones específicas por recurso
  switch (resource) {
    case 'miembros':
      if (operation === 'read') {
        return target ? canViewGrado(user.grado, target.grado) : true;
      }
      if (['create', 'update', 'delete'].includes(operation)) {
        return hasPermission(user, 'manage_members');
      }
      break;
      
    case 'documentos':
      if (operation === 'read') {
        return target ? canViewGrado(user.grado, target.categoria) : true;
      }
      if (operation === 'create') {
        return hasPermission(user, 'upload_documents');
      }
      if (['update', 'delete'].includes(operation)) {
        return hasPermission(user, 'manage_all_documents') || 
               (target && target.autor_id === user.id);
      }
      break;
      
    case 'programas':
      if (operation === 'read') {
        return target ? canViewGrado(user.grado, target.grado) : true;
      }
      if (operation === 'create') {
        return hasPermission(user, 'create_programs');
      }
      if (['update', 'delete'].includes(operation)) {
        return hasPermission(user, 'manage_all_programs') || 
               (target && target.responsable_id === user.id);
      }
      break;
  }
  
  return false;
};

/**
 * Verificar si puede aprobar planchas
 * @param {Object} user - Usuario
 * @param {Object} plancha - Plancha a aprobar
 * @returns {boolean}
 */
const canApprovePlancha = (user, plancha) => {
  if (!user || !plancha) return false;
  
  // Super admin y admin pueden aprobar todo
  if (user.role === 'superadmin' || user.role === 'admin') return true;
  
  // Verificar permiso específico
  if (hasPermission(user, 'approve_planchas')) return true;
  
  // Venerable Maestro puede aprobar todas
  if (user.cargo === 'venerable_maestro') return true;
  
  // Orador puede aprobar planchas
  if (user.cargo === 'orador') return true;
  
  return false;
};

/**
 * Obtener recursos accesibles para un usuario
 * @param {Object} user - Usuario
 * @returns {Object} Objeto con recursos y operaciones permitidas
 */
const getAccessibleResources = (user) => {
  if (!user) return {};
  
  const resources = {
    miembros: {
      create: hasPermission(user, 'manage_members'),
      read: true, // Todos pueden leer (con filtros por grado)
      update: hasPermission(user, 'manage_members'),
      delete: hasPermission(user, 'manage_members'),
      import: hasPermission(user, 'manage_members'),
      export: hasPermission(user, 'export_reports')
    },
    documentos: {
      create: hasPermission(user, 'upload_documents'),
      read: true, // Todos pueden leer (con filtros por grado)
      update: hasPermission(user, 'manage_all_documents'),
      delete: hasPermission(user, 'manage_all_documents'),
      approve_planchas: canApprovePlancha(user, {})
    },
    programas: {
      create: hasPermission(user, 'create_programs'),
      read: true, // Todos pueden leer (con filtros por grado)
      update: hasPermission(user, 'manage_all_programs'),
      delete: hasPermission(user, 'manage_all_programs'),
      manage_attendance: hasPermission(user, 'manage_attendance')
    },
    reportes: {
      view: hasPermission(user, 'view_all_reports') || hasPermission(user, 'export_reports'),
      export: hasPermission(user, 'export_reports')
    },
    sistema: {
      configuration: hasPermission(user, 'system_configuration'),
      backup: hasPermission(user, 'backup_restore'),
      audit_logs: hasPermission(user, 'audit_logs'),
      manage_users: hasPermission(user, 'manage_users')
    }
  };
  
  return resources;
};

module.exports = {
  PERMISSIONS,
  hasPermission,
  canViewGrado,
  canManageUser,
  getUserPermissions,
  hasMultiplePermissions,
  filterByGradoPermissions,
  canPerformCRUD,
  canApprovePlancha,
  getAccessibleResources
};