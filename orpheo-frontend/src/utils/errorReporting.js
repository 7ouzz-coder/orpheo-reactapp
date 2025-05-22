// Sentry para reportes de errores en producción
export class ErrorReporting {
  static init() {
    if (process.env.REACT_APP_SENTRY_DSN && process.env.NODE_ENV === 'production') {
      // Configurar Sentry aquí
      console.log('Error reporting initialized');
    }
  }

  static captureException(error, context = {}) {
    if (process.env.NODE_ENV === 'production') {
      // Reportar error a Sentry
      console.error('Error captured:', error, context);
    } else {
      console.error('Development error:', error, context);
    }
  }

  static addBreadcrumb(message, category = 'default', level = 'info', data = {}) {
    if (process.env.NODE_ENV === 'production') {
      // Agregar breadcrumb a Sentry
      console.log(`Breadcrumb [${category}]: ${message}`, data);
    }
  }
}