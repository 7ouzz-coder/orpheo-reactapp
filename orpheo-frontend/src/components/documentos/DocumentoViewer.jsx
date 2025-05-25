import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectUser } from '../../store/slices/authSlice';
import { 
  formatDate, 
  formatFileSize, 
  getRelativeTime,
  getInitials 
} from '../../utils/helpers';
import { 
  DOCUMENTO_TIPOS_DISPLAY, 
  DOCUMENTO_ESTADOS_DISPLAY 
} from '../../utils/constants';
import toast from 'react-hot-toast';

const DocumentoViewer = ({ documento, onClose }) => {
  const user = useSelector(selectUser);
  const [currentTab, setCurrentTab] = useState('contenido');
  const [newComment, setNewComment] = useState('');

  if (!documento) return null;

  const canEdit = user?.role === 'admin' || user?.role === 'superadmin' || 
                 documento.autorId === user?.id;

  const canApprove = user?.role === 'admin' || user?.role === 'superadmin' || 
                    user?.cargo === 'venerable_maestro' || user?.cargo === 'secretario';

  const getEstadoColor = (estado) => {
    const colors = {
      aprobado: 'text-green-400 bg-green-400/10 border-green-400/20',
      pendiente: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      revision: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      rechazado: 'text-red-400 bg-red-400/10 border-red-400/20',
    };
    return colors[estado] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  const handleDownload = () => {
    toast.success('Descarga iniciada');
    // Simular descarga
    console.log('Descargando:', documento.archivo);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    toast.success('Comentario agregado');
    setNewComment('');
    // Aquí se agregaría el comentario real
  };

  const handleApprove = () => {
    toast.success('Documento aprobado');
    onClose();
  };

  const handleReject = () => {
    toast.error('Documento rechazado');
    onClose();
  };

  const tabs = [
    {
      id: 'contenido',
      label: 'Contenido',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'comentarios',
      label: `Comentarios (${documento.comentarios?.length || 0})`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      id: 'versiones',
      label: 'Versiones',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const renderTabContent = () => {
    switch (currentTab) {
      case 'contenido':
        return (
          <div className="space-y-6">
            {/* Vista previa del documento */}
            <div className="border border-gray-border rounded-lg p-6 bg-primary-black/50">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto bg-primary-gold/10 rounded-lg flex items-center justify-center">
                  <svg className="w-12 h-12 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-text mb-2">
                    Vista Previa del Documento
                  </h3>
                  <p className="text-gray-border text-sm mb-4">
                    Para ver el contenido completo, descarga el archivo PDF
                  </p>
                  <button
                    onClick={handleDownload}
                    className="orpheo-button"
                  >
                    Descargar {documento.archivo}
                  </button>
                </div>
              </div>
            </div>

            {/* Información del contenido */}
            {documento.resumen && (
              <div>
                <h4 className="text-lg font-semibold text-primary-gold mb-3">Resumen</h4>
                <p className="text-gray-text leading-relaxed">{documento.resumen}</p>
              </div>
            )}

            {documento.tags && documento.tags.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-primary-gold mb-3">Etiquetas</h4>
                <div className="flex flex-wrap gap-2">
                  {documento.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-gold/10 text-primary-gold rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'comentarios':
        return (
          <div className="space-y-6">
            {/* Agregar comentario */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-primary-gold">Agregar Comentario</h4>
              <div className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  className="orpheo-input w-full"
                  rows={3}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="orpheo-button disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Comentar
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de comentarios */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-primary-gold">
                Comentarios ({documento.comentarios?.length || 0})
              </h4>
              
              {documento.comentarios && documento.comentarios.length > 0 ? (
                <div className="space-y-4">
                  {documento.comentarios.map((comentario) => (
                    <div
                      key={comentario.id}
                      className="border border-gray-border rounded-lg p-4"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-primary-gold rounded-full flex items-center justify-center text-sm font-bold text-primary-black">
                          {getInitials(comentario.autor)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-text">
                              {comentario.autor}
                            </span>
                            <span className="text-xs text-primary-gold">
                              {comentario.grado}
                            </span>
                            <span className="text-xs text-gray-border">
                              {getRelativeTime(comentario.fecha)}
                            </span>
                          </div>
                          <p className="text-gray-text">{comentario.comentario}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-gray-border">Aún no hay comentarios</p>
                  <p className="text-gray-border text-sm">Sé el primero en comentar este documento</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'versiones':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary-gold">
              Historial de Versiones
            </h4>
            
            {documento.historialVersiones && documento.historialVersiones.length > 0 ? (
              <div className="space-y-3">
                {documento.historialVersiones.map((version) => (
                  <div
                    key={version.version}
                    className={`border rounded-lg p-4 ${
                      version.actual 
                        ? 'border-primary-gold bg-primary-gold/5' 
                        : 'border-gray-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-text">
                          Versión {version.version}
                        </span>
                        {version.actual && (
                          <span className="text-xs bg-primary-gold text-primary-black px-2 py-1 rounded-full">
                            Actual
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-border">
                        {formatDate(version.fecha)}
                      </span>
                    </div>
                    <p className="text-gray-text text-sm mb-2">{version.cambios}</p>
                    <p className="text-gray-border text-xs">Por: {version.autor}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-border">No hay historial de versiones disponible</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
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
        className="bg-primary-black-secondary border border-gray-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-border">
          <div className="flex-1 mr-4">
            <h2 className="text-xl font-serif font-bold text-primary-gold mb-2">
              {documento.titulo}
            </h2>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-border">
                {DOCUMENTO_TIPOS_DISPLAY[documento.tipo]}
              </span>
              <span className={`px-2 py-1 rounded border text-xs ${getEstadoColor(documento.estado)}`}>
                {DOCUMENTO_ESTADOS_DISPLAY[documento.estado]}
              </span>
              <span className="text-gray-border">
                {formatFileSize(documento.tamaño)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canEdit && (
              <button
                onClick={() => toast.info('Función de editar próximamente')}
                className="p-2 text-gray-border hover:text-primary-gold transition-colors"
                title="Editar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            <button
              onClick={handleDownload}
              className="p-2 text-gray-border hover:text-primary-gold transition-colors"
              title="Descargar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-border hover:text-primary-gold transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Document Info */}
        <div className="px-6 py-4 border-b border-gray-border bg-primary-black/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-gold rounded-full flex items-center justify-center text-sm font-bold text-primary-black">
                  {getInitials(documento.autor)}
                </div>
                <div>
                  <p className="text-gray-text font-medium">{documento.autor}</p>
                  <p className="text-gray-border text-sm">{documento.grado}</p>
                </div>
              </div>
              
              <div className="text-gray-border text-sm">
                <p>Creado: {formatDate(documento.fechaCreacion)}</p>
                {documento.fechaModificacion !== documento.fechaCreacion && (
                  <p>Modificado: {formatDate(documento.fechaModificacion)}</p>
                )}
              </div>
            </div>

            {/* Actions for approval */}
            {canApprove && documento.estado === 'pendiente' && (
              <div className="flex space-x-2">
                <button
                  onClick={handleReject}
                  className="px-4 py-2 border border-red-500 text-red-400 rounded-lg hover:bg-red-900/20 transition-colors"
                >
                  Rechazar
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Aprobar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-border">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  currentTab === tab.id
                    ? 'border-primary-gold text-primary-gold'
                    : 'border-transparent text-gray-border hover:text-gray-text'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DocumentoViewer;