# Imagen base para el build
FROM node:18-alpine AS build

# Información del mantenedor
LABEL maintainer="tu-email@ejemplo.com"
LABEL description="Orpheo - Sistema de Gestión Masónica"

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (para cache layer)
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production --silent

# Copiar código fuente
COPY . .

# Variables de entorno para build
ARG REACT_APP_API_BASE_URL=http://localhost:3001/api
ARG REACT_APP_WS_BASE_URL=ws://localhost:3001
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_WS_BASE_URL=$REACT_APP_WS_BASE_URL

# Build de producción
RUN npm run build

# Imagen de producción con Nginx
FROM nginx:1.21-alpine AS production

# Instalar certificados SSL y herramientas adicionales
RUN apk --no-cache add curl

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos construidos desde el stage anterior
COPY --from=build /app/build /usr/share/nginx/html

# Crear directorio para logs
RUN mkdir -p /var/log/nginx

# Copiar script de inicio personalizado
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Exponer puerto
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Ejecutar script de inicio
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]