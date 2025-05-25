import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyToken, selectAuth } from '../../store/slices/authSlice';
import Loading from '../common/Loading';

/**
 * Componente para proteger rutas que requieren autenticación
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si está autenticado
 * @param {string} props.requiredRole - Rol requerido para acceder (opcional)
 * @param {string} props.requiredGrado - Grado masónico requerido (opcional)
 * @param {Array} props.allowedRoles - Array de roles permitidos (opcional)
 * @param {Array} props.allowedGrados - Array de grados permitidos (opcional)
 */
const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredGrado = null,
  allowedRoles = null,
  allowedGrados = null 
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, isLoading, user, token } = useSelector(selectAuth);

  // Verificar token al montar el componente
  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(verifyToken());
    }
  }, [dispatch, token, isAuthenticated]);

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-black flex items-center justify-center">
        <Loading size="lg" text="Verificando autenticación..." />
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar rol específico requerido
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-primary-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-serif font-bold text-primary-gold mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-text mb-4">
            Su rol actual ({user.role}) no tiene permisos para acceder a esta sección.
            <br />
            Se requiere rol: {requiredRole}
          </p>
          <button
            onClick={() => window.history.back()}
            className="orpheo-button"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Verificar roles permitidos
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-primary-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <h2 className="text-xl font-serif font-bold text-primary-gold mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-text mb-4">
            Su rol no está autorizado para acceder a esta funcionalidad.
            <br />
            Roles permitidos: {allowedRoles.join(', ')}
          </p>
          <button
            onClick={() => window.history.back()}
            className="orpheo-button"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Verificar grado masónico requerido
  if (requiredGrado) {
    const gradoHierarchy = ['aprendiz', 'companero', 'maestro'];
    const userLevel = gradoHierarchy.indexOf(user.grado);
    const requiredLevel = gradoHierarchy.indexOf(requiredGrado);
    
    if (userLevel < requiredLevel) {
      return (
        <div className="min-h-screen bg-primary-black flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-serif font-bold text-primary-gold mb-2">
              Grado Insuficiente
            </h2>
            <p className="text-gray-text mb-4">
              Su grado actual ({user.grado}) no permite acceder a este contenido.
              <br />
              Se requiere grado: {requiredGrado} o superior
            </p>
            <button
              onClick={() => window.history.back()}
              className="orpheo-button"
            >
              Volver
            </button>
          </div>
        </div>
      );
    }
  }

  // Verificar grados permitidos
  if (allowedGrados && !allowedGrados.includes(user.grado)) {
    return (
      <div className="min-h-screen bg-primary-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-xl font-serif font-bold text-primary-gold mb-2">
            Grado No Autorizado
          </h2>
          <p className="text-gray-text mb-4">
            Este contenido está restringido a grados específicos.
            <br />
            Grados permitidos: {allowedGrados.join(', ')}
          </p>
          <button
            onClick={() => window.history.back()}
            className="orpheo-button"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Si pasa todas las verificaciones, renderizar los hijos
  return children;
};

export default ProtectedRoute;