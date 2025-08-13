import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
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

const DocumentoUploadScreen = ({ route, navigation }) => {
  const { documentoId } = route.params || {};
  const isEditMode = !!documentoId;

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'documento',
    categoria: 'general',
    tags: '',
    publico: false,
  });

  // Estados del archivo
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Estados de la UI
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});

  // Configuración de tipos y categorías
  const tiposDocumento = [
    { label: 'Documento General', value: 'documento' },
    { label: 'Ritual', value: 'ritual' },
    { label: 'Reglamento', value: 'reglamento' },
    { label: 'Plancha', value: 'plancha' },
    { label: 'Acta', value: 'acta' },
    { label: 'Instructivo', value: 'instructivo' },
    { label: 'Presentación', value: 'presentacion' },
    { label: 'Imagen', value: 'imagen' },
  ];

  const categoriasDocumento = [
    { label: 'General', value: 'general' },
    { label: 'Aprendiz', value: 'aprendiz' },
    { label: 'Compañero', value: 'companero' },
    { label: 'Maestro', value: 'maestro' },
    { label: 'Administrativo', value: 'administrativo' },
    { label: 'Histórico', value: 'historico' },
    { label: 'Educativo', value: 'educativo' },
  ];

  // Cargar documento si estamos en modo edición
  const cargarDocumento = async () => {
    if (!isEditMode) return;
    
    try {
      setLoading(true);
      
      const documento = await documentosService.getDocumentoById(documentoId);
      
      setFormData({
        nombre: documento.nombre || '',
        descripcion: documento.descripcion || '',
        tipo: documento.tipo || 'documento',
        categoria: documento.categoria || 'general',
        tags: documento.tags ? documento.tags.join(', ') : '',
        publico: documento.publico || false,
      });
      
      navigation.setOptions({
        title: 'Editar Documento'
      });
      
    } catch (error) {
      console.error('❌ Error cargando documento:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo cargar el documento',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar archivo
  const seleccionarArchivo = async () => {
    try {
      console.log('📁 Abriendo selector de archivos...');
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'], // Aceptar todos los tipos
        copyToCacheDirectory: true,
        multiple: false,
      });

      console.log('📁 Resultado selector:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        console.log('📁 Archivo seleccionado:', file);
        
        // Validar tamaño (máximo 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
          Alert.alert(
            'Archivo muy grande',
            'El archivo seleccionado es muy grande. El tamaño máximo permitido es 50MB.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Configurar archivo seleccionado
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size,
        });

        // Si el nombre del documento está vacío, usar el nombre del archivo
        if (!formData.nombre) {
          const nombreSinExtension = file.name.replace(/\.[^/.]+$/, '');
          setFormData(prev => ({
            ...prev,
            nombre: nombreSinExtension
          }));
        }

        // Crear preview si es una imagen
        if (file.mimeType && file.mimeType.startsWith('image/')) {
          setFilePreview(file.uri);
        } else {
          setFilePreview(null);
        }

        Toast.show({
          type: 'success',
          text1: 'Archivo seleccionado',
          text2: file.name,
        });
      }
    } catch (error) {
      console.error('❌ Error seleccionando archivo:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo seleccionar el archivo',
      });
    }
  };

  // Remover archivo seleccionado
  const removerArchivo = () => {
    Alert.alert(
      'Remover Archivo',
      '¿Estás seguro de que deseas remover el archivo seleccionado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setSelectedFile(null);
            setFilePreview(null);
            Toast.show({
              type: 'info',
              text1: 'Archivo removido',
            });
          }
        },
      ]
    );
  };

  // Validar formulario
  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!isEditMode && !selectedFile) {
      newErrors.archivo = 'Debe seleccionar un archivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Subir/actualizar documento
  const subirDocumento = async () => {
    if (!validarFormulario()) {
      Toast.show({
        type: 'error',
        text1: 'Formulario incompleto',
        text2: 'Por favor complete todos los campos requeridos',
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Preparar datos del documento
      const documentoData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        tipo: formData.tipo,
        categoria: formData.categoria,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        publico: formData.publico,
      };

      console.log('📤 Subiendo documento:', documentoData);
      console.log('📁 Archivo:', selectedFile);

      let response;

      if (isEditMode) {
        // Actualizar documento existente
        response = await documentosService.updateDocumento(documentoId, documentoData);
      } else {
        // Crear nuevo documento
        response = await documentosService.uploadDocumento(documentoData, selectedFile);
      }

      console.log('✅ Documento subido/actualizado:', response);

      Toast.show({
        type: 'success',
        text1: isEditMode ? 'Documento actualizado' : 'Documento subido',
        text2: isEditMode ? 
          'El documento ha sido actualizado correctamente' : 
          'El documento ha sido subido correctamente',
      });

      // Volver a la pantalla anterior
      navigation.goBack();

    } catch (error) {
      console.error('❌ Error subiendo documento:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudo subir el documento',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Actualizar campo del formulario
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Obtener icono del tipo de archivo
  const getFileIcon = (mimeType) => {
    if (!mimeType) return 'file';
    
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.includes('pdf')) return 'file-pdf-box';
    if (mimeType.includes('word')) return 'file-word-box';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-excel-box';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-powerpoint-box';
    if (mimeType.includes('text')) return 'file-document';
    
    return 'file';
  };

  // Cargar datos al montar si estamos en modo edición
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

  return (
    <TabSafeView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Selector de archivo */}
        {!isEditMode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Archivo</Text>
            
            {!selectedFile ? (
              <TouchableOpacity style={styles.filePicker} onPress={seleccionarArchivo}>
                <Icon name="cloud-upload" size={48} color={colors.primary} />
                <Text style={styles.filePickerTitle}>Seleccionar Archivo</Text>
                <Text style={styles.filePickerSubtitle}>
                  Toca para seleccionar un archivo desde tu dispositivo
                </Text>
                <Text style={styles.filePickerNote}>
                  Formatos soportados: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, etc.
                </Text>
                <Text style={styles.filePickerNote}>
                  Tamaño máximo: 50MB
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.selectedFile}>
                <View style={styles.fileHeader}>
                  <View style={styles.fileInfo}>
                    <Icon 
                      name={getFileIcon(selectedFile.mimeType)} 
                      size={32} 
                      color={colors.primary} 
                    />
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                      <Text style={styles.fileSize}>
                        {formatFileSize(selectedFile.size)}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity style={styles.removeFileButton} onPress={removerArchivo}>
                    <Icon name="close" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>
                
                {/* Preview de imagen */}
                {filePreview && (
                  <View style={styles.imagePreview}>
                    <Image source={{ uri: filePreview }} style={styles.previewImage} />
                  </View>
                )}
                
                <TouchableOpacity style={styles.changeFileButton} onPress={seleccionarArchivo}>
                  <Icon name="swap-horizontal" size={20} color={colors.primary} />
                  <Text style={styles.changeFileText}>Cambiar archivo</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {errors.archivo && (
              <Text style={styles.errorText}>{errors.archivo}</Text>
            )}
          </View>
        )}

        {/* Información del documento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Documento</Text>
          
          {/* Nombre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nombre del documento <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.nombre && styles.inputError]}
              value={formData.nombre}
              onChangeText={(value) => updateField('nombre', value)}
              placeholder="Ingrese el nombre del documento"
              placeholderTextColor={colors.textSecondary}
            />
            {errors.nombre && (
              <Text style={styles.errorText}>{errors.nombre}</Text>
            )}
          </View>

          {/* Descripción */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Descripción <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textArea, errors.descripcion && styles.inputError]}
              value={formData.descripcion}
              onChangeText={(value) => updateField('descripcion', value)}
              placeholder="Ingrese una descripción del documento"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {errors.descripcion && (
              <Text style={styles.errorText}>{errors.descripcion}</Text>
            )}
          </View>

          {/* Tipo de documento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de documento</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.tipo}
                onValueChange={(value) => updateField('tipo', value)}
                style={styles.picker}
              >
                {tiposDocumento.map((tipo) => (
                  <Picker.Item 
                    key={tipo.value} 
                    label={tipo.label} 
                    value={tipo.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Categoría */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoría</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.categoria}
                onValueChange={(value) => updateField('categoria', value)}
                style={styles.picker}
              >
                {categoriasDocumento.map((categoria) => (
                  <Picker.Item 
                    key={categoria.value} 
                    label={categoria.label} 
                    value={categoria.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Etiquetas</Text>
            <TextInput
              style={styles.input}
              value={formData.tags}
              onChangeText={(value) => updateField('tags', value)}
              placeholder="ritual, iniciación, tradición (separadas por comas)"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.helperText}>
              Separe las etiquetas con comas para mejorar la búsqueda
            </Text>
          </View>

          {/* Público */}
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={styles.label}>Documento público</Text>
              <Text style={styles.helperText}>
                Los documentos públicos pueden ser vistos por todos los miembros
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.switch, formData.publico && styles.switchActive]}
              onPress={() => updateField('publico', !formData.publico)}
            >
              <View style={[styles.switchThumb, formData.publico && styles.switchThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={uploading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
            onPress={subirDocumento}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={styles.submitButtonText}>
                  {isEditMode ? 'Guardando...' : 'Subiendo...'}
                </Text>
              </>
            ) : (
              <>
                <Icon 
                  name={isEditMode ? "content-save" : "cloud-upload"} 
                  size={20} 
                  color={colors.white} 
                />
                <Text style={styles.submitButtonText}>
                  {isEditMode ? 'Guardar Cambios' : 'Subir Documento'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        {uploading && uploadProgress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
          </View>
        )}

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

  // Sections
  section: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },

  // File picker
  filePicker: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  filePickerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  filePickerSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  filePickerNote: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Selected file
  selectedFile: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  fileName: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  fileSize: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeFileButton: {
    padding: spacing.xs,
  },
  imagePreview: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  changeFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    gap: spacing.sm,
  },
  changeFileText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '500',
  },

  // Form inputs
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.white,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.white,
    height: 120,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Picker
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  picker: {
    height: 50,
  },

  // Switch
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: colors.primary,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
    ...globalStyles.shadow,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primary,
    gap: spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  submitButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
    minWidth: 40,
    textAlign: 'right',
  },

  bottomSpacer: {
    height: spacing.xl,
  },
});

export default DocumentoUploadScreen;