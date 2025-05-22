import React from 'react';

const Loading = ({ size = 'md', text = 'Cargando...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-4 border-gray-border border-t-primary-gold rounded-full animate-spin`}></div>
      {text && (
        <p className="mt-4 text-gray-text text-sm">{text}</p>
      )}
    </div>
  );
};

export default Loading;