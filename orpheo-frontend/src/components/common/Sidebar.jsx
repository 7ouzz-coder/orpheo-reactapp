import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { selectUser } from '../../store/slices/authSlice';
import { selectSidebarOpen, toggleSidebar } from '../../store/slices/uiSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(selectUser);
  const sidebarOpen = useSelector(selectSidebarOpen);

  const menuItems = [
    {
      path: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      label: 'Dashboard',
      available: true,
    },
    {
      path: '/miembros',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      label: 'Miembros',
      available: true,
    },
    {
      path: '/documentos',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: 'Documentos',
      available: true, // ✅ Ahora está disponible
    },
    {
      path: '/programas',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Programas',
      available: false,
      badge: 'Pronto',
    },
    {
      path: '/perfil',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Mi Perfil',
      available: false,
      badge: 'Pronto',
    },
  ];

  // Agregar item de admin solo para administradores
  if (user?.role === 'admin' || user?.role === 'superadmin') {
    menuItems.push({
      path: '/admin',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Administración',
      available: false,
      badge: 'Pronto',
    });
  }

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 64 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-primary-black-secondary border-r border-gray-border z-20 hidden lg:block"
      >
        <div className="flex flex-col h-full">
          {/* Toggle button */}
          <div className="p-4 border-b border-gray-border">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-primary-gold/10 transition-colors"
            >
              <svg 
                className={`w-5 h-5 text-primary-gold transition-transform duration-300 ${
                  sidebarOpen ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <div key={item.path} className="relative">
                {item.available ? (
                  <NavLink
                    to={item.path}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-primary-gold text-primary-black shadow-gold'
                        : 'text-gray-text hover:bg-primary-gold/10 hover:text-primary-gold'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {item.icon}
                    </div>
                    
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </NavLink>
                ) : (
                  <div
                    className={`flex items-center space-x-3 p-3 rounded-lg opacity-50 cursor-not-allowed ${
                      sidebarOpen ? 'justify-between' : 'justify-center'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 text-gray-border">
                        {item.icon}
                      </div>
                      
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="font-medium text-gray-border"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </div>
                    
                    {sidebarOpen && item.badge && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs bg-primary-gold/20 text-primary-gold px-2 py-1 rounded-full"
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User info section */}
          {sidebarOpen && user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-4 border-t border-gray-border"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-gold rounded-full flex items-center justify-center text-xs font-bold text-primary-black">
                  {user.memberFullName ? user.memberFullName.split(' ').map(n => n[0]).join('').substring(0, 2) : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-text truncate">
                    {user.memberFullName || user.username}
                  </p>
                  <p className="text-xs text-gray-border capitalize">
                    {user.grado}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-primary-black-secondary border-r border-gray-border z-30 lg:hidden"
      >
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <div key={item.path}>
                {item.available ? (
                  <NavLink
                    to={item.path}
                    onClick={() => dispatch(toggleSidebar())}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-primary-gold text-primary-black shadow-gold'
                        : 'text-gray-text hover:bg-primary-gold/10 hover:text-primary-gold'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </NavLink>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg opacity-50 cursor-not-allowed">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-border">
                        {item.icon}
                      </div>
                      <span className="font-medium text-gray-border">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-xs bg-primary-gold/20 text-primary-gold px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User info section */}
          {user && (
            <div className="p-4 border-t border-gray-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-gold rounded-full flex items-center justify-center font-bold text-primary-black">
                  {user.memberFullName ? user.memberFullName.split(' ').map(n => n[0]).join('').substring(0, 2) : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-text truncate">
                    {user.memberFullName || user.username}
                  </p>
                  <p className="text-sm text-gray-border capitalize">
                    {user.grado} {user.cargo && `• ${user.cargo}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;