import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/uiSlice';
import { ErrorReporting } from '../utils/errorReporting';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const callApi = useCallback(async (apiFunction, options = {}) => {
    const {
      showSuccessMessage = false,
      successMessage = 'Operación exitosa',
      showErrorMessage = true,
      onSuccess,
      onError,
      loadingKey = null,
    } = options;

    setLoading(true);
    if (loadingKey) {
      setError(prev => ({ ...prev, [loadingKey]: null }));
    } else {
      setError(null);
    }

    try {
      const result = await apiFunction();
      
      if (showSuccessMessage) {
        dispatch(addNotification({
          type: 'success',
          message: successMessage,
        }));
      }
      
      if (onSuccess) {
        await onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error inesperado';
      
      // Reportar error
      ErrorReporting.captureException(err, {
        context: 'useApi_call',
        apiFunction: apiFunction.name,
      });
      
      if (loadingKey) {
        setError(prev => ({ ...prev, [loadingKey]: errorMessage }));
      } else {
        setError(errorMessage);
      }
      
      if (showErrorMessage) {
        dispatch(addNotification({
          type: 'error',
          message: errorMessage,
        }));
      }
      
      if (onError) {
        await onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  return {
    loading,
    error,
    callApi,
    clearError: () => setError(null),
  };
};