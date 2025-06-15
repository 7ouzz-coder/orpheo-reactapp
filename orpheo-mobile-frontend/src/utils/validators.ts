import { VALIDATIONS } from './constants';
import { validateRUT, validateEmail, validatePhone, validatePassword } from './helpers';

// Tipos para validaciones
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Valida un campo requerido
 */
export const validateRequired = (value: any, fieldName: string = 'Campo'): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return {
      isValid: false,
      error: `${fieldName} es obligatorio`
    };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return {
      isValid: false,
      error: `${fieldName} es obligatorio`
    };
  }
  
  return { isValid: true };
};

/**
 * Valida longitud mínima
 */
export const validateMinLength = (
  value: string, 
  minLength: number, 
  fieldName: string = 'Campo'
): ValidationResult => {
  if (!value || value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} debe tener al menos ${minLength} caracteres`
    };
  }
  
  return { isValid: true };
};

/**
 * Valida longitud máxima
 */
export const validateMaxLength = (
  value: string, 
  maxLength: number, 
  fieldName: string = 'Campo'
): ValidationResult => {
  if (value && value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} no puede tener más de ${maxLength} caracteres`
    };
  }
  
  return { isValid: true };
};

/**
 * Valida formato de email
 */
export const validateEmailFormat = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: true }; // Email vacío es válido si no es requerido
  }
  
  if (!validateEmail(email)) {
    return {
      isValid: false,
      error: 'El formato del email no es válido'
    };
  }
  
  return { isValid: true };
};

/**
 * Valida formato de RUT
 */
export const validateRUTFormat = (rut: string): ValidationResult => {
  if (!rut) {
    return { isValid: true }; // RUT vacío es válido si no es requerido
  }
  
  if (!validateRUT(rut)) {
    return {
      isValid: false,
      error: 'El RUT no es válido'
    };
  }
  
  return { isValid: true };
};

/**
 * Valida formato de teléfono
 */
export const validatePhoneFormat = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: true }; // Teléfono vacío es válido si no es requerido
  }
  
  if (!validatePhone(phone)) {
    return {
      isValid: false,
      error: 'El formato del teléfono no es válido'
    };
  }
  
  return { isValid: true };
};

/**
 * Valida formato de contraseña
 */
export const validatePasswordFormat = (password: string): ValidationResult => {
  if (!password) {
    return {
      isValid: false,
      error: 'La contraseña es obligatoria'
    };
  }
  
  const validation = validatePassword(password);
  
  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.errors[0] // Mostrar el primer error
    };
  }
  
  return { isValid: true };
};

/**
 * Valida que las contraseñas coincidan
 */
export const validatePasswordConfirmation = (
  password: string, 
  confirmPassword: string
): ValidationResult => {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'Las contraseñas no coinciden'
    };
  }
  
  return { isValid: true };
};

/**
 * Valida una fecha
 */
export const validateDate = (
  dateString: string, 
  fieldName: string = 'Fecha'
): ValidationResult => {
  if (!dateString) {
    return { isValid: true }; // Fecha vacía es válida si no es requerida
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: `${fieldName} no es una fecha válida`
    };
  }
  
  return { isValid: true };
};

/**
 * Valida que una fecha sea futura
 */
export const validateFutureDate = (
  dateString: string, 
  fieldName: string = 'Fecha'
): ValidationResult => {
  if (!dateString) {
    return { isValid: true };
  }
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (date <= now) {
    return {
      isValid: false,
      error: `${fieldName} debe ser una fecha futura`
    };
  }
  
  return { isValid: true };
};

/**
 * Valida rango de edad
 */
export const validateAge = (
  birthDate: string, 
  minAge: number = 18, 
  maxAge: number = 120
): ValidationResult => {
  if (!birthDate) {
    return { isValid: true };
  }
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  if (age < minAge) {
    return {
      isValid: false,
      error: `Debe tener al menos ${minAge} años`
    };
  }
  
  if (age > maxAge) {
    return {
      isValid: false,
      error: `La edad no puede ser mayor a ${maxAge} años`
    };
  }
  
  return { isValid: true };
};

/**
 * Valida un grado masónico
 */
export const validateGrado = (grado: string): ValidationResult => {
  const gradosValidos = ['aprendiz', 'companero', 'maestro'];
  
  if (!gradosValidos.includes(grado)) {
    return {
      isValid: false,
      error: 'Grado masónico no válido'
    };
  }
  
  return { isValid: true };
};

/**
 * Valida tamaño de archivo
 */
export const validateFileSize = (
  fileSize: number, 
  maxSize: number = 10 * 1024 * 1024 // 10MB por defecto
): ValidationResult => {
  if (fileSize > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      error: `El archivo no puede ser mayor a ${maxSizeMB}MB`
    };
  }
  
  return { isValid: true };
};

/**
 * Valida tipo de archivo
 */
export const validateFileType = (
  fileName: string, 
  allowedTypes: string[]
): ValidationResult => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (!extension || !allowedTypes.includes(extension)) {
    return {
      isValid: false,
      error: `Tipo de archivo no permitido. Tipos válidos: ${allowedTypes.join(', ')}`
    };
  }
  
  return { isValid: true };
};

// Validadores compuestos para formularios específicos

/**
 * Valida formulario de login
 */
