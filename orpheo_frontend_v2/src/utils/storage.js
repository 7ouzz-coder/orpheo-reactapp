import AsyncStorage from '@react-native-async-storage/async-storage';

// Claves para diferentes tipos de datos
export const STORAGE_KEYS = {
  // Autenticación
  ACCESS_TOKEN: 'orpheo_access_token',
  REFRESH_TOKEN: 'orpheo_refresh_token',
  USER_DATA: 'orpheo_user_data',
  
  // Configuraciones de usuario
  USER_PREFERENCES: 'orpheo_user_preferences',
  NOTIFICATION_SETTINGS: 'orpheo_notification_settings',
  
  // Caché de datos
  CACHED_MIEMBROS: 'orpheo_cached_miembros',
  CACHED_DOCUMENTOS: 'orpheo_cached_documentos',
  CACHED_PROGRAMAS: 'orpheo_cached_programas',
  
  // App settings
  APP_VERSION: 'orpheo_app_version',
  LAST_SYNC: 'orpheo_last_sync',
  OFFLINE_MODE: 'orpheo_offline_mode',
};

class StorageService {
  
  // ==========================================
  // MÉTODOS BÁSICOS
  // ==========================================
  
  /**
   * Guardar datos (con serialización automática)
   */
  async setItem(key, value) {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, serializedValue);
      return { success: true };
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Obtener datos (con deserialización automática)
   */
  async getItem(key, defaultValue = null) {
    try {
      const value = await AsyncStorage.getItem(key);
      
      if (value === null) {
        return defaultValue;
      }
      
      // Intentar parsear como JSON, si falla devolver como string
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return defaultValue;
    }
  }
  
