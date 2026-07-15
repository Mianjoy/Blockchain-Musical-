#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=env.sh
source "${SCRIPT_DIR}/env.sh"

MODE="${1:-up}"
LOG_FILE="${PROJECT_DIR}/fabric-network.log"

function log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "${LOG_FILE}"
}

function networkDown() {
  printInfo "Deteniendo red Fabric..."
  (
    cd "${ROOT_DIR}"
    MSYS_NO_PATHCONV=1 IMAGE_TAG="${FABRIC_VERSION}" CA_IMAGE_TAG="${CA_VERSION}" \
      docker compose -f docker-compose-net.yaml down --volumes --remove-orphans
  ) >/dev/null 2>&1 || true

  for id in $(docker ps -aq --filter "name=dev-peer" 2>/dev/null || true); do
    docker rm -f "$id" >/dev/null 2>&1 || true
  done
  for id in $(docker images -q --filter "reference=dev-peer*" 2>/dev/null || true); do
    docker rmi -f "$id" >/dev/null 2>&1 || true
  done

  printSuccess "Red detenida"
}

function networkClean() {
  networkDown
  printInfo "Limpiando artefactos locales..."
  rm -rf "${ROOT_DIR}/organizations/peerOrganizations" \
         "${ROOT_DIR}/organizations/ordererOrganizations" \
         "${ROOT_DIR}/channel-artifacts" \
         "${ROOT_DIR}/system-genesis-block" \
         "${ROOT_DIR}/organizations/fabric-ca/org1" \
         "${PROJECT_DIR}/wallet"/* \
         "${PROJECT_DIR}/connection.json" \
         "${LOG_FILE}"
  mkdir -p "${PROJECT_DIR}/wallet"
  printSuccess "Limpieza completa"
}

function pullImages() {
  printInfo "Descargando imagenes Docker de Fabric (si faltan)..."
  local images=(
    "hyperledger/fabric-tools:${FABRIC_VERSION}"
    "hyperledger/fabric-peer:${FABRIC_VERSION}"
    "hyperledger/fabric-orderer:${FABRIC_VERSION}"
    "hyperledger/fabric-ca:${CA_VERSION}"
    "node:18-alpine"
  )
  for img in "${images[@]}"; do
    printInfo "  pull ${img}"
    if ! MSYS_NO_PATHCONV=1 docker pull "${img}"; then
      printError "No se pudo descargar ${img}"
      printError "Revisa internet / Docker Desktop y reintenta."
      return 1
    fi
  done
}

function waitForPeer() {
  printInfo "Esperando a que el peer este listo..."
  local i
  for i in $(seq 1 45); do
    if docker exec peer0.org1.example.com peer node status >/dev/null 2>&1 \
      || docker exec peer0.org1.example.com peer channel list >/dev/null 2>&1; then
      printSuccess "Peer listo"
      return 0
    fi
    # Si el contenedor salio, mostrar logs
    local st
    st="$(docker inspect -f '{{.State.Status}}' peer0.org1.example.com 2>/dev/null || echo missing)"
    if [[ "${st}" == "exited" || "${st}" == "missing" ]]; then
      printError "El contenedor del peer no esta en ejecucion (estado: ${st})"
      docker logs peer0.org1.example.com 2>&1 | tail -n 40 || true
      return 1
    fi
    sleep 2
  done
  printError "Timeout esperando al peer"
  docker ps -a --filter "name=peer0.org1" || true
  docker logs peer0.org1.example.com 2>&1 | tail -n 40 || true
  return 1
}

function composeUp() {
  printInfo "Levantando contenedores Fabric..."
  cd "${ROOT_DIR}"
  set +e
  MSYS_NO_PATHCONV=1 IMAGE_TAG="${FABRIC_VERSION}" CA_IMAGE_TAG="${CA_VERSION}" \
    docker compose -f docker-compose-net.yaml up -d 2>&1 | tee -a "${LOG_FILE}"
  local rc=${PIPESTATUS[0]}
  set -e
  if [[ "${rc}" -ne 0 ]]; then
    printError "docker compose up fallo con codigo ${rc}"
    if [[ "${rc}" == "125" ]]; then
      printError "Codigo 125: suele ser fallo de Docker al crear contenedores (volumenes/rutas en Windows)."
      printError "1) Docker Desktop en verde"
      printError "2) Settings > Resources > File sharing: incluye la unidad del proyecto"
      printError "3) Ejecuta: bash network/scripts/network.sh clean && ARRANCAR.bat"
    fi
    docker compose -f docker-compose-net.yaml ps -a || true
    return "${rc}"
  fi
  return 0
}

function networkUp() {
  : > "${LOG_FILE}"
  log "=== network.sh up ==="
  log "ROOT_DIR=${ROOT_DIR}"
  log "PROJECT_DIR=${PROJECT_DIR}"
  log "Docker path sample=$(toDockerPath "${ROOT_DIR}")"

  pullImages

  if [[ ! -f "${ROOT_DIR}/channel-artifacts/${CHANNEL_NAME}.block" ]]; then
    bash "${SCRIPT_DIR}/generateCrypto.sh"
  else
    printInfo "Artefactos existentes detectados"
    # Validar MSP del orderer exista
    if [[ ! -d "${ROOT_DIR}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp" ]]; then
      printWarn "MSP incompleto; regenerando crypto..."
      bash "${SCRIPT_DIR}/generateCrypto.sh"
    fi
  fi

  # Asegurar carpetas que el CA escribe
  mkdir -p "${ROOT_DIR}/organizations/fabric-ca/org1"

  composeUp
  waitForPeer
  sleep 3

  if ! docker exec fabric-cli peer channel list 2>/dev/null | grep -q "${CHANNEL_NAME}"; then
    bash "${SCRIPT_DIR}/createChannel.sh"
  else
    printInfo "Canal ${CHANNEL_NAME} ya existe"
  fi

  if ! docker exec fabric-cli peer lifecycle chaincode querycommitted \
      --channelID "${CHANNEL_NAME}" --name "${CC_NAME}" >/dev/null 2>&1; then
    bash "${SCRIPT_DIR}/deployCC.sh"
  else
    printInfo "Chaincode ${CC_NAME} ya esta committed"
  fi

  printInfo "Generando connection.json y wallet appUser..."
  if ! command -v node >/dev/null 2>&1; then
    printError "node no esta en PATH dentro de Git Bash"
    printError "Reinstala Node.js o ejecuta enroll desde cmd: node scripts/enrollAppUser.js"
    return 1
  fi
  node "${PROJECT_DIR}/scripts/enrollAppUser.js"

  printSuccess "Red Fabric operativa"
  echo ""
  echo "  Canal:      ${CHANNEL_NAME}"
  echo "  Chaincode:  ${CC_NAME}"
  echo "  Peer:       localhost:7051"
  echo "  Orderer:    localhost:7050"
  echo "  CA Org1:    localhost:7054"
  echo "  Connection: ${PROJECT_DIR}/connection.json"
  echo "  Log:        ${LOG_FILE}"
}

case "${MODE}" in
  up) networkUp ;;
  down) networkDown ;;
  clean|reset) networkClean ;;
  generate) bash "${SCRIPT_DIR}/generateCrypto.sh" ;;
  channel) bash "${SCRIPT_DIR}/createChannel.sh" ;;
  deployCC) bash "${SCRIPT_DIR}/deployCC.sh" ;;
  enroll) node "${PROJECT_DIR}/scripts/enrollAppUser.js" ;;
  *)
    echo "Uso: $0 {up|down|clean|generate|channel|deployCC|enroll}"
    exit 1
    ;;
esac
