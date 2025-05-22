#!/bin/bash

echo "🚀 Iniciando despliegue de producción..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# Ejecutar lints y tests
echo "🔍 Ejecutando lints..."
npm run lint

echo "🧪 Ejecutando tests..."
npm test -- --coverage --watchAll=false

# Build de producción
echo "🏗️ Generando build de producción..."
npm run build

# Verificar que el build sea exitoso
if [ -d "build" ]; then
  echo "✅ Build generado exitosamente"
  
  # Copiar archivos al servidor (ajustar según tu configuración)
  echo "📤 Desplegando archivos..."
  # rsync -avz --delete build/ user@server:/path/to/web/directory/
  
  echo "🎉 Despliegue completado exitosamente!"
else
  echo "❌ Error: Build falló"
  exit 1
fi