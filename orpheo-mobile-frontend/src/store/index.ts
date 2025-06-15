// Exportar store principal
export { store, persistor, useAppDispatch, useAppSelector, clearPersistedState } from './store';
export type { RootState, AppDispatch } from './store';

// Exportar slices
export { default as authSlice } from './slices/authSlice';
export { default as uiSlice } from './slices/uiSlice';
export { default as miembrosSlice } from './slices/miembrosSlice';
export { default as documentosSlice } from './slices/documentosSlice';
export { default as programasSlice } from './slices/programasSlice';

// Exportar acciones de auth
export {
  initializeApp,
  login,
  logout,
  refreshToken,
  updateProfile,
  changePassword,
  clearError as clearAuthError,
  resetLoginAttempts,
  setUser,
  clearAuth,
} from './slices/authSlice';

// Exportar acciones de UI
export {
  setTheme,
  setLanguage,
  updatePreferences,
  setGlobalLoading,
  openModal,
  closeModal,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  removeNotification,
  showToast,
  hideToast,
  setNetworkStatus,
  setAppBackground,
  addToSearchHistory,
  clearSearchHistory,
  addToRecentSearches,
  setMiembrosFilters,
  clearMiembrosFilters,
  setDocumentosFilters,
  clearDocumentosFilters,
  setProgramasFilters,
  clearProgramasFilters,
  setKeyboardVisibility,
  resetUIState,
} from './slices/uiSlice';

// Exportar acciones de miembros
export {
  fetchMiembros,
  fetchMiembroById,
  createMiembro,
  updateMiembro,
  deleteMiembro,
  fetchMiembrosStats,
  searchMiembros,
  clearError as clearMiembrosError,
  setCurrentMiembro,
  setFilters as setMiembrosFiltersAction,
  clearFilters as clearMiembrosFiltersAction,
  setPagination as setMiembrosPagination,
  optimisticUpdateMiembro,
  optimisticDeleteMiembro,
  resetMiembrosState,
  updateMiembroInList,
} from './slices/miembrosSlice';

// Exportar store principal
export { store, persistor, useAppDispatch, useAppSelector, clearPersistedState } from './store';
export type { RootState, AppDispatch } from './store';

// Exportar slices
export { default as authSlice } from './slices/authSlice';
export { default as uiSlice } from './slices/uiSlice';
export { default as miembrosSlice } from './slices/miembrosSlice';
export { default as documentosSlice } from './slices/documentosSlice';
export { default as programasSlice } from './slices/programasSlice';

// Exportar acciones de auth
export {
  initializeApp,
  login,
  logout,
  refreshToken,
  updateProfile,
  changePassword,
  clearError as clearAuthError,
  resetLoginAttempts,
  setUser,
  clearAuth,
} from './slices/authSlice';

// Exportar acciones de UI
export {
  setTheme,
  setLanguage,
  updatePreferences,
  setGlobalLoading,
  openModal,
  closeModal,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  removeNotification,
  showToast,
  hideToast,
  setNetworkStatus,
  setAppBackground,
  addToSearchHistory,
  clearSearchHistory,
  addToRecentSearches,
  setMiembrosFilters,
  clearMiembrosFilters,
  setDocumentosFilters,
  clearDocumentosFilters,
  setProgramasFilters,
  clearProgramasFilters,
  setKeyboardVisibility,
  resetUIState,
} from './slices/uiSlice';

// Exportar acciones de miembros
export {
  fetchMiembros,
  fetchMiembroById,
  createMiembro,
  updateMiembro,
  deleteMiembro,
  fetchMiembrosStats,
  searchMiembros,
  clearError as clearMiembrosError,
  setCurrentMiembro,
  setFilters as setMiembrosFiltersAction,
  clearFilters as clearMiembrosFiltersAction,
  setPagination as setMiembrosPagination,
  optimisticUpdateMiembro,
  optimisticDeleteMiembro,
  resetMiembrosState,
  updateMiembroInList,
} from './slices/miembrosSlice';

// Exportar acciones de documentos
export {
  fetchDocumentos,
  fetchDocumentoById,
  uploadDocumento,
  updateDocumento,
  deleteDocumento,
  approveDocumento,
  rejectDocumento,
  downloadDocumento,
  fetchDocumentosStats,
  searchDocumentos,
  clearError as clearDocumentosError,
  setCurrentDocumento,
  setFilters as setDocumentosFiltersAction,
  clearFilters as clearDocumentosFiltersAction,
  setUploadProgress,
  setIsUploading,
  optimisticUpdateDocumento,
  optimisticDeleteDocumento,
  incrementDownloadCount,
  resetDocumentosState,
} from './slices/documentosSlice';

