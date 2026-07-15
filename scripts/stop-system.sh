#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
bash network/scripts/network.sh down
echo "Sistema detenido"
