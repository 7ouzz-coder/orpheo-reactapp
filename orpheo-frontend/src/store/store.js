import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import miembrosSlice from './slices/miembrosSlice';
import documentosSlice from './slices/documentosSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    miembros: miembrosSlice,
    documentos: documentosSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;