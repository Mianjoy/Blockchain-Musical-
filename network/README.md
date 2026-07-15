# Red Hyperledger Fabric – Music Royalty

Red de prueba **Fabric 2.5.16** + **CA 1.5.21**: Org1 (peer + CA), orderer, canal `mychannel` y chaincode `music-royalty`.

> `fabric-tools:3.x` ya no existe en Docker Hub. Se usa la línea **2.5 LTS**.

Documentación completa (instalación Windows, diagramas, troubleshooting): **[README principal](../README.md)**.

## Requisitos

- Docker Desktop (WSL2 recomendado en Windows)
- Node.js 18+ (API, frontend y wallet)
- Git Bash: solo si usas los scripts `.sh` (opcional en Windows)

## Arranque rápido (Windows nativo)

```bat
FABRIC-UP.bat
REPARAR-FABRIC.bat
```

```bat
scripts\windows\fabric-up.bat up
scripts\windows\fabric-up.bat down
scripts\windows\fabric-up.bat clean
```

## Bash / Mac / Linux

```bash
bash network/scripts/network.sh up
bash network/scripts/network.sh down
bash network/scripts/network.sh clean
bash network/scripts/network.sh enroll
```

Artefactos generados (MSP, channel block, `connection.json`) **no se versionan**.
