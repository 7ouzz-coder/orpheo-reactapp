import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { miembrosService } from '../../services/miembrosService';
import Toast from 'react-native-toast-message';

// Estado inicial
const initialState = {
  // Lista de miembros
  miembros: [],
  miembroSeleccionado: null,
  
  // Paginación
  page: 1,
  limit: 20,
  totalMiembros: 0,
  totalPages: 1,
  
  // Filtros y búsqueda
  filtros: {
    grado: 'todos',
    estado: 'todos',
    search: '',
    sortBy: 'apellidos',
    sortOrder: 'ASC'
  },
  
  // Estados de carga
  loading: {
    list: false,
    detail: false,
    create: false,
    update: false,
    delete: false,
    stats: false
  },
  
  // Errores
  error: null,
  
  // Estadísticas
  estadisticas: {
    total: 0,
    aprendices: 0,
    companeros: 0,
    maestros: 0,
    activos: 0,
    inactivos: 0
  }
};

// Thunks para operaciones asíncronas

// Obtener lista de miembros
export const fetchMiembros = createAsyncThunk(
  'miembros/fetchMiembros',
  async (params, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { filtros, page, limit } = state.miembros;
      
      // Combinar parámetros del thunk con el estado actual
      const finalParams = {
        page,
        limit,
        ...filtros,
        ...params
      };
      
      console.log('📋 Obteniendo miembros con parámetros:', finalParams);
      
      const response = await miembrosService.getMiembros(finalParams);
      
      if (response.success) {
        console.log(`✅ ${response.data.miembros.length} miembros obtenidos`);
        return response.data;
      } else {
        throw new Error(response.message || 'Error al obtener miembros');
      }
    } catch (error) {
      console.error('❌ Error al obtener miembros:', error);
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

// Obtener miembro por ID
export const fetchMiembroById = createAsyncThunk(
  'miembros/fetchMiembroById',
  async (id, { rejectWithValue }) => {
    try {
      console.log(`🔍 Obteniendo miembro ID: ${id}`);
      
      const response = await miembrosService.getMiembroById(id);
      
      if (response.success) {
        console.log('✅ Miembro obtenido exitosamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error al obtener miembro');
      }
    } catch (error) {
      console.error('❌ Error al obtener miembro:', error);
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

// Crear nuevo miembro
export const createMiembro = createAsyncThunk(
  'miembros/createMiembro',
  async (miembroData, { dispatch, rejectWithValue }) => {
    try {
      console.log('➕ Creando nuevo miembro:', miembroData.nombres, miembroData.apellidos);
      
      const response = await miembrosService.createMiembro(miembroData);
      
      if (response.success) {
        console.log('✅ Miembro creado exitosamente');
        
        Toast.show({
          type: 'success',
          text1: 'Miembro Creado',
          text2: `${miembroData.nombres} ${miembroData.apellidos} ha sido registrado`,
          visibilityTime: 3000,
        });
        
        // Recargar lista y estadísticas
        dispatch(fetchMiembros());
        dispatch(fetchEstadisticas());
        
        return response.data;
      } else {
        throw new Error(response.message || 'Error al crear miembro');
      }
    } catch (error) {
      console.error('❌ Error al crear miembro:', error);
      const errorMessage = error.response?.data?.message || error.message;
      
      Toast.show({
        type: 'error',
        text1: 'Error al Crear',
        text2: errorMessage,
        visibilityTime: 4000,
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Actualizar miembro
export const updateMiembro = createAsyncThunk(
  'miembros/updateMiembro',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      console.log(`✏️ Actualizando miembro ID: ${id}`);
      
      const response = await miembrosService.updateMiembro(id, data);
      
      if (response.success) {
        console.log('✅ Miembro actualizado exitosamente');
        
        Toast.show({
          type: 'success',
          text1: 'Miembro Actualizado',
          text2: 'Los datos han sido guardados correctamente',
          visibilityTime: 3000,
        });
        
        // Recargar datos
        dispatch(fetchMiembros());
        dispatch(fetchEstadisticas());
        
        return response.data;
      } else {
        throw new Error(response.message || 'Error al actualizar miembro');
      }
    } catch (error) {
      console.error('❌ Error al actualizar miembro:', error);
      const errorMessage = error.response?.data?.message || error.message;
      
      Toast.show({
        type: 'error',
        text1: 'Error al Actualizar',
        text2: errorMessage,
        visibilityTime: 4000,
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Eliminar miembro
export const deleteMiembro = createAsyncThunk(
  'miembros/deleteMiembro',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      console.log(`🗑️ Eliminando miembro ID: ${id}`);
      
      const response = await miembrosService.deleteMiembro(id);
      
      if (response.success) {
        console.log('✅ Miembro eliminado exitosamente');
        
        Toast.show({
          type: 'success',
          text1: 'Miembro Eliminado',
          text2: 'El miembro ha sido eliminado del sistema',
          visibilityTime: 3000,
        });
        
        // Recargar datos
        dispatch(fetchMiembros());
        dispatch(fetchEstadisticas());
        
        return id;
      } else {
        throw new Error(response.message || 'Error al eliminar miembro');
      }
    } catch (error) {
      console.error('❌ Error al eliminar miembro:', error);
      const errorMessage = error.response?.data?.message || error.message;
      
      Toast.show({
        type: 'error',
        text1: 'Error al Eliminar',
        text2: errorMessage,
        visibilityTime: 4000,
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Obtener estadísticas
export const fetchEstadisticas = createAsyncThunk(
  'miembros/fetchEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📊 Obteniendo estadísticas de miembros');
      
      const response = await miembrosService.getEstadisticas();
      
      if (response.success) {
        console.log('✅ Estadísticas obtenidas exitosamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error al obtener estadísticas');
      }
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const miembrosSlice = createSlice({
  name: 'miembros',
  initialState,
  reducers: {
    // Limpiar errores
    clearError: (state) => {
      state.error = null;
    },
    
    // Limpiar miembro seleccionado
    clearMiembroSeleccionado: (state) => {
      state.miembroSeleccionado = null;
    },
    
    // Actualizar filtros
    updateFiltros: (state, action) => {
      state.filtros = { ...state.filtros, ...action.payload };
      state.page = 1; // Resetear página al cambiar filtros
    },
    
    // Cambiar página
    setPage: (state, action) => {
      state.page = action.payload;
    },
    
    // Resetear filtros
    resetFiltros: (state) => {
      state.filtros = initialState.filtros;
      state.page = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch miembros
      .addCase(fetchMiembros.pending, (state) => {
        state.loading.list = true;
        state.error = null;
      })
      .addCase(fetchMiembros.fulfilled, (state, action) => {
        state.loading.list = false;
        state.miembros = action.payload.miembros;
        state.totalMiembros = action.payload.totalMiembros;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.page;
        state.error = null;
      })
      .addCase(fetchMiembros.rejected, (state, action) => {
        state.loading.list = false;
        state.error = action.payload;
      })
      
      // Fetch miembro por ID
      .addCase(fetchMiembroById.pending, (state) => {
        state.loading.detail = true;
        state.error = null;
      })
      .addCase(fetchMiembroById.fulfilled, (state, action) => {
        state.loading.detail = false;
        state.miembroSeleccionado = action.payload;
        state.error = null;
      })
      .addCase(fetchMiembroById.rejected, (state, action) => {
        state.loading.detail = false;
        state.error = action.payload;
      })
      
      // Crear miembro
      .addCase(createMiembro.pending, (state) => {
        state.loading.create = true;
        state.error = null;
      })
      .addCase(createMiembro.fulfilled, (state) => {
        state.loading.create = false;
        state.error = null;
      })
      .addCase(createMiembro.rejected, (state, action) => {
        state.loading.create = false;
        state.error = action.payload;
      })
      
      // Actualizar miembro
      .addCase(updateMiembro.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateMiembro.fulfilled, (state, action) => {
        state.loading.update = false;
        state.miembroSeleccionado = action.payload;
        state.error = null;
      })
      .addCase(updateMiembro.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload;
      })
      
      // Eliminar miembro
      .addCase(deleteMiembro.pending, (state) => {
        state.loading.delete = true;
        state.error = null;
      })
      .addCase(deleteMiembro.fulfilled, (state) => {
        state.loading.delete = false;
        state.error = null;
      })
      .addCase(deleteMiembro.rejected, (state, action) => {
        state.loading.delete = false;
        state.error = action.payload;
      })
      
      // Estadísticas
      .addCase(fetchEstadisticas.pending, (state) => {
        state.loading.stats = true;
      })
      .addCase(fetchEstadisticas.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.estadisticas = action.payload;
      })
      .addCase(fetchEstadisticas.rejected, (state, action) => {
        state.loading.stats = false;
        state.error = action.payload;
      });
  }
});

// Exportar acciones
export const {
  clearError,
  clearMiembroSeleccionado,
  updateFiltros,
  setPage,
  resetFiltros
} = miembrosSlice.actions;

// Selectores
export const selectMiembros = (state) => state.miembros.miembros;
export const selectMiembroSeleccionado = (state) => state.miembros.miembroSeleccionado;
export const selectLoadingList = (state) => state.miembros.loading.list;
export const selectLoadingDetail = (state) => state.miembros.loading.detail;
export const selectLoadingCreate = (state) => state.miembros.loading.create;
export const selectLoadingUpdate = (state) => state.miembros.loading.update;
export const selectLoadingDelete = (state) => state.miembros.loading.delete;
export const selectError = (state) => state.miembros.error;
export const selectFiltros = (state) => state.miembros.filtros;
export const selectPage = (state) => state.miembros.page;
export const selectTotalPages = (state) => state.miembros.totalPages;
export const selectTotalMiembros = (state) => state.miembros.totalMiembros;
export const selectEstadisticas = (state) => state.miembros.estadisticas;

// Exportar reducer
export default miembrosSlice.reducer;