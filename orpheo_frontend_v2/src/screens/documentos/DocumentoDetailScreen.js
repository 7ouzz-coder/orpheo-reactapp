import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

// Services
import documentosService from '../../services/documentosService';

// Components
import TabSafeView from '../../components/common/TabSafeView';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles, spacing, fontSize, wp, hp } from '../../styles/globalStyles';

const DocumentoDetailScreen = ({ route, navigation }) => {
  const { documentoId } = route.params;
  
  // Estados
  const [documento, setDocumento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar documento
  const cargarDocumento = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📄 Cargando documento ID:', documentoId);
      
      const response = await documentosService.getDocumentoById(documentoId);
      
      console.log('✅ Documento cargado:', response);
      
      setDocumento(response);
      
      // Actualizar título de la pantalla
      navigation.setOptions({
        title: response.nombre?.length > 30 
          ? response.nombre.substring(0, 30) + '...' 
          : response.nombre || 'Documento'
      });
      
    } catch (error) {
      console.error('❌ Error cargando documento:', error);
      setError(error.message || 'Error al cargar el documento');
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudo cargar el documento',
      });
    } finally {
      setLoading(false);
    }
  };

  // Descargar documento
  const descargarDocumento = async () => {
    try {
      setDownloading(true);
      
      Toast.show({
        type: 'info',
        text1: 'Descargando...',
        text2: 'Preparando el archivo',
      });

      // Para desarrollo, usar el URL directo
      const downloadUrl = documentosService.getDownloadUrl(documento.id);
      
      console.log('📥 Iniciando descarga:', downloadUrl);
      
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
    } finally {
      setDownloading(false);
    }
  };

  // Compartir documento
  const compartirDocumento = async () => {
    try {
      const shareUrl = documentosService.getDownloadUrl(documento.id);
      
      Alert.alert(
        'Compartir Documento',
        `Compartir: ${documento.nombre}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Copiar URL', 
            onPress: () => {
              // TODO: Implementar Clipboard
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

  // Editar documento
  const editarDocumento = () => {
    navigation.navigate('DocumentoForm', { 
      documentoId: documento.id,
      documento: documento 
    });
  };

  // Eliminar documento
  const eliminarDocumento = () => {
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
              
              // Volver a la lista
              navigation.goBack();
              
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

  // Moderar documento (solo para administradores)
  const moderarDocumento = (decision) => {
    const mensaje = decision === 'aprobado' ? 'aprobar' : 'rechazar';
    
    Alert.prompt(
      `${decision === 'aprobado' ? 'Aprobar' : 'Rechazar'} Documento`,
      'Comentarios (opcional):',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: decision === 'aprobado' ? 'Aprobar' : 'Rechazar',
          onPress: async (comentarios) => {
            try {
              await documentosService.moderarDocumento(documento.id, decision, comentarios || '');
              
              Toast.show({
                type: 'success',
                text1: 'Documento moderado',
                text2: `El documento ha sido ${decision}`,
              });
              
              // Recargar documento
              cargarDocumento();
              
            } catch (error) {
              console.error('❌ Error moderando documento:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo moderar el documento',
              });
            }
          }
        },
      ],
      'plain-text'
    );
  };

  // Utilidades
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Configurar header buttons
  useEffect(() => {
    if (documento) {
      navigation.setOptions({
        headerRight: () => (
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={compartirDocumento}
            >
              <Icon name="share-variant" size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.headerButton}
              onPress={editarDocumento}
            >
              <Icon name="pencil" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [documento]);

  // Cargar datos al montar
  useEffect(() => {
    cargarDocumento();
  }, [documentoId]);

  // Loading state
  if (loading) {
    return (
      <TabSafeView style={styles.container}>
        <LoadingSpinner />
      </TabSafeView>
    );
  }

  // Error state
  if (error || !documento) {
    return (
      <TabSafeView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={80} color={colors.error} />
          <Text style={styles.errorTitle}>Error al cargar</Text>
          <Text style={styles.errorMessage}>
            {error || 'No se pudo encontrar el documento'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={cargarDocumento}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </TabSafeView>
    );
  }

  return (
    <TabSafeView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header del documento */}
        <View style={styles.documentHeader}>
          <View style={styles.documentIconContainer}>
            <Icon 
              name={getTipoIcon(documento.tipo)} 
              size={40} 
              color={colors.primary} 
            />
          </View>
          
          <View style={styles.documentHeaderContent}>
            <Text style={styles.documentTitle}>{documento.nombre}</Text>
            
            <View style={styles.documentMeta}>
              <View style={styles.metaItem}>
                <Icon name="account" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  {documento.autor?.nombres} {documento.autor?.apellidos}
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <Icon name="calendar" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  {formatDate(documento.fecha_creacion)}
                </Text>
              </View>
            </View>
            
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(documento.estado) }]}>
                <Text style={styles.statusText}>
                  {documento.estado?.charAt(0).toUpperCase() + documento.estado?.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Botones de acción principales */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.downloadButton]}
            onPress={descargarDocumento}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Icon name="download" size={20} color={colors.white} />
            )}
            <Text style={styles.actionButtonText}>
              {downloading ? 'Descargando...' : 'Descargar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.shareButton]}
            onPress={compartirDocumento}
          >
            <Icon name="share-variant" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              Compartir
            </Text>
          </TouchableOpacity>
        </View>

        {/* Información del archivo */}
        <View style={styles.fileInfo}>
          <Text style={styles.sectionTitle}>Información del Archivo</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tipo</Text>
              <Text style={styles.infoValue}>
                {documento.tipo?.charAt(0).toUpperCase() + documento.tipo?.slice(1)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Categoría</Text>
              <Text style={styles.infoValue}>
                {documento.categoria?.charAt(0).toUpperCase() + documento.categoria?.slice(1)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tamaño</Text>
              <Text style={styles.infoValue}>
                {formatFileSize(documento.archivo_size || 0)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Formato</Text>
              <Text style={styles.infoValue}>
                {documento.archivo_nombre?.split('.').pop()?.toUpperCase() || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Descripción */}
        {documento.descripcion && (
          <View style={styles.description}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.descriptionText}>{documento.descripcion}</Text>
          </View>
        )}

        {/* Tags */}
        {documento.tags && documento.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>Etiquetas</Text>
            <View style={styles.tagsContainer}>
              {documento.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Estadísticas */}
        {documento.stats && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Estadísticas</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Icon name="download" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{documento.stats.descargas || 0}</Text>
                <Text style={styles.statLabel}>Descargas</Text>
              </View>
              
              <View style={styles.statItem}>
                <Icon name="eye" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{documento.stats.vistas || 0}</Text>
                <Text style={styles.statLabel}>Vistas</Text>
              </View>
              
              <View style={styles.statItem}>
                <Icon name="heart" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{documento.stats.favoritos || 0}</Text>
                <Text style={styles.statLabel}>Favoritos</Text>
              </View>
            </View>
          </View>
        )}

        {/* Botones de moderación (solo para administradores) */}
        {documento.estado === 'pendiente' && (
          <View style={styles.moderationSection}>
            <Text style={styles.sectionTitle}>Moderación</Text>
            
            <View style={styles.moderationButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => moderarDocumento('aprobado')}
              >
                <Icon name="check" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>Aprobar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => moderarDocumento('rechazado')}
              >
                <Icon name="close" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Botón eliminar */}
        <View style={styles.dangerZone}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={eliminarDocumento}
          >
            <Icon name="delete" size={20} color={colors.error} />
            <Text style={styles.deleteButtonText}>Eliminar Documento</Text>
          </TouchableOpacity>
        </View>

        {/* Espaciado inferior */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </TabSafeView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    padding: spacing.xs,
  },
  
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.error,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '600',
  },

  // Document header
  documentHeader: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  documentIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  documentHeaderContent: {
    flex: 1,
  },
  documentTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  documentMeta: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: '600',
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  downloadButton: {
    backgroundColor: colors.primary,
  },
  shareButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },

  // Sections
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },

  // File info
  fileInfo: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  infoItem: {
    width: '48%',
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },

  // Description
  description: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },

  // Tags
  tagsSection: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  tagText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },

  // Stats
  statsSection: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },

  // Moderation
  moderationSection: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  moderationButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },

  // Danger zone
  dangerZone: {
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  deleteButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.error,
  },

  bottomSpacer: {
    height: spacing.xl,
  },
});

export default DocumentoDetailScreen;