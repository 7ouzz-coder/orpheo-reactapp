import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { 
  loginUser, 
  logoutUser, 
  checkAuthStatus, 
  selectAuth,
  clearError 
} from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);

  // Verificar autenticación al cargar
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const login = async (username, password) => {
    return dispatch(loginUser({ username, password }));
  };

  const logout = async () => {
    return dispatch(logoutUser());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    ...auth,
    login,
    logout,
    clearError: clearAuthError,
  };
};