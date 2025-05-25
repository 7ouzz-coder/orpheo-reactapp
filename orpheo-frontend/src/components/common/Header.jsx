import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { logoutUser, selectUser } from '../../store/slices/authSlice';
import { getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Sesión cerrada exitosamente');
      navigate('/login');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const toggleSidebar = () => {
    dispatch({ type: 'ui/toggleSidebar' });
  };

  const getGradoColor = (grado) => {
    const colors = {
      aprendiz: 'text-yellow-400',
      companero: 'text-green-400',
      maestro: 'text-blue-400',
    };
    return colors[grado] || 'text-gray-400';
  };

  // Notificaciones mock
  const mockNotifications = [
    {
      id: 1,
      title: 'Nueva Tenida Programada',
      message: 'Tenida ordinaria programada para el viernes 25 de mayo',
      type: 'info',
      time: '2 min',
      read: false
    },
    {
      id: 2,
      title: 'Documento Aprobado',
      message: 'Su plancha "Simbolismo del Compás" ha sido aprobada',
      type: 'success',
      time: '1 hora',
      read: false
    },
    {
      id: 3,
      title: 'Nuevo Miembro',
      message: 'Se ha registrado un nuevo Aprendiz en la Logia',
      type: 'info',
      time: '3 horas',
      read: true
    }
  ];

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 bg-primary-black-secondary border-b border-gray-border z-30 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-primary-gold/10 transition-colors lg:hidden"
          >
            <svg className="w-6 h-6 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gold-gradient rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
              </svg>
            </div>
            <h1 className="font-serif text-xl font-bold text-primary-gold tracking-wider hidden sm:block">
              ORPHEO
            </h1>
          </div>
        </div>

        {/* Center - Breadcrumb o título dinámico */}
        <div className="hidden md:flex items-center space-x-2 text-sm text-gray-border">
          <span className="text-primary-gold">Dashboard</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>Inicio</span>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Search button */}
          <button className="p-2 rounded-lg hover:bg-primary-gold/10 transition-colors hidden md:block">
            <svg className="w-5 h-5 text-gray-text hover:text-primary-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-primary-gold/10 transition-colors relative"
            >
              <svg className="w-5 h-5 text-gray-text hover:text-primary-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5l-5-5h5v-5a4 4 0 00-8 0v5h5l-5 5l-5-5h5V7a7 7 0 0114 0v10z" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-primary-black-secondary border border-gray-border rounded-lg shadow-lg z-50"
                >
                  <div className="p-4 border-b border-gray-border">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-primary-gold">Notificaciones</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-primary-gold text-primary-black px-2 py-1 rounded-full">
                          {unreadCount} nuevas
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {mockNotifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border-b border-gray-border/50 hover:bg-primary-gold/5 transition-colors ${
                          !notification.read ? 'bg-primary-gold/5' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'success' ? 'bg-green-400' : 
                            notification.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-text">{notification.title}</p>
                            <p className="text-xs text-gray-border mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-border mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 border-t border-gray-border">
                    <button className="w-full text-center text-sm text-primary-gold hover:text-primary-gold-secondary transition-colors">
                      Ver todas las notificaciones
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary-gold/10 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-text">
                  {user?.memberFullName || user?.username}
                </p>
                <p className="text-xs text-gray-border">
                  <span className={getGradoColor(user?.grado)}>
                    {user?.grado && `${user.grado.charAt(0).toUpperCase()}${user.grado.slice(1)}`}
                  </span>
                  {user?.cargo && ` • ${user.cargo}`}
                </p>
              </div>
              
              <div className="w-10 h-10 bg-primary-gold rounded-full flex items-center justify-center">
                <span className="text-primary-black font-semibold text-sm">
                  {getInitials(user?.memberFullName || user?.username || 'U')}
                </span>
              </div>

              <svg className="w-4 h-4 text-gray-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 bg-primary-black-secondary border border-gray-border rounded-lg shadow-lg z-50"
                >
                  {/* User info */}
                  <div className="p-4 border-b border-gray-border">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-gold rounded-full flex items-center justify-center">
                        <span className="text-primary-black font-semibold">
                          {getInitials(user?.memberFullName || user?.username || 'U')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-text">{user?.memberFullName || user?.username}</p>
                        <p className="text-sm text-gray-border">{user?.email}</p>
                        <p className="text-xs text-primary-gold">
                          {user?.grado} {user?.cargo && `• ${user.cargo}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/perfil');
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-text hover:bg-primary-gold/10 hover:text-primary-gold transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Mi Perfil</span>
                    </button>

                    <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-text hover:bg-primary-gold/10 hover:text-primary-gold transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Configuraciones</span>
                    </button>

                    <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-text hover:bg-primary-gold/10 hover:text-primary-gold transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Ayuda</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-border py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </motion.header>
  );
};

export default Header;