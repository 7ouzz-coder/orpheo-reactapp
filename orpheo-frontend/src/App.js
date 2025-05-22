import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { Analytics } from './utils/analytics';
import { ErrorReporting } from './utils/errorReporting';
import './styles/globals.css';

function App() {
  useEffect(() => {
    // Inicializar servicios de producción
    Analytics.init();
    ErrorReporting.init();
    
    // Registrar service worker para PWA (opcional)
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          <div className="App">
            <Routes>
              {/* Ruta pública */}
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
              
              {/* Redirección por defecto */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Ruta 404 */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen bg-primary-black flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-primary-gold mb-4">404</h1>
                      <p className="text-gray-text text-xl mb-8">Página no encontrada</p>
                      <button
                        onClick={() => window.history.back()}
                        className="orpheo-button"
                      >
                        Volver
                      </button>
                    </div>
                  </div>
                }
              />
            </Routes>
            
            {/* Toast notifications con configuración de producción */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#121212',
                  color: '#A59F99',
                  border: '1px solid #7A6F63',
                  borderRadius: '8px',
                },
                success: {
                  iconTheme: {
                    primary: '#D4AF37',
                    secondary: '#0B0B0B',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#0B0B0B',
                  },
                },
              }}
            />
          </div>
        </Router>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;