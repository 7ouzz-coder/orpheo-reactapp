/**
 * Utilidades de validación para formularios de miembros
 */

/**
 * Validar RUT chileno
 * @param {string} rut - RUT a validar
 * @returns {boolean} - true si es válido
 */
export const validarRUT = (rut) => {
  if (!rut || typeof rut !== 'string') return false;
  
  // Limpiar RUT (quitar puntos, guiones y espacios)
  const rutLimpio = rut.replace(/[.\-\s]/g, '').toUpperCase();
  
  // Verificar formato básico (al menos 8 caracteres, último puede ser K)
  if (rutLimpio.length < 8 || rutLimpio.length > 9) return false;
  
  // Separar número y dígito verificador
  const rutNumero = rutLimpio.slice(0, -1);
  const digitoVerificador = rutLimpio.slice(-1);
  
  // Verificar que el número sea numérico
  if (!/^\d+$/.test(rutNumero)) return false;
  
  // Calcular dígito verificador
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = rutNumero.length - 1; i >= 0; i--) {
    suma += parseInt(rutNumero[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const resto = suma % 11;
  const digitoCalculado = resto === 0 ? '0' : resto === 1 ? 'K' : (11 - resto).toString();
  
  return digitoVerificador === digitoCalculado;
};

/**
 * Formatear RUT con puntos y guión
 * @param {string} rut - RUT a formatear
 * @returns {string} - RUT formateado
 */
export const formatearRUT = (rut) => {
  if (!rut) return '';
  
  // Limpiar RUT
  const rutLimpio = rut.replace(/[.\-\s]/g, '').toUpperCase();
  
  if (rutLimpio.length < 2) return rutLimpio;
  
  // Separar número y dígito verificador
  const rutNumero = rutLimpio.slice(0, -1);
  const digitoVerificador = rutLimpio.slice(-1);
  
  // Formatear número con puntos
  const numeroFormateado = rutNumero.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  
  return `${numeroFormateado}-${digitoVerificador}`;
};

/**
 * Limpiar RUT (quitar formato)
 * @param {string} rut - RUT formateado
 * @returns {string} - RUT sin formato
 */
export const limpiarRUT = (rut) => {
  if (!rut) return '';
  return rut.replace(/[.\-\s]/g, '').toUpperCase();
};

/**
 * Validar email
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido
 */
export const validarEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * Validar teléfono chileno
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} - true si es válido
 */
export const validarTelefono = (telefono) => {
  if (!telefono || typeof telefono !== 'string') return true; // Opcional
  
  // Limpiar teléfono
  const telefonoLimpio = telefono.replace(/[\s\-\(\)\+]/g, '');
  
  // Patrones válidos para Chile
  const patronesTelefono = [
    /^569\d{8}$/, // +569 12345678 (móvil)
    /^56\d{8,9}$/, // +56 2 12345678 (fijo) o +56 9 12345678 (móvil)
    /^9\d{8}$/, // 987654321 (móvil sin código país)
    /^\d{8,9}$/, // 12345678 o 212345678 (fijo)
  ];
  
  return patronesTelefono.some(patron => patron.test(telefonoLimpio));
};

/**
 * Formatear teléfono chileno
 * @param {string} telefono - Teléfono a formatear
 * @returns {string} - Teléfono formateado
 */
export const formatearTelefono = (telefono) => {
  if (!telefono) return '';
  
  const telefonoLimpio = telefono.replace(/[\s\-\(\)\+]/g, '');
  
  // Móvil con código país
  if (/^569\d{8}$/.test(telefonoLimpio)) {
    return `+${telefonoLimpio.slice(0, 2)} ${telefonoLimpio.slice(2, 3)} ${telefonoLimpio.slice(3, 7)} ${telefonoLimpio.slice(7)}`;
  }
  
  // Fijo con código país
  if (/^56\d{8,9}$/.test(telefonoLimpio)) {
    if (telefonoLimpio.length === 10) { // Fijo Santiago
      return `+${telefonoLimpio.slice(0, 2)} ${telefonoLimpio.slice(2, 3)} ${telefonoLimpio.slice(3, 7)} ${telefonoLimpio.slice(7)}`;
    } else { // Fijo regiones
      return `+${telefonoLimpio.slice(0, 2)} ${telefonoLimpio.slice(2, 4)} ${telefonoLimpio.slice(4, 7)} ${telefonoLimpio.slice(7)}`;
    }
  }
  
  // Móvil sin código país
  if (/^9\d{8}$/.test(telefonoLimpio)) {
    return `+56 ${telefonoLimpio.slice(0, 1)} ${telefonoLimpio.slice(1, 5)} ${telefonoLimpio.slice(5)}`;
  }
  
  // Fijo sin código país
  if (/^\d{8,9}$/.test(telefonoLimpio)) {
    if (telefonoLimpio.length === 8) { // Santiago
      return `+56 2 ${telefonoLimpio.slice(0, 4)} ${telefonoLimpio.slice(4)}`;
    } else { // Regiones
      return `+56 ${telefonoLimpio.slice(0, 2)} ${telefonoLimpio.slice(2, 5)} ${telefonoLimpio.slice(5)}`;
    }
  }
  
  return telefono; // Devolver original si no coincide con ningún patrón
};

/**
 * Validar nombre (solo letras, espacios y acentos)
 * @param {string} nombre - Nombre a validar
 * @returns {boolean} - true si es válido
 */
export const validarNombre = (nombre) => {
  if (!nombre || typeof nombre !== 'string') return false;
  
  const nombreTrim = nombre.trim();
  if (nombreTrim.length < 2) return false;
  
  // Permitir letras, espacios, acentos y algunos caracteres especiales comunes en nombres
  const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-'\.]+$/;
  return nombreRegex.test(nombreTrim);
};

/**
 * Validar edad mínima
 * @param {Date|string} fechaNacimiento - Fecha de nacimiento
 * @param {number} edadMinima - Edad mínima requerida (default: 18)
 * @returns {boolean} - true si cumple la edad mínima
 */
export const validarEdadMinima = (fechaNacimiento, edadMinima = 18) => {
  if (!fechaNacimiento) return false;
  
  try {
    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();
    
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const diferenciaMeses = hoy.getMonth() - fechaNac.getMonth();
    
    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    
    return edad >= edadMinima;
  } catch {
    return false;
  }
};

/**
 * Validar fecha no futura
 * @param {Date|string} fecha - Fecha a validar
 * @returns {boolean} - true si no es futura
 */
export const validarFechaNoFutura = (fecha) => {
  if (!fecha) return false;
  
  try {
    const fechaValidar = new Date(fecha);
    const hoy = new Date();
    
    // Resetear horas para comparar solo fechas
    hoy.setHours(23, 59, 59, 999);
    
    return fechaValidar <= hoy;
  } catch {
    return false;
  }
};

/**
 * Validar fecha de ingreso posterior al nacimiento
 * @param {Date|string} fechaIngreso - Fecha de ingreso
 * @param {Date|string} fechaNacimiento - Fecha de nacimiento
 * @returns {boolean} - true si la fecha de ingreso es posterior
 */
export const validarFechaIngresoPosterior = (fechaIngreso, fechaNacimiento) => {
  if (!fechaIngreso || !fechaNacimiento) return false;
  
  try {
    const ingreso = new Date(fechaIngreso);
    const nacimiento = new Date(fechaNacimiento);
    
    return ingreso > nacimiento;
  } catch {
    return false;
  }
};

/**
 * Validar longitud de texto
 * @param {string} texto - Texto a validar
 * @param {number} minimo - Longitud mínima
 * @param {number} maximo - Longitud máxima
 * @returns {boolean} - true si está en el rango
 */
export const validarLongitud = (texto, minimo = 0, maximo = Infinity) => {
  if (!texto && minimo === 0) return true; // Opcional
  if (!texto && minimo > 0) return false; // Requerido
  
  const longitud = texto.trim().length;
  return longitud >= minimo && longitud <= maximo;
};

/**
 * Sanitizar texto (limpiar caracteres peligrosos)
 * @param {string} texto - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export const sanitizarTexto = (texto) => {
  if (!texto || typeof texto !== 'string') return '';
  
  return texto
    .trim()
    .replace(/[<>\"'&]/g, '') // Remover caracteres HTML peligrosos
    .replace(/\s+/g, ' '); // Normalizar espacios múltiples
};

/**
 * Validar formato de dirección
 * @param {string} direccion - Dirección a validar
 * @returns {boolean} - true si es válida
 */
export const validarDireccion = (direccion) => {
  if (!direccion) return true; // Opcional
  
  const direccionTrim = direccion.trim();
  if (direccionTrim.length < 5) return false;
  
  // Permitir letras, números, espacios y caracteres comunes en direcciones
  const direccionRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\#\.,°]+$/;
  return direccionRegex.test(direccionTrim);
};

/**
 * Validar grado masónico
 * @param {string} grado - Grado a validar
 * @returns {boolean} - true si es válido
 */
export const validarGrado = (grado) => {
  const gradosValidos = ['aprendiz', 'companero', 'compañero', 'maestro'];
  return gradosValidos.includes(grado?.toLowerCase());
};

/**
 * Validar estado de miembro
 * @param {string} estado - Estado a validar
 * @returns {boolean} - true si es válido
 */
export const validarEstado = (estado) => {
  const estadosValidos = ['activo', 'inactivo', 'suspendido'];
  return estadosValidos.includes(estado?.toLowerCase());
};

/**
 * Validador compuesto para formulario de miembro
 * @param {Object} datos - Datos del miembro a validar
 * @returns {Object} - Objeto con errores por campo
 */
export const validarFormularioMiembro = (datos) => {
  const errores = {};
  
  // Nombres
  if (!validarNombre(datos.nombres)) {
    if (!datos.nombres?.trim()) {
      errores.nombres = 'Los nombres son requeridos';
    } else if (datos.nombres.trim().length < 2) {
      errores.nombres = 'Los nombres deben tener al menos 2 caracteres';
    } else {
      errores.nombres = 'Los nombres contienen caracteres no válidos';
    }
  }
  
  // Apellidos
  if (!validarNombre(datos.apellidos)) {
    if (!datos.apellidos?.trim()) {
      errores.apellidos = 'Los apellidos son requeridos';
    } else if (datos.apellidos.trim().length < 2) {
      errores.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    } else {
      errores.apellidos = 'Los apellidos contienen caracteres no válidos';
    }
  }
  
  // RUT
  if (!datos.rut?.trim()) {
    errores.rut = 'El RUT es requerido';
  } else if (!validarRUT(datos.rut)) {
    errores.rut = 'El RUT no es válido';
  }
  
  // Email
  if (!datos.email?.trim()) {
    errores.email = 'El email es requerido';
  } else if (!validarEmail(datos.email)) {
    errores.email = 'El email no es válido';
  }
  
  // Teléfono (opcional)
  if (datos.telefono?.trim() && !validarTelefono(datos.telefono)) {
    errores.telefono = 'El teléfono no es válido';
  }
  
  // Fecha de nacimiento
  if (!datos.fecha_nacimiento) {
    errores.fecha_nacimiento = 'La fecha de nacimiento es requerida';
  } else if (!validarFechaNoFutura(datos.fecha_nacimiento)) {
    errores.fecha_nacimiento = 'La fecha de nacimiento no puede ser futura';
  } else if (!validarEdadMinima(datos.fecha_nacimiento, 16)) {
    errores.fecha_nacimiento = 'El miembro debe tener al menos 16 años';
  }
  
  // Fecha de ingreso
  if (!datos.fecha_ingreso) {
    errores.fecha_ingreso = 'La fecha de ingreso es requerida';
  } else if (!validarFechaNoFutura(datos.fecha_ingreso)) {
    errores.fecha_ingreso = 'La fecha de ingreso no puede ser futura';
  } else if (datos.fecha_nacimiento && !validarFechaIngresoPosterior(datos.fecha_ingreso, datos.fecha_nacimiento)) {
    errores.fecha_ingreso = 'La fecha de ingreso debe ser posterior al nacimiento';
  }
  
  // Grado
  if (!validarGrado(datos.grado)) {
    errores.grado = 'El grado masónico no es válido';
  }
  
  // Estado
  if (!validarEstado(datos.estado)) {
    errores.estado = 'El estado del miembro no es válido';
  }
  
  // Dirección (opcional)
  if (datos.direccion?.trim() && !validarDireccion(datos.direccion)) {
    errores.direccion = 'La dirección contiene caracteres no válidos';
  }
  
  // Ciudad de nacimiento (opcional)
  if (datos.ciudad_nacimiento?.trim() && !validarNombre(datos.ciudad_nacimiento)) {
    errores.ciudad_nacimiento = 'La ciudad de nacimiento contiene caracteres no válidos';
  }
  
  // Profesión (opcional)
  if (datos.profesion?.trim() && !validarLongitud(datos.profesion, 2, 100)) {
    errores.profesion = 'La profesión debe tener entre 2 y 100 caracteres';
  }
  
  // Observaciones (opcional)
  if (datos.observaciones?.trim() && !validarLongitud(datos.observaciones, 0, 1000)) {
    errores.observaciones = 'Las observaciones no pueden exceder 1000 caracteres';
  }
  
  return errores;
};

/**
 * Limpiar y formatear datos de miembro para envío
 * @param {Object} datos - Datos del miembro
 * @returns {Object} - Datos limpios y formateados
 */
export const limpiarDatosMiembro = (datos) => {
  const datosLimpios = { ...datos };
  
  // Limpiar y formatear textos
  if (datosLimpios.nombres) {
    datosLimpios.nombres = sanitizarTexto(datosLimpios.nombres);
  }
  
  if (datosLimpios.apellidos) {
    datosLimpios.apellidos = sanitizarTexto(datosLimpios.apellidos);
  }
  
  if (datosLimpios.rut) {
    datosLimpios.rut = formatearRUT(datosLimpios.rut);
  }
  
  if (datosLimpios.email) {
    datosLimpios.email = datosLimpios.email.trim().toLowerCase();
  }
  
  if (datosLimpios.telefono) {
    datosLimpios.telefono = formatearTelefono(datosLimpios.telefono);
  }
  
  if (datosLimpios.direccion) {
    datosLimpios.direccion = sanitizarTexto(datosLimpios.direccion);
  }
  
  if (datosLimpios.ciudad_nacimiento) {
    datosLimpios.ciudad_nacimiento = sanitizarTexto(datosLimpios.ciudad_nacimiento);
  }
  
  if (datosLimpios.profesion) {
    datosLimpios.profesion = sanitizarTexto(datosLimpios.profesion);
  }
  
  if (datosLimpios.observaciones) {
    datosLimpios.observaciones = sanitizarTexto(datosLimpios.observaciones);
  }
  
  // Formatear fechas para API (YYYY-MM-DD)
  if (datosLimpios.fecha_nacimiento instanceof Date) {
    datosLimpios.fecha_nacimiento = datosLimpios.fecha_nacimiento.toISOString().split('T')[0];
  }
  
  if (datosLimpios.fecha_ingreso instanceof Date) {
    datosLimpios.fecha_ingreso = datosLimpios.fecha_ingreso.toISOString().split('T')[0];
  }
  
  return datosLimpios;
};

/**
 * Generar mensaje de error amigable
 * @param {string} campo - Campo con error
 * @param {string} valor - Valor del campo
 * @returns {string} - Mensaje de error amigable
 */
export const mensajeErrorAmigable = (campo, valor) => {
  const mensajes = {
    nombres: 'Los nombres deben contener solo letras y tener al menos 2 caracteres',
    apellidos: 'Los apellidos deben contener solo letras y tener al menos 2 caracteres',
    rut: 'Ingresa un RUT válido (ej: 12.345.678-9)',
    email: 'Ingresa un email válido (ej: usuario@dominio.com)',
    telefono: 'Ingresa un teléfono válido (ej: +56 9 1234 5678)',
    fecha_nacimiento: 'La fecha de nacimiento debe ser válida y el miembro debe ser mayor de 16 años',
    fecha_ingreso: 'La fecha de ingreso debe ser válida y posterior al nacimiento',
    direccion: 'La dirección contiene caracteres no permitidos',
    ciudad_nacimiento: 'La ciudad debe contener solo letras',
    profesion: 'La profesión debe tener entre 2 y 100 caracteres',
    observaciones: 'Las observaciones no pueden exceder 1000 caracteres',
  };
  
  return mensajes[campo] || 'El valor ingresado no es válido';
};

/**
 * Validar formulario completo y retornar resultado detallado
 * @param {Object} datos - Datos del formulario
 * @returns {Object} - Resultado de validación con errores y estado
 */
export const validarFormularioCompleto = (datos) => {
  const errores = validarFormularioMiembro(datos);
  const tieneErrores = Object.keys(errores).length > 0;
  
  return {
    valido: !tieneErrores,
    errores,
    cantidadErrores: Object.keys(errores).length,
    camposConError: Object.keys(errores),
    datosLimpios: tieneErrores ? null : limpiarDatosMiembro(datos),
  };
};