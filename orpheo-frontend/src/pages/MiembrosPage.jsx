import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchEstadisticas } from '../store/slices/miembrosSlice';
import Layout from '../components/common/Layout';
import MiembrosList from '../components/miembros/MiembrosList';
import MiembroForm from '../components/miembros/MiembroForm';
import MiembroDetail from '../components/miembros/MiembroDetail';

const MiembrosPage = () => {
  const dispatch = useDispatch();
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit', 'detail'
  const [selectedMiembro, setSelectedMiembro] = useState(null);

  // Cargar estadísticas al montar
  useEffect(() => {
    dispatch(fetchEstadisticas());
  }, [dispatch]);

  const handleCreateMiembro = () => {
    setSelectedMiembro(null);
    setCurrentView('create');
  };

  const handleEditMiembro = (miembro) => {
    setSelectedMiembro(miembro);
    setCurrentView('edit');
  };

  const handleSelectMiembro = (miembro) => {
    setSelectedMiembro(miembro);
    setCurrentView('detail');
  };

  const handleCloseModal = () => {
    setCurrentView('list');
    setSelectedMiembro(null);
  };

  const handleFormSuccess = () => {
    setCurrentView('list');
    setSelectedMiembro(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'list':
        return (
          <MiembrosList
            onSelectMiembro={handleSelectMiembro}
            onCreateMiembro={handleCreateMiembro}
            onEditMiembro={handleEditMiembro}
          />
        );
      default:
        return (
          <MiembrosList
            onSelectMiembro={handleSelectMiembro}
            onCreateMiembro={handleCreateMiembro}
            onEditMiembro={handleEditMiembro}
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
              Gestión de Miembros
            </h1>
            <p className="text-gray-text">
              Administra la información de los hermanos de la logia
            </p>
          </div>
          
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-border">
            <span>Inicio</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-primary-gold">Miembros</span>
          </div>
        </div>
      </motion.div>

      {/* Contenido principal */}
      {renderContent()}

      {/* Modales */}
      <AnimatePresence>
        {(currentView === 'create' || currentView === 'edit') && (
          <MiembroForm
            miembro={currentView === 'edit' ? selectedMiembro : null}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseModal}
          />
        )}

        {currentView === 'detail' && selectedMiembro && (
          <MiembroDetail
            miembro={selectedMiembro}
            onEdit={() => setCurrentView('edit')}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default MiembrosPage;