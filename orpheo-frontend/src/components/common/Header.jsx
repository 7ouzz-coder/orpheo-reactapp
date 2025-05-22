import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { selectUser } from '../../store/slices/authSlice';
import { getInitials } from '../../utils/helpers';

const Header = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 bg-primary-black-secondary border-b border-gray-border z-30"
    >
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg hover:bg-primary-gold/10 transition-colors"
          >
            <svg className="w-6 h-6 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="font-serif text-xl font-bold text-primary-gold tracking-wider">
            ORPHEO
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-primary-gold/10 transition-colors relative">
            <svg className="w-6 h-6 text-gray-text hover:text-primary-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5l-5-5h5v-5a4 4 0 00-8 0v5h5l-5 5l-5-5h5V7a7 7 0 0114 0v10z" />
            </svg>
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-text">
                {user?.memberFullName || user?.username}
              </p>
              <p className="text-xs text-gray-border">
                {user?.grado && `${user.grado.charAt(0).toUpperCase()}${user.grado.slice(1)}`}
                {user?.cargo && ` • ${user.cargo}`}
              </p>
            </div>
            
            <div className="w-10 h-10 bg-primary-gold rounded-full flex items-center justify-center">
              <span className="text-primary-black font-semibold">
                {getInitials(user?.memberFullName || user?.username || 'U')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;