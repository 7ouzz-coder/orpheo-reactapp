import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

// Services
import documentosService from '../../services/documentosService';

// Components
import TabSafeView from '../../components/common/TabSafeView';
import SearchBar from '../../components/common/SearchBar';
import FilterModal from '../../components/common/FilterModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles, spacing, fontSize, wp, hp } from '../../styles/globalStyles';

const DocumentosListScreen = ({ navigation }) => {
  // Estados locales
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados de filtros y búsqueda
  const [filtros, setFiltros] = useState({
    search: '',
    categoria: '',
    tipo: '',
    estado: '',
    autor: '',
    fechaDesde: '',
    fechaHasta: '',
    ordenarPor: 'fecha_creacion',
    orden: 'desc',
  });
  
  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocumentos, setTotalDocumentos] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Cargar documentos desde API
  const cargarDocumentos = async (currentPage = 1, currentFilters = filtros, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);
      
      console.log('📄 Cargando documentos:', { currentPage, currentFilters });
      
      const response = await documentosService.getDocumentos({
        page: currentPage,
        limit: 10,
        ...currentFilters,
      });
      
      console.log('✅ Documentos cargados:', response);
      
      if (append) {
        setDocumentos(prev => [...prev, ...response.data]);
      } else {
        setDocumentos(response.data);
      }
      
      setTotalPages(response.pagination.totalPages || 1);
      setTotalDocumentos(response.total || response.data.length);
      setHasMore(currentPage < (response.pagination.totalPages || 1));
      
    } catch (error) {
      console.error('❌ Error cargando documentos:', error);
      setError(error.message || 'Error al cargar documentos');
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudieron cargar los documentos',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar más documentos (paginación)
  const cargarMasDocumentos = () => {
    if (!loading && hasMore && page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      cargarDocumentos(nextPage, filtros, true);
    }
  };

  // Manejar búsqueda
  const handleSearch = (searchText) => {
    const newFilters = { ...filtros, search: searchText };
    setFiltros(newFilters);
    setPage(1);
    cargarDocumentos(1, newFilters);
  };

  // Aplicar filtros
  const aplicarFiltros = (newFilters) => {
    const updatedFilters = { ...filtros, ...newFilters };
    setFiltros(updatedFilters);
    setPage(1);
    setShowFilters(false);
    cargarDocumentos(1, updatedFilters);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    const cleanFilters = {
      search: '',
      categoria: '',
      tipo: '',
      estado: '',
      autor: '',
      fechaDesde: '',
      fechaHasta: '',
      ordenarPor: 'fecha_creacion',
      orden: 'desc',
    };
    setFiltros(cleanFilters);
    setPage(1);
    cargarDocumentos(1, cleanFilters);
  };

  // Refrescar lista
  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    cargarDocumentos(1, filtros);
  };

  // Descargar documento
  const descargarDocumento = async (documento) => {
    try {
      Toast.show({
        type: 'info',
        text1: 'Descargando...',
        text2: 'Preparando el archivo',
      });

      // Para desarrollo, usar el URL directo
      const downloadUrl = documentosService.getDownloadUrl(documento.id);
      
      // Abrir en navegador (funciona en desarrollo)
      await Linking.openURL(downloadUrl);
      
      Toast.show({
        type: 'success',
        text1: 'Descarga iniciada',
        text2: 'El archivo se abrirá en el navegador',
      });
      
    } catch (error) {
      console.error('❌ Error descargando documento:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo descargar el documento',
      });
    }
  };

  // Compartir documento
  const compartirDocumento = async (documento) => {
    try {
      const shareUrl = documentosService.getDownloadUrl(documento.id);
      
      // TODO: Implementar Share API de React Native
      Alert.alert(
        'Compartir Documento',
        `Compartir: ${documento.nombre}\nURL: ${shareUrl}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Copiar URL', 
            onPress: () => {
              // TODO: Copiar al portapapeles
              Toast.show({
                type: 'success',
                text1: 'URL copiada',
                text2: 'URL copiada al portapapeles',
              });
            }
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error compartiendo documento:', error);
    }
  };

  // Eliminar documento
  const eliminarDocumento = (documento) => {
    Alert.alert(
      'Eliminar Documento',
      `¿Estás seguro de que deseas eliminar "${documento.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await documentosService.deleteDocumento(documento.id);
              
              Toast.show({
                type: 'success',
                text1: 'Documento eliminado',
                text2: 'El documento ha sido eliminado correctamente',
              });
              
              // Recargar lista
              onRefresh();
              
            } catch (error) {
              console.error('❌ Error eliminando documento:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo eliminar el documento',
              });
            }
          }
        },
      ]
    );
  };

  // Configuración de filtros para el modal
  const filterConfig = [
    {
      key: 'categoria',
      label: 'Categoría',
      type: 'select',
      options: [
        { label: 'Todas', value: '' },
        { label: 'Aprendiz', value: 'aprendiz' },
        { label: 'Compañero', value: 'companero' },
        { label: 'Maestro', value: 'maestro' },
        { label: 'General', value: 'general' },
        { label: 'Administrativo', value: 'administrativo' },
      ],
    },
    {
      key: 'tipo',
      label: 'Tipo',
      type: 'select',
      options: [
        { label: 'Todos', value: '' },
        { label: 'Ritual', value: 'ritual' },
        { label: 'Reglamento', value: 'reglamento' },
        { label: 'Plancha', value: 'plancha' },
        { label: 'Acta', value: 'acta' },
        { label: 'Instructivo', value: 'instructivo' },
      ],
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'select',
      options: [
        { label: 'Todos', value: '' },
        { label: 'Aprobado', value: 'aprobado' },
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Rechazado', value: 'rechazado' },
      ],
    },
    {
      key: 'ordenarPor',
      label: 'Ordenar por',
      type: 'select',
      options: [
        { label: 'Fecha creación', value: 'fecha_creacion' },
        { label: 'Nombre', value: 'nombre' },
        { label: 'Descargas', value: 'descargas' },
        { label: 'Autor', value: 'autor' },
      ],
    },
    {
      key: 'orden',
      label: 'Orden',
      type: 'select',
      options: [
        { label: 'Descendente', value: 'desc' },
        { label: 'Ascendente', value: 'asc' },
      ],
    },
  ];

  // Renderizar documento
  const renderDocumento = ({ item: documento }) => (
    <DocumentoCard
      documento={documento}
      onPress={() => navigation.navigate('DocumentoDetail', { documentoId: documento.id })}
      onDownload={() => descargarDocumento(documento)}
      onShare={() => compartirDocumento(documento)}
      onEdit={() => navigation.navigate('DocumentoForm', { documentoId: documento.id })}
      onDelete={() => eliminarDocumento(documento)}
    />
  );

  // Renderizar estado vacío
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="file-document-outline" size={80} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No hay documentos</Text>
      <Text style={styles.emptySubtitle}>
        {filtros.search || filtros.categoria || filtros.tipo || filtros.estado
          ? 'No se encontraron documentos con los filtros aplicados'
          : 'Aún no hay documentos disponibles'}
      </Text>
      {(filtros.search || filtros.categoria || filtros.tipo || filtros.estado) && (
        <TouchableOpacity style={styles.clearFiltersButton} onPress={limpiarFiltros}>
          <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Renderizar footer de la lista
  const renderFooter = () => {
    if (!loading || refreshing) return null;
    
    return (
      <View style={styles.footerLoader}>
        <LoadingSpinner size="small" />
        <Text style={styles.footerText}>Cargando más documentos...</Text>
      </View>
    );
  };

  // Hook para cargar datos al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      cargarDocumentos(1, filtros);
    }, [])
  );

  return (
    <TabSafeView style={styles.container}>
      {/* Header con búsqueda y filtros */}
      <View style={styles.header}>
        <SearchBar
          placeholder="Buscar documentos..."
          value={filtros.search}
          onChangeText={handleSearch}
          onClear={() => handleSearch('')}
        />
        
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              (filtros.categoria || filtros.tipo || filtros.estado) && styles.filterButtonActive
            ]}
            onPress={() => setShowFilters(true)}
          >
            <Icon 
              name="filter-variant" 
              size={20} 
              color={
                (filtros.categoria || filtros.tipo || filtros.estado) 
                  ? colors.white 
                  : colors.primary
              } 
            />
            <Text style={[
              styles.filterButtonText,
              (filtros.categoria || filtros.tipo || filtros.estado) && styles.filterButtonTextActive
            ]}>
              Filtros
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('DocumentoUpload')}
          >
            <Icon name="plus" size={20} color={colors.white} />
            <Text style={styles.addButtonText}>Subir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contador de resultados */}
      <View style={styles.resultsCounter}>
        <Text style={styles.resultsText}>
          {totalDocumentos} documento{totalDocumentos !== 1 ? 's' : ''} encontrado{totalDocumentos !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Lista de documentos */}
      {loading && !refreshing ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={documentos}
          renderItem={renderDocumento}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={documentos.length === 0 ? styles.emptyList : styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={cargarMasDocumentos}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de filtros */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={aplicarFiltros}
        onClear={limpiarFiltros}
        filters={filtros}
        filterConfig={filterConfig}
        title="Filtrar Documentos"
      />
    </TabSafeView>
  );
};

