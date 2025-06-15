// Tipos para gestión de documentos
export interface Documento {
  id: string;
  titulo: string;
  tipo: 'plancha' | 'acta' | 'circular' | 'reglamento' | 'carta' | 'informe' | 'otro';
  autor: string;
  autorId: string;
  grado: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'revision';
  fechaCreacion: string;
  fechaModificacion: string;
  fechaAprobacion?: string;
  aprobadoPor?: string;
  categoria?: string;
  tags: string[];
  resumen?: string;
  archivo: string;
  tamaño: number;
  versiones: number;
  descargas: number;
  visibilidad: string[];
  comentarios: number;
}

export interface DocumentoComentario {
  id: string;
  autor: string;
  autorId: string;
  fecha: string;
  comentario: string;
  grado: string;
}

export interface DocumentoVersion {
  version: number;
  fecha: string;
  autor: string;
  cambios: string;
  actual: boolean;
}

export interface DocumentoDetalle extends Documento {
  contenido?: string;
  comentarios: DocumentoComentario[];
  historialVersiones: DocumentoVersion[];
}

export interface DocumentoFormData {
  titulo: string;
  tipo: 'plancha' | 'acta' | 'circular' | 'reglamento' | 'carta' | 'informe' | 'otro';
  categoria?: string;
  tags?: string;
  resumen?: string;
  visibilidad: string[];
  archivo: any; // File object para upload
}

export interface DocumentosFilters {
  search: string;
  tipo: string;
  estado: string;
  categoria: string;
  grado: string;
}

export interface DocumentosState {
  documentos: Documento[];
  currentDocumento: DocumentoDetalle | null;
  isLoading: boolean;
  error: string | null;
  filters: DocumentosFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalDocumentos: number;
    porTipo: Record<string, number>;
    porEstado: Record<string, number>;
    porGrado: Record<string, number>;
    descargasTotal: number;
    documentosRecientes: number;
  };
  uploadProgress: number;
  isUploading: boolean;
}

export interface DocumentoStats {
  totalDocumentos: number;
  porTipo: Record<string, number>;
  porEstado: Record<string, number>;
  porGrado: Record<string, number>;
  descargasTotal: number;
  documentosRecientes: number;
}