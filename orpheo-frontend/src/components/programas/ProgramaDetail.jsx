import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchProgramaById,
  confirmarAsistencia,
  selectCurrentPrograma,
  selectProgramasLoading,
  selectIsUpdatingAsistencia,
} from '../../store/slices/programasSlice';
import { selectUser } from '../../store/slices/authSlice';
import { 
  formatDate, 
  getRelativeTime,
  getInitials,
  getGradoDisplayName 
} from '../../utils/helpers';
import { 
  PROGRAMA_TIPOS_DISPLAY, 
  PROGRAMA_ESTADOS_DISPLAY,
  ASISTENCIA_ESTADOS_DISPLAY 
} from '../../utils/constants';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';

const ProgramaDetail = ({ programa, onEdit, onManageAsistencia, onClose }) => {
  const dispatch = useDispatch();
  const currentPrograma = useSelector(selectCurrentPrograma);
  const isLoading = useSelector(selectProgramasLoading);
  const isUpdatingAsistencia = useSelector(selectIsUpdatingAsistencia);
  const user = useSelector(selectUser);

  const [currentTab, setCurrentTab] = useState('detalles');
  const [miAsistencia, setMiAsistencia] = useState(null);

  const programaData = currentPrograma || programa;

  // Cargar detalles completos del programa
  useEffect(() => {
    if (programa?.id && !currentPrograma) {
      dispatch(fetchProgramaById(programa.id));
    }
  }, [dispatch, programa?.id, currentPrograma]);

  // Buscar mi asistencia
  useEffect(() => {
    if (programaData?.asistencias && user?.id) {
      const miAsistenciaData = programaData.asistencias.find(a => a.miembroId === user.id);
      setMiAsistencia(miAsistenciaData);
    }
  }, [programaData, user?.id]);

  if (!programaData) return null;

  const canEdit = user?.role === 'admin' || user?.role === 'superadmin' || 
                 programaData.organizadorId === user?.id;

  const canManageAsistencia = user?.role === 'admin' || user?.role === 'superadmin' || 
                             ['venerable_maestro', 'secretario'].includes(user?.cargo);

  const canAttend = programaData.gradosPermitidos?.includes(user?.grado);

  const getEstadoColor = (estado) => {
    const colors = {
      programado: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      en_curso: 'text-green-400 bg-green-400/10 border-green-400/20',
      finalizado: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
      cancelado: 'text-red-400 bg-red-400/10 border-red-400/20',
      suspendido: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    };
    return colors[estado] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  const getAsistenciaColor = (estado) => {
    const colors = {
      confirmada: 'text-green-400 bg-green-400/10',
      pendiente: 'text-yellow-400 bg-yellow-400/10',
      ausente: 'text-red-400 bg-red-400/10',
      justificada: 'text-blue-400 bg-blue-400/10',
    };
    return colors[estado] || 'text-gray-400 bg-gray-400/10';
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      tenida_ordinaria: '🏛️',
      tenida_extraordinaria: '⭐',
      grado: '🎓',
      reunion_administrativa: '📋',
      evento_social: '🎉',
      conferencia: '🎤',
      instalacion: '👑',
    };
    return icons[tipo] || '📅';
  };

  const handleConfirmarAsistencia = async (estado) => {
    try {
      await dispatch(confirmarAsistencia({
        programaId: programaData.id,
        miembroId: user.id,
        estado
      })).unwrap();
      
      toast.success(
        estado === 'confirmada' 
          ? 'Asistencia confirmada' 
          : 'Asistencia cancelada'
      );
    } catch (error) {
      toast.error('Error al actualizar asistencia');
    }
  };

  const getAsistenciaStats = () => {
    const total = programaData.asistenciasConfirmadas + programaData.asistenciasPendientes;
    const porcentaje = total > 0 ? Math.round((programaData.asistenciasConfirmadas / total) * 100) : 0;
    return { total, porcentaje };
  };

  const tabs = [
    {
      id: 'detalles',
      label: 'Detalles',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'asistencia',
      label: `Asistencia (${programaData.asistencias?.length || 0})`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 'agenda',
      label: 'Orden del Día',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
  ];

  const renderTabContent = () => {
    switch (currentTab) {
      case 'detalles':
        return (
          <div className="space-y-6">
            {/* Información principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-primary-gold mb-3">Información General</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-border">Tipo:</span>
                    <p className="text-gray-text">{PROGRAMA_TIPOS_DISPLAY[programaData.tipo]}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-border">Lugar:</span>
                    <p className="text-gray-text">{programaData.lugar}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-border">Organizador:</span>
                    <p className="text-gray-text">{programaData.organizador}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-border">Máximo Asistentes:</span>
                    <p className="text-gray-text">{programaData.maxAsistentes}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-primary-gold mb-3">Fecha y Hora</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-border">Inicio:</span>
                    <p className="text-gray-text">
                      {formatDate(programaData.fechaInicio, 'dd/MM/yyyy HH:mm')}
                    </p>
                    <p className="text-xs text-gray-border">
                      {getRelativeTime(programaData.fechaInicio)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-border">Fin:</span>
                    <p className="text-gray-text">
                      {formatDate(programaData.fechaFin, 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-border">Duración:</span>
                    <p className="text-gray-text">
                      {Math.round((new Date(programaData.fechaFin) - new Date(programaData.fechaInicio)) / (1000 * 60 * 60 * 100)) / 10} horas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {programaData.descripcion && (
              <div>
                <h4 className="text-lg font-semibold text-primary-gold mb-3">Descripción</h4>
                <p className="text-gray-text leading-relaxed">{programaData.descripcion}</p>
              </div>
            )}

            {/* Grados permitidos */}
            <div>
              <h4 className="text-lg font-semibold text-primary-gold mb-3">Grados Permitidos</h4>
              <div className="flex flex-wrap gap-2">
                {programaData.gradosPermitidos?.map((grado) => (
                  <span
                    key={grado}
                    className="px-3 py-1 bg-primary-gold/10 text-primary-gold rounded-full text-sm"
                  >
                    {getGradoDisplayName(grado)}
                  </span>
                ))}
              </div>
            </div>

            {/* Información específica por tipo */}
            {programaData.tipo === 'grado' && programaData.candidato && (
              <div>
                <h4 className="text-lg font-semibold text-primary-gold mb-3">Candidato</h4>
                <div className="bg-primary-black/30 p-4 rounded-lg">
                  <p className="text-gray-text"><strong>Nombre:</strong> {programaData.candidato.nombre}</p>
                  <p className="text-gray-text"><strong>Edad:</strong> {programaData.candidato.edad} años</p>
                  <p className="text-gray-text"><strong>Profesión:</strong> {programaData.candidato.profesion}</p>
                  <p className="text-gray-text"><strong>Padrino:</strong> {programaData.candidato.padrino}</p>
                </div>
              </div>
            )}

            {programaData.tipo === 'conferencia' && programaData.conferencista && (
              <div>
                <h4 className="text-lg font-semibold text-primary-gold mb-3">Conferencista</h4>
                <div className="bg-primary-black/30 p-4 rounded-lg">
                  <p className="text-gray-text"><strong>Nombre:</strong> {programaData.conferencista.nombre}</p>
                  <p className="text-gray-text"><strong>Título:</strong> {programaData.conferencista.titulo}</p>
                  {programaData.conferencista.biografia && (
                    <p className="text-gray-text mt-2">{programaData.conferencista.biografia}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'asistencia':
        const stats = getAsistenciaStats();
        return (
          <div className="space-y-6">
            {/* Estadísticas de asistencia */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-400/10 p-4 rounded-lg border border-green-400/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{programaData.asistenciasConfirmadas}</p>
                  <p className="text-sm text-gray-text">Confirmados</p>
                </div>
              </div>
              <div className="bg-yellow-400/10 p-4 rounded-lg border border-yellow-400/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{programaData.asistenciasPendientes}</p>
                  <p className="text-sm text-gray-text">Pendientes</p>
                </div>
              </div>
              <div className="bg-primary-gold/10 p-4 rounded-lg border border-primary-gold/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-gold">{stats.porcentaje}%</p>
                  <p className="text-sm text-gray-text">Confirmación</p>
                </div>
              </div>
            </div>

            {/* Mi asistencia */}
            {canAttend && (
              <div className="bg-primary-black/30 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-primary-gold mb-3">Mi Asistencia</h4>
                <div className="flex items-center justify-between">
                  <div>
                    {miAsistencia ? (
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${getAsistenciaColor(miAsistencia.estado)}`}>
                          {ASISTENCIA_ESTADOS_DISPLAY[miAsistencia.estado]}
                        </span>
                        {miAsistencia.fechaConfirmacion && (
                          <span className="text-sm text-gray-border">
                            Confirmado {getRelativeTime(miAsistencia.fechaConfirmacion)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-border">No has confirmado tu asistencia</span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleConfirmarAsistencia('confirmada')}
                      disabled={isUpdatingAsistencia || miAsistencia?.estado === 'confirmada'}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdatingAsistencia ? 'Actualizando...' : 'Confirmar'}
                    </button>
                    
                    {miAsistencia?.estado === 'confirmada' && (
                      <button
                        onClick={() => handleConfirmarAsistencia('pendiente')}
                        disabled={isUpdatingAsistencia}
                        className="px-4 py-2 border border-red-500 text-red-400 rounded-lg hover:bg-red-900/20 transition-colors disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lista de asistentes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-primary-gold">
                  Lista de Asistentes ({programaData.asistencias?.length || 0})
                </h4>
                {canManageAsistencia && (
                  <button
                    onClick={() => onManageAsistencia(programaData)}
                    className="text-sm text-primary-gold hover:text-primary-gold-secondary transition-colors"
                  >
                    Gestionar Asistencia
                  </button>
                )}
              </div>

              {programaData.asistencias && programaData.asistencias.length > 0 ? (
                <div className="space-y-3">
                  {programaData.asistencias.map((asistencia) => (
                    <div
                      key={asistencia.id}
                      className="flex items-center justify-between p-3 bg-primary-black/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-gold rounded-full flex items-center justify-center text-sm font-bold text-primary-black">
                          {getInitials(asistencia.miembro)}
                        </div>
                        <div>
                          <p className="text-gray-text font-medium">{asistencia.miembro}</p>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-primary-gold">{getGradoDisplayName(asistencia.grado)}</span>
                            {asistencia.cargo && (
                              <span className="text-gray-border">• {asistencia.cargo}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs ${getAsistenciaColor(asistencia.estado)}`}>
                          {ASISTENCIA_ESTADOS_DISPLAY[asistencia.estado]}
                        </span>
                        {asistencia.horaLlegada && (
                          <span className="text-xs text-gray-border">
                            Llegó: {formatDate(asistencia.horaLlegada, 'HH:mm')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-border">Aún no hay confirmaciones de asistencia</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'agenda':
        return (
          <div className="space-y-6">
            {/* Orden del día para tenidas */}
            {(programaData.tipo === 'tenida_ordinaria' || programaData.tipo === 'tenida_extraordinaria') && programaData.ordenDelDia && (
              <div>
                <h4 className="text-lg font-semibold text-primary-gold mb-4">Orden del Día</h4>
                <div className="space-y-3">
                  {programaData.ordenDelDia.map((punto, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-primary-black/30 rounded-lg">
                      <span className="text-primary-gold font-semibold text-sm mt-1">
                        {index + 1}.
                      </span>
                      <p className="text-gray-text flex-1">{punto}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agenda para reuniones */}
            {programaData.tipo === 'reunion_administrativa' && programaData.agenda && (
              <div>
                <h4 className="text-lg font-semibold text-primary-gold mb-4">Agenda de la Reunión</h4>
                <div className="space-y-3">
                  {programaData.agenda.map((tema, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-primary-black/30 rounded-lg">
                      <span className="text-primary-gold font-semibold text-sm mt-1">
                        {index + 1}.
                      </span>
                      <p className="text-gray-text flex-1">{tema}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información adicional */}
            {programaData.notasAdicionales && (
              <div>
                <h4 className="text-lg font-semibold text-primary-gold mb-3">Notas Adicionales</h4>
                <div className="bg-primary-black/30 p-4 rounded-lg">
                  <p className="text-gray-text leading-relaxed">{programaData.notasAdicionales}</p>
                </div>
              </div>
            )}

            {/* Preparación */}
            <div>
              <h4 className="text-lg font-semibold text-primary-gold mb-3">Preparación</h4>
              <div className="bg-primary-black/30 p-4 rounded-lg">
                <ul className="space-y-2 text-gray-text">
                  <li className="flex items-center space-x-2">
                    <span className="text-primary-gold">•</span>
                    <span>Llegar 15 minutos antes del inicio</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-primary-gold">•</span>
                    <span>Vestimenta: Traje oscuro y mandil</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-primary-gold">•</span>
                    <span>Traer libreta personal para tomar notas</span>
                  </li>
                  {programaData.requiereConfirmacion && (
                    <li className="flex items-center space-x-2">
                      <span className="text-primary-gold">•</span>
                      <span>Confirmar asistencia antes del evento</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
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
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">{getTipoIcon(programaData.tipo)}</span>
              <h2 className="text-xl font-serif font-bold text-primary-gold">
                {programaData.titulo}
              </h2>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-border">
                {formatDate(programaData.fechaInicio, 'dd/MM/yyyy HH:mm')}
              </span>
              <span className={`px-2 py-1 rounded border text-xs ${getEstadoColor(programaData.estado)}`}>
                {PROGRAMA_ESTADOS_DISPLAY[programaData.estado]}
              </span>
              <span className="text-gray-border">
                {programaData.lugar}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canEdit && (
              <button
                onClick={() => onEdit(programaData)}
                className="p-2 text-gray-border hover:text-primary-gold transition-colors"
                title="Editar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            {canManageAsistencia && (
              <button
                onClick={() => onManageAsistencia(programaData)}
                className="p-2 text-gray-border hover:text-primary-gold transition-colors"
                title="Gestionar asistencia"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            )}
            
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
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loading size="md" text="Cargando detalles..." />
            </div>
          ) : (
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
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProgramaDetail;