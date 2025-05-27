-- Crear base de datos y usuario
DROP DATABASE IF EXISTS orpheo_db;
DROP USER IF EXISTS orpheo_user;

CREATE USER orpheo_user WITH PASSWORD 'orpheo_secure_2025';
CREATE DATABASE orpheo_db OWNER orpheo_user;

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE orpheo_db TO orpheo_user;

-- Conectar a la base de datos
\c orpheo_db orpheo_user;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsqueda full-text
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- Para búsqueda sin acentos

-- Configurar timezone para Chile
SET timezone = 'America/Santiago';

-- Verificar que todo esté correcto
SELECT current_database(), current_user, now();

-- Mostrar extensiones instaladas
SELECT name, default_version FROM pg_available_extensions 
WHERE name IN ('uuid-ossp', 'pg_trgm', 'unaccent');

\echo 'Base de datos orpheo_db creada exitosamente!'
\echo 'Usuario: orpheo_user'
\echo 'Base de datos: orpheo_db'
\echo 'Timezone: America/Santiago'