// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Importar slices
import authReducer from './slices/authSlice';
import miembrosReducer from './slices/miembrosSlice';
// TODO: Agregar más slices cuando estén listos
// import documentosReducer from './slices/documentosSlice';
// import uiReducer from './slices/uiSlice';

// Configuración de persistencia
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Solo persistir auth por ahora
  blacklist: ['miembros'], // No persistir miembros (se recargan desde API)
};

// Combinar reducers
const rootReducer = combineReducers({
  auth: authReducer,
  miembros: miembrosReducer, // ✅ Ahora incluido
  // documentos: documentosReducer, // TODO: Descomentar cuando esté listo
  // ui: uiReducer, // TODO: Descomentar cuando esté listo
});

// Reducer persistido
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configurar store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/FLUSH',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PERSIST',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
  devTools: __DEV__, // Solo en desarrollo
});

// Persistor para PersistGate
export const persistor = persistStore(store);