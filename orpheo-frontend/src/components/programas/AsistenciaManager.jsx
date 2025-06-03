import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  marcarAsistencia,
  confirmarAsistencia,
  selectCurrentPrograma,
  selectIsUpdatingAsistencia,
  selectProgramasError,
} from '../../store/slices/programasSlice';
import { selectUser } from '../../store/slices/authSlice';
import { 
  formatDate, 
  getRelativeTime,
  getInitials,
  getGradoDisplayName 
} from '../../utils/helpers';
import { ASISTENCIA_ESTADOS_DISPLAY } from '../../utils/constants';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';

const AsistenciaManager = ({ programa, onClose }) => {
  const dispatch = useDispatch();
  const currentPrograma = useSelector(selectCurrentPrograma);
  const isUpdating = useSelector(selectIsUpdatingAsistencia);
  const error = useSelector(selectProgramasError);
  const user = useSelector(selectUser);

  const [currentTab, setCurrentTab] = useState('lista');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [selectedMiembros, setSelectedMiembros] = useState([]);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showJustificar, setShowJustificar] = useState(false);
  const [miembroSeleccionado, setMiembroSeleccionado] = useState(null);
  const [justificacion, setJustificacion] = useState('');

  const programaData = currentPrograma || programa;

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const canManageAsistencia = user?.role === 'admin' || user?.role === 'superadmin' || 
                             ['venerable_maestro', 'secretario'].includes(user?.cargo);

  const getAsistenciaColor = (estado) => {
    const colors = {
      confirmada: 'text-green-400 bg-green-400/10 border-green-400/20',
      pendiente: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      ausente: 'text-red-400 bg-red-400/10 border-red-400/20',
      justificada: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      presente: 'text-green-500 bg-green-500/10 border-green-500/20',
    };
    return colors[estado] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  const handleMarcarPresente = async (miembroId, horaLlegada = new Date().toISOString()) => {
    try {
      await dispatch(marcarAsistencia({
        programaId: programaData.id,
        miembroId,
        horaLlegada
      })).unwrap();
      
      toast.success('Asistencia marcada como presente');
    } catch (error) {
      toast.error('Error al marcar asistencia');
    }
  };

  const handleMarcarAusente = async (miembroId) => {
    try {
      await dispatch(confirmarAsistencia({
        programaId: programaData.id,
        miembroId,
        estado: 'ausente'
      })).unwrap();
      
      toast.success('Miembro marcado como ausente');
    } catch (error) {
      toast.error('Error al marcar ausencia');
    }
  };

  const handleJustificarAusencia = async () => {
    if (!miembroSeleccionado || !justificacion.trim()) {
      toast.error('Debe proporcionar una justificación');
      return;
    }

    try {
      await dispatch(confirmarAsistencia({
        programaId: programaData.id,
        miembroId: miembroSeleccionado.miembroId,
        estado: 'justificada',
        observaciones: justificacion.trim()
      })).unwrap();
      
      toast.success('Ausencia justificada correctamente');
      setShowJustificar(false);
      setMiembroSeleccionado(null);
      setJustificacion('');
    } catch (error) {
      toast.error('Error al justificar ausencia');
    }
  };

  const handleSeleccionarMiembro = (miembro) => {
    if (selectedMiembros.includes(miembro.miembroId)) {
      setSelectedMiembros(prev => prev.filter(id => id !== miembro.miembroId));
    } else {
      setSelectedMiembros(prev => [...prev, miembro.miembroId]);
    }
  };

  const handleAccionMasiva = async (accion) => {
    if (selectedMiembros.length === 0) {
      toast.error('Seleccione al menos un miembro');
      return;
    }

    try {
      const promesas = selectedMiembros.map(miembroId => {
        if (accion === 'presente') {
          return dispatch(marcarAsistencia({
            programaId: programaData.id,
            miembroId,
            horaLlegada: new Date().toISOString()
          }));
        } else if (accion === 'ausente') {
          return dispatch(confirmarAsistencia({
            programaId: programaData.id,
            miembroId,
            estado: 'ausente'
          }));
        }
      });

      await Promise.all(promesas);
      toast.success(`${selectedMiembros.length} miembros marcados como ${accion}`);
      setSelectedMiembros([]);
    } catch (error) {
      toast.error(`Error al marcar asistencia masiva`);
    }
  };

  const asistenciasFiltradas = programaData?.asistencias?.filter(asistencia => {
    const cumpleBusqueda = searchTerm === '' || 
      asistencia.miembro.toLowerCase().includes(searchTerm.toLowerCase());
    
    const cumpleEstado = filtroEstado === 'todos' || asistencia.estado === filtroEstado;
    
    return cumpleBusqueda && cumpleEstado;
  }) || [];

  const estadisticas = {
    total: programaData?.asistencias?.length || 0,
    confirmadas: programaData?.asistencias?.filter(a => a.estado === 'confirmada').length || 0,
    presentes: programaData?.asistencias?.filter(a => a.horaLlegada).length || 0,
    ausentes: programaData?.asistencias?.filter(a => a.estado === 'ausente').length || 0,
    justificadas: programaData?.asistencias?.filter(a => a.estado === 'justificada').length || 0,
    pendientes: programaData?.asistencias?.filter(a => a.estado === 'pendiente').length || 0,
  };

  const porcentajeAsistencia = estadisticas.total > 0 
    ? Math.round((estadisticas.presentes / estadisticas.total) * 100) 
    : 0;

  const tabs = [
    {
      id: 'lista',
      label: `Lista (${estadisticas.total})`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      id: 'estadisticas',
      label: 'Estadísticas',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const renderTabContent = () => {
    switch (currentTab) {
      case 'lista':
        return (
          <div className="space-y-6">
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-green-400/10 p-3 rounded-lg border border-green-400/20">
                <p className="text-green-400 text-2xl font-bold">{estadisticas.presentes}</p>
                <p className="text-sm text-gray-text">Presentes</p>
              </div>
              <div className="bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                <p className="text-red-400 text-2xl font-bold">{estadisticas.ausentes}</p>
                <p className="text-sm text-gray-text">Ausentes</p>
              </div>
              <div className="bg-blue-400/10 p-3 rounded-lg border border-blue-400/20">
                <p className="text-blue-400 text-2xl font-bold">{estadisticas.justificadas}</p>
                <p className="text-sm text-gray-text">Justificadas</p>
              </div>
              <div className="bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20">
                <p className="text-yellow-400 text-2xl font-bold">{estadisticas.pendientes}</p>
                <p className="text-sm text-gray-text">Pendientes</p>
              </div>
              <div className="bg-primary-gold/10 p-3 rounded-lg border border-primary-gold/20">
                <p className="text-primary-gold text-2xl font-bold">{porcentajeAsistencia}%</p>
                <p className="text-sm text-gray-text">Asistencia</p>
              </div>
            </div>

            {/* Controles */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Búsqueda */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar miembro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="orpheo-input pl-10 w-full sm:w-64"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Filtro por estado */}
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="orpheo-input"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="confirmada">Confirmados</option>
                  <option value="presente">Presentes</option>
                  <option value="ausente">Ausentes</option>
                  <option value="justificada">Justificadas</option>
                  <option value="pendiente">Pendientes</option>
                </select>
              </div>

              {/* Acciones masivas */}
              {canManageAsistencia && selectedMiembros.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAccionMasiva('presente')}
                    disabled={isUpdating}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Marcar Presentes ({selectedMiembros.length})
                  </button>
                  <button
                    onClick={() => handleAccionMasiva('ausente')}
                    disabled={isUpdating}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Marcar Ausentes ({selectedMiembros.length})
                  </button>
                </div>
              )}
            </div>

            {/* Lista de asistencia */}
            <div className="space-y-2">
              {asistenciasFiltradas.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-border">
                    {searchTerm || filtroEstado !== 'todos' 
                      ? 'No se encontraron miembros con los filtros aplicados'
                      : 'No hay lista de asistencia disponible'
                    }
                  </p>
                </div>
              ) : (
                asistenciasFiltradas.map((asistencia, index) => (
                  <motion.div
                    key={asistencia.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 border rounded-lg transition-all ${
                      selectedMiembros.includes(asistencia.miembroId)
                        ? 'border-primary-gold bg-primary-gold/5'
                        : 'border-gray-border hover:border-primary-gold/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Checkbox para selección múltiple */}
                        {canManageAsistencia && (
                          <input
                            type="checkbox"
                            checked={selectedMiembros.includes(asistencia.miembroId)}
                            onChange={() => handleSeleccionarMiembro(asistencia)}
                            className="w-4 h-4 text-primary-gold bg-primary-black border-gray-border rounded focus:ring-primary-gold focus:ring-2"
                          />
                        )}

                        {/* Avatar y información del miembro */}
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary-gold rounded-full flex items-center justify-center text-sm font-bold text-primary-black">
                            {getInitials(asistencia.miembro)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-text">{asistencia.miembro}</h3>
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-primary-gold">{getGradoDisplayName(asistencia.grado)}</span>
                              {asistencia.cargo && (
                                <span className="text-gray-border">• {asistencia.cargo}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Estado de asistencia */}
                        <div className="text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getAsistenciaColor(asistencia.horaLlegada ? 'presente' : asistencia.estado)}`}>
                            {asistencia.horaLlegada ? 'Presente' : ASISTENCIA_ESTADOS_DISPLAY[asistencia.estado]}
                          </span>
                          {asistencia.horaLlegada && (
                            <p className="text-xs text-gray-border mt-1">
                              Llegó: {formatDate(asistencia.horaLlegada, 'HH:mm')}
                            </p>
                          )}
                          {asistencia.fechaConfirmacion && !asistencia.horaLlegada && (
                            <p className="text-xs text-gray-border mt-1">
                              Confirmó: {getRelativeTime(asistencia.fechaConfirmacion)}
                            </p>
                          )}
                        </div>

                        {/* Acciones */}
                        {canManageAsistencia && (
                          <div className="flex space-x-2">
                            {!asistencia.horaLlegada && asistencia.estado !== 'ausente' && (
                              <button
                                onClick={() => handleMarcarPresente(asistencia.miembroId)}
                                disabled={isUpdating}
                                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                title="Marcar presente"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}

                            {asistencia.estado !== 'ausente' && asistencia.estado !== 'justificada' && (
                              <button
                                onClick={() => handleMarcarAusente(asistencia.miembroId)}
                                disabled={isUpdating}
                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                title="Marcar ausente"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}

                            {asistencia.estado === 'ausente' && (
                              <button
                                onClick={() => {
                                  setMiembroSeleccionado(asistencia);
                                  setShowJustificar(true);
                                }}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                title="Justificar ausencia"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Observaciones */}
                    {asistencia.observaciones && (
                      <div className="mt-3 pt-3 border-t border-gray-border/50">
                        <p className="text-sm text-gray-text">
                          <span className="font-medium">Observaciones:</span> {asistencia.observaciones}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );

      case 'estadisticas':
        return (
          <div className="space-y-6">
            {/* Gráfico de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="orpheo-card">
                <h3 className="text-lg font-semibold text-primary-gold mb-4">Resumen de Asistencia</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-text">Total de Miembros</span>
                    <span className="font-bold text-gray-text">{estadisticas.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-400">Presentes</span>
                    <span className="font-bold text-green-400">{estadisticas.presentes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-red-400">Ausentes</span>
                    <span className="font-bold text-red-400">{estadisticas.ausentes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400">Justificadas</span>
                    <span className="font-bold text-blue-400">{estadisticas.justificadas}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400">Pendientes</span>
                    <span className="font-bold text-yellow-400">{estadisticas.pendientes}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-border">
                    <div className="flex items-center justify-between">
                      <span className="text-primary-gold font-medium">Porcentaje de Asistencia</span>
                      <span className="font-bold text-primary-gold text-xl">{porcentajeAsistencia}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="orpheo-card">
                <h3 className="text-lg font-semibold text-primary-gold mb-4">Asistencia por Grado</h3>
                <div className="space-y-4">
                  {['aprendiz', 'companero', 'maestro'].map(grado => {
                    const miembrosGrado = asistenciasFiltradas.filter(a => a.grado === grado);
                    const presentesGrado = miembrosGrado.filter(a => a.horaLlegada).length;
                    const porcentajeGrado = miembrosGrado.length > 0 
                      ? Math.round((presentesGrado / miembrosGrado.length) * 100) 
                      : 0;

                    return (
                      <div key={grado} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-text capitalize">{getGradoDisplayName(grado)}</span>
                          <span className="text-sm text-gray-border">
                            {presentesGrado}/{miembrosGrado.length} ({porcentajeGrado}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-border rounded-full h-2">
                          <div 
                            className="bg-primary-gold h-2 rounded-full transition-all duration-300"
                            style={{ width: `${porcentajeGrado}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Métricas adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="orpheo-card text-center">
                <div className="w-16 h-16 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-text mb-2">Puntualidad</h3>
                <p className="text-3xl font-bold text-green-400">95%</p>
                <p className="text-sm text-gray-border">Llegaron a tiempo</p>
              </div>

              <div className="orpheo-card text-center">
                <div className="w-16 h-16 bg-blue-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-text mb-2">Promedio General</h3>
                <p className="text-3xl font-bold text-blue-400">{porcentajeAsistencia}%</p>
                <p className="text-sm text-gray-border">Asistencia efectiva</p>
              </div>

              <div className="orpheo-card text-center">
                <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-text mb-2">Ausencias</h3>
                <p className="text-3xl font-bold text-yellow-400">{estadisticas.ausentes + estadisticas.justificadas}</p>
                <p className="text-sm text-gray-border">Total ausencias</p>
              </div>
            </div>
          </div>
        );

      case 'reportes':
        return (
          <div className="space-y-6">
            {/* Opciones de reporte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="orpheo-card">
                <h3 className="text-lg font-semibold text-primary-gold mb-4">Generar Reportes</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => toast.success('Generando reporte de asistencia...')}
                    className="w-full p-3 border border-gray-border rounded-lg hover:border-primary-gold hover:bg-primary-gold/5 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-text">Lista de Asistencia</p>
                        <p className="text-sm text-gray-border">PDF con todos los asistentes</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => toast.success('Generando reporte estadístico...')}
                    className="w-full p-3 border border-gray-border rounded-lg hover:border-primary-gold hover:bg-primary-gold/5 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-text">Reporte Estadístico</p>
                        <p className="text-sm text-gray-border">Análisis detallado de asistencia</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => toast.success('Exportando a Excel...')}
                    className="w-full p-3 border border-gray-border rounded-lg hover:border-primary-gold hover:bg-primary-gold/5 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-text">Exportar Excel</p>
                        <p className="text-sm text-gray-border">Datos para análisis externo</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="orpheo-card">
                <h3 className="text-lg font-semibold text-primary-gold mb-4">Historial de Asistencia</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-primary-black/30 rounded-lg">
                    <div>
                      <p className="text-gray-text font-medium">Tenida Anterior</p>
                      <p className="text-sm text-gray-border">Abril 2025</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">92%</p>
                      <p className="text-xs text-gray-border">Asistencia</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-primary-black/30 rounded-lg">
                    <div>
                      <p className="text-gray-text font-medium">Ceremonia Grado</p>
                      <p className="text-sm text-gray-border">Marzo 2025</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">88%</p>
                      <p className="text-xs text-gray-border">Asistencia</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-primary-black/30 rounded-lg">
                    <div>
                      <p className="text-gray-text font-medium">Tenida Extraordinaria</p>
                      <p className="text-sm text-gray-border">Febrero 2025</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">75%</p>
                      <p className="text-xs text-gray-border">Asistencia</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas de tendencias */}
            <div className="orpheo-card">
              <h3 className="text-lg font-semibold text-primary-gold mb-4">Tendencias de Asistencia</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">↗️ +5%</p>
                  <p className="text-sm text-gray-text">vs. Mes anterior</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">87%</p>
                  <p className="text-sm text-gray-text">Promedio 2025</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">3</p>
                  <p className="text-sm text-gray-text">Ausencias récord</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-gold">42</p>
                  <p className="text-sm text-gray-text">Miembros activos</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!programaData) return null;

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
        className="bg-primary-black-secondary border border-gray-border rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-border">
          <div className="flex-1 mr-4">
            <h2 className="text-xl font-serif font-bold text-primary-gold mb-2">
              Gestión de Asistencia
            </h2>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-text font-medium">{programaData.titulo}</span>
              <span className="text-gray-border">•</span>
              <span className="text-gray-border">
                {formatDate(programaData.fechaInicio, 'dd/MM/yyyy HH:mm')}
              </span>
              <span className="text-gray-border">•</span>
              <span className="text-gray-border">
                {programaData.lugar}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canManageAsistencia && (
              <button
                onClick={() => setShowCheckIn(!showCheckIn)}
                className="orpheo-button flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Check-in Rápido</span>
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
          {isUpdating && (
            <div className="mb-4">
              <Loading size="sm" text="Actualizando asistencia..." />
            </div>
          )}

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

      {/* Modal para justificar ausencia */}
      <AnimatePresence>
        {showJustificar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-primary-black-secondary border border-gray-border rounded-xl max-w-md w-full"
            >
              <div className="p-6">
                <h3 className="text-lg font-serif font-bold text-primary-gold mb-4">
                  Justificar Ausencia
                </h3>
                
                {miembroSeleccionado && (
                  <div className="mb-4">
                    <p className="text-gray-text">
                      <span className="font-medium">Miembro:</span> {miembroSeleccionado.miembro}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-text mb-2">
                      Motivo de la ausencia *
                    </label>
                    <textarea
                      value={justificacion}
                      onChange={(e) => setJustificacion(e.target.value)}
                      placeholder="Ingrese el motivo de la ausencia..."
                      className="orpheo-input w-full"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowJustificar(false);
                        setMiembroSeleccionado(null);
                        setJustificacion('');
                      }}
                      className="px-4 py-2 border border-gray-border text-gray-text rounded-lg hover:border-primary-gold hover:text-primary-gold transition-colors"
                    >
                      Cancelar
                    </button>
                    
                    <button
                      onClick={handleJustificarAusencia}
                      disabled={!justificacion.trim() || isUpdating}
                      className="orpheo-button disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? 'Guardando...' : 'Justificar'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel de Check-in rápido */}
      <AnimatePresence>
        {showCheckIn && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-4 top-20 bottom-4 w-80 bg-primary-black-secondary border border-gray-border rounded-xl p-4 z-[60] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-gold">Check-in Rápido</h3>
              <button
                onClick={() => setShowCheckIn(false)}
                className="p-1 text-gray-border hover:text-primary-gold transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              {asistenciasFiltradas
                .filter(a => !a.horaLlegada && a.estado !== 'ausente')
                .map((asistencia) => (
                <div
                  key={asistencia.id}
                  className="flex items-center justify-between p-2 border border-gray-border rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-gold rounded-full flex items-center justify-center text-xs font-bold text-primary-black">
                      {getInitials(asistencia.miembro)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-text truncate">
                        {asistencia.miembro}
                      </p>
                      <p className="text-xs text-gray-border">{asistencia.grado}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleMarcarPresente(asistencia.miembroId)}
                    disabled={isUpdating}
                    className="p-1 bg-green-600 text-white rounded transition-colors hover:bg-green-700 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AsistenciaManager;