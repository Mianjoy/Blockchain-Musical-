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
    printError "Habilita File sharing de esa unidad en Docker Desktop."
  fi
  exit "${CC_NPM_RC}"
fi

printInfo "Empaquetando chaincode ${CC_NAME}..."
docker exec -w /opt/gopath/src/github.com/hyperledger/fabric/peer fabric-cli \
  peer lifecycle chaincode package "${CC_PACKAGE}" \
  --path "${CC_SRC_IN_CLI}" \
  --lang node \
  --label "${CC_LABEL}"

printInfo "Instalando chaincode en peer0.org1..."
docker exec fabric-cli peer lifecycle chaincode install "${CC_PACKAGE}"

PACKAGE_ID="$(docker exec fabric-cli peer lifecycle chaincode queryinstalled \
  | sed -n "s/^Package ID: ${CC_LABEL}:\(.*\), Label: ${CC_LABEL}$/\1/p" \
  | head -n1)"

if [[ -z "${PACKAGE_ID}" ]]; then
  PACKAGE_ID="$(docker exec fabric-cli peer lifecycle chaincode queryinstalled \
    | sed -n "s/.*Package ID: //p" \
    | sed -n "s/, Label: ${CC_LABEL}.*//p" \
    | head -n1)"
fi

if [[ -z "${PACKAGE_ID}" ]]; then
  printError "No se pudo obtener Package ID del chaincode"
  docker exec fabric-cli peer lifecycle chaincode queryinstalled
  exit 1
fi

# PACKAGE_ID completo incluye label:hash
FULL_PACKAGE_ID="$(docker exec fabric-cli peer lifecycle chaincode queryinstalled \
  | sed -n "s/^Package ID: \\(.*\\), Label: ${CC_LABEL}$/\\1/p" \
  | head -n1)"

printInfo "Package ID: ${FULL_PACKAGE_ID}"

printInfo "Aprobando chaincode para Org1..."
docker exec fabric-cli peer lifecycle chaincode approveformyorg \
  -o orderer.example.com:7050 \
  --channelID "${CHANNEL_NAME}" \
  --name "${CC_NAME}" \
  --version "${CC_VERSION}" \
  --package-id "${FULL_PACKAGE_ID}" \
  --sequence "${CC_SEQUENCE}" \
  --tls \
  --cafile "${ORDERER_CA_CONTAINER}" \
  --signature-policy "OR('Org1MSP.peer')"

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
  --signature-policy "OR('Org1MSP.peer')"

printInfo "Consultando chaincode committed..."
docker exec fabric-cli peer lifecycle chaincode querycommitted \
  --channelID "${CHANNEL_NAME}" \
  --name "${CC_NAME}"

printInfo "Inicializando ledger (InitLedger)..."
docker exec fabric-cli peer chaincode invoke \
  -o orderer.example.com:7050 \
  --tls \
  --cafile "${ORDERER_CA_CONTAINER}" \
  -C "${CHANNEL_NAME}" \
  -n "${CC_NAME}" \
  --peerAddresses peer0.org1.example.com:7051 \
  --tlsRootCertFiles "${PEER_TLS_ROOTCERT}" \
  -c '{"function":"InitLedger","Args":[]}' \
  --waitForEvent

printSuccess "Chaincode ${CC_NAME} desplegado"
