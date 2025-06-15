// Tipos para gestión de programas y asistencia
export interface Programa {
  id: string;
  titulo: string;
  tipo: 'tenida_ordinaria' | 'tenida_extraordinaria' | 'grado' | 'reunion_administrativa' | 'evento_social' | 'conferencia' | 'instalacion';
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  lugar: string;
  estado: 'programado' | 'en_curso' | 'finalizado' | 'cancelado' | 'suspendido';
  organizador: string;
  organizadorId: string;
  gradosPermitidos: string[];
  maxAsistentes: number;
  asistenciasConfirmadas: number;
  asistenciasPendientes: number;
  requiereConfirmacion: boolean;
  recordatorioEnviado: boolean;
  ordenDelDia?: string[];
  agenda?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Asistencia {
  id: string;
  miembroId: string;
  miembro: string;
  grado: string;
  cargo?: string;
  estado: 'confirmada' | 'pendiente' | 'ausente' | 'justificada';
  fechaConfirmacion?: string;
  horaLlegada?: string;
  observaciones?: string;
}

export interface ProgramaDetalle extends Programa {
  asistencias: Asistencia[];
  candidato?: {
    nombre: string;
    edad: number;
    profesion: string;
    padrino: string;
  };
  conferencista?: {
    nombre: string;
    titulo: string;
    biografia?: string;
  };
  notasAdicionales?: string;
}

export interface ProgramaFormData {
  titulo: string;
  tipo: 'tenida_ordinaria' | 'tenida_extraordinaria' | 'grado' | 'reunion_administrativa' | 'evento_social' | 'conferencia' | 'instalacion';
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  lugar: string;
  gradosPermitidos: string[];
  maxAsistentes: number;
  requiereConfirmacion: boolean;
  ordenDelDia?: string[];
  agenda?: string[];
  candidatoNombre?: string;
  padrino?: string;
  conferencistaNombre?: string;
  conferencistaTitulo?: string;
  conferencistaBiografia?: string;
  notasAdicionales?: string;
}

export interface ProgramasFilters {
  search?: string;
  tipo: string;
  estado: string;
  mes: number;
  año: number;
}

export interface ProgramasState {
  programas: Programa[];
  currentPrograma: ProgramaDetalle | null;
  isLoading: boolean;
  error: string | null;
  filters: ProgramasFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalProgramas: number;
    porTipo: Record<string, number>;
    porEstado: Record<string, number>;
    asistenciaPromedio: number;
    proximosEventos: number;
    miembrosActivos: number;
  };
  vistaCalendario: 'mes' | 'semana' | 'dia';
  fechaSeleccionada: string;
  isCreating: boolean;
  isUpdatingAsistencia: boolean;
}

export interface ProgramaStats {
  totalProgramas: number;
  porTipo: Record<string, number>;
  porEstado: Record<string, number>;
  asistenciaPromedio: number;
  proximosEventos: number;
  miembrosActivos: number;
}