export const validateLoginForm = (data: {
  username: string;
  password: string;
}): FormValidationResult => {
  const errors: Record<string, string> = {};
  
  // Validar username
  const usernameRequired = validateRequired(data.username, 'Usuario');
  if (!usernameRequired.isValid) {
    errors.username = usernameRequired.error!;
  } else {
    const usernameLength = validateMinLength(data.username, VALIDATIONS.USERNAME_MIN_LENGTH, 'Usuario');
    if (!usernameLength.isValid) {
      errors.username = usernameLength.error!;
    }
  }
  
  // Validar password
  const passwordRequired = validateRequired(data.password, 'Contraseña');
  if (!passwordRequired.isValid) {
    errors.password = passwordRequired.error!;
  } else {
    const passwordFormat = validatePasswordFormat(data.password);
    if (!passwordFormat.isValid) {
      errors.password = passwordFormat.error!;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida formulario de miembro
 */
export const validateMiembroForm = (data: {
  nombres: string;
  apellidos: string;
  rut: string;
  grado: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
}): FormValidationResult => {
  const errors: Record<string, string> = {};
  
  // Campos obligatorios
  const nombresRequired = validateRequired(data.nombres, 'Nombres');
  if (!nombresRequired.isValid) {
    errors.nombres = nombresRequired.error!;
  }
  
  const apellidosRequired = validateRequired(data.apellidos, 'Apellidos');
  if (!apellidosRequired.isValid) {
    errors.apellidos = apellidosRequired.error!;
  }
  
  const rutRequired = validateRequired(data.rut, 'RUT');
  if (!rutRequired.isValid) {
    errors.rut = rutRequired.error!;
  } else {
    const rutFormat = validateRUTFormat(data.rut);
    if (!rutFormat.isValid) {
      errors.rut = rutFormat.error!;
    }
  }
  
  const gradoValidation = validateGrado(data.grado);
  if (!gradoValidation.isValid) {
    errors.grado = gradoValidation.error!;
  }
  
  // Campos opcionales
  if (data.email) {
    const emailFormat = validateEmailFormat(data.email);
    if (!emailFormat.isValid) {
      errors.email = emailFormat.error!;
    }
  }
  
  if (data.telefono) {
    const phoneFormat = validatePhoneFormat(data.telefono);
    if (!phoneFormat.isValid) {
      errors.telefono = phoneFormat.error!;
    }
  }
  
  if (data.fechaNacimiento) {
    const dateValidation = validateDate(data.fechaNacimiento, 'Fecha de nacimiento');
    if (!dateValidation.isValid) {
      errors.fechaNacimiento = dateValidation.error!;
    } else {
      const ageValidation = validateAge(data.fechaNacimiento);
      if (!ageValidation.isValid) {
        errors.fechaNacimiento = ageValidation.error!;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida formulario de documento
 */
export const validateDocumentoForm = (data: {
  titulo: string;
  tipo: string;
  visibilidad: string[];
  archivo?: { name: string; size: number };
}): FormValidationResult => {
  const errors: Record<string, string> = {};
  
  const tituloRequired = validateRequired(data.titulo, 'Título');
  if (!tituloRequired.isValid) {
    errors.titulo = tituloRequired.error!;
  } else {
    const tituloLength = validateMinLength(data.titulo, 3, 'Título');
    if (!tituloLength.isValid) {
      errors.titulo = tituloLength.error!;
    }
  }
  
  const tipoRequired = validateRequired(data.tipo, 'Tipo de documento');
  if (!tipoRequired.isValid) {
    errors.tipo = tipoRequired.error!;
  }
  
  if (!data.visibilidad || data.visibilidad.length === 0) {
    errors.visibilidad = 'Debe seleccionar al menos un grado';
  }
  
  if (data.archivo) {
    const fileSizeValidation = validateFileSize(data.archivo.size);
    if (!fileSizeValidation.isValid) {
      errors.archivo = fileSizeValidation.error!;
    }
    
    const fileTypeValidation = validateFileType(data.archivo.name, ['pdf', 'doc', 'docx', 'txt']);
    if (!fileTypeValidation.isValid) {
      errors.archivo = fileTypeValidation.error!;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida formulario de programa
 */
export const validateProgramaForm = (data: {
  titulo: string;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  lugar: string;
  gradosPermitidos: string[];
  maxAsistentes: number;
}): FormValidationResult => {
  const errors: Record<string, string> = {};
  
  const tituloRequired = validateRequired(data.titulo, 'Título');
  if (!tituloRequired.isValid) {
    errors.titulo = tituloRequired.error!;
  }
  
  const tipoRequired = validateRequired(data.tipo, 'Tipo de programa');
  if (!tipoRequired.isValid) {
    errors.tipo = tipoRequired.error!;
  }
  
  const fechaInicioRequired = validateRequired(data.fechaInicio, 'Fecha de inicio');
  if (!fechaInicioRequired.isValid) {
    errors.fechaInicio = fechaInicioRequired.error!;
  } else {
    const fechaInicioValidation = validateDate(data.fechaInicio, 'Fecha de inicio');
    if (!fechaInicioValidation.isValid) {
      errors.fechaInicio = fechaInicioValidation.error!;
    }
  }
  
  const fechaFinRequired = validateRequired(data.fechaFin, 'Fecha de fin');
  if (!fechaFinRequired.isValid) {
    errors.fechaFin = fechaFinRequired.error!;
  } else {
    const fechaFinValidation = validateDate(data.fechaFin, 'Fecha de fin');
    if (!fechaFinValidation.isValid) {
      errors.fechaFin = fechaFinValidation.error!;
    } else if (new Date(data.fechaFin) <= new Date(data.fechaInicio)) {
      errors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
  }
  
  const lugarRequired = validateRequired(data.lugar, 'Lugar');
  if (!lugarRequired.isValid) {
    errors.lugar = lugarRequired.error!;
  }
  
  if (!data.gradosPermitidos || data.gradosPermitidos.length === 0) {
    errors.gradosPermitidos = 'Debe seleccionar al menos un grado';
  }
  
  if (!data.maxAsistentes || data.maxAsistentes < 1) {
    errors.maxAsistentes = 'El máximo de asistentes debe ser mayor a 0';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};