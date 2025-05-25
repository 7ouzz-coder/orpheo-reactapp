import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchEstadisticas } from '../store/slices/programasSlice';
import { setPageTitle } from '../store/slices/uiSlice';
import Layout from '../components/common/Layout';
import ProgramasList from '../components/programas/ProgramasList';
import CalendarioView from '../components/programas/CalendarioView';
import ProgramaForm from '../components/programas/ProgramaForm';
import ProgramaDetail from '../components/programas/ProgramaDetail';
import AsistenciaManager from '../components/programas/AsistenciaManager';

const ProgramasPage = () => {
  const dispatch = useDispatch();
  const [currentView, setCurrentView] = useState('lista'); // 'lista', 'calendario', 'crear', 'detalle', 'asistencia'
  const [selectedPrograma, setSelectedPrograma] = useState(null);

  // Configurar página
  useEffect(() => {
    dispatch(setPageTitle('Programas'));
    dispatch(fetchEstadisticas());
  }, [dispatch]);

  const handleCreatePrograma = () => {
    setSelectedPrograma(null);
    setCurrentView('crear');
  };

  const handleEditPrograma = (programa) => {
    setSelectedPrograma(programa);
    setCurrentView('crear');
  };

  const handleViewPrograma = (programa) => {
    setSelectedPrograma(programa);
    setCurrentView('detalle');
  };

  const handleManageAsistencia = (programa) => {
    setSelectedPrograma(programa);
    setCurrentView('asistencia');
  };

  const handleCloseModal = () => {
    setCurrentView(currentView === 'calendario' ? 'calendario' : 'lista');
    setSelectedPrograma(null);
  };

  const handleFormSuccess = () => {
    setCurrentView('lista');
    setSelectedPrograma(null);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    setSelectedPrograma(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'lista':
        return (
          <ProgramasList
            onCreatePrograma={handleCreatePrograma}
            onEditPrograma={handleEditPrograma}
            onViewPrograma={handleViewPrograma}
            onManageAsistencia={handleManageAsistencia}
            onViewChange={handleViewChange}
          />
        );
      case 'calendario':
        return (
          <CalendarioView
            onCreatePrograma={handleCreatePrograma}
            onViewPrograma={handleViewPrograma}
            onViewChange={handleViewChange}
          />
        );
      default:
        return (
          <ProgramasList
            onCreatePrograma={handleCreatePrograma}
            onEditPrograma={handleEditPrograma}
            onViewPrograma={handleViewPrograma}
            onManageAsistencia={handleManageAsistencia}
            onViewChange={handleViewChange}
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
              Programas y Asistencia
            </h1>
            <p className="text-gray-text">
              Gestiona tenidas, ceremonias y eventos de la logia
            </p>
          </div>
          
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-border">
            <span>Inicio</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-primary-gold">Programas</span>
          </div>
        </div>
      </motion.div>

      {/* Contenido principal */}
      {renderContent()}

      {/* Modales */}
      <AnimatePresence>
        {currentView === 'crear' && (
          <ProgramaForm
            programa={selectedPrograma}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseModal}
          />
        )}

        {currentView === 'detalle' && selectedPrograma && (
          <ProgramaDetail
            programa={selectedPrograma}
            onEdit={() => setCurrentView('crear')}
            onManageAsistencia={() => setCurrentView('asistencia')}
            onClose={handleCloseModal}
          />
        )}

        {currentView === 'asistencia' && selectedPrograma && (
          <AsistenciaManager
            programa={selectedPrograma}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default ProgramasPage;