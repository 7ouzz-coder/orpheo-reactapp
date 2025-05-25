import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { 
  subirDocumento,
  selectIsUploading,
  selectUploadProgress,
  selectDocumentosError,
} from '../../store/slices/documentosSlice';
import { selectUser } from '../../store/slices/authSlice';
import { 
  DOCUMENTO_TIPOS_DISPLAY, 
  FILE_CONFIG,
  GRADOS_DISPLAY 
} from '../../utils/constants';
import { formatFileSize } from '../../utils/helpers';
import toast from 'react-hot-toast';

const DocumentoUpload = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isUploading = useSelector(selectIsUploading);
  const uploadProgress = useSelector(selectUploadProgress);
  const error = useSelector(selectDocumentosError);

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      tipo: 'plancha',
      categoria: '',
      visibilidad: [user?.grado || 'aprendiz'],
    }
  });

  const watchedTipo = watch('tipo');
  const watchedVisibilidad = watch('visibilidad');

  // Configurar dropzone
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.file.size > FILE_CONFIG.MAX_SIZE) {
        toast.error(`El archivo es demasiado grande. Máximo ${formatFileSize(FILE_CONFIG.MAX_SIZE)}`);
      } else {
        toast.error('Tipo de archivo no permitido');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setValue('titulo', file.name.replace(/\.[^/.]+$/, ''));
    }
  }, [setValue]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: FILE_CONFIG.MAX_SIZE,
    multiple: false,
  });

  const onSubmit = async (data) => {
    if (!selectedFile) {
      toast.error('Debe seleccionar un archivo');
      return;
    }

    try {
      const documentoData = {
        ...data,
        archivo: selectedFile,
        autorId: user?.id,
        autor: user?.memberFullName || user?.username,
        grado: user?.grado,
        tamaño: selectedFile.size,
        fechaCreacion: new Date().toISOString(),
      };

      await dispatch(subirDocumento(documentoData)).unwrap();
      toast.success('Documento subido exitosamente');
      onSuccess && onSuccess();
    } catch (err) {
      toast.error(err || 'Error al subir documento');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setValue('titulo', '');
  };

  const categoriasPorTipo = {
    plancha: ['simbolismo', 'filosofia', 'historia', 'ritual', 'educacion'],
    acta: ['tenidas', 'extraordinarias', 'grados'],
    circular: ['administrativo', 'informativo', 'convocatorias'],
    reglamento: ['interno', 'protocolo', 'ceremonial'],
    informe: ['comisiones', 'actividades', 'proyectos'],
    carta: ['oficial', 'fraternal', 'invitaciones'],
    otro: ['varios', 'recursos', 'referencias'],
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-primary-black-secondary border border-gray-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-border">
          <h2 className="text-xl font-serif font-bold text-primary-gold">
            Subir Documento
          </h2>
          <button
            onClick={onCancel}
            disabled={isUploading}
            className="p-2 text-gray-border hover:text-primary-gold transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Upload Area */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-text">
                Archivo del Documento *
              </label>
              
              {!selectedFile ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary-gold bg-primary-gold/5'
                      : 'border-gray-border hover:border-primary-gold/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto text-gray-border">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-text font-medium">
                        {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic para seleccionar'}
                      </p>
                      <p className="text-gray-border text-sm mt-2">
                        PDF, DOC, DOCX, TXT • Máximo {formatFileSize(FILE_CONFIG.MAX_SIZE)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">📄</div>
                      <div>
                        <p className="text-gray-text font-medium">{selectedFile.name}</p>
                        <p className="text-gray-border text-sm">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      disabled={isUploading}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Título del Documento *
                </label>
                <input
                  {...register('titulo', {
                    required: 'El título es obligatorio',
                    minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                  })}
                  className="orpheo-input w-full"
                  placeholder="Ej: El Simbolismo del Compás"
                />
                {errors.titulo && (
                  <p className="mt-1 text-sm text-red-400">{errors.titulo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Tipo de Documento *
                </label>
                <select
                  {...register('tipo', { required: 'El tipo es obligatorio' })}
                  className="orpheo-input w-full"
                >
                  {Object.entries(DOCUMENTO_TIPOS_DISPLAY).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.tipo && (
                  <p className="mt-1 text-sm text-red-400">{errors.tipo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Categoría
                </label>
                <select
                  {...register('categoria')}
                  className="orpheo-input w-full"
                >
                  <option value="">Seleccionar categoría</option>
                  {categoriasPorTipo[watchedTipo]?.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visibilidad */}
            <div>
              <label className="block text-sm font-medium text-gray-text mb-3">
                Visibilidad del Documento *
              </label>
              <div className="space-y-2">
                {Object.entries(GRADOS_DISPLAY).map(([value, label]) => (
                  <label key={value} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      value={value}
                      {...register('visibilidad', {
                        required: 'Debe seleccionar al menos un grado'
                      })}
                      className="w-4 h-4 text-primary-gold bg-primary-black border-gray-border rounded focus:ring-primary-gold focus:ring-2"
                    />
                    <span className="text-gray-text">{label}</span>
                  </label>
                ))}
              </div>
              {errors.visibilidad && (
                <p className="mt-1 text-sm text-red-400">{errors.visibilidad.message}</p>
              )}
              <p className="mt-2 text-xs text-gray-border">
                Selecciona qué grados pueden ver este documento
              </p>
            </div>

            {/* Resumen */}
            <div>
              <label className="block text-sm font-medium text-gray-text mb-2">
                Resumen (Opcional)
              </label>
              <textarea
                {...register('resumen')}
                className="orpheo-input w-full"
                rows={3}
                placeholder="Breve descripción del contenido del documento..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-text mb-2">
                Etiquetas (Opcional)
              </label>
              <input
                {...register('tags')}
                className="orpheo-input w-full"
                placeholder="Separar con comas: simbolismo, geometría, compás"
              />
              <p className="mt-1 text-xs text-gray-border">
                Ayuda a otros hermanos a encontrar tu documento
              </p>
            </div>

            {/* Progress bar durante upload */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-text">Subiendo documento...</span>
                  <span className="text-primary-gold">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-border rounded-full h-2">
                  <div 
                    className="bg-primary-gold h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-border">
            <button
              type="button"
              onClick={onCancel}
              disabled={isUploading}
              className="px-6 py-2 border border-gray-border text-gray-text rounded-lg hover:border-primary-gold hover:text-primary-gold transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="orpheo-button relative disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-primary-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Subiendo...
                </div>
              ) : (
                'Subir Documento'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default DocumentoUpload;