// Exportar acciones de programas
export {
  fetchProgramas,
  fetchProgramaById,
  createPrograma,
  updatePrograma,
  deletePrograma,
  confirmAsistencia,
  updateAsistencia,
  fetchProgramasStats,
  searchProgramas,
  clearError as clearProgramasError,
  setCurrentPrograma,
  setFilters as setProgramasFiltersAction,
  clearFilters as clearProgramasFiltersAction,
  setVistaCalendario,
  setFechaSeleccionada,
  optimisticUpdatePrograma,
  optimisticDeletePrograma,
  optimisticUpdateAsistencia,
  resetProgramasState,
} from './slices/programasSlice';

// Hooks personalizados para usar con el store
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './store';

// Hook para autenticación
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);

  const loginUser = useCallback((credentials: { username: string; password: string }) => {
    return dispatch(login(credentials));
  }, [dispatch]);

  const logoutUser = useCallback(() => {
    return dispatch(logout());
  }, [dispatch]);

  const refreshUserToken = useCallback(() => {
    return dispatch(refreshToken());
  }, [dispatch]);

  return {
    ...auth,
    login: loginUser,
    logout: logoutUser,
    refreshToken: refreshUserToken,
  };
};

// Hook para UI
export const useUI = () => {
  const dispatch = useAppDispatch();
  const ui = useAppSelector(state => state.ui);

  const showToastMessage = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    dispatch(showToast({ message, type }));
  }, [dispatch]);

  const showGlobalLoading = useCallback((message?: string) => {
    dispatch(setGlobalLoading({ isLoading: true, message }));
  }, [dispatch]);

  const hideGlobalLoading = useCallback(() => {
    dispatch(setGlobalLoading({ isLoading: false }));
  }, [dispatch]);

  return {
    ...ui,
    showToast: showToastMessage,
    showLoading: showGlobalLoading,
    hideLoading: hideGlobalLoading,
  };
};

// Hook para miembros
export const useMiembros = () => {
  const dispatch = useAppDispatch();
  const miembros = useAppSelector(state => state.miembros);

  const loadMiembros = useCallback((params?: any) => {
    return dispatch(fetchMiembros(params));
  }, [dispatch]);

  const loadMiembro = useCallback((id: string) => {
    return dispatch(fetchMiembroById(id));
  }, [dispatch]);

  const createNewMiembro = useCallback((data: any) => {
    return dispatch(createMiembro(data));
  }, [dispatch]);

  const updateExistingMiembro = useCallback((id: string, data: any) => {
    return dispatch(updateMiembro({ id, data }));
  }, [dispatch]);

  const removeMiembro = useCallback((id: string) => {
    return dispatch(deleteMiembro(id));
  }, [dispatch]);

  return {
    ...miembros,
    loadMiembros,
    loadMiembro,
    createMiembro: createNewMiembro,
    updateMiembro: updateExistingMiembro,
    deleteMiembro: removeMiembro,
  };
};

// Hook para documentos
export const useDocumentos = () => {
  const dispatch = useAppDispatch();
  const documentos = useAppSelector(state => state.documentos);

  const loadDocumentos = useCallback((params?: any) => {
    return dispatch(fetchDocumentos(params));
  }, [dispatch]);

  const loadDocumento = useCallback((id: string) => {
    return dispatch(fetchDocumentoById(id));
  }, [dispatch]);

  const uploadNewDocumento = useCallback((data: any, onProgress?: (progress: number) => void) => {
    return dispatch(uploadDocumento({ formData: data, onProgress }));
  }, [dispatch]);

  const downloadDocumentoFile = useCallback((id: string) => {
    return dispatch(downloadDocumento(id));
  }, [dispatch]);

  return {
    ...documentos,
    loadDocumentos,
    loadDocumento,
    uploadDocumento: uploadNewDocumento,
    downloadDocumento: downloadDocumentoFile,
  };
};

// Hook para programas
export const useProgramas = () => {
  const dispatch = useAppDispatch();
  const programas = useAppSelector(state => state.programas);

  const loadProgramas = useCallback((params?: any) => {
    return dispatch(fetchProgramas(params));
  }, [dispatch]);

  const loadPrograma = useCallback((id: string) => {
    return dispatch(fetchProgramaById(id));
  }, [dispatch]);

  const createNewPrograma = useCallback((data: any) => {
    return dispatch(createPrograma(data));
  }, [dispatch]);

  const confirmUserAsistencia = useCallback((programaId: string, estado: string) => {
    return dispatch(confirmAsistencia({ programaId, estado }));
  }, [dispatch]);

  return {
    ...programas,
    loadProgramas,
    loadPrograma,
    createPrograma: createNewPrograma,
    confirmAsistencia: confirmUserAsistencia,
  };
};