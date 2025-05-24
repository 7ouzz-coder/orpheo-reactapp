import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  fetchMiembros, 
  setFilters, 
  setPagination,
  resetFilters,
  selectMiembros,
  selectMiembrosLoading,
  selectMiembrosError,
  selectMiembrosFilters,
  selectMiembrosPagination,
  selectMiembrosStats,
} from '../../store/slices/miembrosSlice';
import { selectUser } from '../../store/slices/authSlice';
import { GRADOS_DISPLAY } from '../../utils/constants';
import { getGradoDisplayName, formatDate, getInitials } from '../../utils/helpers';
import { useDebounce } from '../../hooks/useDebounce';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';

const MiembrosList = ({ onSelectMiembro, onCreateMiembro, onEditMiembro }) => {
  const dispatch = useDispatch();
  const miembros = useSelector(selectMiembros);
  const isLoading = useSelector(selectMiembrosLoading);
  const error = useSelector(selectMiembrosError);
  const filters = useSelector(selectMiembrosFilters);
  const pagination = useSelector(selectMiembrosPagination);
  const stats = useSelector(selectMiembrosStats);
  const user = useSelector(selectUser);

  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 500);

  // Cargar miembros al montar el componente
  useEffect(() => {
    dispatch(fetchMiembros());
  }, [dispatch]);

  // Actualizar búsqueda cuando cambia el valor debounced
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      dispatch(setFilters({ search: debouncedSearch }));
    }
  }, [debouncedSearch, filters.search, dispatch]);

  // Recargar cuando cambian los filtros o paginación
  useEffect(() => {
    dispatch(fetchMiembros());
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

  const canManageMembers = user?.role === 'admin' || user?.role === 'superadmin' || 
                          user?.cargo === 'secretario';

  const getGradoColor = (grado) => {
    const colors = {
      aprendiz: 'text-yellow-400 bg-yellow-400/10',
      companero: 'text-green-400 bg-green-400/10',
      maestro: 'text-blue-400 bg-blue-400/10',
    };
    return colors[grado] || 'text-gray-400 bg-gray-400/10';
  };

  if (isLoading && miembros.length === 0) {
    return <Loading size="lg" text="Cargando miembros..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="orpheo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-text text-sm">Total Miembros</p>
              <p className="text-2xl font-bold text-primary-gold">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary-gold/10 rounded-lg">
              <svg className="w-6 h-6 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="orpheo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-text text-sm">Aprendices</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.porGrado?.aprendiz || 0}</p>
            </div>
            <div className="p-3 bg-yellow-400/10 rounded-lg">
              <span className="text-yellow-400 text-xl">⚬</span>
            </div>
          </div>
        </div>

        <div className="orpheo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-text text-sm">Compañeros</p>
              <p className="text-2xl font-bold text-green-400">{stats.porGrado?.companero || 0}</p>
            </div>
            <div className="p-3 bg-green-400/10 rounded-lg">
              <span className="text-green-400 text-xl">⚬⚬</span>
            </div>
          </div>
        </div>

        <div className="orpheo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-text text-sm">Maestros</p>
              <p className="text-2xl font-bold text-blue-400">{stats.porGrado?.maestro || 0}</p>
            </div>
            <div className="p-3 bg-blue-400/10 rounded-lg">
              <span className="text-blue-400 text-xl">⚬⚬⚬</span>
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
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o RUT..."
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

            {/* Filtro por grado */}
            <select
              value={filters.grado}
              onChange={(e) => handleFilterChange({ grado: e.target.value })}
              className="orpheo-input"
            >
              <option value="todos">Todos los grados</option>
              {Object.entries(GRADOS_DISPLAY).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* Botón limpiar filtros */}
            {(filters.search || filters.grado !== 'todos') && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-gray-text hover:text-primary-gold transition-colors border border-gray-border rounded-lg hover:border-primary-gold"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Acciones */}
          <div className="flex space-x-3">
            {canManageMembers && (
              <>
                <button
                  onClick={onCreateMiembro}
                  className="orpheo-button flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Nuevo Miembro</span>
                </button>

                <button
                  onClick={() => toast.success('Función de importar próximamente')}
                  className="px-4 py-2 border border-primary-gold text-primary-gold rounded-lg hover:bg-primary-gold/10 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Importar</span>
                </button>
              </>
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

      {/* Lista de miembros */}
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

        {!isLoading && miembros.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-border mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-text mb-2">No se encontraron miembros</h3>
            <p className="text-gray-border mb-4">
              {filters.search || filters.grado !== 'todos' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay miembros registrados en el sistema'
              }
            </p>
            {canManageMembers && !filters.search && filters.grado === 'todos' && (
              <button
                onClick={onCreateMiembro}
                className="orpheo-button"
              >
                Agregar primer miembro
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Header de tabla */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 py-3 px-4 border-b border-gray-border text-sm font-medium text-gray-border">
              <div className="col-span-4">Miembro</div>
              <div className="col-span-2">Grado</div>
              <div className="col-span-2">Cargo</div>
              <div className="col-span-2">Contacto</div>
              <div className="col-span-1">Usuario</div>
              <div className="col-span-1">Acciones</div>
            </div>

            {/* Lista de miembros */}
            <div className="space-y-2">
              {miembros.map((miembro, index) => (
                <motion.div
                  key={miembro.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="md:grid md:grid-cols-12 gap-4 p-4 rounded-lg border border-gray-border hover:border-primary-gold/30 transition-all cursor-pointer"
                  onClick={() => onSelectMiembro && onSelectMiembro(miembro)}
                >
                  {/* Información del miembro */}
                  <div className="col-span-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-gold rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-black font-semibold text-sm">
                        {getInitials(miembro.nombreCompleto)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-text font-medium truncate">
                        {miembro.nombreCompleto}
                      </p>
                      <p className="text-gray-border text-sm">
                        RUT: {miembro.rut}
                      </p>
                      {miembro.edad && (
                        <p className="text-gray-border text-xs">
                          {miembro.edad} años
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Grado */}
                  <div className="col-span-2 md:flex md:items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradoColor(miembro.grado)}`}>
                      {getGradoDisplayName(miembro.grado)}
                    </span>
                  </div>

                  {/* Cargo */}
                  <div className="col-span-2 md:flex md:items-center">
                    <span className="text-gray-text text-sm">
                      {miembro.cargo || '-'}
                    </span>
                  </div>

                  {/* Contacto */}
                  <div className="col-span-2 md:flex md:items-center">
                    <div className="space-y-1">
                      {miembro.email && (
                        <div className="flex items-center space-x-1 text-xs text-gray-border">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                          <span className="truncate">{miembro.email}</span>
                        </div>
                      )}
                      {miembro.telefono && (
                        <div className="flex items-center space-x-1 text-xs text-gray-border">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{miembro.telefono}</span>
                        </div>
                      )}
                      {!miembro.email && !miembro.telefono && (
                        <span className="text-gray-border text-xs">Sin contacto</span>
                      )}
                    </div>
                  </div>

                  {/* Usuario del sistema */}
                  <div className="col-span-1 md:flex md:items-center">
                    {miembro.tieneUsuario ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-400/10 text-green-400">
                        ✓ Sistema
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-400/10 text-gray-400">
                        Sin acceso
                      </span>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="col-span-1 md:flex md:items-center md:justify-end">
                    {canManageMembers && (
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditMiembro && onEditMiembro(miembro);
                          }}
                          className="p-1 text-gray-border hover:text-primary-gold transition-colors"
                          title="Editar miembro"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Información adicional en móvil */}
                  <div className="md:hidden mt-3 pt-3 border-t border-gray-border/50">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 rounded text-xs ${getGradoColor(miembro.grado)}`}>
                          {getGradoDisplayName(miembro.grado)}
                        </span>
                        {miembro.cargo && (
                          <span className="text-gray-border">
                            {miembro.cargo}
                          </span>
                        )}
                      </div>
                      {miembro.fechaIniciacion && (
                        <span className="text-gray-border text-xs">
                          Iniciado: {formatDate(miembro.fechaIniciacion)}
                        </span>
                      )}
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
                    <option value={100}>100</option>
                  </select>
                  <span>de {pagination.total} miembros</span>
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

export default MiembrosList;