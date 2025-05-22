#!/bin/bash

echo "🚀 Desplegando Orpheo con Docker..."

# Variables
IMAGE_NAME="orpheo-app"
CONTAINER_NAME="orpheo-frontend"
TAG="latest"

# Detener contenedor existente
echo "🛑 Deteniendo contenedor existente..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Construir nueva imagen
echo "🏗️ Construyendo nueva imagen..."
docker build -t $IMAGE_NAME:$TAG .

# Ejecutar nuevo contenedor
echo "▶️ Iniciando nuevo contenedor..."
docker run -d \
  --name $CONTAINER_NAME \
  -p 80:80 \
  -p 443:443 \
  --restart unless-stopped \
  $IMAGE_NAME:$TAG

# Verificar que esté funcionando
sleep 5
if curl -f http://localhost/health > /dev/null 2>&1; then
  echo "✅ Despliegue exitoso!"
else
  echo "❌ Error en el despliegue"
  docker logs $CONTAINER_NAME
  exit 1
fi