import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  fetchProgramas, 
  setFilters,
  setVistaCalendario,
  setFechaSeleccionada,
  selectProgramas,
  selectProgramasLoading,
  selectVistaCalendario,
  selectFechaSeleccionada,
  selectProgramasStats,
} from '../../store/slices/programasSlice';
import { selectUser } from '../../store/slices/authSlice';
import { 
  formatDate, 
  getRelativeTime 
} from '../../utils/helpers';
import { 
  PROGRAMA_TIPOS_DISPLAY, 
  PROGRAMA_ESTADOS_DISPLAY 
} from '../../utils/constants';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';

const CalendarioView = ({ onCreatePrograma, onViewPrograma, onViewChange }) => {
  const dispatch = useDispatch();
  const programas = useSelector(selectProgramas);
  const isLoading = useSelector(selectProgramasLoading);
  const vistaCalendario = useSelector(selectVistaCalendario);
  const fechaSeleccionada = useSelector(selectFechaSeleccionada);
  const stats = useSelector(selectProgramasStats);
  const user = useSelector(selectUser);

  const [fechaActual, setFechaActual] = useState(new Date(fechaSeleccionada));

  // Cargar programas cuando cambia el mes
  useEffect(() => {
    const mes = fechaActual.getMonth() + 1;
    const año = fechaActual.getFullYear();
    dispatch(setFilters({ mes, año }));
    dispatch(fetchProgramas());
  }, [dispatch, fechaActual]);

  const canCreatePrograms = user?.role === 'admin' || user?.role === 'superadmin' || 
                           ['venerable_maestro', 'primer_vigilante', 'segundo_vigilante', 'secretario'].includes(user?.cargo);

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

  const getEstadoColor = (estado) => {
    const colors = {
      programado: 'border-l-blue-400',
      en_curso: 'border-l-green-400',
      finalizado: 'border-l-gray-400',
      cancelado: 'border-l-red-400',
      suspendido: 'border-l-yellow-400',
    };
    return colors[estado] || 'border-l-gray-400';
  };

  // Navegar entre meses
  const cambiarMes = (direccion) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(fechaActual.getMonth() + direccion);
    setFechaActual(nuevaFecha);
    dispatch(setFechaSeleccionada(nuevaFecha.toISOString()));
  };

  const irAHoy = () => {
    const hoy = new Date();
    setFechaActual(hoy);
    dispatch(setFechaSeleccionada(hoy.toISOString()));
  };

  // Generar días del mes
  const generarDiasDelMes = () => {
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    
    // Calcular días de relleno del mes anterior
    const primerDiaSemana = primerDia.getDay();
    const diasRelleno = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1; // Lunes = 0
    
    const dias = [];
    
    // Días del mes anterior (grises)
    for (let i = diasRelleno; i > 0; i--) {
      const dia = new Date(año, mes, -i + 1);
      dias.push({
        fecha: dia,
        esDelMes: false,
        programas: [],
      });
    }
    
    // Días del mes actual
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(año, mes, dia);
      const programasDelDia = programas.filter(programa => {
        const fechaPrograma = new Date(programa.fechaInicio);
        return fechaPrograma.toDateString() === fecha.toDateString();
      });
      
      dias.push({
        fecha,
        esDelMes: true,
        programas: programasDelDia,
      });
    }
    
    // Días del mes siguiente para completar la grilla
    const diasRestantes = 42 - dias.length; // 6 semanas x 7 días
    for (let i = 1; i <= diasRestantes; i++) {
      const dia = new Date(año, mes + 1, i);
      dias.push({
        fecha: dia,
        esDelMes: false,
        programas: [],
      });
    }
    
    return dias;
  };

  const diasDelMes = generarDiasDelMes();
  const nombreMes = fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const hoy = new Date();

  const renderVistaCalendario = () => {
    switch (vistaCalendario) {
      case 'mes':
        return (
          <div className="grid grid-cols-7 gap-1">
            {/* Headers de días de la semana */}
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia) => (
              <div key={dia} className="h-10 flex items-center justify-center text-sm font-medium text-gray-border bg-primary-black-secondary">
                {dia}
              </div>
            ))}
            
            {/* Días del mes */}
            {diasDelMes.map((diaData, index) => {
              const esHoy = diaData.fecha.toDateString() === hoy.toDateString();
              const tieneProgramas = diaData.programas.length > 0;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className={`min-h-[100px] border border-gray-border p-2 cursor-pointer transition-colors ${
                    diaData.esDelMes 
                      ? 'bg-primary-black-secondary hover:bg-primary-gold/5' 
                      : 'bg-primary-black/50 text-gray-border'
                  } ${esHoy ? 'ring-2 ring-primary-gold' : ''}`}
                  onClick={() => {
                    if (canCreatePrograms) {
                      // Pre-llenar fecha al crear programa
                      onCreatePrograma(diaData.fecha);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      esHoy ? 'text-primary-gold' : 
                      diaData.esDelMes ? 'text-gray-text' : 'text-gray-border'
                    }`}>
                      {diaData.fecha.getDate()}
                    </span>
                    {tieneProgramas && (
                      <span className="w-2 h-2 bg-primary-gold rounded-full"></span>
                    )}
                  </div>
                  
                  {/* Programas del día */}
                  <div className="space-y-1">
                    {diaData.programas.slice(0, 3).map((programa) => (
                      <motion.div
                        key={programa.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-xs p-1 rounded border-l-2 bg-primary-black/50 hover:bg-primary-gold/10 transition-colors cursor-pointer ${getEstadoColor(programa.estado)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewPrograma(programa);
                        }}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{getTipoIcon(programa.tipo)}</span>
                          <span className="truncate text-gray-text">
                            {programa.titulo}
                          </span>
                        </div>
                        <div className="text-gray-border">
                          {formatDate(programa.fechaInicio, 'HH:mm')}
                        </div>
                      </motion.div>
                    ))}
                    
                    {diaData.programas.length > 3 && (
                      <div className="text-xs text-gray-border text-center">
                        +{diaData.programas.length - 3} más
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        );
        
      case 'semana':
        // Vista semanal simplificada
        const inicioSemana = new Date(fechaActual);
        inicioSemana.setDate(fechaActual.getDate() - fechaActual.getDay() + 1);
        
        const diasSemana = Array.from({ length: 7 }, (_, i) => {
          const dia = new Date(inicioSemana);
          dia.setDate(inicioSemana.getDate() + i);
          return {
            fecha: dia,
            programas: programas.filter(programa => {
              const fechaPrograma = new Date(programa.fechaInicio);
              return fechaPrograma.toDateString() === dia.toDateString();
            }),
          };
        });
        
        return (
          <div className="grid grid-cols-7 gap-2">
            {diasSemana.map((diaData, index) => {
              const esHoy = diaData.fecha.toDateString() === hoy.toDateString();
              
              return (
                <div key={index} className={`min-h-[300px] border border-gray-border p-3 rounded-lg ${
                  esHoy ? 'ring-2 ring-primary-gold bg-primary-gold/5' : 'bg-primary-black-secondary'
                }`}>
                  <div className="text-center mb-3">
                    <div className="text-sm text-gray-border">
                      {diaData.fecha.toLocaleDateString('es-ES', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-semibold ${
                      esHoy ? 'text-primary-gold' : 'text-gray-text'
                    }`}>
                      {diaData.fecha.getDate()}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {diaData.programas.map((programa) => (
                      <div
                        key={programa.id}
                        className={`p-2 rounded border-l-4 bg-primary-black/50 hover:bg-primary-gold/10 transition-colors cursor-pointer ${getEstadoColor(programa.estado)}`}
                        onClick={() => onViewPrograma(programa)}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span>{getTipoIcon(programa.tipo)}</span>
                          <span className="text-xs text-primary-gold">
                            {formatDate(programa.fechaInicio, 'HH:mm')}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-text line-clamp-2">
                          {programa.titulo}
                        </h4>
                        <p className="text-xs text-gray-border">
                          {programa.lugar}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (isLoading && programas.length === 0) {
    return <Loading size="lg" text="Cargando calendario..." />;
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="orpheo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-text text-sm">Este Mes</p>
              <p className="text-2xl font-bold text-primary-gold">{programas.length}</p>
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
              <p className="text-gray-text text-sm">Próximos 7 días</p>
              <p className="text-2xl font-bold text-blue-400">
                {programas.filter(p => {
                  const fecha = new Date(p.fechaInicio);
                  const enSemana = fecha >= hoy && fecha <= new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
                  return enSemana;
                }).length}
              </p>
            </div>
            <div className="p-3 bg-blue-400/10 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="orpheo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-text text-sm">Tenidas</p>
              <p className="text-2xl font-bold text-green-400">
                {programas.filter(p => p.tipo.includes('tenida')).length}
              </p>
            </div>
            <div className="p-3 bg-green-400/10 rounded-lg">
              <span className="text-green-400 text-xl">🏛️</span>
            </div>
          </div>
        </div>

        <div className="orpheo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-text text-sm">Ceremonias</p>
              <p className="text-2xl font-bold text-purple-400">
                {programas.filter(p => p.tipo === 'grado').length}
              </p>
            </div>
            <div className="p-3 bg-purple-400/10 rounded-lg">
              <span className="text-purple-400 text-xl">🎓</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Controles del calendario */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="orpheo-card"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            {/* Vista Toggle */}
            <div className="flex bg-primary-black rounded-lg p-1 border border-gray-border">
              <button
                onClick={() => onViewChange('lista')}
                className="flex items-center space-x-2 px-4 py-2 rounded-md transition-colors text-gray-text hover:text-primary-gold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Lista</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 rounded-md transition-colors bg-primary-gold text-primary-black">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Calendario</span>
              </button>
            </div>

            {/* Vista Calendario Toggle */}
            <div className="flex bg-primary-black rounded-lg p-1 border border-gray-border">
              <button
                onClick={() => dispatch(setVistaCalendario('mes'))}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  vistaCalendario === 'mes' 
                    ? 'bg-primary-gold text-primary-black' 
                    : 'text-gray-text hover:text-primary-gold'
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => dispatch(setVistaCalendario('semana'))}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  vistaCalendario === 'semana' 
                    ? 'bg-primary-gold text-primary-black' 
                    : 'text-gray-text hover:text-primary-gold'
                }`}
              >
                Semana
              </button>
            </div>
          </div>

          {/* Navegación del calendario */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => cambiarMes(-1)}
                className="p-2 text-gray-border hover:text-primary-gold transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h2 className="text-lg font-semibold text-primary-gold capitalize min-w-[200px] text-center">
                {nombreMes}
              </h2>
              
              <button
                onClick={() => cambiarMes(1)}
                className="p-2 text-gray-border hover:text-primary-gold transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <button
              onClick={irAHoy}
              className="px-4 py-2 text-sm border border-gray-border text-gray-text rounded-lg hover:border-primary-gold hover:text-primary-gold transition-colors"
            >
              Hoy
            </button>

            {canCreatePrograms && (
              <button
                onClick={() => onCreatePrograma()}
                className="orpheo-button flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Nuevo</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Calendario */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="orpheo-card p-4"
      >
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="md" text="Cargando eventos..." />
          </div>
        ) : (
          renderVistaCalendario()
        )}
      </motion.div>

      {/* Leyenda */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="orpheo-card"
      >
        <h3 className="text-lg font-semibold text-primary-gold mb-4">Leyenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(PROGRAMA_TIPOS_DISPLAY).map(([tipo, label]) => (
            <div key={tipo} className="flex items-center space-x-2">
              <span className="text-lg">{getTipoIcon(tipo)}</span>
              <span className="text-sm text-gray-text">{label}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-border">
          <h4 className="text-sm font-medium text-gray-text mb-2">Estados</h4>
          <div className="flex flex-wrap gap-4">
            {Object.entries(PROGRAMA_ESTADOS_DISPLAY).map(([estado, label]) => (
              <div key={estado} className="flex items-center space-x-2">
                <div className={`w-3 h-3 border-l-4 ${getEstadoColor(estado)}`}></div>
                <span className="text-xs text-gray-border">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarioView;