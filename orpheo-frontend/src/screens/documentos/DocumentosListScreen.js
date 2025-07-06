import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from 'expo-document-picker';

import { colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';
import { wp, hp, fontSize, spacing } from '../../utils/dimensions';
import SearchBar from '../../components/common/SearchBar';
import DocumentoCard from '../../components/documentos/DocumentoCard';
import DocumentoFilterModal from '../../components/documentos/DocumentoFilterModal';
import DocumentoUploadModal from '../../components/documentos/DocumentoUploadModal';
import LoadingCard from '../../components/common/LoadingCard';
import { 
  getDocumentos, 
  selectDocumentos, 
  selectDocumentosLoading,
  selectDocumentosError,
  clearError,
  uploadDocumento 
} from '../../store/slices/documentosSlice';
import { useDebounce } from '../../hooks/useDebounce';

const DocumentosListScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const documentos = useSelector(selectDocumentos);
  const loading = useSelector(selectDocumentosLoading);
  const error = useSelector(selectDocumentosError);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [filters, setFilters] = useState({
    categoria: null,
    tipo: null,
    esplancha: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    porCategoria: { aprendiz: 0, companero: 0, maestro: 0, general: 0 },
    planchas: { total: 0, pendientes: 0, aprobadas: 0 },
    porTipo: {}
  });

  useFocusEffect(
    useCallback(() => {
      loadDocumentos();
    }, [])
  );

  useEffect(() => {
    if (debouncedSearchQuery !== null) {
      loadDocumentos();
    }
  }, [debouncedSearchQuery, filters]);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
        position: 'top',
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Calcular estadísticas
  useEffect(() => {
    if (Array.isArray(documentos)) {
      const total = documentos.length;
      
      const porCategoria = documentos.reduce((acc, doc) => {
        if (doc && doc.categoria) {
          acc[doc.categoria] = (acc[doc.categoria] || 0) + 1;
        }
        return acc;
      }, { aprendiz: 0, companero: 0, maestro: 0, general: 0, administrativo: 0 });

      const planchas = documentos.filter(doc => doc.esPlancha);
      const planchasStats = {
        total: planchas.length,
        pendientes: planchas.filter(p => p.planchaEstado === 'pendiente').length,
        aprobadas: planchas.filter(p => p.planchaEstado === 'aprobada').length,
      };

      const porTipo = documentos.reduce((acc, doc) => {
        if (doc && doc.tipo) {
          acc[doc.tipo] = (acc[doc.tipo] || 0) + 1;
        }
        return acc;
      }, {});

      setStats({ total, porCategoria, planchas: planchasStats, porTipo });
    }
  }, [documentos]);

  const loadDocumentos = () => {
    const params = {
      page: 1,
      limit: 50,
      ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
      ...(filters.categoria && { categoria: filters.categoria }),
      ...(filters.tipo && { tipo: filters.tipo }),
      ...(filters.esplancha !== null && { esplancha: filters.esplancha }),
    };
    
    dispatch(getDocumentos(params));
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDocumentos();
    setRefreshing(false);
  }, []);

  const handleDocumentoPress = (documento) => {
    navigation.navigate('DocumentoDetail', { documento });
  };

  const handleDocumentoLongPress = (documento) => {
    const options = [
      {
        text: 'Ver documento',
        onPress: () => handleDocumentoPress(documento),
        style: 'default'
      },
      {
        text: 'Descargar',
        onPress: () => handleDownload(documento),
        style: 'default'
      },
      {
        text: 'Compartir',
        onPress: () => handleShare(documento),
        style: 'default'
      }
    ];

    // Agregar opciones adicionales si tiene permisos
    if (documento.autor?.id === 'current_user_id') { // TODO: obtener user actual
      options.splice(1, 0, {
        text: 'Editar',
        onPress: () => navigation.navigate('DocumentoForm', { documento }),
        style: 'default'
      });
    }

    options.push({
      text: 'Cancelar',
      style: 'cancel',
    });

    Alert.alert(
      documento.nombre,
      'Selecciona una acción',
      options
    );
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setShowUpload(true);
        // TODO: Pasar el archivo seleccionado al modal
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo seleccionar el archivo',
        position: 'top',
      });
    }
  };

  const handleQuickUpload = async (uploadData) => {
    try {
      await dispatch(uploadDocumento(uploadData)).unwrap();
      setShowUpload(false);
      Toast.show({
        type: 'success',
        text1: 'Éxito',
        text2: 'Documento subido correctamente',
        position: 'top',
      });
      loadDocumentos();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
        position: 'top',
      });
    }
  };

  const handleDownload = (documento) => {
    // TODO: Implementar descarga
    Toast.show({
      type: 'info',
      text1: 'Descarga',
      text2: `Descargando ${documento.nombre}...`,
      position: 'top',
    });
  };

  const handleShare = (documento) => {
    // TODO: Implementar compartir
    Toast.show({
      type: 'info',
      text1: 'Compartir',
      text2: `Compartiendo ${documento.nombre}...`,
      position: 'top',
    });
  };

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setShowFilter(false);
  };

  const clearFilters = () => {
    setFilters({ categoria: null, tipo: null, esplancha: null });
    setSearchQuery('');
  };

  const hasActiveFilters = () => {
    return filters.categoria || filters.tipo || filters.esplancha !== null || searchQuery.length > 0;
  };

  const getCategoriaColor = (categoria) => {
    const colores = {
      aprendiz: colors.aprendiz,
      companero: colors.companero,
      maestro: colors.maestro,
      general: colors.primary,
      administrativo: colors.info
    };
    return colores[categoria] || colors.primary;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.aprendiz }]}>{stats.porCategoria.aprendiz}</Text>
          <Text style={styles.statLabel}>Aprendiz</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.companero }]}>{stats.porCategoria.companero}</Text>
          <Text style={styles.statLabel}>Compañero</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.maestro }]}>{stats.porCategoria.maestro}</Text>
          <Text style={styles.statLabel}>Maestro</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>{stats.planchas.pendientes}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
      </View>

      {/* Barra de búsqueda y controles */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar documentos..."
      />
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilters() && styles.filterButtonActive]}
          onPress={() => setShowFilter(true)}
          activeOpacity={0.8}
        >
          <Icon name="tune" size={wp(5)} color={hasActiveFilters() ? colors.white : colors.primary} />
          <Text style={[styles.filterText, hasActiveFilters() && styles.filterTextActive]}>
            Filtros
          </Text>
          {hasActiveFilters() && <View style={styles.filterDot} />}
        </TouchableOpacity>
        
        {hasActiveFilters() && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearFilters}
            activeOpacity={0.8}
          >
            <Icon name="clear" size={wp(4)} color={colors.error} />
            <Text style={styles.clearText}>Limpiar</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUpload}
          activeOpacity={0.8}
        >
          <Icon name="cloud-upload" size={wp(5)} color={colors.white} />
          <Text style={styles.uploadButtonText}>Subir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDocumento = ({ item, index }) => (
    <DocumentoCard
      documento={item}
      onPress={() => handleDocumentoPress(item)}
      onLongPress={() => handleDocumentoLongPress(item)}
      getCategoriaColor={getCategoriaColor}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon 
        name={searchQuery ? "search-off" : "description"} 
        size={wp(20)} 
        color={colors.textTertiary} 
      />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'Sin resultados' : 'No hay documentos'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? `No se encontraron documentos que coincidan con "${searchQuery}"` 
          : 'Sube el primer documento a la biblioteca'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={handleUpload}
          activeOpacity={0.8}
        >
          <Icon name="cloud-upload" size={wp(5)} color={colors.white} />
          <Text style={styles.emptyButtonText}>Subir Primer Documento</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && documentos.length === 0) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          {[...Array(8)].map((_, index) => (
            <LoadingCard key={index} height={hp(10)} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <FlatList
        data={documentos}
        renderItem={renderDocumento}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
      />
      
      <DocumentoFilterModal
        visible={showFilter}
        filters={filters}
        onApply={handleFilterApply}
        onClose={() => setShowFilter(false)}
      />

      <DocumentoUploadModal
        visible={showUpload}
        onUpload={handleQuickUpload}
        onClose={() => setShowUpload(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  
  // Estadísticas
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: wp(3),
    padding: spacing.md,
    marginBottom: spacing.md,
    justifyContent: 'space-around',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Controles
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: wp(6),
    marginRight: spacing.sm,
    position: 'relative',
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.primary,
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.white,
  },
  filterDot: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: colors.warning,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: wp(4),
    marginRight: spacing.sm,
  },
  clearText: {
    color: colors.error,
    marginLeft: spacing.xs,
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: wp(6),
    marginLeft: 'auto',
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  
  // Lista
  listContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  
  // Estados
  loadingContainer: {
    padding: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(10),
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: fontSize.md * 1.4,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: wp(2),
    elevation: 2,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});

export default DocumentosListScreen;