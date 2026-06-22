#!/bin/bash

# Colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "  Sistema de Regalías Musicales"
echo "  con Blockchain - Iniciando..."
echo "========================================"
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERROR] Docker no está instalado.${NC}"
    echo ""
    echo "Por favor, instala Docker:"
    echo "  - macOS: brew install --cask docker"
    echo "  - Linux: curl -fsSL https://get.docker.com | sh"
    echo "  - Windows: https://www.docker.com/products/docker-desktop/"
    echo ""
    exit 1
fi

echo -e "${GREEN}[OK]${NC} Docker detectado correctamente: $(docker --version)"
echo ""

# Verificar si Docker Compose está disponible
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}[ERROR] Docker Compose no está disponible.${NC}"
    echo "Asegúrate de tener Docker Desktop instalado o instala docker-compose."
    exit 1
fi

echo -e "${GREEN}[OK]${NC} Docker Compose detectado correctamente"
echo ""

# Determinar el comando de docker compose
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

# Construir y ejecutar el sistema
echo "========================================"
echo "  Construyendo contenedores..."
echo "========================================"
echo ""

$COMPOSE_CMD up --build -d

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Error al construir los contenedores.${NC}"
    exit 1
fi

echo ""
echo "========================================"
echo -e "  ${GREEN}Sistema iniciado exitosamente!${NC}"
echo "========================================"
echo ""
echo "  Frontend: http://localhost:3001"
echo "  Backend:  http://localhost:3000/api"
echo "  Health:   http://localhost:3000/health"
echo ""
echo "  Para detener el sistema ejecuta:"
echo "  $COMPOSE_CMD down"
echo ""

# Intentar abrir el navegador automáticamente
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3001
elif command -v open &> /dev/null; then
    open http://localhost:3001
elif command -v start &> /dev/null; then
    start http://localhost:3001
else
    echo "Abre tu navegador en: http://localhost:3001"
fi

echo ""
echo -e "${YELLOW}Presiona Ctrl+C para ver los logs en tiempo real${NC}"
echo ""

# Mostrar logs
$COMPOSE_CMD logs -f
