#!/bin/bash

echo "🚀 Inicializando proyecto Orpheo Backend completamente..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ===== 1. VERIFICAR DEPENDENCIAS =====
echo -e "${BLUE}📋 Verificando dependencias...${NC}"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencias verificadas${NC}"

# ===== 2. INSTALAR DEPENDENCIAS NPM =====
echo -e "${BLUE}📦 Instalando dependencias npm...${NC}"
npm install

# ===== 3. CREAR DIRECTORIOS NECESARIOS =====
echo -e "${BLUE}📁 Creando directorios...${NC}"
mkdir -p uploads
mkdir -p logs

# ===== 4. CONFIGURAR BASE DE DATOS =====
echo -e "${BLUE}🗄️ Configurando base de datos PostgreSQL...${NC}"

# Verificar si la base de datos existe
DB_EXISTS=$(psql -U postgres -lqt | cut -d \| -f 1 | grep -qw orpheo_db; echo $?)

if [ $DB_EXISTS -eq 0 ]; then
    echo -e "${YELLOW}⚠️ La base de datos orpheo_db ya existe${NC}"
    read -p "¿Quieres recrearla? (esto eliminará todos los datos) [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🗑️ Eliminando base de datos existente...${NC}"
        psql -U postgres -c "DROP DATABASE IF EXISTS orpheo_db;"
        psql -U postgres -c "DROP USER IF EXISTS orpheo_user;"
    else
        echo -e "${GREEN}✅ Usando base de datos existente${NC}"
        DB_EXISTS=1
    fi
fi

if [ $DB_EXISTS -ne 0 ]; then
    echo -e "${BLUE}🔧 Creando base de datos y usuario...${NC}"
    
    # Ejecutar script de inicialización de base de datos
    psql -U postgres -f src/scripts/database_init.sql
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Base de datos creada exitosamente${NC}"
    else
        echo -e "${RED}❌ Error al crear la base de datos${NC}"
        exit 1
    fi
fi

# ===== 5. EJECUTAR MIGRACIONES =====
echo -e "${BLUE}🔄 Ejecutando migraciones...${NC}"
npm run migrate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migraciones ejecutadas exitosamente${NC}"
else
    echo -e "${RED}❌ Error al ejecutar migraciones${NC}"
    exit 1
fi

# ===== 6. EJECUTAR SEEDERS =====
echo -e "${BLUE}🌱 Insertando datos iniciales (seeders)...${NC}"
npm run seed

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Datos iniciales insertados exitosamente${NC}"
else
    echo -e "${YELLOW}⚠️ Advertencia: Error al insertar datos iniciales${NC}"
fi

# ===== 7. VERIFICAR ARCHIVO .env =====
echo -e "${BLUE}⚙️ Verificando configuración...${NC}"

if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️ Archivo .env no encontrado, creándolo...${NC}"
    cat > .env << EOF
# ===== CONFIGURACIÓN DEL SERVIDOR =====
NODE_ENV=development
PORT=3001

# ===== BASE DE DATOS =====
DB_HOST=localhost
DB_PORT=5432
DB_NAME=orpheo_db
DB_USERNAME=orpheo_user
DB_PASSWORD=orpheo_secure_2025

# URL completa de la base de datos
DATABASE_URL=postgresql://orpheo_user:orpheo_secure_2025@localhost:5432/orpheo_db

# ===== JWT CONFIGURACIÓN =====
JWT_SECRET=orpheo-jwt-secret-super-seguro-cambiar-en-produccion-2025
JWT_EXPIRY=1h
REFRESH_TOKEN_SECRET=orpheo-refresh-token-secret-super-seguro-2025
REFRESH_TOKEN_EXPIRY=30d

# ===== CORS =====
CORS_ORIGIN=http://localhost:3000

# ===== LOGGING =====
LOG_LEVEL=info

# ===== UPLOAD CONFIGURACIÓN =====
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# ===== WEBSOCKET =====
SOCKET_CORS_ORIGIN=http://localhost:3000
EOF
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
else
    echo -e "${GREEN}✅ Archivo .env encontrado${NC}"
fi

# ===== 8. VERIFICAR PERMISOS DE DIRECTORIOS =====
echo -e "${BLUE}🔐 Verificando permisos...${NC}"
chmod 755 uploads
chmod 755 logs

# ===== 9. MOSTRAR RESUMEN =====
echo -e "${GREEN}"
echo "🎉 =================================="
echo "   INICIALIZACIÓN COMPLETADA"
echo "===================================="
echo -e "${NC}"
echo -e "${BLUE}📊 Resumen:${NC}"
echo "✅ Dependencias npm instaladas"
echo "✅ Base de datos PostgreSQL configurada"
echo "✅ Migraciones ejecutadas"
echo "✅ Datos iniciales insertados"
echo "✅ Directorios creados"
echo "✅ Permisos configurados"
echo ""
echo -e "${YELLOW}🚀 Para iniciar el servidor:${NC}"
echo "   npm run dev"
echo ""
echo -e "${YELLOW}📝 Usuarios de prueba creados:${NC}"
echo "   admin/password123 (Super Admin)"
echo "   venerable/password123 (Admin - Venerable Maestro)"
echo "   secretario/password123 (Admin - Secretario)"
echo "   maestro1/password123 (General - Maestro)"
echo "   companero1/password123 (General - Compañero)"
echo "   aprendiz1/password123 (General - Aprendiz)"
echo ""
echo -e "${BLUE}🌐 URLs importantes:${NC}"
echo "   API: http://localhost:3001/api"
echo "   Health: http://localhost:3001/health"
echo "   Uploads: http://localhost:3001/uploads"
echo ""
echo -e "${GREEN}¡Listo para usar! 🚀${NC}"