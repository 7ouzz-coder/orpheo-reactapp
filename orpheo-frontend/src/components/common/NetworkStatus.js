import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const NetworkStatus = () => {
  const { isOnline, isConnected } = useNetworkStatus();

  if (isOnline && isConnected) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm">
      {!isOnline ? (
        '🔴 Sin conexión a internet'
      ) : !isConnected ? (
        '🟡 Sin conexión al servidor Orpheo'
      ) : null}
    </div>
  );
};

export default NetworkStatus;