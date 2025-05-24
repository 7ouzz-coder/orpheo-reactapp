import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectUser } from '../../store/slices/authSlice';
import { 
  getGradoDisplayName, 
  getCargoDisplayName, 
  formatDate, 
  getInitials 
} from '../../utils/helpers';

const MiembroDetail = ({ miembro, onEdit, onClose }) => {
  const user = useSelector(selectUser);
  
  const canManageMembers = user?.role === 'admin' || user?.role === 'superadmin' || 
                          user?.cargo === 'secretario';

  const getGradoColor = (grado) => {
    const colors = {
      aprendiz: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      companero: 'text-green-400 bg-green-400/10 border-green-400/20',
      maestro: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    };
    return colors[grado] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  const InfoSection = ({ title, children, icon }) => (
    <div className="orpheo-card">
      <div className="flex items-center space-x-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-primary-gold">{title}</h3>
      </div>
      {children}
    </div>
  );

  const InfoRow = ({ label, value, fullWidth = false }) => (
    <div className={`${fullWidth ? 'col-span-2' : ''}`}>
      <dt className="text-sm font-medium text-gray-border">{label}</dt>
      <dd className="mt-1 text-gray-text">{value || 'No especificado'}</dd>
    </div>
  );

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
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-gold rounded-full flex items-center justify-center">
              <span className="text-primary-black font-bold text-xl">
                {getInitials(miembro.nombreCompleto)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-primary-gold">
                {miembro.nombreCompleto}
              </h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getGradoColor(miembro.grado)}`}>
                  {getGradoDisplayName(miembro.grado)}
                </span>
                {miembro.cargo && (
                  <span className="text-gray-text text-sm">
                    {getCargoDisplayName(miembro.cargo)}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canManageMembers && (
              <button
                onClick={onEdit}
                className="orpheo-button flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Editar</span>
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

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Información Personal */}
          <InfoSection
            title="Información Personal"
            icon={
              <svg className="w-5 h-5 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          >
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Nombres" value={miembro.nombres} />
              <InfoRow label="Apellidos" value={miembro.apellidos} />
              <InfoRow label="RUT" value={miembro.rut} />
              <InfoRow label="Fecha de Nacimiento" value={miembro.fechaNacimiento ? formatDate(miembro.fechaNacimiento) : null} />
              {miembro.edad && (
                <InfoRow label="Edad" value={`${miembro.edad} años`} />
              )}
            </dl>
          </InfoSection>

          {/* Información de Contacto */}
          <InfoSection
            title="Información de Contacto"
            icon={
              <svg className="w-5 h-5 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          >
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Email" value={miembro.email} />
              <InfoRow label="Teléfono" value={miembro.telefono} />
              <InfoRow label="Dirección" value={miembro.direccion} fullWidth />
            </dl>
          </InfoSection>

          {/* Información Profesional */}
          {(miembro.profesion || miembro.ocupacion || miembro.trabajoNombre) && (
            <InfoSection
              title="Información Profesional"
              icon={
                <svg className="w-5 h-5 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 002 2h2a2 2 0 002-2V6" />
                </svg>
              }
            >
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Profesión" value={miembro.profesion} />
                <InfoRow label="Ocupación Actual" value={miembro.ocupacion} />
                <InfoRow label="Empresa/Institución" value={miembro.trabajoNombre} />
                <InfoRow label="Teléfono Laboral" value={miembro.trabajoTelefono} />
                <InfoRow label="Email Laboral" value={miembro.trabajoEmail} />
                <InfoRow label="Dirección Laboral" value={miembro.trabajoDireccion} fullWidth />
              </dl>
            </InfoSection>
          )}

          {/* Información Familiar */}
          {(miembro.parejaNombre || miembro.contactoEmergenciaNombre) && (
            <InfoSection
              title="Información Familiar"
              icon={
                <svg className="w-5 h-5 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            >
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Pareja" value={miembro.parejaNombre} />
                <InfoRow label="Teléfono de Pareja" value={miembro.parejaTelefono} />
                <InfoRow label="Contacto de Emergencia" value={miembro.contactoEmergenciaNombre} />
                <InfoRow label="Teléfono de Emergencia" value={miembro.contactoEmergenciaTelefono} />
              </dl>
            </InfoSection>
          )}

          {/* Información Masónica */}
          <InfoSection
            title="Información Masónica"
            icon={
              <svg className="w-5 h-5 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          >
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Grado" value={getGradoDisplayName(miembro.grado)} />
              <InfoRow label="Cargo" value={miembro.cargo ? getCargoDisplayName(miembro.cargo) : null} />
              <InfoRow label="Fecha de Iniciación" value={miembro.fechaIniciacion ? formatDate(miembro.fechaIniciacion) : null} />
              {miembro.fechaAumentoSalario && (
                <InfoRow label="Fecha de Aumento de Salario" value={formatDate(miembro.fechaAumentoSalario)} />
              )}
              {miembro.fechaExaltacion && (
                <InfoRow label="Fecha de Exaltación" value={formatDate(miembro.fechaExaltacion)} />
              )}
              {miembro.observaciones && (
                <InfoRow label="Observaciones" value={miembro.observaciones} fullWidth />
              )}
            </dl>
          </InfoSection>

          {/* Estado del Usuario */}
          <InfoSection
            title="Acceso al Sistema"
            icon={
              <svg className="w-5 h-5 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          >
            <div className="space-y-4">
              {miembro.usuario ? (
                <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div>
                      <p className="text-green-400 font-medium">Usuario del Sistema</p>
                      <p className="text-sm text-gray-text">
                        Username: {miembro.usuario.username}
                      </p>
                      {miembro.usuario.lastLogin && (
                        <p className="text-xs text-gray-border">
                          Último acceso: {formatDate(miembro.usuario.lastLogin, 'dd/MM/yyyy HH:mm')}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    miembro.usuario.isActive 
                      ? 'bg-green-400/10 text-green-400' 
                      : 'bg-red-400/10 text-red-400'
                  }`}>
                    {miembro.usuario.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gray-900/20 border border-gray-500/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div>
                      <p className="text-gray-400 font-medium">Sin acceso al sistema</p>
                      <p className="text-sm text-gray-border">
                        Este miembro no tiene usuario creado
                      </p>
                    </div>
                  </div>
                  {canManageMembers && (
                    <button className="px-3 py-1 text-xs text-primary-gold border border-primary-gold rounded hover:bg-primary-gold/10 transition-colors">
                      Crear Usuario
                    </button>
                  )}
                </div>
              )}
            </div>
          </InfoSection>

          {/* Situación de Salud (solo para ciertos cargos) */}
          {miembro.situacionSalud && (user?.cargo === 'hospitalario' || user?.role === 'admin' || user?.role === 'superadmin') && (
            <InfoSection
              title="Situación de Salud"
              icon={
                <svg className="w-5 h-5 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              }
            >
              <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                <p className="text-orange-400 text-sm font-medium mb-2">
                  ⚠️ Información Confidencial
                </p>
                <p className="text-gray-text">{miembro.situacionSalud}</p>
              </div>
            </InfoSection>
          )}

          {/* Metadatos */}
          <InfoSection
            title="Información del Registro"
            icon={
              <svg className="w-5 h-5 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Fecha de Registro" value={formatDate(miembro.createdAt, 'dd/MM/yyyy HH:mm')} />
              <InfoRow label="Última Actualización" value={formatDate(miembro.updatedAt, 'dd/MM/yyyy HH:mm')} />
              <InfoRow label="Estado" value={miembro.vigente ? 'Vigente' : 'No vigente'} />
            </dl>
          </InfoSection>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MiembroDetail;