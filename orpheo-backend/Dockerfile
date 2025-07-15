FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk --no-cache add curl postgresql-client bash

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001

# Directorio de trabajo
WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Crear directorios y permisos
RUN mkdir -p uploads logs && chown -R nodeuser:nodejs /app

# Copiar código fuente
COPY --chown=nodeuser:nodejs . .

# Cambiar a usuario no-root
USER nodeuser

# Exponer puerto
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Comando por defecto
CMD ["npm", "start"]
