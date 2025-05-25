import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MiembrosPage from './pages/MiembrosPage';
import DocumentosPage from './pages/DocumentosPage';
import './styles/globals.css';

function App() {
  useEffect(() => {
    // Configurar título de la página
    document.title = 'Orpheo - Sistema de Gestión Masónica';
    
    // Configurar meta tags
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Sistema integral de gestión para logias masónicas';
    document.getElementsByTagName('head')[0].appendChild(metaDescription);
    
    // Log de inicio para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🔷 Orpheo Frontend iniciado');
      console.log('📱 Versión:', process.env.REACT_APP_VERSION || '1.0.0');
      console.log('🌐 Entorno:', process.env.NODE_ENV);
    }
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            {/* Ruta pública - Login */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Rutas protegidas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/miembros"
              element={
                <ProtectedRoute>
                  <MiembrosPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/documentos"
              element={
                <ProtectedRoute>
                  <DocumentosPage />
                </ProtectedRoute>
              }
            />
            
            {/* Rutas futuras - por ahora redirigen al dashboard */}
            <Route
              path="/programas"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-primary-black flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-3xl font-serif text-primary-gold mb-4">Programas</h1>
                      <p className="text-gray-text mb-6">Módulo en desarrollo</p>
                      <button
                        onClick={() => window.history.back()}
                        className="orpheo-button"
                      >
                        Volver
                      </button>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-primary-black flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-3xl font-serif text-primary-gold mb-4">Perfil</h1>
                      <p className="text-gray-text mb-6">Módulo en desarrollo</p>
                      <button
                        onClick={() => window.history.back()}
                        className="orpheo-button"
                      >
                        Volver
                      </button>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* Ruta de administración - solo para admins */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <div className="min-h-screen bg-primary-black flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-3xl font-serif text-primary-gold mb-4">Administración</h1>
                      <p className="text-gray-text mb-6">Panel de administración en desarrollo</p>
                      <button
                        onClick={() => window.history.back()}
                        className="orpheo-button"
                      >
                        Volver
                      </button>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* Redirección por defecto */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Ruta 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-primary-black flex items-center justify-center">
                  <div className="text-center max-w-md mx-auto p-6">
                    <div className="w-24 h-24 bg-primary-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h1 className="text-6xl font-bold text-primary-gold mb-4">404</h1>
                    <h2 className="text-2xl font-serif text-gray-text mb-4">Página no encontrada</h2>
                    <p className="text-gray-border mb-8">
                      La página que buscas no existe o ha sido movida.
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => window.history.back()}
                        className="orpheo-button w-full"
                      >
                        Volver
                      </button>
                      <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="w-full px-6 py-3 border border-primary-gold text-primary-gold rounded-lg hover:bg-primary-gold/10 transition-colors"
                      >
                        Ir al Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              }
            />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#121212',
                color: '#A59F99',
                border: '1px solid #7A6F63',
                borderRadius: '8px',
                fontSize: '14px',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#D4AF37',
                  secondary: '#0B0B0B',
                },
                style: {
                  border: '1px solid #D4AF37',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#0B0B0B',
                },
                style: {
                  border: '1px solid #EF4444',
                  color: '#FCA5A5',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#D4AF37',
                  secondary: '#0B0B0B',
                },
              },
            }}
          />
        </div>
      </Router>
    </Provider>
  );
}

export default App;