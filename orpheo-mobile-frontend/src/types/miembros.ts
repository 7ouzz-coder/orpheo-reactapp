// Tipos para gestión de miembros
export interface Miembro {
  id: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  rut: string;
  grado: 'aprendiz' | 'companero' | 'maestro';
  cargo?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  profesion?: string;
  ocupacion?: string;
  
  // Información laboral
  trabajoNombre?: string;
  trabajoDireccion?: string;
  trabajoTelefono?: string;
  trabajoEmail?: string;
  
  // Información familiar
  parejaNombre?: string;
  parejaTelefono?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  
  // Fechas importantes
  fechaNacimiento?: string;
  fechaIniciacion?: string;
  fechaAumentoSalario?: string;
  fechaExaltacion?: string;
  
  // Información adicional
  situacionSalud?: string;
  observaciones?: string;
  edad?: number;
  vigente: boolean;
  tieneUsuario: boolean;
  
  // Metadatos
  createdAt: string;
  updatedAt: string;
}

export interface MiembroFormData {
  nombres: string;
  apellidos: string;
  rut: string;
  grado: 'aprendiz' | 'companero' | 'maestro';
  cargo?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  profesion?: string;
  ocupacion?: string;
  trabajoNombre?: string;
  trabajoDireccion?: string;
  trabajoTelefono?: string;
  trabajoEmail?: string;
  parejaNombre?: string;
  parejaTelefono?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  fechaNacimiento?: string;
  fechaIniciacion?: string;
  fechaAumentoSalario?: string;
  fechaExaltacion?: string;
  situacionSalud?: string;
  observaciones?: string;
}

export interface MiembrosFilters {
  search: string;
  grado: string;
  vigente: boolean;
}

export interface MiembrosState {
  miembros: Miembro[];
  currentMiembro: Miembro | null;
  isLoading: boolean;
  error: string | null;
  filters: MiembrosFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    total: number;
    porGrado: {
      aprendiz: number;
      companero: number;
      maestro: number;
    };
    conEmail: number;
    conTelefono: number;
  };
}

export interface MiembroStats {
  total: number;
  porGrado: {
    aprendiz: number;
    companero: number;
    maestro: number;
  };
  conEmail: number;
  conTelefono: number;
}