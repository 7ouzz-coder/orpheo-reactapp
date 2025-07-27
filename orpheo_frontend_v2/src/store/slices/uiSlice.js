import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'dark',
  language: 'es',
  sidebarOpen: false,
  loading: false,
  notifications: [],
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  toast: {
    show: false,
    type: 'info',
    message: '',
  },
  networkStatus: 'online',
  orientation: 'portrait',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    // Language
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    // Loading global
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.notifications.unshift(notification);
      
      // Limitar a 50 notificaciones
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) {
        notification.read = true;
      }
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Modal
    openModal: (state, action) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        data: null,
      };
    },
    
    // Toast
    showToast: (state, action) => {
      state.toast = {
        show: true,
        type: action.payload.type || 'info',
        message: action.payload.message,
      };
    },
    
    hideToast: (state) => {
      state.toast.show = false;
    },
    
    // Network status
    setNetworkStatus: (state, action) => {
      state.networkStatus = action.payload;
    },
    
    // Orientation
    setOrientation: (state, action) => {
      state.orientation = action.payload;
    },
  },
});

// Actions
export const {
  setTheme,
  setLanguage,
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  addNotification,
  removeNotification,
  markNotificationAsRead,
  clearNotifications,
  openModal,
  closeModal,
  showToast,
  hideToast,
  setNetworkStatus,
  setOrientation,
} = uiSlice.actions;

// Selectores
export const selectTheme = (state) => state.ui.theme;
export const selectLanguage = (state) => state.ui.language;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectLoading = (state) => state.ui.loading;
export const selectNotifications = (state) => state.ui.notifications;
export const selectUnreadNotifications = (state) => 
  state.ui.notifications.filter(n => !n.read);
export const selectModal = (state) => state.ui.modal;
export const selectToast = (state) => state.ui.toast;
export const selectNetworkStatus = (state) => state.ui.networkStatus;
export const selectOrientation = (state) => state.ui.orientation;

export default uiSlice.reducer;