  /**
   * Eliminar un elemento
   */
  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Verificar si existe una clave
   */
  async hasItem(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`Error checking ${key}:`, error);
      return false;
    }
  }
  
  /**
   * Obtener múltiples elementos
   */
  async getMultiple(keys) {
    try {
      const results = await AsyncStorage.multiGet(keys);
      const data = {};
      
      results.forEach(([key, value]) => {
        if (value !== null) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Guardar múltiples elementos
   */
  async setMultiple(keyValuePairs) {
    try {
      const serializedPairs = keyValuePairs.map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value)
      ]);
      
      await AsyncStorage.multiSet(serializedPairs);
      return { success: true };
    } catch (error) {
      console.error('Error setting multiple items:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Eliminar múltiples elementos
   */
  async removeMultiple(keys) {
    try {
      await AsyncStorage.multiRemove(keys);
      return { success: true };
    } catch (error) {
      console.error('Error removing multiple items:', error);
      return { success: false, error: error.message };
    }
  }
  
  // ==========================================
  // MÉTODOS ESPECÍFICOS DE AUTENTICACIÓN
  // ==========================================
  
  /**
   * Guardar datos de autenticación completos
   */
  async saveAuthData(user, accessToken, refreshToken) {
    const authPairs = [
      [STORAGE_KEYS.USER_DATA, user],
      [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
    ];
    
    if (refreshToken) {
      authPairs.push([STORAGE_KEYS.REFRESH_TOKEN, refreshToken]);
    }
    
    return await this.setMultiple(authPairs);
  }
  
  /**
   * Obtener datos de autenticación completos
   */
  async getAuthData() {
    const result = await this.getMultiple([
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
    ]);
    
    if (result.success) {
      return {
        success: true,
        data: {
          user: result.data[STORAGE_KEYS.USER_DATA] || null,
          accessToken: result.data[STORAGE_KEYS.ACCESS_TOKEN] || null,
          refreshToken: result.data[STORAGE_KEYS.REFRESH_TOKEN] || null,
        },
      };
    }
    
    return result;
  }
  
  /**
   * Limpiar todos los datos de autenticación
   */
  async clearAuthData() {
    return await this.removeMultiple([
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
    ]);
  }
  
  // ==========================================
  // MÉTODOS DE CACHÉ
  // ==========================================
  
  /**
   * Guardar datos en caché con timestamp
   */
  async setCachedData(key, data, ttl = 5 * 60 * 1000) { // TTL por defecto: 5 minutos
    const cacheObject = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    
    return await this.setItem(key, cacheObject);
  }
  
  /**
   * Obtener datos del caché (verificando expiración)
   */
  async getCachedData(key) {
    const cacheObject = await this.getItem(key);
    
    if (!cacheObject || !cacheObject.timestamp) {
      return null;
    }
    
    const now = Date.now();
    const isExpired = (now - cacheObject.timestamp) > cacheObject.ttl;
    
    if (isExpired) {
      // Eliminar caché expirado
      await this.removeItem(key);
      return null;
    }
    
    return cacheObject.data;
  }
  
  /**
   * Verificar si el caché está válido
   */
  async isCacheValid(key) {
    const data = await this.getCachedData(key);
    return data !== null;
  }
  
  /**
   * Limpiar todo el caché expirado
   */
  async clearExpiredCache() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => 
        key.startsWith('orpheo_cached_') || 
        key.includes('_cache_')
      );
      
      for (const key of cacheKeys) {
        const isValid = await this.isCacheValid(key);
        if (!isValid) {
          await this.removeItem(key);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error clearing expired cache:', error);
      return { success: false, error: error.message };
    }
  }
  
  // ==========================================
  // MÉTODOS DE CONFIGURACIÓN
  // ==========================================
  
  /**
   * Guardar preferencias del usuario
   */
  async saveUserPreferences(preferences) {
    return await this.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }
  
  /**
   * Obtener preferencias del usuario
   */
  async getUserPreferences() {
    return await this.getItem(STORAGE_KEYS.USER_PREFERENCES, {
      theme: 'dark',
      language: 'es',
      notifications: true,
      biometrics: false,
    });
  }
  
  /**
   * Guardar configuración de notificaciones
   */
  async saveNotificationSettings(settings) {
    return await this.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, settings);
  }
  
  /**
   * Obtener configuración de notificaciones
   */
  async getNotificationSettings() {
    return await this.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, {
      push: true,
      email: true,
      sms: false,
      documentos: true,
      miembros: true,
      programas: true,
    });
  }
  
  // ==========================================
  // MÉTODOS DE UTILIDAD Y DEBUGGING
  // ==========================================
  
  /**
   * Obtener información de almacenamiento (para debugging)
   */
  async getStorageInfo() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const orpheoKeys = allKeys.filter(key => key.startsWith('orpheo_'));
      
      const sizes = {};
      for (const key of orpheoKeys) {
        const value = await AsyncStorage.getItem(key);
        sizes[key] = value ? value.length : 0;
      }
      
      return {
        success: true,
        data: {
          totalKeys: orpheoKeys.length,
          keys: orpheoKeys,
          sizes,
          totalSize: Object.values(sizes).reduce((sum, size) => sum + size, 0),
        },
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Limpiar todo el almacenamiento de Orpheo (para reset completo)
   */
  async clearAllOrpheoData() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const orpheoKeys = allKeys.filter(key => key.startsWith('orpheo_'));
      
      await AsyncStorage.multiRemove(orpheoKeys);
      
      return { success: true, clearedKeys: orpheoKeys };
    } catch (error) {
      console.error('Error clearing all Orpheo data:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Migrar datos entre versiones (para actualizaciones)
   */
  async migrateData(fromVersion, toVersion) {
    try {
      console.log(`Migrating data from ${fromVersion} to ${toVersion}`);
      
      // Aquí se pueden agregar migraciones específicas
      // Por ejemplo, cambiar nombres de claves, reestructurar datos, etc.
      
      // Guardar nueva versión
      await this.setItem(STORAGE_KEYS.APP_VERSION, toVersion);
      
      return { success: true };
    } catch (error) {
      console.error('Error migrating data:', error);
      return { success: false, error: error.message };
    }
  }
}

// Exportar instancia singleton
const storageService = new StorageService();
export default storageService;

// Exportar también los métodos más comunes para uso directo
export const {
  setItem,
  getItem,
  removeItem,
  hasItem,
  getMultiple,
  setMultiple,
  removeMultiple,
  saveAuthData,
  getAuthData,
  clearAuthData,
  setCachedData,
  getCachedData,
  saveUserPreferences,
  getUserPreferences,
} = storageService;