# Red Hyperledger Fabric – Music Royalty

Red de prueba **Fabric 2.5** embebida en el proyecto: Org1 (peer + CA), orderer etcdraft, canal `mychannel` y chaincode `music-royalty`.

## Requisitos

- Docker Desktop (WSL2 recomendado en Windows)
- Git Bash o WSL (para `network/scripts/*.sh`)
- Node.js 18+ (API, frontend y wallet)

## Arranque rápido (Windows)

1. Instalar dependencias:
```bat
install-dependencies.bat
```

2. Arrancar Fabric + app:
```bat
start-system.bat
```

Esto:

1. Verifica Docker / Git Bash / Node
2. Genera crypto + canal
3. Levanta CA, orderer, peer y CLI
4. Despliega el chaincode `music-royalty`
5. Escribe `connection.json` e importa `appUser` en `wallet/`
6. Arranca API (`:3000`) y frontend (`:3001`) **sin simulación**

Detener:

```bat
stop-system.bat
```

## Comandos manuales

```bash
# Levantar red + canal + chaincode + wallet
bash network/scripts/network.sh up

# Solo crypto
bash network/scripts/network.sh generate

# Solo canal
bash network/scripts/network.sh channel

# Solo chaincode
bash network/scripts/network.sh deployCC

# Regenerar connection.json + wallet
bash network/scripts/network.sh enroll

# Bajar red
bash network/scripts/network.sh down

# Borrar artefactos + volúmenes
bash network/scripts/network.sh clean
```

## Endpoints Fabric

| Servicio | Host |
|----------|------|
| Peer Org1 | `localhost:7051` |
| Orderer | `localhost:7050` |
| Orderer Admin | `localhost:7053` |
| CA Org1 | `localhost:7054` |

## Simulación (opcional)

Por defecto la app **exige** Fabric. Para permitir fallback:

```bat
set ALLOW_SIMULATION=true
node index.js
```

## Estructura

```
network/
  docker-compose-net.yaml
  configtx/configtx.yaml
  organizations/cryptogen/
  scripts/network.sh
chaincode/music-royalty/
connection.json          # generado
wallet/                  # generado (appUser)
```
