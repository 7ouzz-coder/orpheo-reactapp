import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  fetchProgramas, 
  setFilters, 
  setPagination,
  resetFilters,
  selectProgramas,
  selectProgramasLoading,
  selectProgramasError,
  selectProgramasFilters,
  selectProgramasPagination,
  selectProgramasStats,
} from '../../store/slices/programasSlice';
import { selectUser } from '../../store/slices/authSlice';
import { useDebounce } from '../../hooks/useDebounce';
import { 
  formatDate, 
  getRelativeTime,
  getInitials 
} from '../../utils/helpers';
import { 
  PROGRAMA_TIPOS_DISPLAY, 
  PROGRAMA_ESTADOS_DISPLAY 
} from '../../utils/constants';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';

const ProgramasList = ({ 
  onCreatePrograma, 
  onEditPrograma, 
  onViewPrograma, 
  onManageAsistencia,
  onViewChange 
}) => {
  const dispatch = useDispatch();
  const programas = useSelector(selectProgramas);
  const isLoading = useSelector(selectProgramasLoading);
  const error = useSelector(selectProgramasError);
  const filters = useSelector(selectProgramasFilters);
  const pagination = useSelector(selectProgramasPagination);
  const stats = useSelector(selectProgramasStats);
  const user = useSelector(selectUser);

  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 500);

  // Cargar programas al montar
  useEffect(() => {
    dispatch(fetchProgramas());
  }, [dispatch]);

  // Actualizar búsqueda cuando cambia el valor debounced
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      dispatch(setFilters({ search: debouncedSearch }));
    }
  }, [debouncedSearch, filters.search, dispatch]);

  // Recargar cuando cambian los filtros o paginación
  useEffect(() => {
    dispatch(fetchProgramas());
  }, [dispatch, filters, pagination.page, pagination.limit]);

  // Mostrar error si existe
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handlePageChange = (newPage) => {
    dispatch(setPagination({ page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    dispatch(setPagination({ page: 1, limit: newLimit }));
  };

  const handleResetFilters = () => {
    setSearchInput('');
    dispatch(resetFilters());
  };

  const canCreatePrograms = user?.role === 'admin' || user?.role === 'superadmin' || 
                           ['venerable_maestro', 'primer_vigilante', 'segundo_vigilante', 'secretario'].includes(user?.cargo);

  const canEditProgram = (programa) => {
    return user?.role === 'admin' || user?.role === 'superadmin' || 
           programa.organizadorId === user?.id ||
           ['venerable_maestro', 'secretario'].includes(user?.cargo);
  };

  const canManageAsistencia = user?.role === 'admin' || user?.role === 'superadmin' || 
                             ['venerable_maestro', 'secretario'].includes(user?.cargo);

  const canAttendProgram = (programa) => {
    return programa.gradosPermitidos?.includes(user?.grado);
  };

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

  const getMesAño = () => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[filters.mes - 1]} ${filters.año}`;
  };

  const cambiarMes = (direccion) => {
    let nuevoMes = filters.mes + direccion;
    let nuevoAño = filters.año;

    if (nuevoMes > 12) {
      nuevoMes = 1;
      nuevoAño++;
    } else if (nuevoMes < 1) {
      nuevoMes = 12;
      nuevoAño--;
    }

    dispatch(setFilters({ mes: nuevoMes, año: nuevoAño }));
  };

  const irAMesActual = () => {
    const ahora = new Date();
    dispatch(setFilters({ 
      mes: ahora.getMonth() + 1, 
      año: ahora.getFullYear() 
    }));
  };

  if (isLoading && programas.length === 0) {
    return <Loading size="lg" text="Cargando programas..." />;
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="orpheo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-text text-sm">Total Programas</p>
              <p className="text-2xl font-bold text-primary-gold">{stats.totalProgramas}</p>
            </div>
            <div className="p-3 bg-primary-gold/10 rounded-lg">
              <svg className="w-6 h-6 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="orpheo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-text text-sm">Este Mes</p>
              <p className="text-2xl font-bold text-blue-400">{programas.length}</p>
            </div>
            <div className="p-3 bg-blue-400/10 rounded-lg">
              <span className="text-blue-400 text-xl">📅</span>
            </div>
          </div>
        </div>

        <div className="orpheo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-text text-sm">Próximos Eventos</p>
              <p className="text-2xl font-bold text-green-400">{stats.proximosEventos}</p>
            </div>
            <div className="p-3 bg-green-400/10 rounded-lg">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="orpheo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-text text-sm">Asistencia Promedio</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.asistenciaPromedio}%</p>
            </div>
            <div className="p-3 bg-yellow-400/10 rounded-lg">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filtros y acciones */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="orpheo-card"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
            {/* Vista Toggle */}
            <div className="flex bg-primary-black rounded-lg p-1 border border-gray-border">
              <button className="flex items-center space-x-2 px-4 py-2 rounded-md transition-colors bg-primary-gold text-primary-black">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Lista</span>
              </button>
              <button
                onClick={() => onViewChange('calendario')}
                className="flex items-center space-x-2 px-4 py-2 rounded-md transition-colors text-gray-text hover:text-primary-gold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Calendario</span>
              </button>
            </div>

            {/* Navegación de mes */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => cambiarMes(-1)}
                className="p-2 text-gray-border hover:text-primary-gold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <span className="text-lg font-semibold text-primary-gold min-w-[140px] text-center">
                {getMesAño()}
              </span>
              
              <button
                onClick={() => cambiarMes(1)}
                className="p-2 text-gray-border hover:text-primary-gold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                onClick={irAMesActual}
                className="px-3 py-1 text-xs border border-gray-border text-gray-text rounded hover:border-primary-gold hover:text-primary-gold transition-colors"
              >
                Hoy
              </button>
            </div>

            {/* Búsqueda */}
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Buscar programas..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="orpheo-input w-full pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filtro por tipo */}
            <select
              value={filters.tipo}
              onChange={(e) => handleFilterChange({ tipo: e.target.value })}
              className="orpheo-input"
            >
              <option value="todos">Todos los tipos</option>
              {Object.entries(PROGRAMA_TIPOS_DISPLAY).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* Filtro por estado */}
            <select
              value={filters.estado}
              onChange={(e) => handleFilterChange({ estado: e.target.value })}
              className="orpheo-input"
            >
              <option value="todos">Todos los estados</option>
              {Object.entries(PROGRAMA_ESTADOS_DISPLAY).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* Botón limpiar filtros */}
            {(filters.search || filters.tipo !== 'todos' || filters.estado !== 'todos') && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-gray-text hover:text-primary-gold transition-colors border border-gray-border rounded-lg hover:border-primary-gold"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Acciones */}
          <div className="flex space-x-3">
            {canCreatePrograms && (
              <button
                onClick={onCreatePrograma}
                className="orpheo-button flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Nuevo Programa</span>
              </button>
            )}

            <button
              onClick={() => toast.success('Función de exportar próximamente')}
              className="px-4 py-2 border border-gray-border text-gray-text rounded-lg hover:border-primary-gold hover:text-primary-gold transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Lista de programas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="orpheo-card"
      >
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loading size="md" text="Cargando..." />
          </div>
        )}

        {!isLoading && programas.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-border mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-text mb-2">No se encontraron programas</h3>
            <p className="text-gray-border mb-4">
              {filters.search || filters.tipo !== 'todos' || filters.estado !== 'todos'
                ? 'Intenta ajustar los filtros de búsqueda'
                : `No hay programas programados para ${getMesAño()}`
              }
            </p>
            {canCreatePrograms && !filters.search && filters.tipo === 'todos' && filters.estado === 'todos' && (
              <button
                onClick={onCreatePrograma}
                className="orpheo-button"
              >
                Crear primer programa
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Header de tabla - Desktop */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 py-3 px-4 border-b border-gray-border text-sm font-medium text-gray-border">
              <div className="col-span-5">Programa</div>
              <div className="col-span-2">Organizador</div>
              <div className="col-span-2">Fecha y Hora</div>
              <div className="col-span-2">Estado/Asistencia</div>
              <div className="col-span-1">Acciones</div>
            </div>

            {/* Lista de programas */}
            <div className="space-y-2">
              {programas.map((programa, index) => (
                <motion.div
                  key={programa.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="md:grid md:grid-cols-12 gap-4 p-4 rounded-lg border border-gray-border hover:border-primary-gold/30 transition-all cursor-pointer"
                  onClick={() => onViewPrograma && onViewPrograma(programa)}
                >
                  {/* Información del programa */}
                  <div className="col-span-5 flex items-start space-x-3">
                    <div className="text-2xl flex-shrink-0">
                      {getTipoIcon(programa.tipo)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-gray-text font-medium truncate">
                        {programa.titulo}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-primary-gold/10 text-primary-gold px-2 py-1 rounded-full">
                          {PROGRAMA_TIPOS_DISPLAY[programa.tipo]}
                        </span>
                        {programa.requiereConfirmacion && (
                          <span className="text-xs text-blue-400">
                            Requiere confirmación
                          </span>
                        )}
                      </div>
                      <p className="text-gray-border text-sm mt-1 line-clamp-1">
                        📍 {programa.lugar}
                      </p>
                      {programa.descripcion && (
                        <p className="text-gray-border text-sm mt-1 line-clamp-2">
                          {programa.descripcion}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-border">
                        <span>👥 {programa.maxAsistentes} max</span>
                        <span>✅ {programa.asistenciasConfirmadas} confirmados</span>
                        <span>⏳ {programa.asistenciasPendientes} pendientes</span>
                      </div>
                    </div>
                  </div>

                  {/* Organizador */}
                  <div className="col-span-2 md:flex md:items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary-gold rounded-full flex items-center justify-center text-xs font-bold text-primary-black">
                        {getInitials(programa.organizador)}
                      </div>
                      <div>
                        <p className="text-gray-text text-sm font-medium">
                          {programa.organizador}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fecha y Hora */}
                  <div className="col-span-2 md:flex md:items-center">
                    <div className="text-sm">
                      <p className="text-gray-text font-medium">
                        {formatDate(programa.fechaInicio, 'dd/MM/yyyy')}
                      </p>
                      <p className="text-gray-border">
                        {formatDate(programa.fechaInicio, 'HH:mm')} - {formatDate(programa.fechaFin, 'HH:mm')}
                      </p>
                      <p className="text-gray-border text-xs">
                        {getRelativeTime(programa.fechaInicio)}
                      </p>
                    </div>
                  </div>

                  {/* Estado y Asistencia */}
                  <div className="col-span-2 md:flex md:items-center">
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(programa.estado)}`}>
                        {PROGRAMA_ESTADOS_DISPLAY[programa.estado]}
                      </span>
                      
                      {canAttendProgram(programa) && programa.requiereConfirmacion && (
                        <div className="text-xs">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success('Función de confirmación próximamente');
                            }}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Confirmar asistencia
                          </button>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-border">
                        {Math.round((programa.asistenciasConfirmadas / programa.maxAsistentes) * 100)}% ocupado
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="col-span-1 md:flex md:items-center md:justify-end">
                    <div className="flex space-x-2">
                      {canEditProgram(programa) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPrograma && onEditPrograma(programa);
                          }}
                          className="p-1 text-gray-border hover:text-primary-gold transition-colors"
                          title="Editar programa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      
                      {canManageAsistencia && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onManageAsistencia && onManageAsistencia(programa);
                          }}
                          className="p-1 text-gray-border hover:text-primary-gold transition-colors"
                          title="Gestionar asistencia"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Información adicional en móvil */}
                  <div className="md:hidden mt-3 pt-3 border-t border-gray-border/50">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs border ${getEstadoColor(programa.estado)}`}>
                          {PROGRAMA_ESTADOS_DISPLAY[programa.estado]}
                        </span>
                        <span className="text-gray-border text-xs">
                          por {programa.organizador}
                        </span>
                      </div>
                      <div className="text-gray-border text-xs text-right">
                        <p>{formatDate(programa.fechaInicio, 'dd/MM HH:mm')}</p>
                        <p>{programa.lugar}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-border">
                <div className="flex items-center space-x-2 text-sm text-gray-border">
                  <span>Mostrando</span>
                  <select
                    value={pagination.limit}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                    className="orpheo-input py-1 px-2 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>de {pagination.total} programas</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 text-gray-border hover:text-primary-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNumber;
                      if (pagination.totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNumber = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNumber = pagination.totalPages - 4 + i;
                      } else {
                        pageNumber = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            pageNumber === pagination.page
                              ? 'bg-primary-gold text-primary-black'
                              : 'text-gray-border hover:text-primary-gold'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 text-gray-border hover:text-primary-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ProgramasList;