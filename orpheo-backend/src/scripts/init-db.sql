-- Orpheo Database Initialization Script

-- Crear base de datos si no existe
CREATE DATABASE orpheo_db;

-- Crear usuario si no existe
CREATE USER orpheo_user WITH PASSWORD 'orpheo_password';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE orpheo_db TO orpheo_user;

-- Conectar a la base de datos
\c orpheo_db;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Configurar timezone
SET timezone = 'America/Santiago';

-- Crear schema para auditoría (opcional)
CREATE SCHEMA IF NOT EXISTS audit;

-- Función para auditoría automática
CREATE OR REPLACE FUNCTION audit.log_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit.log_table (table_name, operation, row_data, changed_by, changed_at)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), current_user, now());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit.log_table (table_name, operation, row_data, old_row_data, changed_by, changed_at)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), row_to_json(OLD), current_user, now());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit.log_table (table_name, operation, old_row_data, changed_by, changed_at)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), current_user, now());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Tabla de logs de auditoría
CREATE TABLE IF NOT EXISTS audit.log_table (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    row_data JSONB,
    old_row_data JSONB,
    changed_by TEXT DEFAULT current_user,
    changed_at TIMESTAMP DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_table_name ON audit.log_table(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at ON audit.log_table(changed_at);

-- Otorgar permisos al usuario
GRANT ALL ON SCHEMA audit TO orpheo_user;
GRANT ALL ON ALL TABLES IN SCHEMA audit TO orpheo_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA audit TO orpheo_user;