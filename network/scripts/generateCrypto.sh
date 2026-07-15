#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=env.sh
source "${SCRIPT_DIR}/env.sh"

printInfo "Generando certificados (cryptogen)..."
printInfo "ROOT_DIR=${ROOT_DIR}"
printInfo "Docker mount=$(toDockerPath "${ROOT_DIR}")"

# En Windows preferir script .bat nativo (evita path mangling de Git Bash → error 125)
uname_s="$(uname -s 2>/dev/null || echo unknown)"
if [[ "${uname_s}" == MINGW* || "${uname_s}" == MSYS* || "${uname_s}" == CYGWIN* ]]; then
  NATIVE_BAT="$(toDockerPath "${PROJECT_DIR}/scripts/windows/generate-crypto-native.bat")"
  printInfo "Intentando generador nativo Windows: ${NATIVE_BAT}"
  if cmd.exe /c "\"${NATIVE_BAT}\""; then
    printSuccess "Crypto generado con script nativo Windows"
    exit 0
  fi
  printWarn "Generador nativo fallo; reintentando con fabric-tools via bash..."
fi

rm -rf "${ROOT_DIR}/organizations/peerOrganizations" \
       "${ROOT_DIR}/organizations/ordererOrganizations" \
       "${ROOT_DIR}/channel-artifacts" \
       "${ROOT_DIR}/system-genesis-block"

mkdir -p "${ROOT_DIR}/organizations/peerOrganizations" \
         "${ROOT_DIR}/organizations/ordererOrganizations" \
         "${ROOT_DIR}/channel-artifacts" \
         "${ROOT_DIR}/organizations/fabric-ca/org1"

set +e
fabricTools cryptogen generate \
  --config=/work/organizations/cryptogen/crypto-config-org1.yaml \
  --output=/work/organizations
RC1=$?
set -e
if [[ "${RC1}" -ne 0 ]]; then
  printError "cryptogen Org1 fallo (codigo ${RC1})"
  if [[ "${RC1}" == "125" ]]; then
    printError "Docker rechazo el volumen. En Docker Desktop > Settings > Resources > File sharing"
    printError "habilita la unidad donde esta el proyecto (ej. D:) y Apply & Restart."
  fi
  exit "${RC1}"
fi

set +e
fabricTools cryptogen generate \
  --config=/work/organizations/cryptogen/crypto-config-orderer.yaml \
  --output=/work/organizations
RC2=$?
set -e
if [[ "${RC2}" -ne 0 ]]; then
  printError "cryptogen Orderer fallo (codigo ${RC2})"
  exit "${RC2}"
fi

# config.yaml NodeOUs debe existir ANTES de configtxgen
# (si falta → "creator org unknown, creator is malformed")
printInfo "Asegurando config.yaml NodeOUs en todos los MSP..."
if command -v powershell.exe >/dev/null 2>&1 \
  && [[ -f "${PROJECT_DIR}/scripts/windows/ensure-msp-config.ps1" ]]; then
  powershell.exe -NoProfile -ExecutionPolicy Bypass \
    -File "${PROJECT_DIR}/scripts/windows/ensure-msp-config.ps1" || true
fi
while IFS= read -r -d '' ca; do
  msp_dir="$(dirname "$(dirname "$ca")")"
  ca_name="$(basename "$ca")"
  cfg="${msp_dir}/config.yaml"
  cat >"${cfg}" <<EOF
NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/${ca_name}
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/${ca_name}
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/${ca_name}
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/${ca_name}
    OrganizationalUnitIdentifier: orderer
EOF
done < <(find "${ROOT_DIR}/organizations" -type f -path '*/msp/cacerts/*' -print0 2>/dev/null || true)

printInfo "Generando bloque de configuracion del canal ${CHANNEL_NAME}..."
set +e
fabricTools configtxgen \
  -profile MusicRoyaltyChannel \
  -outputBlock "/work/channel-artifacts/${CHANNEL_NAME}.block" \
  -channelID "${CHANNEL_NAME}"
RC3=$?
set -e
if [[ "${RC3}" -ne 0 ]]; then
  printError "configtxgen fallo (codigo ${RC3})"
  exit "${RC3}"
fi

if [[ ! -f "${ROOT_DIR}/channel-artifacts/${CHANNEL_NAME}.block" ]]; then
  printError "No se genero el bloque del canal"
  exit 1
fi

if [[ ! -d "${ROOT_DIR}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp" ]]; then
  printError "MSP del orderer no generado"
  exit 1
fi

printSuccess "Crypto y bloque de canal generados"
