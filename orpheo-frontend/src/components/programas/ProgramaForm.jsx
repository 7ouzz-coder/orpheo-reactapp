import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  crearPrograma,
  selectIsCreating,
  selectProgramasError,
} from '../../store/slices/programasSlice';
import { selectUser } from '../../store/slices/authSlice';
import { 
  PROGRAMA_TIPOS_DISPLAY,
  GRADOS_DISPLAY 
} from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ProgramaForm = ({ programa = null, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isCreating = useSelector(selectIsCreating);
  const error = useSelector(selectProgramasError);

  const isEditing = !!programa;
  const [currentTab, setCurrentTab] = useState('basico');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
    reset,
  } = useForm({
    defaultValues: programa ? {
      titulo: programa.titulo || '',
      tipo: programa.tipo || 'tenida_ordinaria',
      descripcion: programa.descripcion || '',
      fechaInicio: programa.fechaInicio ? programa.fechaInicio.slice(0, 16) : '',
      fechaFin: programa.fechaFin ? programa.fechaFin.slice(0, 16) : '',
      lugar: programa.lugar || 'Templo Masónico',
      gradosPermitidos: programa.gradosPermitidos || ['aprendiz'],
      maxAsistentes: programa.maxAsistentes || 50,
      requiereConfirmacion: programa.requiereConfirmacion ?? true,
      ordenDelDia: programa.ordenDelDia || [''],
      agenda: programa.agenda || [''],
    } : {
      tipo: 'tenida_ordinaria',
      lugar: 'Templo Masónico',
      gradosPermitidos: ['aprendiz'],
      maxAsistentes: 50,
      requiereConfirmacion: true,
      ordenDelDia: [''],
      agenda: [''],
    }
  });

  const watchedTipo = watch('tipo');
  const watchedFechaInicio = watch('fechaInicio');

  // Field arrays para listas dinámicas
  const { fields: ordenFields, append: appendOrden, remove: removeOrden } = useFieldArray({
    control,
    name: 'ordenDelDia',
  });

  const { fields: agendaFields, append: appendAgenda, remove: removeAgenda } = useFieldArray({
    control,
    name: 'agenda',
  });

  // Auto-calcular fecha fin si no está definida
  useEffect(() => {
    if (watchedFechaInicio && !watch('fechaFin')) {
      const fechaInicio = new Date(watchedFechaInicio);
      fechaInicio.setHours(fechaInicio.getHours() + 3); // Default: 3 horas de duración
      setValue('fechaFin', fechaInicio.toISOString().slice(0, 16));
    }
  }, [watchedFechaInicio, setValue, watch]);

  const onSubmit = async (data) => {
    try {
      // Validar fechas
      const fechaInicio = new Date(data.fechaInicio);
      const fechaFin = new Date(data.fechaFin);
      
      if (fechaFin <= fechaInicio) {
        toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
        return;
      }

      if (fechaInicio < new Date()) {
        toast.error('No se pueden programar eventos en fechas pasadas');
        return;
      }

      // Preparar datos
      const submitData = {
        ...data,
        organizador: user?.memberFullName || user?.username,
        organizadorId: user?.id,
        fechaInicio: new Date(data.fechaInicio).toISOString(),
        fechaFin: new Date(data.fechaFin).toISOString(),
        // Limpiar arrays vacíos
        ordenDelDia: data.ordenDelDia?.filter(item => item.trim()) || [],
        agenda: data.agenda?.filter(item => item.trim()) || [],
      };

      await dispatch(crearPrograma(submitData)).unwrap();
      
      toast.success(isEditing ? 'Programa actualizado exitosamente' : 'Programa creado exitosamente');
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Error al guardar programa:', error);
    }
  };

  const tabs = [
    {
      id: 'basico',
      label: 'Información Básica',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'detalles',
      label: 'Detalles del Evento',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'agenda',
      label: 'Orden del Día',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
  ];

  const renderTabContent = () => {
    switch (currentTab) {
      case 'basico':
        return (
          <div className="space-y-6">
            {/* Título y tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Título del Programa *
                </label>
                <input
                  {...register('titulo', {
                    required: 'El título es obligatorio',
                    minLength: { value: 5, message: 'Mínimo 5 caracteres' }
                  })}
                  className="orpheo-input w-full"
                  placeholder="Ej: Tenida Ordinaria Mayo 2025"
                />
                {errors.titulo && (
                  <p className="mt-1 text-sm text-red-400">{errors.titulo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Tipo de Programa *
                </label>
                <select
                  {...register('tipo', { required: 'El tipo es obligatorio' })}
                  className="orpheo-input w-full"
                >
                  {Object.entries(PROGRAMA_TIPOS_DISPLAY).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.tipo && (
                  <p className="mt-1 text-sm text-red-400">{errors.tipo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Lugar *
                </label>
                <input
                  {...register('lugar', { required: 'El lugar es obligatorio' })}
                  className="orpheo-input w-full"
                  placeholder="Templo Masónico - Sala Principal"
                />
                {errors.lugar && (
                  <p className="mt-1 text-sm text-red-400">{errors.lugar.message}</p>
                )}
              </div>
            </div>

            {/* Fechas y horarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Fecha y Hora de Inicio *
                </label>
                <input
                  {...register('fechaInicio', { 
                    required: 'La fecha de inicio es obligatoria',
                    validate: (value) => {
                      const fecha = new Date(value);
                      const ahora = new Date();
                      return fecha > ahora || 'No se pueden programar eventos en fechas pasadas';
                    }
                  })}
                  type="datetime-local"
                  className="orpheo-input w-full"
                />
                {errors.fechaInicio && (
                  <p className="mt-1 text-sm text-red-400">{errors.fechaInicio.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Fecha y Hora de Fin *
                </label>
                <input
                  {...register('fechaFin', { 
                    required: 'La fecha de fin es obligatoria',
                    validate: (value) => {
                      const fechaInicio = new Date(watchedFechaInicio);
                      const fechaFin = new Date(value);
                      return fechaFin > fechaInicio || 'La fecha de fin debe ser posterior al inicio';
                    }
                  })}
                  type="datetime-local"
                  className="orpheo-input w-full"
                />
                {errors.fechaFin && (
                  <p className="mt-1 text-sm text-red-400">{errors.fechaFin.message}</p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-text mb-2">
                Descripción
              </label>
              <textarea
                {...register('descripcion')}
                className="orpheo-input w-full"
                rows={3}
                placeholder="Descripción detallada del programa..."
              />
            </div>
          </div>
        );

      case 'detalles':
        return (
          <div className="space-y-6">
            {/* Permisos por grado */}
            <div>
              <label className="block text-sm font-medium text-gray-text mb-3">
                Grados Permitidos *
              </label>
              <div className="space-y-2">
                {Object.entries(GRADOS_DISPLAY).map(([value, label]) => (
                  <label key={value} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      value={value}
                      {...register('gradosPermitidos', {
                        required: 'Debe seleccionar al menos un grado'
                      })}
                      className="w-4 h-4 text-primary-gold bg-primary-black border-gray-border rounded focus:ring-primary-gold focus:ring-2"
                    />
                    <span className="text-gray-text">{label}</span>
                  </label>
                ))}
              </div>
              {errors.gradosPermitidos && (
                <p className="mt-1 text-sm text-red-400">{errors.gradosPermitidos.message}</p>
              )}
            </div>

            {/* Configuraciones adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Máximo de Asistentes
                </label>
                <input
                  {...register('maxAsistentes', {
                    required: 'El máximo de asistentes es obligatorio',
                    min: { value: 1, message: 'Mínimo 1 asistente' },
                    max: { value: 500, message: 'Máximo 500 asistentes' }
                  })}
                  type="number"
                  className="orpheo-input w-full"
                  placeholder="50"
                />
                {errors.maxAsistentes && (
                  <p className="mt-1 text-sm text-red-400">{errors.maxAsistentes.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-3 mt-8">
                <input
                  {...register('requiereConfirmacion')}
                  type="checkbox"
                  className="w-4 h-4 text-primary-gold bg-primary-black border-gray-border rounded focus:ring-primary-gold focus:ring-2"
                />
                <label className="text-gray-text">
                  Requiere confirmación previa de asistencia
                </label>
              </div>
            </div>

            {/* Campos específicos por tipo */}
            {watchedTipo === 'grado' && (
              <div className="border border-gray-border rounded-lg p-4">
                <h4 className="text-lg font-semibold text-primary-gold mb-4">
                  Información de Ceremonia de Grado
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-text mb-2">
                      Nombre del Candidato
                    </label>
                    <input
                      {...register('candidatoNombre')}
                      className="orpheo-input w-full"
                      placeholder="Nombre completo del candidato"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-text mb-2">
                      Padrino
                    </label>
                    <input
                      {...register('padrino')}
                      className="orpheo-input w-full"
                      placeholder="Hermano padrino"
                    />
                  </div>
                </div>
              </div>
            )}

            {watchedTipo === 'conferencia' && (
              <div className="border border-gray-border rounded-lg p-4">
                <h4 className="text-lg font-semibold text-primary-gold mb-4">
                  Información del Conferencista
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-text mb-2">
                      Nombre del Conferencista
                    </label>
                    <input
                      {...register('conferencistaNombre')}
                      className="orpheo-input w-full"
                      placeholder="Nombre del conferencista"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-text mb-2">
                      Título/Grado Académico
                    </label>
                    <input
                      {...register('conferencistaTitulo')}
                      className="orpheo-input w-full"
                      placeholder="Dr., Lic., etc."
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-text mb-2">
                    Biografía del Conferencista
                  </label>
                  <textarea
                    {...register('conferencistaBiografia')}
                    className="orpheo-input w-full"
                    rows={3}
                    placeholder="Breve biografía y credenciales del conferencista"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'agenda':
        return (
          <div className="space-y-6">
            {/* Orden del día para tenidas */}
            {(watchedTipo === 'tenida_ordinaria' || watchedTipo === 'tenida_extraordinaria') && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-primary-gold">
                    Orden del Día
                  </h4>
                  <button
                    type="button"
                    onClick={() => appendOrden('')}
                    className="text-sm text-primary-gold hover:text-primary-gold-secondary transition-colors"
                  >
                    + Agregar punto
                  </button>
                </div>
                
                <div className="space-y-3">
                  {ordenFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-3">
                      <span className="text-gray-border text-sm font-medium w-8">
                        {index + 1}.
                      </span>
                      <input
                        {...register(`ordenDelDia.${index}`)}
                        className="orpheo-input flex-1"
                        placeholder="Punto del orden del día"
                      />
                      {ordenFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOrden(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agenda para reuniones administrativas */}
            {watchedTipo === 'reunion_administrativa' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-primary-gold">
                    Agenda de la Reunión
                  </h4>
                  <button
                    type="button"
                    onClick={() => appendAgenda('')}
                    className="text-sm text-primary-gold hover:text-primary-gold-secondary transition-colors"
                  >
                    + Agregar tema
                  </button>
                </div>
                
                <div className="space-y-3">
                  {agendaFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-3">
                      <span className="text-gray-border text-sm font-medium w-8">
                        {index + 1}.
                      </span>
                      <input
                        {...register(`agenda.${index}`)}
                        className="orpheo-input flex-1"
                        placeholder="Tema de la agenda"
                      />
                      {agendaFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAgenda(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div>
              <label className="block text-sm font-medium text-gray-text mb-2">
                Notas Adicionales
              </label>
              <textarea
                {...register('notasAdicionales')}
                className="orpheo-input w-full"
                rows={4}
                placeholder="Instrucciones especiales, material requerido, preparaciones, etc."
              />
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
          <h2 className="text-xl font-serif font-bold text-primary-gold">
            {isEditing ? 'Editar Programa' : 'Nuevo Programa'}
          </h2>
          <button
            onClick={onCancel}
            disabled={isCreating}
            className="p-2 text-gray-border hover:text-primary-gold transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-border">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
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

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {renderTabContent()}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-border">
            <button
              type="button"
              onClick={onCancel}
              disabled={isCreating}
              className="px-6 py-2 border border-gray-border text-gray-text rounded-lg hover:border-primary-gold hover:text-primary-gold transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isCreating}
              className="orpheo-button relative disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-primary-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </div>
              ) : (
                isEditing ? 'Actualizar Programa' : 'Crear Programa'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProgramaForm;