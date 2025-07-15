# ===========================================
# SCRIPT DE INICIALIZACIÓN DOCKER - ORPHEO
# ===========================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Iniciando Sistema Orpheo con Docker...${NC}"
echo "========================================="

# Detectar carpeta raíz del proyecto correctamente
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "🔍 Script ubicado en: $SCRIPT_DIR"

# Subir 3 niveles: src/scripts -> src -> orpheo-backend -> orpheo-project
PROJECT_ROOT="$(dirname "$(dirname "$(dirname "$SCRIPT_DIR")")")"
echo "📁 Carpeta raíz detectada: $PROJECT_ROOT"

# Ir a la carpeta raíz
cd "$PROJECT_ROOT"
echo "📁 Directorio actual: $(pwd)"

# Verificar estructura del proyecto
echo -e "${BLUE}🔍 Verificando estructura del proyecto...${NC}"

# Mostrar lo que hay en la carpeta actual
echo "📍 Contenido de la carpeta actual:"
ls -la

# Verificar que existe package.json
if [ -f "orpheo-backend/package.json" ]; then
    echo -e "${GREEN}✅ package.json encontrado en orpheo-backend/${NC}"
else
    echo -e "${RED}❌ No se encontró package.json en orpheo-backend/${NC}"
    echo "🔍 Buscando package.json..."
    find . -name "package.json" -type f 2>/dev/null || echo "No se encontró package.json"
    exit 1
fi

# Verificar que existe server.js
if [ -f "orpheo-backend/src/server.js" ]; then
    echo -e "${GREEN}✅ server.js encontrado en orpheo-backend/src/${NC}"
else
    echo -e "${RED}❌ No se encontró server.js en orpheo-backend/src/${NC}"
    exit 1
fi

# Crear directorios necesarios
echo -e "${BLUE}📂 Creando directorios necesarios...${NC}"
mkdir -p orpheo-backend/uploads
mkdir -p orpheo-backend/logs
chmod 755 orpheo-backend/uploads 2>/dev/null || true
chmod 755 orpheo-backend/logs 2>/dev/null || true

# Crear .env si no existe
if [ ! -f orpheo-backend/.env ]; then
    echo -e "${YELLOW}⚙️ Creando archivo .env...${NC}"
    cat > orpheo-backend/.env << 'ENVEOF'
NODE_ENV=development
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_NAME=orpheo_db
DB_USERNAME=orpheo_user
DB_PASSWORD=orpheo_secure_2025
DATABASE_URL=postgresql://orpheo_user:orpheo_secure_2025@postgres:5432/orpheo_db
JWT_SECRET=orpheo-jwt-secret-super-seguro-cambiar-en-produccion-2025
JWT_EXPIRY=1h
REFRESH_TOKEN_SECRET=orpheo-refresh-token-secret-super-seguro-2025
REFRESH_TOKEN_EXPIRY=30d
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
SOCKET_CORS_ORIGIN=http://localhost:3000
ENVEOF
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
else
    echo -e "${GREEN}✅ Archivo .env encontrado${NC}"
fi

# Crear docker-compose.yml si no existe
if [ ! -f docker-compose.yml ]; then
    echo -e "${YELLOW}⚙️ Creando docker-compose.yml...${NC}"
    cat > docker-compose.yml << 'DOCKEREOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: orpheo-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: orpheo_db
      POSTGRES_USER: orpheo_user
      POSTGRES_PASSWORD: orpheo_secure_2025
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U orpheo_user -d orpheo_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: 
      context: ./orpheo-backend
      dockerfile: Dockerfile
    container_name: orpheo-backend
    restart: unless-stopped
    environment:
      NODE_ENV: development
      PORT: 3001
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: orpheo_db
      DB_USERNAME: orpheo_user
      DB_PASSWORD: orpheo_secure_2025
      JWT_SECRET: orpheo-jwt-secret-super-seguro-cambiar-en-produccion-2025
      JWT_EXPIRY: 1h
      REFRESH_TOKEN_SECRET: orpheo-refresh-token-secret-super-seguro-2025
      REFRESH_TOKEN_EXPIRY: 30d
      CORS_ORIGIN: http://localhost:3000
      LOG_LEVEL: info
      UPLOAD_PATH: ./uploads
      MAX_FILE_SIZE: 10485760
      SOCKET_CORS_ORIGIN: http://localhost:3000
    ports:
      - "3001:3001"
    volumes:
      - ./orpheo-backend/uploads:/app/uploads
      - ./orpheo-backend/logs:/app/logs
    depends_on:
      postgres:
        condition: service_healthy

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: orpheo-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@orpheo.local
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
    driver: local
DOCKEREOF
    echo -e "${GREEN}✅ docker-compose.yml creado${NC}"
else
    echo -e "${GREEN}✅ docker-compose.yml encontrado${NC}"
fi

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi

# Detectar comando de compose
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    echo -e "${RED}❌ No se encontró docker-compose ni 'docker compose'${NC}"
    exit 1
fi

echo -e "${BLUE}🐳 Usando: $COMPOSE_CMD${NC}"

# Limpiar contenedores anteriores
echo -e "${YELLOW}🧹 Limpiando contenedores anteriores...${NC}"
$COMPOSE_CMD down --remove-orphans 2>/dev/null || true

# Iniciar servicios
echo -e "${BLUE}🗄️ Iniciando PostgreSQL...${NC}"
$COMPOSE_CMD up -d postgres

echo -e "${YELLOW}⏳ Esperando PostgreSQL...${NC}"
sleep 15

echo -e "${BLUE}🚀 Iniciando backend...${NC}"
$COMPOSE_CMD up -d backend

echo -e "${BLUE}📊 Iniciando pgAdmin...${NC}"
$COMPOSE_CMD up -d pgadmin

echo -e "${GREEN}✅ Servicios iniciados!${NC}"
echo -e "${BLUE}🔗 URLs:${NC}"
echo -e "   Backend: http://localhost:3001"
echo -e "   Health: http://localhost:3001/health"
echo -e "   pgAdmin: http://localhost:5050"

echo -e "${BLUE}📊 Estado de contenedores:${NC}"
$COMPOSE_CMD ps