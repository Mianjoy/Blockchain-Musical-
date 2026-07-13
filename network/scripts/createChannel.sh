#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=env.sh
source "${SCRIPT_DIR}/env.sh"

ORDERER_ADMIN_TLS_SIGN_CERT="/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt"
ORDERER_ADMIN_TLS_PRIVATE_KEY="/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key"
ORDERER_CA_CONTAINER="/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt"
CHANNEL_BLOCK="./channel-artifacts/${CHANNEL_NAME}.block"

printInfo "Orderer se une al canal ${CHANNEL_NAME} (osnadmin)..."
docker exec fabric-cli osnadmin channel join \
  --channelID "${CHANNEL_NAME}" \
  --config-block "${CHANNEL_BLOCK}" \
  -o orderer.example.com:7053 \
  --ca-file "${ORDERER_CA_CONTAINER}" \
  --client-cert "${ORDERER_ADMIN_TLS_SIGN_CERT}" \
  --client-key "${ORDERER_ADMIN_TLS_PRIVATE_KEY}"

printInfo "Peer0.org1 se une al canal ${CHANNEL_NAME}..."
docker exec fabric-cli peer channel join -b "${CHANNEL_BLOCK}"

printInfo "Listando canales del peer..."
docker exec fabric-cli peer channel list

printSuccess "Canal ${CHANNEL_NAME} listo"
