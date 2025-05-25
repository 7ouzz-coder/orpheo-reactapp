import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  fetchDocumentos, 
  setFilters, 
  setPagination,
  resetFilters,
  selectDocumentos,
  selectDocumentosLoading,
  selectDocumentosError,
  selectDocumentosFilters,
  selectDocumentosPagination,
  selectDocumentosStats,
} from '../../store/slices/documentosSlice';
import { selectUser } from '../../store/slices/authSlice';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate, formatFileSize, getRelativeTime } from '../../utils/helpers';
import { DOCUMENTO_TIPOS_DISPLAY, DOCUMENTO_ESTADOS_DISPLAY } from '../../utils/constants';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';

const DocumentosList = ({ onUploadDocument, onViewDocument }) => {
  const dispatch = useDispatch();
  const documentos = useSelector(selectDocumentos);
  const isLoading = useSelector(selectDocumentosLoading);
  const error = useSelector(selectDocumentosError);
  const filters = useSelector(selectDocumentosFilters);
  const pagination = useSelector(selectDocumentosPagination);
  const stats = useSelector(selectDocumentosStats);
  const user = useSelector(selectUser);

  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 500);

  // Cargar documentos al montar
  useEffect(() => {
    dispatch(fetchDocumentos());
  }, [dispatch]);

  // Actualizar búsqueda cuando cambia el valor debounced
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      dispatch(setFilters({ search: debouncedSearch }));
    }
  }, [debouncedSearch, filters.search, dispatch]);

  // Recargar cuando cambian los filtros o paginación
  useEffect(() => {
    dispatch(fetchDocumentos());
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

  const handleResetFilters = () => {
    setSearchInput('');
    dispatch(resetFilters());
  };

  const canUploadDocuments = user?.role === 'admin' || user?.role === 'superadmin' || 
                           user?.grado === 'maestro' || user?.cargo;

  const canViewDocument = (documento) => {
    if (user?.role === 'admin' || user?.role === 'superadmin') return true;
    
    // Verificar visibilidad por grado
    if (documento.visibilidad && documento.visibilidad.includes(user?.grado)) {
      return true;
    }
    
    // El autor siempre puede ver sus documentos
    return documento.autorId === user?.id;
  };

  const getEstadoColor = (estado) => {
    const colors = {
      aprobado: 'text-green-400 bg-green-400/10 border-green-400/20',
      pendiente: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      revision: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      rechazado: 'text-red-400 bg-red-400/10 border-red-400/20',
    };
    return colors[estado] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      plancha: '📄',
      acta: '📋',
      circular: '📢',
      reglamento: '📜',
      informe: '📊',
      carta: '✉️',
      otro: '📁',
    };
    return icons[tipo] || '📄';
  };

  if (isLoading && documentos.length === 0) {
    return <Loading size="lg" text="Cargando documentos..." />;
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
              <p className="text-gray-text text-sm">Total Documentos</p>
              <p className="text-2xl font-bold text-primary-gold">{stats.totalDocumentos}</p>
            </div>
            <div className="p-3 bg-primary-gold/10 rounded-lg">
              <svg className="w-6 h-6 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="orpheo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-text text-sm">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.porEstado?.pendiente || 0}</p>
            </div>
            <div className="p-3 bg-yellow-400/10 rounded-lg">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="orpheo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-text text-sm">Planchas</p>
              <p className="text-2xl font-bold text-blue-400">{stats.porTipo?.plancha || 0}</p>
            </div>
            <div className="p-3 bg-blue-400/10 rounded-lg">
              <span className="text-blue-400 text-xl">📄</span>
            </div>
          </div>
        </div>

        <div className="orpheo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-text text-sm">Descargas</p>
              <p className="text-2xl font-bold text-green-400">{stats.descargasTotal}</p>
            </div>
            <div className="p-3 bg-green-400/10 rounded-lg">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar documentos..."
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
              {Object.entries(DOCUMENTO_TIPOS_DISPLAY).map(([value, label]) => (
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
              {Object.entries(DOCUMENTO_ESTADOS_DISPLAY).map(([value, label]) => (
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
            {canUploadDocuments && (
              <button
                onClick={onUploadDocument}
                className="orpheo-button flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Subir Documento</span>
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

      {/* Lista de documentos */}
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

        {!isLoading && documentos.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-border mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-text mb-2">No se encontraron documentos</h3>
            <p className="text-gray-border mb-4">
              {filters.search || filters.tipo !== 'todos' || filters.estado !== 'todos'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay documentos registrados en el sistema'
              }
            </p>
            {canUploadDocuments && !filters.search && filters.tipo === 'todos' && filters.estado === 'todos' && (
              <button
                onClick={onUploadDocument}
                className="orpheo-button"
              >
                Subir primer documento
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Header de tabla - Desktop */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 py-3 px-4 border-b border-gray-border text-sm font-medium text-gray-border">
              <div className="col-span-5">Documento</div>
              <div className="col-span-2">Autor</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-2">Fecha</div>
              <div className="col-span-1">Acciones</div>
            </div>

            {/* Lista de documentos */}
            <div className="space-y-2">
              {documentos.map((documento, index) => (
                <motion.div
                  key={documento.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="md:grid md:grid-cols-12 gap-4 p-4 rounded-lg border border-gray-border hover:border-primary-gold/30 transition-all cursor-pointer"
                  onClick={() => canViewDocument(documento) && onViewDocument(documento)}
                >
                  {/* Información del documento */}
                  <div className="col-span-5 flex items-start space-x-3">
                    <div className="text-2xl flex-shrink-0">
                      {getTipoIcon(documento.tipo)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-gray-text font-medium truncate">
                        {documento.titulo}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-primary-gold/10 text-primary-gold px-2 py-1 rounded-full">
                          {DOCUMENTO_TIPOS_DISPLAY[documento.tipo]}
                        </span>
                        {documento.categoria && (
                          <span className="text-xs text-gray-border">
                            {documento.categoria}
                          </span>
                        )}
                      </div>
                      {documento.resumen && (
                        <p className="text-gray-border text-sm mt-1 line-clamp-2">
                          {documento.resumen}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-border">
                        <span>📥 {documento.descargas} descargas</span>
                        <span>💬 {documento.comentarios} comentarios</span>
                        <span>📄 {formatFileSize(documento.tamaño)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Autor */}
                  <div className="col-span-2 md:flex md:items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary-gold rounded-full flex items-center justify-center text-xs font-bold text-primary-black">
                        {documento.autor.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-gray-text text-sm font-medium">
                          {documento.autor}
                        </p>
                        <p className="text-gray-border text-xs">
                          {documento.grado}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="col-span-2 md:flex md:items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(documento.estado)}`}>
                      {DOCUMENTO_ESTADOS_DISPLAY[documento.estado]}
                    </span>
                  </div>

                  {/* Fecha */}
                  <div className="col-span-2 md:flex md:items-center">
                    <div className="text-sm text-gray-border">
                      <p>{formatDate(documento.fechaCreacion)}</p>
                      <p className="text-xs">{getRelativeTime(documento.fechaCreacion)}</p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="col-span-1 md:flex md:items-center md:justify-end">
                    <div className="flex space-x-2">
                      {canViewDocument(documento) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDocument(documento);
                          }}
                          className="p-1 text-gray-border hover:text-primary-gold transition-colors"
                          title="Ver documento"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success('Descarga iniciada');
                        }}
                        className="p-1 text-gray-border hover:text-primary-gold transition-colors"
                        title="Descargar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Información adicional en móvil */}
                  <div className="md:hidden mt-3 pt-3 border-t border-gray-border/50">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs border ${getEstadoColor(documento.estado)}`}>
                          {DOCUMENTO_ESTADOS_DISPLAY[documento.estado]}
                        </span>
                        <span className="text-gray-border text-xs">
                          por {documento.autor}
                        </span>
                      </div>
                      <span className="text-gray-border text-xs">
                        {formatDate(documento.fechaCreacion)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-border">
                <div className="flex items-center space-x-2 text-sm text-gray-border">
                  <span>Mostrando {documentos.length} de {pagination.total} documentos</span>
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

                  <span className="px-3 py-1 text-sm text-gray-text">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>

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

export default DocumentosList;