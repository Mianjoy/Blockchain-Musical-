#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=env.sh
source "${SCRIPT_DIR}/env.sh"

ORDERER_CA_CONTAINER="/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
PEER_TLS_ROOTCERT="/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
CC_SRC_IN_CLI="/opt/gopath/src/github.com/chaincode/music-royalty"
CC_LABEL="${CC_NAME}_${CC_VERSION}"
CC_PACKAGE="${CC_NAME}.tar.gz"
EVENT_TIMEOUT="${CC_EVENT_TIMEOUT:-120s}"

function waitChannelReady() {
  printInfo "Esperando que el canal ${CHANNEL_NAME} entregue bloques..."
  local i height
  for i in $(seq 1 30); do
    height="$(docker exec fabric-cli peer channel getinfo -c "${CHANNEL_NAME}" 2>/dev/null | sed -n 's/.*height: *\([0-9]*\).*/\1/p' | head -n1 || true)"
    if [[ -n "${height}" && "${height}" -ge 1 ]]; then
      printSuccess "Canal listo (height=${height})"
      return 0
    fi
    sleep 2
  done
  printWarn "No se pudo leer height del canal; se continua igual"
  docker exec fabric-cli peer channel getinfo -c "${CHANNEL_NAME}" || true
}

function getFullPackageId() {
  docker exec fabric-cli peer lifecycle chaincode queryinstalled 2>/dev/null \
    | sed -n "s/^Package ID: \\(.*\\), Label: ${CC_LABEL}$/\\1/p" \
    | head -n1
}

function approveWithRetry() {
  local pkg_id="$1"
  local attempt rc
  for attempt in 1 2 3; do
    printInfo "Aprobando chaincode para Org1 (intento ${attempt}/3, timeout ${EVENT_TIMEOUT})..."
    set +e
    docker exec fabric-cli peer lifecycle chaincode approveformyorg \
      -o orderer.example.com:7050 \
      --channelID "${CHANNEL_NAME}" \
      --name "${CC_NAME}" \
      --version "${CC_VERSION}" \
      --package-id "${pkg_id}" \
      --sequence "${CC_SEQUENCE}" \
      --tls \
      --cafile "${ORDERER_CA_CONTAINER}" \
      --signature-policy "OR('Org1MSP.peer')" \
      --waitForEvent \
      --waitForEventTimeout "${EVENT_TIMEOUT}"
    rc=$?
    set -e
    if [[ "${rc}" -eq 0 ]]; then
      printSuccess "approveformyorg OK"
      return 0
    fi
    printWarn "approveformyorg fallo (codigo ${rc}). Reintentando en 8s..."
    sleep 8
  done
  return 1
}

printInfo "Instalando dependencias del chaincode (npm)..."
CC_DOCKER_PATH="$(toDockerPath "${CC_SRC_PATH}")"
printInfo "Chaincode mount: ${CC_DOCKER_PATH}"
set +e
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "${CC_DOCKER_PATH}:/chaincode" \
  -w /chaincode \
  node:18-alpine \
  sh -c "npm install --omit=dev"
CC_NPM_RC=$?
set -e
if [[ "${CC_NPM_RC}" -ne 0 ]]; then
  printError "npm install del chaincode fallo (codigo ${CC_NPM_RC})"
  if [[ "${CC_NPM_RC}" == "125" ]]; then
    printError "Error 125: Docker no pudo montar ${CC_DOCKER_PATH}"
  fi
  exit "${CC_NPM_RC}"
fi

waitChannelReady

FULL_PACKAGE_ID="$(getFullPackageId)"
if [[ -z "${FULL_PACKAGE_ID}" ]]; then
  printInfo "Empaquetando chaincode ${CC_NAME}..."
  docker exec -w /opt/gopath/src/github.com/hyperledger/fabric/peer fabric-cli \
    peer lifecycle chaincode package "${CC_PACKAGE}" \
    --path "${CC_SRC_IN_CLI}" \
    --lang node \
    --label "${CC_LABEL}"

  printInfo "Instalando chaincode en peer0.org1..."
  set +e
  docker exec fabric-cli peer lifecycle chaincode install "${CC_PACKAGE}"
  set -e
  FULL_PACKAGE_ID="$(getFullPackageId)"
else
  printInfo "Chaincode ya instalado: ${FULL_PACKAGE_ID}"
fi

if [[ -z "${FULL_PACKAGE_ID}" ]]; then
  printError "No se pudo obtener Package ID del chaincode"
  docker exec fabric-cli peer lifecycle chaincode queryinstalled || true
  exit 1
fi

printInfo "Package ID: ${FULL_PACKAGE_ID}"

if ! approveWithRetry "${FULL_PACKAGE_ID}"; then
  printError "No se pudo aprobar el chaincode (timeout txid)."
  printError "Causa tipica: el peer no recibe bloques del orderer a tiempo."
  printError "Prueba REPARAR-FABRIC.bat o usa ARRANCAR-DEMO.bat (simulacion)."
  docker logs orderer.example.com 2>&1 | tail -n 30 || true
  docker logs peer0.org1.example.com 2>&1 | tail -n 30 || true
  exit 1
fi

printInfo "Comprobando commit readiness..."
docker exec fabric-cli peer lifecycle chaincode checkcommitreadiness \
  --channelID "${CHANNEL_NAME}" \
  --name "${CC_NAME}" \
  --version "${CC_VERSION}" \
  --sequence "${CC_SEQUENCE}" \
  --tls \
  --cafile "${ORDERER_CA_CONTAINER}" \
  --signature-policy "OR('Org1MSP.peer')" \
  --output json

printInfo "Haciendo commit del chaincode..."
set +e
docker exec fabric-cli peer lifecycle chaincode commit \
  -o orderer.example.com:7050 \
  --channelID "${CHANNEL_NAME}" \
  --name "${CC_NAME}" \
  --version "${CC_VERSION}" \
  --sequence "${CC_SEQUENCE}" \
  --tls \
  --cafile "${ORDERER_CA_CONTAINER}" \
  --peerAddresses peer0.org1.example.com:7051 \
  --tlsRootCertFiles "${PEER_TLS_ROOTCERT}" \
  --signature-policy "OR('Org1MSP.peer')" \
  --waitForEvent \
  --waitForEventTimeout "${EVENT_TIMEOUT}"
COMMIT_RC=$?
set -e
if [[ "${COMMIT_RC}" -ne 0 ]]; then
  printError "commit del chaincode fallo (codigo ${COMMIT_RC})"
  exit "${COMMIT_RC}"
fi

printInfo "Consultando chaincode committed..."
docker exec fabric-cli peer lifecycle chaincode querycommitted \
  --channelID "${CHANNEL_NAME}" \
  --name "${CC_NAME}"

printInfo "Inicializando ledger (InitLedger)..."
set +e
docker exec fabric-cli peer chaincode invoke \
  -o orderer.example.com:7050 \
  --tls \
  --cafile "${ORDERER_CA_CONTAINER}" \
  -C "${CHANNEL_NAME}" \
  -n "${CC_NAME}" \
  --peerAddresses peer0.org1.example.com:7051 \
  --tlsRootCertFiles "${PEER_TLS_ROOTCERT}" \
  -c '{"function":"InitLedger","Args":[]}' \
  --waitForEvent \
  --waitForEventTimeout "${EVENT_TIMEOUT}"
INVOKE_RC=$?
set -e
if [[ "${INVOKE_RC}" -ne 0 ]]; then
  printWarn "InitLedger devolvio codigo ${INVOKE_RC} (puede reintentarse luego)"
fi

printSuccess "Chaincode ${CC_NAME} desplegado"
