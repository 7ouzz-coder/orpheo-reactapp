#!/bin/bash

# 🚀 ORPHEO QUICK START - Inicialización Rápida
# Este script configura todo el backend en menos de 2 minutos

echo "🚀 ORPHEO QUICK START"
echo "===================="

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde orpheo-backend/${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Instalando dependencias...${NC}"
npm install --silent

echo -e "${BLUE}📁 Creando directorios...${NC}"
mkdir -p uploads logs

echo -e "${BLUE}🗄️ Configurando PostgreSQL...${NC}"

# Verificar si PostgreSQL está corriendo
if ! pg_isready -q; then
    echo -e "${RED}❌ PostgreSQL no está corriendo. Inicia PostgreSQL primero.${NC}"
    echo "macOS: brew services start postgresql"
    echo "Linux: sudo systemctl start postgresql"
    exit 1
fi

# Crear base de datos (ignorar errores si ya existe)
echo -e "${YELLOW}🔧 Creando base de datos...${NC}"
psql -U postgres -c "DROP DATABASE IF EXISTS orpheo_db;" 2>/dev/null
psql -U postgres -c "DROP USER IF EXISTS orpheo_user;" 2>/dev/null
psql -U postgres -c "CREATE USER orpheo_user WITH PASSWORD 'orpheo_secure_2025';" 2>/dev/null
psql -U postgres -c "CREATE DATABASE orpheo_db OWNER orpheo_user;" 2>/dev/null
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE orpheo_db TO orpheo_user;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base de datos creada${NC}"
else
    echo -e "${YELLOW}⚠️ Base de datos ya existe o error menor${NC}"
fi

echo -e "${BLUE}🔄 Ejecutando migraciones...${NC}"
npm run migrate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migraciones completadas${NC}"
else
    echo -e "${RED}❌ Error en migraciones${NC}"
    exit 1
fi

echo -e "${BLUE}🌱 Insertando datos de prueba...${NC}"
npm run seed

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Datos de prueba insertados${NC}"
else
    echo -e "${YELLOW}⚠️ Error en seeders (posiblemente ya existen)${NC}"
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo -e "${BLUE}⚙️ Creando archivo .env...${NC}"
    cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=orpheo_db
DB_USERNAME=orpheo_user
DB_PASSWORD=orpheo_secure_2025
DATABASE_URL=postgresql://orpheo_user:orpheo_secure_2025@localhost:5432/orpheo_db
JWT_SECRET=orpheo-jwt-secret-super-seguro-cambiar-en-produccion-2025
JWT_EXPIRY=1h
REFRESH_TOKEN_SECRET=orpheo-refresh-token-secret-super-seguro-2025
REFRESH_TOKEN_EXPIRY=30d
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
SOCKET_CORS_ORIGIN=http://localhost:3000
EOF
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
fi

echo -e "${GREEN}"
echo "🎉 ¡CONFIGURACIÓN COMPLETADA!"
echo "=========================="
echo -e "${NC}"
echo -e "${YELLOW}🚀 Para iniciar el servidor:${NC}"
echo "   npm run dev"
echo ""
echo -e "${YELLOW}🧪 Usuarios de prueba:${NC}"
echo "   admin/password123"
echo "   venerable/password123"
echo "   secretario/password123"
echo "   maestro1/password123"
echo "   companero1/password123"
echo "   aprendiz1/password123"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo "   Health: http://localhost:3001/health"
echo "   API: http://localhost:3001/api"
echo ""
echo -e "${GREEN}¡Todo listo! 🚀${NC}"