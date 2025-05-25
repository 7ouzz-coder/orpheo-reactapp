import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchEstadisticas } from '../store/slices/documentosSlice';
import { setPageTitle } from '../store/slices/uiSlice';
import Layout from '../components/common/Layout';
import DocumentosList from '../components/documentos/DocumentosList';
import DocumentoUpload from '../components/documentos/DocumetnoUpload';
import DocumentoViewer from '../components/documentos/DocumentoViewer';

const DocumentosPage = () => {
  const dispatch = useDispatch();
  const [currentView, setCurrentView] = useState('list'); // 'list', 'upload', 'viewer'
  const [selectedDocumento, setSelectedDocumento] = useState(null);

  // Configurar página
  useEffect(() => {
    dispatch(setPageTitle('Documentos'));
    dispatch(fetchEstadisticas());
  }, [dispatch]);

  const handleUploadDocument = () => {
    setCurrentView('upload');
  };

  const handleViewDocument = (documento) => {
    setSelectedDocumento(documento);
    setCurrentView('viewer');
  };

  const handleCloseModal = () => {
    setCurrentView('list');
    setSelectedDocumento(null);
  };

  const handleUploadSuccess = () => {
    setCurrentView('list');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'list':
        return (
          <DocumentosList
            onUploadDocument={handleUploadDocument}
            onViewDocument={handleViewDocument}
          />
        );
      default:
        return (
          <DocumentosList
            onUploadDocument={handleUploadDocument}
            onViewDocument={handleViewDocument}
          />
        );
    }
  };

  return (
    <Layout>
      {/* Header de página */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-gold mb-2">
              Gestión de Documentos
            </h1>
            <p className="text-gray-text">
              Administra documentos, planchas y archivos de la logia
            </p>
          </div>
          
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-border">
            <span>Inicio</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-primary-gold">Documentos</span>
          </div>
        </div>
      </motion.div>

      {/* Contenido principal */}
      {renderContent()}

      {/* Modales */}
      <AnimatePresence>
        {currentView === 'upload' && (
          <DocumentoUpload
            onSuccess={handleUploadSuccess}
            onCancel={handleCloseModal}
          />
        )}

        {currentView === 'viewer' && selectedDocumento && (
          <DocumentoViewer
            documento={selectedDocumento}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default DocumentosPage;