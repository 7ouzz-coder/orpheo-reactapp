# start-server-network.sh

echo "🚀 Iniciando Servidor Orpheo - Acceso de Red Completo"

# Detectar IP automáticamente
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "📍 IP detectada: $SERVER_IP"

# Actualizar variables de entorno
export SERVER_HOST=0.0.0.0
export PORT=3001
export SERVER_IP=$SERVER_IP

# Mostrar información de acceso
echo ""
echo "🌐 URLs de Acceso:"
echo "   Local: http://localhost:3001/api"
echo "   Red: http://$SERVER_IP:3001/api"
echo "   Health: http://$SERVER_IP:3001/health"
echo ""

# Iniciar servidor
npm run dev