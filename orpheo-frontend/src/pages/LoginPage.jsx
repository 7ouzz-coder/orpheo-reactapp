import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  loginUser, 
  clearError, 
  selectAuth,
  resetLoginAttempts 
} from '../store/slices/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isAuthenticated, isLoading, error, loginAttempts } = useSelector(selectAuth);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Limpiar errores al cambiar los campos
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [formData.username, formData.password, dispatch, error]);

  // Resetear intentos de login después de 1 minuto
  useEffect(() => {
    if (loginAttempts >= 5) {
      const timer = setTimeout(() => {
        dispatch(resetLoginAttempts());
        toast.success('Puede intentar iniciar sesión nuevamente');
      }, 60000);
      
      return () => clearTimeout(timer);
    }
  }, [loginAttempts, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    if (loginAttempts >= 5) {
      toast.error('Demasiados intentos fallidos. Espere un minuto.');
      return;
    }

    try {
      await dispatch(loginUser({
        username: formData.username,
        password: formData.password
      })).unwrap();
      
      toast.success('¡Bienvenido a Orpheo!');
    } catch (err) {
      toast.error(err || 'Error al iniciar sesión');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuickLogin = (userType) => {
    const credentials = {
      admin: { username: 'admin', password: 'admin123' },
      maestro: { username: 'maestro', password: 'maestro123' },
      companero: { username: 'companero', password: 'companero123' },
      aprendiz: { username: 'aprendiz', password: 'aprendiz123' }
    };

    const cred = credentials[userType];
    setFormData(cred);
    
    // Auto login después de un pequeño delay
    setTimeout(() => {
      dispatch(loginUser(cred));
    }, 500);
  };

  const isLoginDisabled = loginAttempts >= 5 || isLoading;

  return (
    <div className="min-h-screen bg-primary-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Logo y título */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-24 h-24 mb-6"
          >
            {/* Logo placeholder - reemplazar con tu logo */}
            <div className="w-full h-full bg-gold-gradient rounded-full flex items-center justify-center shadow-gold">
              <svg className="w-12 h-12 text-primary-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                <path d="M12 8v4l3 3-1.5 1.5L12 15l-1.5 1.5L9 15l3-3V8h-2v4.5l-2.5 2.5L6 13.5 8.5 11H6V9h6V7h2v2z" fill="white"/>
              </svg>
            </div>
          </motion.div>
          
          <h1 className="font-serif text-4xl font-bold text-primary-gold mb-2 tracking-wider">
            ORPHEO
          </h1>
          <p className="text-gray-text text-lg tracking-wide">
            SISTEMA DE GESTIÓN MASÓNICA
          </p>
        </div>

        {/* Alerta de intentos fallidos */}
        {loginAttempts >= 3 && loginAttempts < 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-yellow-900/20 border border-yellow-500 text-yellow-400 px-4 py-3 rounded-lg text-sm text-center"
          >
            ⚠️ {5 - loginAttempts} intentos restantes antes del bloqueo temporal
          </motion.div>
        )}

        {loginAttempts >= 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm text-center"
          >
            🚫 Cuenta bloqueada temporalmente. Espere 1 minuto.
          </motion.div>
        )}

        {/* Formulario */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-text mb-2">
              Usuario
            </label>
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                disabled={isLoginDisabled}
                className={`orpheo-input w-full pl-10 ${isLoginDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Ingrese su usuario"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-border" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-text mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isLoginDisabled}
                className={`orpheo-input w-full pl-10 pr-10 ${isLoginDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Ingrese su contraseña"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-border" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoginDisabled}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-border hover:text-primary-gold transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  {showPassword ? (
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  ) : (
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Recordarme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary-gold bg-primary-black border-gray-border rounded focus:ring-primary-gold focus:ring-2"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-text">
                Recordarme
              </label>
            </div>
            
            <div className="text-sm">
              <button 
                type="button"
                className="text-primary-gold hover:text-primary-gold-secondary transition-colors"
                onClick={() => toast.info('Función disponible próximamente')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoginDisabled}
            className={`w-full relative overflow-hidden ${
              isLoginDisabled 
                ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                : 'orpheo-button hover:shadow-gold'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-primary-black border-t-transparent rounded-full animate-spin mr-2"></div>
                Iniciando sesión...
              </div>
            ) : (
              'INGRESAR'
            )}
          </button>
        </motion.form>

        {/* Credenciales de prueba */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="orpheo-card"
        >
          <h3 className="text-primary-gold font-semibold text-sm mb-3 text-center">
            CREDENCIALES DE PRUEBA
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { type: 'admin', label: 'Admin', user: 'admin', pass: 'admin123' },
              { type: 'maestro', label: 'Maestro', user: 'maestro', pass: 'maestro123' },
              { type: 'companero', label: 'Compañero', user: 'companero', pass: 'companero123' },
              { type: 'aprendiz', label: 'Aprendiz', user: 'aprendiz', pass: 'aprendiz123' }
            ].map((cred) => (
              <button
                key={cred.type}
                onClick={() => handleQuickLogin(cred.type)}
                disabled={isLoginDisabled}
                className={`p-2 rounded border text-left transition-colors ${
                  isLoginDisabled
                    ? 'border-gray-600 text-gray-600 cursor-not-allowed'
                    : 'border-primary-gold/30 hover:border-primary-gold hover:bg-primary-gold/10'
                }`}
              >
                <div className="font-medium text-primary-gold">{cred.label}</div>
                <div className="text-gray-text">{cred.user} / {cred.pass}</div>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;