// Componente DocumentoCard
const DocumentoCard = ({ 
  documento, 
  onPress, 
  onDownload, 
  onShare, 
  onEdit, 
  onDelete 
}) => {
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'aprobado': return colors.success;
      case 'pendiente': return colors.warning;
      case 'rechazado': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'ritual': return 'book-open-variant';
      case 'reglamento': return 'gavel';
      case 'plancha': return 'file-document';
      case 'acta': return 'clipboard-text';
      case 'instructivo': return 'help-circle';
      default: return 'file';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <TouchableOpacity style={styles.documentCard} onPress={onPress}>
      {/* Header de la tarjeta */}
      <View style={styles.cardHeader}>
        <View style={styles.documentInfo}>
          <Icon 
            name={getTipoIcon(documento.tipo)} 
            size={24} 
            color={colors.primary} 
          />
          <View style={styles.documentTitleContainer}>
            <Text style={styles.documentTitle} numberOfLines={2}>
              {documento.nombre}
            </Text>
            <View style={styles.documentMeta}>
              <Text style={styles.documentAuthor}>
                {documento.autor?.nombres} {documento.autor?.apellidos}
              </Text>
              <Text style={styles.documentDate}>
                {formatDate(documento.fecha_creacion)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onDownload();
            }}
          >
            <Icon name="download" size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onShare();
            }}
          >
            <Icon name="share-variant" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Descripción */}
      {documento.descripcion && (
        <Text style={styles.documentDescription} numberOfLines={2}>
          {documento.descripcion}
        </Text>
      )}

      {/* Tags */}
      {documento.tags && documento.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {documento.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {documento.tags.length > 3 && (
            <Text style={styles.moreTags}>+{documento.tags.length - 3}</Text>
          )}
        </View>
      )}

      {/* Footer de la tarjeta */}
      <View style={styles.cardFooter}>
        <View style={styles.documentStats}>
          <View style={styles.stat}>
            <Icon name="download" size={14} color={colors.textSecondary} />
            <Text style={styles.statText}>{documento.stats?.descargas || 0}</Text>
          </View>
          
          <View style={styles.stat}>
            <Icon name="eye" size={14} color={colors.textSecondary} />
            <Text style={styles.statText}>{documento.stats?.vistas || 0}</Text>
          </View>
          
          <Text style={styles.fileSize}>
            {formatFileSize(documento.archivo_size || 0)}
          </Text>
        </View>
        
        <View style={styles.documentStatus}>
          <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(documento.estado) }]}>
            <Text style={styles.statusText}>
              {documento.estado?.charAt(0).toUpperCase() + documento.estado?.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButtons: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    marginLeft: spacing.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  addButtonText: {
    marginLeft: spacing.xs,
    color: colors.white,
    fontWeight: '600',
  },
  resultsCounter: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  resultsText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.sm,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  clearFiltersButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  clearFiltersText: {
    color: colors.white,
    fontWeight: '600',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  
  // DocumentoCard styles
  documentCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...globalStyles.shadow,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  documentInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: spacing.sm,
  },
  documentTitleContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  documentTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  documentMeta: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  documentAuthor: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  documentDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
  },
  documentDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '500',
  },
  moreTags: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    alignSelf: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  fileSize: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  documentStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: '500',
  },
});

export default DocumentosListScreen;