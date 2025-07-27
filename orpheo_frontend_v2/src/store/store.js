import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import miembrosSlice from './slices/miembrosSlice';
import documentosSlice from './slices/documentosSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Solo persistir auth
  version: 1,
};

const rootReducer = combineReducers({
  auth: authSlice,
  ui: uiSlice,
  miembros: miembrosSlice,
  documentos: documentosSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          'persist/REGISTER',
          'persist/PURGE',
          'persist/PAUSE',
          'persist/FLUSH'
        ],
      },
    }),
  devTools: __DEV__,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;