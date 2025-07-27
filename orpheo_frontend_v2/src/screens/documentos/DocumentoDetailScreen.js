import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

const { width: screenWidth } = Dimensions.get('window');

const DocumentoDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { documento } = route.params;

  const [activeTab, setActiveTab] = useState('info');

  // Funciones de utilidad
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Tamaño desconocido';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Obtener icono por tipo de documento
  const getDocumentIcon = (tipo, fileName) => {
    if (fileName) {
      const extension = fileName.toLowerCase().split('.').pop();
      switch (extension) {
        case 'pdf':
          return { name: 'file-pdf-box', color: colors.error };
        case 'doc':
        case 'docx':
          return { name: 'file-word-box', color: colors.info };
        case 'jpg':
        case 'jpeg':
        case 'png':
          return { name: 'file-image-box', color: colors.success };
        default:
          return { name: 'file-document', color: colors.textMuted };
      }
    }
    
    switch (tipo) {
      case 'plancha':
        return { name: 'scroll-text', color: colors.primary };
      case 'reglamento':
        return { name: 'book-open', color: colors.warning };
      case 'acta':
        return { name: 'script-text', color: colors.info };
      default:
        return { name: 'file-document', color: colors.textMuted };
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

  // Manejar descarga/apertura del documento
  const handleOpenDocument = () => {
    if (documento.archivo_url) {
      Linking.openURL(documento.archivo_url).catch(() => {
        Alert.alert('Error', 'No se pudo abrir el documento');
      });
    } else {
      Alert.alert('Sin archivo', 'Este documento no tiene un archivo asociado');
    }
  };

  // Compartir documento
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${documento.titulo}\n\n${documento.descripcion || 'Documento de la logia'}`,
        title: documento.titulo,
        url: documento.archivo_url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Eliminar documento
  const handleDelete = () => {
    Alert.alert(
      'Eliminar Documento',
      `¿Estás seguro de que quieres eliminar "${documento.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar eliminación
            Alert.alert('Función pendiente', 'La eliminación será implementada próximamente');
          }
        },
      ]
    );
  };

  // Componente de información
  const InfoRow = ({ icon, label, value, color }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Icon name={icon} size={20} color={color || colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'No especificado'}</Text>
      </View>
    </View>
  );

  // Componente de tabs
  const TabButton = ({ id, title, active, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={() => onPress(id)}
    >
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const documentIcon = getDocumentIcon(documento.tipo, documento.archivo_nombre);

  return (
    <SafeAreaView style={globalStyles.safeContainer}>
      {/* Header del documento */}
      <View style={styles.documentHeader}>
        <View style={styles.iconContainer}>
          <Icon 
            name={documentIcon.name} 
            size={60} 
            color={documentIcon.color} 
          />
        </View>
        
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle} numberOfLines={3}>
            {documento.titulo}
          </Text>
          <Text style={styles.documentSubtitle}>
            {documento.tipo?.toUpperCase()} • {documento.categoria?.toUpperCase()}
          </Text>
          
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
      </View>

      {/* Acciones rápidas */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleOpenDocument}
        >
          <Icon name="eye" size={20} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Ver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Icon name="share" size={20} color={colors.info} />
          <Text style={[styles.actionText, { color: colors.info }]}>Compartir</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Próximamente', 'La edición estará disponible pronto')}
        >
          <Icon name="pencil" size={20} color={colors.warning} />
          <Text style={[styles.actionText, { color: colors.warning }]}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleDelete}
        >
          <Icon name="delete" size={20} color={colors.error} />
          <Text style={[styles.actionText, { color: colors.error }]}>Eliminar</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton
          id="info"
          title="Información"
          active={activeTab === 'info'}
          onPress={setActiveTab}
        />
        <TabButton
          id="content"
          title="Contenido"
          active={activeTab === 'content'}
          onPress={setActiveTab}
        />
        <TabButton
          id="history"
          title="Historial"
          active={activeTab === 'history'}
          onPress={setActiveTab}
        />
      </View>

      {/* Contenido de tabs */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {activeTab === 'info' && (
          <View style={styles.tabContent}>
            {/* Información básica */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Básica</Text>
              <View style={globalStyles.card}>
                <InfoRow
                  icon="text"
                  label="Título"
                  value={documento.titulo}
                />
                <InfoRow
                  icon="tag"
                  label="Tipo"
                  value={documento.tipo}
                />
                <InfoRow
                  icon="folder"
                  label="Categoría"
                  value={documento.categoria}
                />
                <InfoRow
                  icon="information"
                  label="Estado"
                  value={documento.estado}
                />
                {documento.descripcion && (
                  <InfoRow
                    icon="note-text"
                    label="Descripción"
                    value={documento.descripcion}
                  />
                )}
              </View>
            </View>

            {/* Información del archivo */}
            {documento.archivo_nombre && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Archivo</Text>
                <View style={globalStyles.card}>
                  <InfoRow
                    icon="file"
                    label="Nombre del archivo"
                    value={documento.archivo_nombre}
                  />
                  <InfoRow
                    icon="weight"
                    label="Tamaño"
                    value={formatFileSize(documento.archivo_size)}
                  />
                  <InfoRow
                    icon="file-check"
                    label="Tipo MIME"
                    value={documento.archivo_tipo}
                  />
                </View>
              </View>
            )}

            {/* Metadatos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Metadatos</Text>
              <View style={globalStyles.card}>
                <InfoRow
                  icon="account"
                  label="Autor"
                  value={documento.autor}
                />
                <InfoRow
                  icon="calendar-plus"
                  label="Fecha de creación"
                  value={formatDate(documento.created_at)}
                />
                <InfoRow
                  icon="calendar-edit"
                  label="Última modificación"
                  value={formatDate(documento.updated_at)}
                />
                {documento.version && (
                  <InfoRow
                    icon="source-branch"
                    label="Versión"
                    value={documento.version}
                  />
                )}
              </View>
            </View>
          </View>
        )}

        {activeTab === 'content' && (
          <View style={styles.tabContent}>
            <View style={globalStyles.card}>
              <Text style={styles.contentTitle}>Vista Previa del Contenido</Text>
              {documento.contenido ? (
                <Text style={styles.contentText}>{documento.contenido}</Text>
              ) : (
                <View style={styles.noContent}>
                  <Icon name="file-outline" size={48} color={colors.textMuted} />
                  <Text style={styles.noContentText}>
                    No hay vista previa disponible para este documento
                  </Text>
                  <TouchableOpacity 
                    style={globalStyles.button}
                    onPress={handleOpenDocument}
                  >
                    <Text style={globalStyles.buttonText}>Abrir Documento</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.tabContent}>
            <View style={globalStyles.card}>
              <Text style={styles.contentTitle}>Historial de Cambios</Text>
              <View style={styles.historyItem}>
                <Icon name="plus-circle" size={20} color={colors.success} />
                <View style={styles.historyContent}>
                  <Text style={styles.historyAction}>Documento creado</Text>
                  <Text style={styles.historyDate}>{formatDate(documento.created_at)}</Text>
                  <Text style={styles.historyUser}>por {documento.autor || 'Usuario'}</Text>
                </View>
              </View>
              
              {documento.updated_at && documento.updated_at !== documento.created_at && (
                <View style={styles.historyItem}>
                  <Icon name="pencil-circle" size={20} color={colors.warning} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyAction}>Documento modificado</Text>
                    <Text style={styles.historyDate}>{formatDate(documento.updated_at)}</Text>
                    <Text style={styles.historyUser}>por {documento.autor || 'Usuario'}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Espaciado final */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  documentHeader: {
    backgroundColor: colors.surface,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    marginRight: 16,
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  documentSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  contentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  noContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noContentText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyContent: {
    marginLeft: 12,
    flex: 1,
  },
  historyAction: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  historyDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  historyUser: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});

export default DocumentoDetailScreen;