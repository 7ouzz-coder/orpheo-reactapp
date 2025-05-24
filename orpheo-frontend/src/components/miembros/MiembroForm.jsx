import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  createMiembro, 
  updateMiembro,
  selectMiembrosLoading,
  selectMiembrosError,
  clearError,
} from '../../store/slices/miembrosSlice';
import { GRADOS_DISPLAY, CARGOS_DISPLAY } from '../../utils/constants';
import { validateRUT, formatRUT } from '../../utils/helpers';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';

const MiembroForm = ({ miembro = null, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectMiembrosLoading);
  const error = useSelector(selectMiembrosError);
  
  const isEditing = !!miembro;
  const [currentTab, setCurrentTab] = useState('personal');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    clearErrors,
  } = useForm({
    defaultValues: miembro ? {
      nombres: miembro.nombres || '',
      apellidos: miembro.apellidos || '',
      rut: miembro.rut || '',
      grado: miembro.grado || 'aprendiz',
      cargo: miembro.cargo || '',
      email: miembro.email || '',
      telefono: miembro.telefono || '',
      direccion: miembro.direccion || '',
      profesion: miembro.profesion || '',
      ocupacion: miembro.ocupacion || '',
      trabajoNombre: miembro.trabajoNombre || '',
      trabajoDireccion: miembro.trabajoDireccion || '',
      trabajoTelefono: miembro.trabajoTelefono || '',
      trabajoEmail: miembro.trabajoEmail || '',
      parejaNombre: miembro.parejaNombre || '',
      parejaTelefono: miembro.parejaTelefono || '',
      contactoEmergenciaNombre: miembro.contactoEmergenciaNombre || '',
      contactoEmergenciaTelefono: miembro.contactoEmergenciaTelefono || '',
      fechaNacimiento: miembro.fechaNacimiento ? miembro.fechaNacimiento.split('T')[0] : '',
      fechaIniciacion: miembro.fechaIniciacion ? miembro.fechaIniciacion.split('T')[0] : '',
      fechaAumentoSalario: miembro.fechaAumentoSalario ? miembro.fechaAumentoSalario.split('T')[0] : '',
      fechaExaltacion: miembro.fechaExaltacion ? miembro.fechaExaltacion.split('T')[0] : '',
      situacionSalud: miembro.situacionSalud || '',
      observaciones: miembro.observaciones || '',
    } : {
      grado: 'aprendiz',
    }
  });

  const watchedGrado = watch('grado');
  const watchedRut = watch('rut');

  // Limpiar errores al cambiar entre tabs
  useEffect(() => {
    dispatch(clearError());
  }, [currentTab, dispatch]);

  // Formatear RUT mientras se escribe
  useEffect(() => {
    if (watchedRut && watchedRut.length > 1) {
      const formatted = formatRUT(watchedRut);
      if (formatted !== watchedRut) {
        setValue('rut', formatted);
      }
    }
  }, [watchedRut, setValue]);

  const onSubmit = async (data) => {
    try {
      // Validar RUT
      if (!validateRUT(data.rut)) {
        toast.error('RUT inválido');
        return;
      }

      // Preparar datos
      const submitData = {
        ...data,
        // Limpiar campos vacíos
        cargo: data.cargo?.trim() || null,
        email: data.email?.trim() || null,
        telefono: data.telefono?.trim() || null,
        direccion: data.direccion?.trim() || null,
        profesion: data.profesion?.trim() || null,
        ocupacion: data.ocupacion?.trim() || null,
        trabajoNombre: data.trabajoNombre?.trim() || null,
        trabajoDireccion: data.trabajoDireccion?.trim() || null,
        trabajoTelefono: data.trabajoTelefono?.trim() || null,
        trabajoEmail: data.trabajoEmail?.trim() || null,
        parejaNombre: data.parejaNombre?.trim() || null,
        parejaTelefono: data.parejaTelefono?.trim() || null,
        contactoEmergenciaNombre: data.contactoEmergenciaNombre?.trim() || null,
        contactoEmergenciaTelefono: data.contactoEmergenciaTelefono?.trim() || null,
        situacionSalud: data.situacionSalud?.trim() || null,
        observaciones: data.observaciones?.trim() || null,
        // Convertir fechas vacías a null
        fechaNacimiento: data.fechaNacimiento || null,
        fechaIniciacion: data.fechaIniciacion || null,
        fechaAumentoSalario: data.fechaAumentoSalario || null,
        fechaExaltacion: data.fechaExaltacion || null,
      };

      if (isEditing) {
        await dispatch(updateMiembro({ id: miembro.id, data: submitData })).unwrap();
        toast.success('Miembro actualizado exitosamente');
      } else {
        await dispatch(createMiembro(submitData)).unwrap();
        toast.success('Miembro creado exitosamente');
      }
      
      onSuccess && onSuccess();
    } catch (error) {
      // El error ya se maneja en el slice
      console.error('Error al guardar miembro:', error);
    }
  };

  const tabs = [
    {
      id: 'personal',
      label: 'Información Personal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'contacto',
      label: 'Contacto',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      id: 'profesional',
      label: 'Información Profesional',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 002 2h2a2 2 0 002-2V6" />
        </svg>
      ),
    },
    {
      id: 'familia',
      label: 'Información Familiar',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 'masonico',
      label: 'Información Masónica',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
  ];

  const renderTabContent = () => {
    switch (currentTab) {
      case 'personal':
        return (
          <div className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Nombres *
                </label>
                <input
                  {...register('nombres', {
                    required: 'Los nombres son obligatorios',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                  })}
                  className="orpheo-input w-full"
                  placeholder="Ingrese los nombres"
                />
                {errors.nombres && (
                  <p className="mt-1 text-sm text-red-400">{errors.nombres.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Apellidos *
                </label>
                <input
                  {...register('apellidos', {
                    required: 'Los apellidos son obligatorios',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                  })}
                  className="orpheo-input w-full"
                  placeholder="Ingrese los apellidos"
                />
                {errors.apellidos && (
                  <p className="mt-1 text-sm text-red-400">{errors.apellidos.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  RUT *
                </label>
                <input
                  {...register('rut', {
                    required: 'El RUT es obligatorio',
                    validate: (value) => validateRUT(value) || 'RUT inválido'
                  })}
                  className="orpheo-input w-full"
                  placeholder="12.345.678-9"
                  maxLength={12}
                />
                {errors.rut && (
                  <p className="mt-1 text-sm text-red-400">{errors.rut.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Fecha de Nacimiento
                </label>
                <input
                  {...register('fechaNacimiento')}
                  type="date"
                  className="orpheo-input w-full"
                />
              </div>
            </div>

            {/* Grado y cargo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Grado *
                </label>
                <select
                  {...register('grado', { required: 'El grado es obligatorio' })}
                  className="orpheo-input w-full"
                >
                  {Object.entries(GRADOS_DISPLAY).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.grado && (
                  <p className="mt-1 text-sm text-red-400">{errors.grado.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Cargo
                </label>
                <select
                  {...register('cargo')}
                  className="orpheo-input w-full"
                >
                  <option value="">Sin cargo específico</option>
                  {Object.entries(CARGOS_DISPLAY).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 'contacto':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Email
                </label>
                <input
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  type="email"
                  className="orpheo-input w-full"
                  placeholder="ejemplo@correo.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Teléfono
                </label>
                <input
                  {...register('telefono')}
                  type="tel"
                  className="orpheo-input w-full"
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-text mb-2">
                Dirección
              </label>
              <textarea
                {...register('direccion')}
                className="orpheo-input w-full"
                rows={3}
                placeholder="Dirección completa"
              />
            </div>
          </div>
        );

      case 'profesional':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Profesión
                </label>
                <input
                  {...register('profesion')}
                  className="orpheo-input w-full"
                  placeholder="Ej: Ingeniero, Médico, Profesor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Ocupación Actual
                </label>
                <input
                  {...register('ocupacion')}
                  className="orpheo-input w-full"
                  placeholder="Cargo o función actual"
                />
              </div>
            </div>

            <div className="border-t border-gray-border pt-6">
              <h4 className="text-lg font-medium text-primary-gold mb-4">Información Laboral</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-text mb-2">
                    Nombre de la Empresa/Institución
                  </label>
                  <input
                    {...register('trabajoNombre')}
                    className="orpheo-input w-full"
                    placeholder="Nombre del lugar de trabajo"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-text mb-2">
                      Teléfono Laboral
                    </label>
                    <input
                      {...register('trabajoTelefono')}
                      type="tel"
                      className="orpheo-input w-full"
                      placeholder="Teléfono del trabajo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-text mb-2">
                      Email Laboral
                    </label>
                    <input
                      {...register('trabajoEmail', {
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email inválido'
                        }
                      })}
                      type="email"
                      className="orpheo-input w-full"
                      placeholder="email@trabajo.com"
                    />
                    {errors.trabajoEmail && (
                      <p className="mt-1 text-sm text-red-400">{errors.trabajoEmail.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-text mb-2">
                    Dirección Laboral
                  </label>
                  <textarea
                    {...register('trabajoDireccion')}
                    className="orpheo-input w-full"
                    rows={2}
                    placeholder="Dirección del lugar de trabajo"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'familia':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-border pb-6">
              <h4 className="text-lg font-medium text-primary-gold mb-4">Información de Pareja</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-text mb-2">
                    Nombre de la Pareja
                  </label>
                  <input
                    {...register('parejaNombre')}
                    className="orpheo-input w-full"
                    placeholder="Nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-text mb-2">
                    Teléfono de la Pareja
                  </label>
                  <input
                    {...register('parejaTelefono')}
                    type="tel"
                    className="orpheo-input w-full"
                    placeholder="Teléfono de contacto"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-primary-gold mb-4">Contacto de Emergencia</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-text mb-2">
                    Nombre del Contacto de Emergencia
                  </label>
                  <input
                    {...register('contactoEmergenciaNombre')}
                    className="orpheo-input w-full"
                    placeholder="Nombre y relación (ej: Juan Pérez - Hermano)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-text mb-2">
                    Teléfono de Emergencia
                  </label>
                  <input
                    {...register('contactoEmergenciaTelefono')}
                    type="tel"
                    className="orpheo-input w-full"
                    placeholder="Teléfono de emergencia"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-text mb-2">
                Situación de Salud
              </label>
              <textarea
                {...register('situacionSalud')}
                className="orpheo-input w-full"
                rows={3}
                placeholder="Información relevante sobre condiciones médicas, alergias, medicamentos, etc."
              />
              <p className="mt-1 text-xs text-gray-border">
                Esta información es confidencial y solo será accesible por el Hospitalario y autoridades de la Logia.
              </p>
            </div>
          </div>
        );

      case 'masonico':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-text mb-2">
                  Fecha de Iniciación
                </label>
                <input
                  {...register('fechaIniciacion')}
                  type="date"
                  className="orpheo-input w-full"
                />
              </div>

              {(watchedGrado === 'companero' || watchedGrado === 'maestro') && (
                <div>
                  <label className="block text-sm font-medium text-gray-text mb-2">
                    Fecha de Aumento de Salario
                  </label>
                  <input
                    {...register('fechaAumentoSalario')}
                    type="date"
                    className="orpheo-input w-full"
                  />
                </div>
              )}

              {watchedGrado === 'maestro' && (
                <div>
                  <label className="block text-sm font-medium text-gray-text mb-2">
                    Fecha de Exaltación
                  </label>
                  <input
                    {...register('fechaExaltacion')}
                    type="date"
                    className="orpheo-input w-full"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-text mb-2">
                Observaciones
              </label>
              <textarea
                {...register('observaciones')}
                className="orpheo-input w-full"
                rows={4}
                placeholder="Observaciones adicionales, reconocimientos, participación en comités, etc."
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-primary-black-secondary border border-gray-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-border">
          <h2 className="text-xl font-serif font-bold text-primary-gold">
            {isEditing ? 'Editar Miembro' : 'Nuevo Miembro'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-border hover:text-primary-gold transition-colors"
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
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
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
              className="px-6 py-2 border border-gray-border text-gray-text rounded-lg hover:border-primary-gold hover:text-primary-gold transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="orpheo-button relative"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-primary-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </div>
              ) : (
                isEditing ? 'Actualizar Miembro' : 'Crear Miembro'
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default MiembroForm;