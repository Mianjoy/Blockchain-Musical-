#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=env.sh
source "${SCRIPT_DIR}/env.sh"

printInfo "Generando certificados (cryptogen)..."

rm -rf "${ROOT_DIR}/organizations/peerOrganizations" \
       "${ROOT_DIR}/organizations/ordererOrganizations" \
       "${ROOT_DIR}/channel-artifacts" \
       "${ROOT_DIR}/system-genesis-block"

mkdir -p "${ROOT_DIR}/organizations/peerOrganizations" \
         "${ROOT_DIR}/organizations/ordererOrganizations" \
         "${ROOT_DIR}/channel-artifacts" \
         "${ROOT_DIR}/organizations/fabric-ca/org1"

fabricTools cryptogen generate \
  --config=/work/organizations/cryptogen/crypto-config-org1.yaml \
  --output=/work/organizations

fabricTools cryptogen generate \
  --config=/work/organizations/cryptogen/crypto-config-orderer.yaml \
  --output=/work/organizations

printInfo "Generando bloque de configuración del canal ${CHANNEL_NAME}..."
fabricTools configtxgen \
  -profile MusicRoyaltyChannel \
  -outputBlock "/work/channel-artifacts/${CHANNEL_NAME}.block" \
  -channelID "${CHANNEL_NAME}"

printSuccess "Crypto y bloque de canal generados"
