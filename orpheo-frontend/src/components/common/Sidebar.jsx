import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { selectSidebarOpen, setSidebarOpen } from '../../store/slices/uiSlice';
import { selectUser } from '../../store/slices/authSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { ROUTES } from '../../utils/constants';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarOpen = useSelector(selectSidebarOpen);
  const user = useSelector(selectUser);

  const menuItems = [
    {
      path: ROUTES.DASHBOARD,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Inicio',
      available: true,
    },
    {
      path: ROUTES.MIEMBROS,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      label: 'Miembros',
      available: false, // Próximamente
    },
    {
      path: ROUTES.DOCUMENTOS,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      label: 'Documentos',
      available: false, // Próximamente
    },
    {
      path: ROUTES.PROGRAMAS,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Programas',
      available: false, // Próximamente
    },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleMenuClick = (path, available) => {
    if (!available) {
      // Mostrar toast de "próximamente"
      return;
    }
    navigate(path);
    if (window.innerWidth < 1024) {
      dispatch(setSidebarOpen(false));
    }
  };

  return (
    <>
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`fixed left-0 top-16 h-full bg-primary-black-secondary border-r border-gray-border z-20 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <motion.button
                  key={item.path}
                  onClick={() => handleMenuClick(item.path, item.available)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-primary-gold text-primary-black'
                      : item.available
                      ? 'text-gray-text hover:bg-primary-gold/10 hover:text-primary-gold'
                      : 'text-gray-border opacity-50 cursor-not-allowed'
                  }`}
                  whileHover={item.available ? { scale: 1.02 } : {}}
                  whileTap={item.available ? { scale: 0.98 } : {}}
                >
                  <div className={`${isActive ? 'text-primary-black' : ''}`}>
                    {item.icon}
                  </div>
                  
                  {sidebarOpen && (
                    <span className="font-medium">
                      {item.label}
                    </span>
                  )}
                  
                  {!item.available && sidebarOpen && (
                    <span className="ml-auto text-xs bg-gray-border/20 text-gray-border px-2 py-1 rounded">
                      Próximamente
                    </span>
                  )}
                  
                  {/* Tooltip for collapsed sidebar */}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-primary-black-secondary text-gray-text text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                      {!item.available && (
                        <span className="text-xs text-gray-border"> (Próximamente)</span>
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Admin Section */}
          {user?.role === 'admin' && (
            <div className="px-4 py-4 border-t border-gray-border">
              <motion.button
                onClick={() => handleMenuClick('/admin', false)}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-border opacity-50 cursor-not-allowed"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {sidebarOpen && (
                  <>
                    <span className="font-medium">Administración</span>
                    <span className="ml-auto text-xs bg-gray-border/20 text-gray-border px-2 py-1 rounded">
                      Próximamente
                    </span>
                  </>
                )}
              </motion.button>
            </div>
          )}

          {/* User Section */}
          <div className="px-4 py-4 border-t border-gray-border">
            <motion.button
              onClick={() => handleMenuClick('/perfil', false)}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-text hover:bg-primary-gold/10 hover:text-primary-gold transition-all duration-200 mb-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {sidebarOpen && <span className="font-medium">Perfil</span>}
            </motion.button>

            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {sidebarOpen && <span className="font-medium">Cerrar Sesión</span>}
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;