-- ============================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
-- Sistema Orpheo - Gestión Masónica
-- ============================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Verificar si la base de datos existe
SELECT 'CREATE DATABASE orpheo_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'orpheo_db')\gexec

-- Conectar a la base de datos orpheo_db
\c orpheo_db;

-- Crear usuario específico si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'orpheo_user') THEN
        CREATE USER orpheo_user WITH PASSWORD 'orpheo_password_123';
    END IF;
END
$$;

-- Otorgar permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE orpheo_db TO orpheo_user;
GRANT ALL ON SCHEMA public TO orpheo_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO orpheo_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO orpheo_user;

-- Configurar permisos por defecto para tablas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO orpheo_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO orpheo_user;

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para validar RUT chileno
CREATE OR REPLACE FUNCTION validar_rut(rut_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    rut_clean TEXT;
    rut_numbers TEXT;
    verificador CHAR(1);
    suma INTEGER := 0;
    multiplicador INTEGER := 2;
    resto INTEGER;
    dv_calculado CHAR(1);
BEGIN
    -- Limpiar RUT (quitar puntos y guiones)
    rut_clean := UPPER(REPLACE(REPLACE(rut_input, '.', ''), '-', ''));
    
    -- Verificar formato básico
    IF LENGTH(rut_clean) < 8 OR LENGTH(rut_clean) > 9 THEN
        RETURN FALSE;
    END IF;
    
    -- Separar números y dígito verificador
    rut_numbers := SUBSTRING(rut_clean, 1, LENGTH(rut_clean) - 1);
    verificador := SUBSTRING(rut_clean, LENGTH(rut_clean), 1);
    
    -- Verificar que los números sean válidos
    IF rut_numbers !~ '^[0-9]+$' THEN
        RETURN FALSE;
    END IF;
    
    -- Calcular dígito verificador
    FOR i IN REVERSE LENGTH(rut_numbers)..1 LOOP
        suma := suma + (SUBSTRING(rut_numbers, i, 1)::INTEGER * multiplicador);
        multiplicador := multiplicador + 1;
        IF multiplicador > 7 THEN
            multiplicador := 2;
        END IF;
    END LOOP;
    
    resto := suma % 11;
    
    IF resto = 0 THEN
        dv_calculado := '0';
    ELSIF resto = 1 THEN
        dv_calculado := 'K';
    ELSE
        dv_calculado := (11 - resto)::CHAR(1);
    END IF;
    
    RETURN verificador = dv_calculado;
END;
$$ LANGUAGE plpgsql;

-- Función para normalizar nombres
CREATE OR REPLACE FUNCTION normalizar_nombre(nombre_input TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN INITCAP(TRIM(nombre_input));
END;
$$ LANGUAGE plpgsql;

-- Función para generar slug único
CREATE OR REPLACE FUNCTION generar_slug(texto TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                    UNACCENT(texto),
                    'ñ', 'n'), 'Ñ', 'N'),
                    'ü', 'u'), 'Ü', 'U'),
                    'ç', 'c'), 'Ç', 'C'),
                    'ß', 'ss'
                ),
                '[^a-zA-Z0-9\s-]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS PARA AUDITORÍA
-- ============================================

-- Función genérica para timestamps
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista para estadísticas de miembros
CREATE OR REPLACE VIEW vista_estadisticas_miembros AS
SELECT 
    grado,
    estado,
    COUNT(*) as cantidad,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as porcentaje
FROM miembros 
GROUP BY grado, estado
ORDER BY grado, estado;

-- Vista para documentos recientes
CREATE OR REPLACE VIEW vista_documentos_recientes AS
SELECT 
    d.id,
    d.nombre,
    d.categoria,
    d.tipo,
    d.estado,
    d.created_at,
    u.nombres || ' ' || u.apellidos as autor_nombre
FROM documentos d
LEFT JOIN users u ON d.autor_id = u.id
ORDER BY d.created_at DESC
LIMIT 50;

-- Vista para próximos programas
CREATE OR REPLACE VIEW vista_proximos_programas AS
SELECT 
    p.id,
    p.titulo,
    p.tipo,
    p.grado_requerido,
    p.fecha_inicio,
    p.ubicacion,
    p.estado,
    u.nombres || ' ' || u.apellidos as creador_nombre,
    COUNT(a.id) as asistencias_confirmadas
FROM programas p
LEFT JOIN users u ON p.creado_por = u.id
LEFT JOIN asistencias a ON p.id = a.programa_id AND a.estado = 'confirmado'
WHERE p.fecha_inicio > NOW()
GROUP BY p.id, u.nombres, u.apellidos
ORDER BY p.fecha_inicio ASC;

-- ============================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ============================================

-- Índices para búsqueda de texto completo
CREATE INDEX IF NOT EXISTS idx_miembros_busqueda 
ON miembros USING gin(to_tsvector('spanish', nombres || ' ' || apellidos || ' ' || COALESCE(profesion, '')));

CREATE INDEX IF NOT EXISTS idx_documentos_busqueda 
ON documentos USING gin(to_tsvector('spanish', nombre || ' ' || COALESCE(descripcion, '')));

-- Índices para filtros frecuentes
CREATE INDEX IF NOT EXISTS idx_documentos_categoria_estado ON documentos(categoria, estado);
CREATE INDEX IF NOT EXISTS idx_miembros_grado_estado ON miembros(grado, estado);
CREATE INDEX IF NOT EXISTS idx_programas_fecha_estado ON programas(fecha_inicio, estado);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_leida ON notificaciones(usuario_id, leida);

-- Índices parciales para optimizar consultas específicas
CREATE INDEX IF NOT EXISTS idx_documentos_pendientes 
ON documentos(autor_id, created_at) WHERE estado = 'pendiente';

CREATE INDEX IF NOT EXISTS idx_notificaciones_no_leidas 
ON notificaciones(usuario_id, created_at) WHERE leida = false;

-- ============================================
-- CONFIGURACIONES DE PERFORMANCE
-- ============================================

-- Configurar parámetros para mejor rendimiento
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Configurar collation para búsquedas case-insensitive
CREATE COLLATION IF NOT EXISTS case_insensitive (provider = icu, locale = 'und-u-ks-level2', deterministic = false);

-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE users IS 'Tabla principal de usuarios del sistema';
COMMENT ON TABLE miembros IS 'Registro de miembros de la logia masónica';
COMMENT ON TABLE documentos IS 'Documentos y planchas del sistema';
COMMENT ON TABLE programas IS 'Programación de tenidas y eventos';
COMMENT ON TABLE asistencias IS 'Control de asistencia a programas';
COMMENT ON TABLE notificaciones IS 'Sistema de notificaciones del usuario';

-- ============================================
-- MENSAJE DE FINALIZACIÓN
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Base de datos Orpheo inicializada correctamente';
    RAISE NOTICE 'Usuario: orpheo_user';
    RAISE NOTICE 'Base de datos: orpheo_db';
    RAISE NOTICE 'Extensiones instaladas: uuid-ossp, pg_trgm, btree_gin';
    RAISE NOTICE 'Funciones auxiliares creadas';
    RAISE NOTICE 'Vistas e índices configurados';
END $$;