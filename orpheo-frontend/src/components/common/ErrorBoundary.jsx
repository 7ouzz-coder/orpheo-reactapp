import React from 'react';
import { ErrorReporting } from '../../utils/errorReporting';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Reportar error
    ErrorReporting.captureException(error, {
      context: 'react_error_boundary',
      errorInfo,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-primary-black flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-serif font-bold text-primary-gold mb-4">
                ¡Algo salió mal!
              </h1>
              
              <p className="text-gray-text mb-6">
                Ha ocurrido un error inesperado. El equipo técnico ha sido notificado automáticamente.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-primary-black-secondary border border-gray-border rounded-lg p-4 mb-6">
                  <summary className="text-red-400 font-medium cursor-pointer mb-2">
                    Detalles del error (solo en desarrollo)
                  </summary>
                  <pre className="text-xs text-gray-text overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="space-y-4">
              <button
                onClick={this.handleReload}
                className="orpheo-button w-full"
              >
                Recargar Página
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full px-6 py-3 border border-primary-gold text-primary-gold rounded-lg hover:bg-primary-gold/10 transition-colors"
              >
                Ir al Inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;