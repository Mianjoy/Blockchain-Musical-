#!/usr/bin/env bash
# Variables compartidas de la red Music Royalty Fabric

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_DIR="$(cd "${ROOT_DIR}/.." && pwd)"

export FABRIC_CFG_PATH="${ROOT_DIR}/configtx"
export COMPOSE_PROJECT_NAME=musicroyalty
export CHANNEL_NAME="${CHANNEL_NAME:-mychannel}"
export CC_NAME="${CC_NAME:-music-royalty}"
export CC_VERSION="${CC_VERSION:-1.0}"
export CC_SEQUENCE="${CC_SEQUENCE:-1}"
export CC_SRC_PATH="${PROJECT_DIR}/chaincode/music-royalty"
export CC_RUNTIME_LANGUAGE=node
export FABRIC_VERSION="${FABRIC_VERSION:-2.5.4}"
export CA_VERSION="${CA_VERSION:-1.5.7}"

export ORDERER_CA="${ROOT_DIR}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
export PEER0_ORG1_CA="${ROOT_DIR}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_TLS_ROOTCERT_FILE="${PEER0_ORG1_CA}"
export CORE_PEER_MSPCONFIGPATH="${ROOT_DIR}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
export CORE_PEER_ADDRESS=localhost:7051

IMAGE_TAG="${FABRIC_VERSION}"
CA_IMAGE_TAG="${CA_VERSION}"
export IMAGE_TAG CA_IMAGE_TAG

DOCKER_COMPOSE_FILE="${ROOT_DIR}/docker-compose-net.yaml"

# Git Bash en Windows convierte mal las rutas -v de Docker (error 125).
export MSYS_NO_PATHCONV=1
export MSYS2_ARG_CONV_EXCL='*'
export COMPOSE_CONVERT_WINDOWS_PATHS=1

function printInfo() {
  echo -e "\033[0;34m[INFO]\033[0m $1"
}

function printSuccess() {
  echo -e "\033[0;32m[OK]\033[0m $1"
}

function printError() {
  echo -e "\033[0;31m[ERROR]\033[0m $1"
}

function printWarn() {
  echo -e "\033[0;33m[AVISO]\033[0m $1"
}

# Convierte ruta del host a formato que Docker Desktop en Windows acepta.
function toDockerPath() {
  local p="$1"
  local uname_s
  uname_s="$(uname -s 2>/dev/null || echo unknown)"

  case "${uname_s}" in
    MINGW*|MSYS*|CYGWIN*)
      if command -v cygpath >/dev/null 2>&1; then
        cygpath -w "$p"
        return 0
      fi
      if [[ "$p" =~ ^/([a-zA-Z])/(.*)$ ]]; then
        local drive rest
        drive="$(echo "${BASH_REMATCH[1]}" | tr '[:lower:]' '[:upper:]')"
        rest="${BASH_REMATCH[2]}"
        rest="${rest//\//\\}"
        echo "${drive}:\\${rest}"
        return 0
      fi
      ;;
  esac
  echo "$p"
}

function fabricTools() {
  local win_path
  win_path="$(toDockerPath "${ROOT_DIR}")"

  printInfo "fabric-tools mount: ${win_path}  cmd: $*"
  MSYS_NO_PATHCONV=1 docker run --rm \
    -v "${win_path}:/work" \
    -w /work \
    -e FABRIC_CFG_PATH=/work/configtx \
    "hyperledger/fabric-tools:${FABRIC_VERSION}" \
    "$@"
}
