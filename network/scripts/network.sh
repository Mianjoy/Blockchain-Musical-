#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=env.sh
source "${SCRIPT_DIR}/env.sh"

MODE="${1:-up}"

function networkDown() {
  printInfo "Deteniendo red Fabric..."
  docker compose -f "${DOCKER_COMPOSE_FILE}" down --volumes --remove-orphans 2>/dev/null || true

  # Contenedores / imágenes de chaincode residuales
  for id in $(docker ps -aq --filter "name=dev-peer" 2>/dev/null); do
    docker rm -f "$id" >/dev/null 2>&1 || true
  done
  for id in $(docker images -q --filter "reference=dev-peer*" 2>/dev/null); do
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
         "${PROJECT_DIR}/connection.json"
  mkdir -p "${PROJECT_DIR}/wallet"
  printSuccess "Limpieza completa"
}

function waitForPeer() {
  printInfo "Esperando a que el peer esté listo..."
  for i in $(seq 1 30); do
    if docker exec peer0.org1.example.com peer channel list >/dev/null 2>&1; then
      printSuccess "Peer listo"
      return 0
    fi
    sleep 2
  done
  printError "Timeout esperando al peer"
  return 1
}

function networkUp() {
  if [[ ! -f "${ROOT_DIR}/channel-artifacts/${CHANNEL_NAME}.block" ]]; then
    bash "${SCRIPT_DIR}/generateCrypto.sh"
  else
    printInfo "Artefactos existentes detectados (usa 'down + generate' para regenerar)"
  fi

  printInfo "Levantando contenedores Fabric..."
  IMAGE_TAG="${FABRIC_VERSION}" CA_IMAGE_TAG="${CA_VERSION}" \
    docker compose -f "${DOCKER_COMPOSE_FILE}" up -d

  waitForPeer
  sleep 3

  # Si el canal no existe todavía en el peer, crearlo
  if ! docker exec fabric-cli peer channel list 2>/dev/null | grep -q "${CHANNEL_NAME}"; then
    bash "${SCRIPT_DIR}/createChannel.sh"
  else
    printInfo "Canal ${CHANNEL_NAME} ya existe"
  fi

  # Desplegar chaincode si no está committed
  if ! docker exec fabric-cli peer lifecycle chaincode querycommitted \
      --channelID "${CHANNEL_NAME}" --name "${CC_NAME}" >/dev/null 2>&1; then
    bash "${SCRIPT_DIR}/deployCC.sh"
  else
    printInfo "Chaincode ${CC_NAME} ya está committed"
  fi

  printInfo "Generando connection.json y wallet appUser..."
  node "${PROJECT_DIR}/scripts/enrollAppUser.js"

  printSuccess "Red Fabric operativa"
  echo ""
  echo "  Canal:      ${CHANNEL_NAME}"
  echo "  Chaincode:  ${CC_NAME}"
  echo "  Peer:       localhost:7051"
  echo "  Orderer:    localhost:7050"
  echo "  CA Org1:    localhost:7054"
  echo "  Connection: ${PROJECT_DIR}/connection.json"
  echo "  Wallet:     ${PROJECT_DIR}/wallet"
}

case "${MODE}" in
  up)
    networkUp
    ;;
  down)
    networkDown
    ;;
  clean|reset)
    networkClean
    ;;
  generate)
    bash "${SCRIPT_DIR}/generateCrypto.sh"
    ;;
  channel)
    bash "${SCRIPT_DIR}/createChannel.sh"
    ;;
  deployCC)
    bash "${SCRIPT_DIR}/deployCC.sh"
    ;;
  enroll)
    node "${PROJECT_DIR}/scripts/enrollAppUser.js"
    ;;
  *)
    echo "Uso: $0 {up|down|clean|generate|channel|deployCC|enroll}"
    exit 1
    ;;
esac
