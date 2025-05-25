import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: false,
  theme: 'dark',
  notifications: [],
  isLoading: false,
  breadcrumbs: [],
  pageTitle: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('orpheo_theme', action.payload);
    },
    
    setPageTitle: (state, action) => {
      state.pageTitle = action.payload;
      document.title = `${action.payload} - Orpheo`;
    },
    
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    
    setGlobalLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(notification);
      
      // Limitar a 50 notificaciones
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  setSidebarOpen,
  toggleSidebar,
  setTheme,
  setPageTitle,
  setBreadcrumbs,
  setGlobalLoading,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectores
export const selectUI = (state) => state.ui;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectTheme = (state) => state.ui.theme;
export const selectPageTitle = (state) => state.ui.pageTitle;
export const selectBreadcrumbs = (state) => state.ui.breadcrumbs;
export const selectGlobalLoading = (state) => state.ui.isLoading;
export const selectNotifications = (state) => state.ui.notifications;
export const selectUnreadNotificationsCount = (state) => 
  state.ui.notifications.filter(n => !n.read).length;