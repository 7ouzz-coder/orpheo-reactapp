#!/bin/bash

# Script para desplegar el backend en servidor
set -e

echo "��� Desplegando Orpheo Backend en Servidor..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi

# Detectar comando compose
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ No se encontró docker-compose"
    exit 1
fi

# Crear directorios necesarios
mkdir -p uploads logs

# Parar servicios anteriores
echo "��� Parando servicios anteriores..."
$COMPOSE_CMD down --remove-orphans || true

# Construir imagen
echo "���️ Construyendo imagen..."
$COMPOSE_CMD build --no-cache backend

# Iniciar servicios
echo "���️ Iniciando PostgreSQL..."
$COMPOSE_CMD up -d postgres

echo "⏳ Esperando PostgreSQL..."
sleep 20

echo "��� Iniciando backend..."
$COMPOSE_CMD up -d backend

echo "✅ Backend desplegado!"
echo "��� Backend API: http://$(hostname -I | awk '{print $1}'):3001"
echo "��� Health Check: http://$(hostname -I | awk '{print $1}'):3001/health"

# Mostrar logs
echo "��� Logs del backend:"
$COMPOSE_CMD logs backend --tail=20

# Mostrar estado
echo "��� Estado de servicios:"
$COMPOSE_CMD ps

# Instrucciones para el frontend
echo ""
echo "��� Para conectar el frontend:"
echo "   API_URL: http://$(hostname -I | awk '{print $1}'):3001"
echo "   WebSocket: ws://$(hostname -I | awk '{print $1}'):3001"
