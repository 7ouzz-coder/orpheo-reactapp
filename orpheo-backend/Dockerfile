FROM node:18-alpine

# Información del mantenedor
LABEL maintainer="tu-email@ejemplo.com"
LABEL description="Orpheo Backend API"

# Instalar dependencias del sistema
RUN apk --no-cache add \
    postgresql-client \
    curl

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Cambiar propietario de node_modules
RUN chown -R nodeuser:nodejs /app/node_modules

# Copiar código fuente
COPY --chown=nodeuser:nodejs . .

# Crear directorios necesarios
RUN mkdir -p logs uploads && \
    chown -R nodeuser:nodejs logs uploads

# Cambiar a usuario no-root
USER nodeuser

# Exponer puerto
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Comando por defecto
CMD ["npm", "start"]