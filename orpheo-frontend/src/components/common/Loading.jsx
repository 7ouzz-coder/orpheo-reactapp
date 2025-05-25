import React from 'react';
import { motion } from 'framer-motion';

// Definir constantes fuera del componente para poder reutilizarlas
const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const Loading = ({ 
  size = 'md', 
  text = 'Cargando...', 
  overlay = false,
  className = '' 
}) => {

  const containerClasses = overlay 
    ? 'fixed inset-0 bg-black/50 flex items-center justify-center z-50'
    : 'flex flex-col items-center justify-center p-4';

  return (
    <div className={`${containerClasses} ${className}`}>
      <motion.div
        className="flex flex-col items-center space-y-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Spinner */}
        <div className="relative">
          {/* Outer ring */}
          <motion.div
            className={`${sizeClasses[size]} border-4 border-gray-border rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Inner ring */}
          <motion.div
            className={`absolute top-0 left-0 ${sizeClasses[size]} border-4 border-transparent border-t-primary-gold rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Center dot */}
          <div 
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
              size === 'sm' ? 'w-1 h-1' : 
              size === 'md' ? 'w-2 h-2' : 
              size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
            } bg-primary-gold rounded-full`}
          />
        </div>

        {/* Loading text */}
        {text && (
          <motion.p
            className={`${textSizeClasses[size]} text-gray-text font-medium`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {text}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

// Variaciones específicas del componente
export const LoadingSpinner = ({ size = 'md', className = '' }) => (
  <motion.div
    className={`relative ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      className={`${sizeClasses[size]} border-4 border-gray-border rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
    />
    <motion.div
      className={`absolute top-0 left-0 ${sizeClasses[size]} border-4 border-transparent border-t-primary-gold rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  </motion.div>
);

export const LoadingDots = ({ className = '' }) => (
  <div className={`flex space-x-1 ${className}`}>
    {[0, 1, 2].map((index) => (
      <motion.div
        key={index}
        className="w-2 h-2 bg-primary-gold rounded-full"
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: index * 0.1,
        }}
      />
    ))}
  </div>
);

export const LoadingPulse = ({ size = 'md', className = '' }) => (
  <motion.div
    className={`${sizeClasses[size]} bg-primary-gold rounded-full ${className}`}
    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
  />
);

export const LoadingBars = ({ className = '' }) => (
  <div className={`flex space-x-1 ${className}`}>
    {[0, 1, 2, 3, 4].map((index) => (
      <motion.div
        key={index}
        className="w-1 bg-primary-gold"
        style={{ height: '20px' }}
        animate={{ scaleY: [1, 2, 1] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: index * 0.1,
        }}
      />
    ))}
  </div>
);

export default Loading;