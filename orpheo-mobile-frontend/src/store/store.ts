import { configureStore } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importar slices
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import miembrosSlice from './slices/miembrosSlice';
import documentosSlice from './slices/documentosSlice';
import programasSlice from './slices/programasSlice';

// Configuración de persistencia para auth
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['user', 'token', 'refreshToken', 'isAuthenticated'], // Solo persistir datos esenciales
};

// Configuración de persistencia para UI (configuraciones del usuario)
const uiPersistConfig = {
  key: 'ui',
  storage: AsyncStorage,
  whitelist: ['theme', 'language', 'preferences'], // Solo persistir configuraciones
};

// Configuración del store
export const store = configureStore({
  reducer: {
    auth: persistReducer(authPersistConfig, authSlice),
    ui: persistReducer(uiPersistConfig, uiSlice),
    miembros: miembrosSlice,
    documentos: documentosSlice,
    programas: programasSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: __DEV__, // Solo en desarrollo
});

// Configurar persistor
export const persistor = persistStore(store);

// Tipos del store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks tipados
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Acciones para limpiar el store
export const clearPersistedState = () => {
  persistor.purge();
};

export default store;