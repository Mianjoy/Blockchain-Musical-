#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "=== Music Royalty + Hyperledger Fabric ==="

if ! command -v docker >/dev/null 2>&1; then
  echo "[ERROR] Docker no está instalado"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "[ERROR] Docker no está en ejecución"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js no está instalado"
  exit 1
fi

if [[ ! -d node_modules ]]; then
  npm install
fi

if [[ ! -d frontend/node_modules ]]; then
  (cd frontend && npm install)
fi

bash network/scripts/network.sh up

export ALLOW_SIMULATION=false
export CHANNEL_NAME=mychannel
export CHAINCODE_NAME=music-royalty
export PORT=3000
export HOST=0.0.0.0

node index.js &
API_PID=$!

(cd frontend && npm run dev -- --host 0.0.0.0 --port 3001) &
UI_PID=$!

cleanup() {
  kill "$API_PID" "$UI_PID" 2>/dev/null || true
  bash network/scripts/network.sh down
}
trap cleanup EXIT INT TERM

echo "API PID=$API_PID UI PID=$UI_PID"
echo "Frontend: http://localhost:3001"
echo "Health:   http://localhost:3000/health"

for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/health >/dev/null; then
    echo "[OK] API lista"
    break
  fi
  sleep 2
done

wait
