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
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';

// Redux
import { 
  fetchDocumentos, 
  selectDocumentos, 
  selectDocumentosLoading,
  selectDocumentosError,
  selectDocumentosFilters,
  setFilters,
  clearFilters,
  uploadDocumento 
} from '../../store/slices/documentosSlice';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

// Hook para debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const DocumentosListScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Redux state
  const documentos = useSelector(selectDocumentos);
  const loading = useSelector(selectDocumentosLoading);
  const error = useSelector(selectDocumentosError);
  const filters = useSelector(selectDocumentosFilters);
  
  // Local state
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [uploading, setUploading] = useState(false);
  
  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Cargar documentos al inicializar
  useFocusEffect(
    useCallback(() => {
      loadDocumentos();
    }, [])
  );

  useEffect(() => {
    if (debouncedSearchQuery !== filters.search) {
      dispatch(setFilters({ search: debouncedSearchQuery }));
      loadDocumentos();
    }
  }, [debouncedSearchQuery]);

  const loadDocumentos = async () => {
    try {
      await dispatch(fetchDocumentos()).unwrap();
    } catch (error) {
      console.error('Error loading documentos:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDocumentos();
    setRefreshing(false);
  };

  // Manejar toque en documento
  const handleDocumentoPress = (documento) => {
    navigation.navigate('DocumentoDetail', { documento });
  };

  // Subir documento
  const handleUploadDocumento = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        Alert.prompt(
          'Título del Documento',
          'Ingresa un título para el documento:',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'Subir',
              onPress: async (titulo) => {
                if (titulo && titulo.trim()) {
                  setUploading(true);
                  try {
                    await dispatch(uploadDocumento({
                      titulo: titulo.trim(),
                      tipo: 'documento',
                      categoria: 'general',
                      archivo: {
                        uri: file.uri,
                        type: file.mimeType,
                        name: file.name,
                        size: file.size,
                      },
                    })).unwrap();
                    
                    Alert.alert('Éxito', 'Documento subido correctamente');
                  } catch (error) {
                    Alert.alert('Error', 'No se pudo subir el documento');
                  } finally {
                    setUploading(false);
                  }
                } else {
                  Alert.alert('Error', 'El título es obligatorio');
                }
              },
            },
          ],
          'plain-text'
        );
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  // Aplicar filtros
  const applyFilters = () => {
    dispatch(setFilters(localFilters));
    setShowFilters(false);
    loadDocumentos();
  };

  // Limpiar filtros
  const clearAllFilters = () => {
    const emptyFilters = {
      search: '',
      categoria: null,
      tipo: null,
      estado: 'activo',
    };
    setLocalFilters(emptyFilters);
    setSearchQuery('');
    dispatch(clearFilters());
    setShowFilters(false);
    loadDocumentos();
  };

  // Obtener icono por tipo de documento
  const getDocumentIcon = (tipo, fileName) => {
    if (fileName) {
      const extension = fileName.toLowerCase().split('.').pop();
      switch (extension) {
        case 'pdf':
          return 'file-pdf-box';
        case 'doc':
        case 'docx':
          return 'file-word-box';
        case 'jpg':
        case 'jpeg':
        case 'png':
          return 'file-image-box';
        default:
          return 'file-document';
      }
    }
    
    switch (tipo) {
      case 'plancha':
        return 'scroll-text';
      case 'reglamento':
        return 'book-open';
      case 'acta':
        return 'script-text';
      default:
        return 'file-document';
    }
  };

  // Obtener color por categoría
  const getCategoriaColor = (categoria) => {
    switch (categoria?.toLowerCase()) {
      case 'aprendiz':
        return colors.aprendiz;
      case 'companero':
        return colors.companero;
      case 'maestro':
        return colors.maestro;
      default:
        return colors.info;
    }
  };

  // Componente de tarjeta de documento
  const DocumentoCard = ({ documento }) => (
    <TouchableOpacity
      style={styles.documentoCard}
      onPress={() => handleDocumentoPress(documento)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Icon 
            name={getDocumentIcon(documento.tipo, documento.archivo_nombre)} 
            size={32} 
            color={getCategoriaColor(documento.categoria)} 
          />
        </View>
        <View style={styles.documentoInfo}>
          <Text style={styles.documentoTitle} numberOfLines={2}>
            {documento.titulo}
          </Text>
          <Text style={styles.documentoSubtitle}>
            {documento.tipo?.toUpperCase()} • {documento.categoria?.toUpperCase()}
          </Text>
          {documento.archivo_nombre && (
            <Text style={styles.fileName} numberOfLines={1}>
              📎 {documento.archivo_nombre}
            </Text>
          )}
        </View>
        <Icon name="chevron-right" size={20} color={colors.textMuted} />
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>
            {documento.autor || 'Sin autor'}
          </Text>
          <Text style={styles.metaText}>
            {new Date(documento.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getCategoriaColor(documento.categoria) + '20' }]}>
            <Text style={[styles.badgeText, { color: getCategoriaColor(documento.categoria) }]}>
              {documento.categoria?.toUpperCase()}
            </Text>
          </View>
          
          {documento.estado && (
            <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.badgeText, { color: colors.success }]}>
                {documento.estado?.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Componente de filtros modal
  const FiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Filtros</Text>
          <TouchableOpacity onPress={clearAllFilters}>
            <Text style={styles.clearText}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          {/* Filtro por tipo */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Tipo de Documento</Text>
            <View style={styles.filterOptions}>
              {['documento', 'plancha', 'reglamento', 'acta'].map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.filterOption,
                    localFilters.tipo === tipo && styles.filterOptionActive
                  ]}
                  onPress={() => setLocalFilters(prev => ({ 
                    ...prev, 
                    tipo: prev.tipo === tipo ? null : tipo 
                  }))}
                >
                  <Text style={[
                    styles.filterOptionText,
                    localFilters.tipo === tipo && styles.filterOptionTextActive
                  ]}>
                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filtro por categoría */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Categoría</Text>
            <View style={styles.filterOptions}>
              {['general', 'aprendiz', 'companero', 'maestro'].map((categoria) => (
                <TouchableOpacity
                  key={categoria}
                  style={[
                    styles.filterOption,
                    localFilters.categoria === categoria && styles.filterOptionActive
                  ]}
                  onPress={() => setLocalFilters(prev => ({ 
                    ...prev, 
                    categoria: prev.categoria === categoria ? null : categoria 
                  }))}
                >
                  <Text style={[
                    styles.filterOptionText,
                    localFilters.categoria === categoria && styles.filterOptionTextActive
                  ]}>
                    {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={applyFilters}
          >
            <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  // Estado de carga inicial
  if (loading && documentos.length === 0) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={globalStyles.loadingText}>Cargando documentos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeContainer}>
      {/* Header con búsqueda y filtros */}
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar documentos..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Icon name="filter" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Lista de documentos */}
      <FlatList
        data={documentos}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => <DocumentoCard documento={item} />}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={globalStyles.emptyContainer}>
            <Icon name="file-document" size={64} color={colors.textMuted} />
            <Text style={globalStyles.emptyText}>
              {searchQuery ? 'No se encontraron documentos' : 'No hay documentos disponibles'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity style={globalStyles.button} onPress={handleUploadDocumento}>
                <Text style={globalStyles.buttonText}>Subir Primer Documento</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Botón flotante para subir */}
      <TouchableOpacity
        style={[styles.floatingButton, uploading && styles.floatingButtonDisabled]}
        onPress={handleUploadDocumento}
        disabled={uploading}
        activeOpacity={0.8}
      >
        {uploading ? (
          <ActivityIndicator size={24} color={colors.background} />
        ) : (
          <Icon name="plus" size={24} color={colors.background} />
        )}
      </TouchableOpacity>

      {/* Modal de filtros */}
      <FiltersModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: colors.text,
  },
  filterButton: {
    padding: 8,
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
  },
  listContainer: {
    padding: 16,
  },
  documentoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 4,
  },
  documentoInfo: {
    flex: 1,
  },
  documentoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  documentoSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  fileName: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  badges: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  // Modal styles (similares a MiembrosListScreen)
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  clearText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  filterOptionTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DocumentosListScreen;