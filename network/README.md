# Red Hyperledger Fabric – Music Royalty

Red de prueba **Fabric 2.5.15** + **CA 1.5.15**: Org1 (peer + CA), orderer, canal `mychannel` y chaincode `music-royalty`.

## Requisitos

- Docker Desktop (WSL2 recomendado en Windows)
- Node.js 18+ (API, frontend y wallet)
- Git Bash: solo si usas los scripts `.sh` (opcional en Windows)

## Arranque rápido (Windows nativo)

No requiere Git Bash. Orquestación: `scripts\windows\fabric-up.bat` (CMD + Docker).

```bat
ARRANCAR-FABRIC.bat
```

Si hubo un fallo previo:

```bat
REPARAR-FABRIC.bat
ARRANCAR-FABRIC.bat
```

Alternativas:

```bat
ARRANCAR.bat          :: intenta Fabric; si falla → DEMO
ARRANCAR-DEMO.bat     :: solo simulacion
DETENER.bat           :: apaga API + Fabric
```

Detalle: [README principal](../README.md).

### Comandos Fabric (Windows CMD)

```bat
scripts\windows\fabric-up.bat up
scripts\windows\fabric-up.bat down
scripts\windows\fabric-up.bat clean
scripts\windows\generate-crypto-native.bat
node scripts\enrollAppUser.js
```

## Comandos manuales (bash / Mac / Linux)

```bash
bash network/scripts/network.sh up
bash network/scripts/network.sh generate
bash network/scripts/network.sh channel
bash network/scripts/network.sh deployCC
bash network/scripts/network.sh enroll
bash network/scripts/network.sh down
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
scripts/windows/fabric-up.bat
chaincode/music-royalty/
```
