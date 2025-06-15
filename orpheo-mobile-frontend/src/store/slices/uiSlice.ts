import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '@/types';

interface UIState {
  // Tema y apariencia
  theme: 'dark' | 'light';
  language: 'es' | 'en';
  
  // Loading states globales
  isGlobalLoading: boolean;
  globalLoadingMessage: string;
  
  // Modales
  activeModal: string | null;
  modalData: any;
  
  // Notificaciones
  notifications: Notification[];
  notificationCount: number;
  
  // Toast messages
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'warning' | 'info' | null;
  
  // Network status
  isOnline: boolean;
  
  // App state
  isAppInBackground: boolean;
  
  // Preferences
  preferences: {
    enableNotifications: boolean;
    enableBiometric: boolean;
    autoRefresh: boolean;
    defaultView: 'list' | 'grid';
    pageSize: number;
  };
  
  // Search states
  searchHistory: string[];
  recentSearches: string[];
  
  // Filter states (para mantener filtros entre navegaciones)
  miembrosFilters: {
    search: string;
    grado: string;
    vigente: boolean;
  };
  
  documentosFilters: {
    search: string;
    tipo: string;
    estado: string;
    categoria: string;
    grado: string;
  };
  
  programasFilters: {
    search: string;
    tipo: string;
    estado: string;
    mes: number;
    año: number;
  };
  
  // Keyboard visibility (útil para ajustes de UI)
  isKeyboardVisible: boolean;
  keyboardHeight: number;
}

const initialState: UIState = {
  theme: 'dark',
  language: 'es',
  isGlobalLoading: false,
  globalLoadingMessage: '',
  activeModal: null,
  modalData: null,
  notifications: [],
  notificationCount: 0,
  toastMessage: null,
  toastType: null,
  isOnline: true,
  isAppInBackground: false,
  preferences: {
    enableNotifications: true,
    enableBiometric: false,
    autoRefresh: true,
    defaultView: 'list',
    pageSize: 20,
  },
  searchHistory: [],
  recentSearches: [],
  miembrosFilters: {
    search: '',
    grado: '',
    vigente: true,
  },
  documentosFilters: {
    search: '',
    tipo: '',
    estado: '',
    categoria: '',
    grado: '',
  },
  programasFilters: {
    search: '',
    tipo: '',
    estado: '',
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear(),
  },
  isKeyboardVisible: false,
  keyboardHeight: 0,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Tema y configuración
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
    },
    
    setLanguage: (state, action: PayloadAction<'es' | 'en'>) => {
      state.language = action.payload;
    },
    
    updatePreferences: (state, action: PayloadAction<Partial<UIState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    // Loading global
    setGlobalLoading: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
      state.isGlobalLoading = action.payload.isLoading;
      state.globalLoadingMessage = action.payload.message || '';
    },
    
    // Modales
    openModal: (state, action: PayloadAction<{ modalId: string; data?: any }>) => {
      state.activeModal = action.payload.modalId;
      state.modalData = action.payload.data || null;
    },
    
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },
    
    // Notificaciones
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.notificationCount += 1;
      }
    },
    
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.notificationCount = Math.max(0, state.notificationCount - 1);
      }
    },
    
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.notificationCount = 0;
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
      state.notificationCount = 0;
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.notificationCount = Math.max(0, state.notificationCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    
    // Toast messages
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'warning' | 'info' }>) => {
      state.toastMessage = action.payload.message;
      state.toastType = action.payload.type;
    },
    
    hideToast: (state) => {
      state.toastMessage = null;
      state.toastType = null;
    },
    
    // Network status
    setNetworkStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    
    // App state
    setAppBackground: (state, action: PayloadAction<boolean>) => {
      state.isAppInBackground = action.payload;
    },
    
    // Search
    addToSearchHistory: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (query && !state.searchHistory.includes(query)) {
        state.searchHistory.unshift(query);
        // Mantener solo los últimos 10
        if (state.searchHistory.length > 10) {
          state.searchHistory = state.searchHistory.slice(0, 10);
        }
      }
    },
    
    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },
    
    addToRecentSearches: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (query) {
        // Remover si ya existe
        state.recentSearches = state.recentSearches.filter(s => s !== query);
        // Agregar al inicio
        state.recentSearches.unshift(query);
        // Mantener solo los últimos 5
        if (state.recentSearches.length > 5) {
          state.recentSearches = state.recentSearches.slice(0, 5);
        }
      }
    },
    
    // Filtros
    setMiembrosFilters: (state, action: PayloadAction<Partial<UIState['miembrosFilters']>>) => {
      state.miembrosFilters = { ...state.miembrosFilters, ...action.payload };
    },
    
    clearMiembrosFilters: (state) => {
      state.miembrosFilters = initialState.miembrosFilters;
    },
    
    setDocumentosFilters: (state, action: PayloadAction<Partial<UIState['documentosFilters']>>) => {
      state.documentosFilters = { ...state.documentosFilters, ...action.payload };
    },
    
    clearDocumentosFilters: (state) => {
      state.documentosFilters = initialState.documentosFilters;
    },
    
    setProgramasFilters: (state, action: PayloadAction<Partial<UIState['programasFilters']>>) => {
      state.programasFilters = { ...state.programasFilters, ...action.payload };
    },
    
    clearProgramasFilters: (state) => {
      state.programasFilters = {
        ...initialState.programasFilters,
        mes: new Date().getMonth() + 1,
        año: new Date().getFullYear(),
      };
    },
    
    // Keyboard
    setKeyboardVisibility: (state, action: PayloadAction<{ visible: boolean; height?: number }>) => {
      state.isKeyboardVisible = action.payload.visible;
      state.keyboardHeight = action.payload.height || 0;
    },
    
    // Reset UI state (útil al logout)
    resetUIState: (state) => {
      return {
        ...initialState,
        theme: state.theme, // Mantener tema
        language: state.language, // Mantener idioma
        preferences: state.preferences, // Mantener preferencias
      };
    },
  },
});

export const {
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
} = uiSlice.actions;

export default uiSlice.reducer;