@echo off
:: Genera crypto Fabric usando docker.exe con rutas Windows puras (sin Git Bash path mangling)
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
cd /d "%~dp0\..\.."
set "ROOT=%CD%"
set "NET=%ROOT%\network"
set "FABRIC_VER=2.5.4"
set "LOG=%ROOT%\fabric-network.log"

call "%ROOT%\scripts\windows\refresh-path.bat"
where docker >nul 2>nul
if errorlevel 1 (
  echo [ERROR] docker no esta en PATH
  exit /b 1
)

echo [INFO] Generando crypto con rutas Windows nativas...>>"%LOG%"
echo [INFO] NET=%NET%

if exist "%NET%\organizations\peerOrganizations" rmdir /s /q "%NET%\organizations\peerOrganizations"
if exist "%NET%\organizations\ordererOrganizations" rmdir /s /q "%NET%\organizations\ordererOrganizations"
if exist "%NET%\channel-artifacts" rmdir /s /q "%NET%\channel-artifacts"
mkdir "%NET%\organizations\peerOrganizations" 2>nul
mkdir "%NET%\organizations\ordererOrganizations" 2>nul
mkdir "%NET%\channel-artifacts" 2>nul
mkdir "%NET%\organizations\fabric-ca\org1" 2>nul

echo [INFO] cryptogen Org1...
docker run --rm -v "%NET%:/work" -w /work -e FABRIC_CFG_PATH=/work/configtx hyperledger/fabric-tools:%FABRIC_VER% cryptogen generate --config=/work/organizations/cryptogen/crypto-config-org1.yaml --output=/work/organizations
if errorlevel 1 (
  echo [ERROR] cryptogen Org1 fallo codigo !ERRORLEVEL!
  echo [ERROR] Si es 125: habilita File sharing de la unidad en Docker Desktop
  exit /b 125
)

echo [INFO] cryptogen Orderer...
docker run --rm -v "%NET%:/work" -w /work -e FABRIC_CFG_PATH=/work/configtx hyperledger/fabric-tools:%FABRIC_VER% cryptogen generate --config=/work/organizations/cryptogen/crypto-config-orderer.yaml --output=/work/organizations
if errorlevel 1 exit /b 125

echo [INFO] configtxgen canal...
docker run --rm -v "%NET%:/work" -w /work -e FABRIC_CFG_PATH=/work/configtx hyperledger/fabric-tools:%FABRIC_VER% configtxgen -profile MusicRoyaltyChannel -outputBlock /work/channel-artifacts/mychannel.block -channelID mychannel
if errorlevel 1 exit /b 1

if not exist "%NET%\channel-artifacts\mychannel.block" (
  echo [ERROR] No se creo mychannel.block
  exit /b 1
)

echo [OK] Crypto generado con Windows nativo
exit /b 0
