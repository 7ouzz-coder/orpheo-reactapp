import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/auth';
import { STORAGE_KEYS } from '@/utils/constants';

class StorageService {
  // AUTH METHODS
  
  /**
   * Guardar token de autenticación
   */
  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw new Error('Error al guardar token de autenticación');
    }
  }

  /**
   * Obtener token de autenticación
   */
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Guardar refresh token
   */
  async saveRefreshToken(refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw new Error('Error al guardar refresh token');
    }
  }

  /**
   * Obtener refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Guardar información del usuario
   */
  async saveUser(user: User): Promise<void> {
    try {
      const userJson = JSON.stringify(user);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, userJson);
    } catch (error) {
      console.error('Error saving user:', error);
      throw new Error('Error al guardar información del usuario');
    }
  }

  /**
   * Obtener información del usuario
   */
  async getUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Guardar toda la información de autenticación
   */
  async saveAuth(user: User, token: string, refreshToken?: string): Promise<void> {
    try {
      const promises = [
        this.saveUser(user),
        this.saveToken(token),
      ];

      if (refreshToken) {
        promises.push(this.saveRefreshToken(refreshToken));
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw new Error('Error al guardar datos de autenticación');
    }
  }

  /**
   * Limpiar todos los datos de autenticación
   */
  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw new Error('Error al limpiar datos de autenticación');
    }
  }

  // PREFERENCES METHODS

  /**
   * Guardar preferencias del usuario
   */
  async savePreferences(preferences: Record<string, any>): Promise<void> {
    try {
      const preferencesJson = JSON.stringify(preferences);
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, preferencesJson);
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw new Error('Error al guardar preferencias');
    }
  }

  /**
   * Obtener preferencias del usuario
   */
  async getPreferences(): Promise<Record<string, any> | null> {
    try {
      const preferencesJson = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return preferencesJson ? JSON.parse(preferencesJson) : null;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return null;
    }
  }

  /**
   * Actualizar una preferencia específica
   */
  async updatePreference(key: string, value: any): Promise<void> {
    try {
      const currentPreferences = await this.getPreferences() || {};
      currentPreferences[key] = value;
      await this.savePreferences(currentPreferences);
    } catch (error) {
      console.error('Error updating preference:', error);
      throw new Error('Error al actualizar preferencia');
    }
  }

  // THEME METHODS

  /**
   * Guardar tema seleccionado
   */
  async saveTheme(theme: 'dark' | 'light'): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
      throw new Error('Error al guardar tema');
    }
  }

  /**
   * Obtener tema seleccionado
   */
  async getTheme(): Promise<'dark' | 'light' | null> {
    try {
      const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      return theme as 'dark' | 'light' | null;
    } catch (error) {
      console.error('Error getting theme:', error);
      return null;
    }
  }

  // GENERIC METHODS

  /**
   * Guardar un valor genérico
   */
  async setValue(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error saving value for key ${key}:`, error);
      throw new Error(`Error al guardar ${key}`);
    }
  }

  /**
   * Obtener un valor genérico
   */
  async getValue(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting value for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Guardar un objeto genérico
   */
  async setObject(key: string, object: any): Promise<void> {
    try {
      const objectJson = JSON.stringify(object);
      await AsyncStorage.setItem(key, objectJson);
    } catch (error) {
      console.error(`Error saving object for key ${key}:`, error);
      throw new Error(`Error al guardar ${key}`);
    }
  }

  /**
   * Obtener un objeto genérico
   */
  async getObject(key: string): Promise<any | null> {
    try {
      const objectJson = await AsyncStorage.getItem(key);
      return objectJson ? JSON.parse(objectJson) : null;
    } catch (error) {
      console.error(`Error getting object for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Eliminar un valor
   */
  async removeValue(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing value for key ${key}:`, error);
      throw new Error(`Error al eliminar ${key}`);
    }
  }

  /**
   * Eliminar múltiples valores
   */
  async removeValues(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error removing multiple values:', error);
      throw new Error('Error al eliminar valores');
    }
  }

  /**
   * Obtener todas las claves
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  /**
   * Limpiar todo el storage (usar con cuidado)
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all storage:', error);
      throw new Error('Error al limpiar todo el almacenamiento');
    }
  }

  /**
   * Obtener el tamaño usado del storage
   */
  async getStorageSize(): Promise<{ used: number; total: number }> {
    try {
      const keys = await this.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await this.getValue(key);
        if (value) {
          totalSize += value.length;
        }
      }

      // AsyncStorage no tiene límite estricto, pero es bueno monitorear
      return {
        used: totalSize,
        total: -1, // AsyncStorage no tiene límite fijo
      };
    } catch (error) {
      console.error('Error getting storage size:', error);
      return { used: 0, total: -1 };
    }
  }

  // CACHE METHODS

  /**
   * Guardar datos en cache con timestamp
   */
  async setCacheData(key: string, data: any, ttl: number = 3600000): Promise<void> { // 1 hora por defecto
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      await this.setObject(`cache_${key}`, cacheItem);
    } catch (error) {
      console.error(`Error setting cache for key ${key}:`, error);
    }
  }

  /**
   * Obtener datos del cache (verificando TTL)
   */
  async getCacheData(key: string): Promise<any | null> {
    try {
      const cacheItem = await this.getObject(`cache_${key}`);
      
      if (!cacheItem) {
        return null;
      }

      const now = Date.now();
      const isExpired = (now - cacheItem.timestamp) > cacheItem.ttl;

      if (isExpired) {
        await this.removeValue(`cache_${key}`);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Limpiar cache expirado
   */
  async clearExpiredCache(): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      const now = Date.now();

      for (const key of cacheKeys) {
        const cacheItem = await this.getObject(key);
        if (cacheItem && (now - cacheItem.timestamp) > cacheItem.ttl) {
          await this.removeValue(key);
        }
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  /**
   * Verificar si hay datos de autenticación guardados
   */
  async hasAuthData(): Promise<boolean> {
    try {
      const token = await this.getToken();
      const user = await this.getUser();
      return !!(token && user);
    } catch (error) {
      console.error('Error checking auth data:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const storageService = new StorageService();
export default storageService;