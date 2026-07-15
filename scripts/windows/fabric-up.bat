@echo off
:: =============================================================================
:: fabric-up.bat — Hyperledger Fabric 3.1.5 en Windows nativo (CMD + Docker)
:: Uso: fabric-up.bat [up|down|clean]
:: =============================================================================
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
cd /d "%~dp0\..\.."
set "ROOT=%CD%"
set "NET=%ROOT%\network"
set "CC=%ROOT%\chaincode\music-royalty"
set "LOG=%ROOT%\fabric-network.log"
set "FABRIC_VER=3.1.5"
set "CA_VER=1.5.21"
set "CHANNEL=mychannel"
set "CC_NAME=music-royalty"
set "CC_VER=1.0"
set "CC_SEQ=1"
set "IMAGE_TAG=%FABRIC_VER%"
set "CA_IMAGE_TAG=%CA_VER%"
set "COMPOSE_PROJECT_NAME=musicroyalty"
set "RECOVERY_DONE=0"

set "MODE=%~1"
if "%MODE%"=="" set "MODE=up"

call "%ROOT%\scripts\windows\refresh-path.bat"
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
call "%ROOT%\scripts\windows\find-docker.bat"
if errorlevel 1 (
  call :err "docker.exe no encontrado. Abre Docker Desktop o ejecuta FABRIC-UP.bat / install-dependencies.bat"
  exit /b 1
)
if not defined MR_COMPOSE set "MR_COMPOSE=docker compose"

"%MR_DOCKER%" info >nul 2>nul
if errorlevel 1 (
  call :err "Docker Desktop no responde. Abrelo y espera el icono en verde."
  exit /b 1
)

if /i "%MODE%"=="down" goto do_down
if /i "%MODE%"=="clean" goto do_clean
if /i "%MODE%"=="up" goto do_up
call :err "Uso: fabric-up.bat [up|down|clean]"
exit /b 1

:do_down
call :log "[INFO] Deteniendo red Fabric..."
set "IMAGE_TAG=%FABRIC_VER%"
set "CA_IMAGE_TAG=%CA_VER%"
pushd "%NET%"
%MR_COMPOSE% -f docker-compose-net.yaml down --volumes --remove-orphans >nul 2>&1
popd
pushd "%ROOT%"
%MR_COMPOSE% -f docker-compose.fabric.yml down --volumes --remove-orphans >nul 2>&1
popd
for /f "tokens=*" %%i in ('"%MR_DOCKER%" ps -aq --filter "name=dev-peer" 2^>nul') do "%MR_DOCKER%" rm -f %%i >nul 2>&1
for /f "tokens=*" %%i in ('"%MR_DOCKER%" images -q --filter "reference=dev-peer*" 2^>nul') do "%MR_DOCKER%" rmi -f %%i >nul 2>&1
call :log "[OK] Red detenida"
exit /b 0

:do_clean
call :do_down
call :log "[INFO] Limpiando artefactos..."
if exist "%NET%\organizations\peerOrganizations" rmdir /s /q "%NET%\organizations\peerOrganizations"
if exist "%NET%\organizations\ordererOrganizations" rmdir /s /q "%NET%\organizations\ordererOrganizations"
if exist "%NET%\channel-artifacts" rmdir /s /q "%NET%\channel-artifacts"
if exist "%NET%\organizations\fabric-ca\org1" rmdir /s /q "%NET%\organizations\fabric-ca\org1"
if exist "%ROOT%\connection.json" del /f /q "%ROOT%\connection.json"
if exist "%ROOT%\wallet" rmdir /s /q "%ROOT%\wallet"
mkdir "%ROOT%\wallet" 2>nul
call :log "[OK] Limpieza completa"
exit /b 0

:do_up
echo.>"%LOG%"
call :log "=============================================================="
call :log " FABRIC WINDOWS NATIVO %FABRIC_VER% / CA %CA_VER%"
call :log " ROOT=%ROOT%"
call :log "=============================================================="

call :log "[1/7] Descargando imagenes Docker..."
for %%I in (
  "hyperledger/fabric-tools:%FABRIC_VER%"
  "hyperledger/fabric-peer:%FABRIC_VER%"
  "hyperledger/fabric-orderer:%FABRIC_VER%"
  "hyperledger/fabric-ca:%CA_VER%"
  "node:18-alpine"
) do (
  call :log "  pull %%~I"
  docker pull %%~I >>"%LOG%" 2>&1
  if errorlevel 1 (
    call :err "No se pudo descargar %%~I"
    exit /b 1
  )
)

call :log "[2/7] Crypto / MSP..."
if not exist "%NET%\channel-artifacts\%CHANNEL%.block" (
  call "%ROOT%\scripts\windows\generate-crypto-native.bat"
  if errorlevel 1 (
    call :err "Fallo crypto. Activa File sharing de la unidad en Docker Desktop."
    exit /b 1
  )
) else (
  call :log "  Artefactos existentes; validando MSP config.yaml..."
  if not exist "%NET%\organizations\ordererOrganizations\example.com\orderers\orderer.example.com\msp" (
    call :log "  MSP incompleto; regenerando crypto..."
    call "%ROOT%\scripts\windows\generate-crypto-native.bat"
    if errorlevel 1 exit /b 1
  ) else (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%\scripts\windows\ensure-msp-config.ps1" >>"%LOG%" 2>&1
    if errorlevel 1 (
      call :log "  config.yaml incompleto; regenerando crypto..."
      call "%ROOT%\scripts\windows\generate-crypto-native.bat"
      if errorlevel 1 exit /b 1
    )
  )
)

mkdir "%NET%\organizations\fabric-ca\org1" 2>nul

:: Preferir compose legacy de network/ (probado); fallback al de raiz
call :log "[3/7] Levantando contenedores Fabric..."
set "IMAGE_TAG=%FABRIC_VER%"
set "CA_IMAGE_TAG=%CA_VER%"
set "RC=1"
pushd "%NET%"
call :log "  Usando network/docker-compose-net.yaml"
%MR_COMPOSE% -f docker-compose-net.yaml up -d >>"%LOG%" 2>&1
set "RC=!ERRORLEVEL!"
popd
if not "!RC!"=="0" (
  call :log "  Fallback a docker-compose.fabric.yml (raiz)..."
  pushd "%ROOT%"
  %MR_COMPOSE% -f docker-compose.fabric.yml up -d >>"%LOG%" 2>&1
  set "RC=!ERRORLEVEL!"
  popd
)
if not "!RC!"=="0" (
  call :err "docker compose up fallo (!RC!). Revisa File sharing y fabric-network.log"
  exit /b !RC!
)

call :log "[4/7] Esperando peer..."
set /a _i=0
:wait_peer
set /a _i+=1
docker exec peer0.org1.example.com peer channel list >nul 2>&1
if not errorlevel 1 goto peer_ok
docker inspect -f "{{.State.Status}}" peer0.org1.example.com 2>nul | findstr /i "exited" >nul
if not errorlevel 1 (
  call :err "El peer salio. Ultimas lineas de log:"
  docker logs peer0.org1.example.com --tail 40
  exit /b 1
)
if !_i! GEQ 60 (
  call :err "Timeout esperando peer"
  docker logs peer0.org1.example.com --tail 40
  exit /b 1
)
timeout /t 2 /nobreak >nul
goto wait_peer
:peer_ok
call :log "[OK] Peer listo"
timeout /t 5 /nobreak >nul

:: Validar identidad Admin del CLI (detecta MSP malformado / canal viejo)
call :check_cli_identity
if errorlevel 1 (
  if "!RECOVERY_DONE!"=="0" (
    call :log "[AVISO] Identidad/canal inconsistente (creator malformed). Reset completo..."
    set "RECOVERY_DONE=1"
    call :do_clean
    goto do_up
  )
  call :err "Identidad MSP sigue invalida tras reset. Revisa fabric-network.log"
  exit /b 1
)

docker exec fabric-cli peer channel list 2>nul | findstr /i "%CHANNEL%" >nul
if errorlevel 1 (
  call :log "[5/7] Creando canal %CHANNEL%..."
  call :create_channel
  if errorlevel 1 (
    if "!RECOVERY_DONE!"=="0" (
      call :log "[AVISO] Canal fallo; reset completo..."
      set "RECOVERY_DONE=1"
      call :do_clean
      goto do_up
    )
    exit /b 1
  )
) else (
  call :log "[5/7] Canal %CHANNEL% ya existe; verificando lectura..."
  docker exec fabric-cli peer channel getinfo -c %CHANNEL% >"%TEMP%\mr-chinfo.txt" 2>&1
  findstr /i /c:"height:" "%TEMP%\mr-chinfo.txt" >nul
  if errorlevel 1 (
    findstr /i /c:"malformed" /c:"access denied" /c:"creator org" "%TEMP%\mr-chinfo.txt" >nul
    if not errorlevel 1 (
      if "!RECOVERY_DONE!"=="0" (
        call :log "[AVISO] Canal existe pero Admin no es valido. Reset completo..."
        type "%TEMP%\mr-chinfo.txt" >>"%LOG%"
        set "RECOVERY_DONE=1"
        call :do_clean
        goto do_up
      )
    )
    call :log "[AVISO] No se pudo leer height; se continua"
  ) else (
    call :log "[OK] Canal legible"
  )
)

call :wait_channel_height
timeout /t 5 /nobreak >nul

docker exec fabric-cli peer lifecycle chaincode querycommitted --channelID %CHANNEL% --name %CC_NAME% >nul 2>&1
if errorlevel 1 (
  call :log "[6/7] Desplegando chaincode %CC_NAME%..."
  call :deploy_cc
  if errorlevel 1 (
    findstr /i /c:"malformed" /c:"creator org" "%LOG%" >nul
    if not errorlevel 1 if "!RECOVERY_DONE!"=="0" (
      call :log "[AVISO] Deploy fallo por MSP. Reset completo..."
      set "RECOVERY_DONE=1"
      call :do_clean
      goto do_up
    )
    exit /b 1
  )
) else (
  call :log "[6/7] Chaincode ya committed"
)

call :log "[7/7] Generando connection.json + wallet..."
where node >nul 2>nul
if errorlevel 1 (
  call :err "node no esta en PATH"
  exit /b 1
)
pushd "%ROOT%"
node scripts\enrollAppUser.js >>"%LOG%" 2>&1
set "RC=!ERRORLEVEL!"
popd
if not "!RC!"=="0" (
  call :err "enrollAppUser.js fallo"
  exit /b 1
)

call :log "[OK] Red Fabric operativa en Windows"
call :log "  Peer:    localhost:7051"
call :log "  Orderer: localhost:7050"
call :log "  Canal:   %CHANNEL%"
call :log "  CC:      %CC_NAME%"
exit /b 0

:check_cli_identity
:: Comprueba que el MSP Admin tiene config.yaml y que el CLI puede firmar
docker exec fabric-cli sh -lc "test -f \"$CORE_PEER_MSPCONFIGPATH/config.yaml\" && test -d \"$CORE_PEER_MSPCONFIGPATH/signcerts\" && test -d \"$CORE_PEER_MSPCONFIGPATH/keystore\" && test -d \"$CORE_PEER_MSPCONFIGPATH/cacerts\"" >nul 2>&1
if errorlevel 1 (
  call :log "[AVISO] MSP Admin incompleto dentro del contenedor CLI"
  exit /b 1
)
:: Si el canal no existe aun, channel list vacio es OK
docker exec fabric-cli peer channel list >"%TEMP%\mr-clist.txt" 2>&1
findstr /i /c:"malformed" /c:"creator org unknown" /c:"access denied" "%TEMP%\mr-clist.txt" >nul
if not errorlevel 1 (
  call :log "[AVISO] peer channel list rechazo identidad Admin"
  type "%TEMP%\mr-clist.txt" >>"%LOG%"
  exit /b 1
)
exit /b 0

:create_channel
set "OCA=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt"
set "OCERT=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt"
set "OKEY=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key"
set "BLOCK=./channel-artifacts/%CHANNEL%.block"

docker exec fabric-cli osnadmin channel join --channelID %CHANNEL% --config-block %BLOCK% -o orderer.example.com:7053 --ca-file %OCA% --client-cert %OCERT% --client-key %OKEY% >>"%LOG%" 2>&1
if errorlevel 1 (
  call :err "osnadmin channel join fallo"
  docker logs orderer.example.com --tail 30
  exit /b 1
)
timeout /t 3 /nobreak >nul
docker exec fabric-cli peer channel join -b %BLOCK% >>"%LOG%" 2>&1
if errorlevel 1 (
  call :err "peer channel join fallo"
  docker logs peer0.org1.example.com --tail 30
  exit /b 1
)
docker exec fabric-cli peer channel list >>"%LOG%" 2>&1
call :log "[OK] Canal listo"
exit /b 0

:wait_channel_height
set /a _h=0
:wh_loop
set /a _h+=1
docker exec fabric-cli peer channel getinfo -c %CHANNEL% >"%TEMP%\mr-chinfo.txt" 2>&1
findstr /i "height:" "%TEMP%\mr-chinfo.txt" >nul
if not errorlevel 1 (
  call :log "[OK] Canal entregando bloques"
  exit /b 0
)
if !_h! GEQ 30 (
  call :log "[AVISO] No se pudo leer height; se continua"
  exit /b 0
)
timeout /t 2 /nobreak >nul
goto wh_loop

:deploy_cc
set "ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
set "PEER_TLS=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
set "CC_IN_CLI=/opt/gopath/src/github.com/chaincode/music-royalty"
set "CC_LABEL=%CC_NAME%_%CC_VER%"
set "CC_PKG=%CC_NAME%.tar.gz"

call :log "  npm install chaincode..."
if exist "%CC%\node_modules\" goto npm_done
where npm >nul 2>nul
if not errorlevel 1 (
  pushd "%CC%"
  call npm install --omit=dev >>"%LOG%" 2>&1
  set "RC=!ERRORLEVEL!"
  popd
  if "!RC!"=="0" goto npm_done
)
call :log "  npm via Docker (fallback)..."
docker run --rm -v "%CC%:/chaincode" -w /chaincode node:18-alpine sh -c "npm install --omit=dev" >>"%LOG%" 2>&1
if errorlevel 1 (
  call :err "npm install del chaincode fallo"
  exit /b 1
)
:npm_done

set "PKG_ID="
call :get_pkg_id
if defined PKG_ID (
  call :log "  Ya instalado: !PKG_ID!"
  goto do_approve
)

call :log "  Empaquetando..."
docker exec -w /opt/gopath/src/github.com/hyperledger/fabric/peer fabric-cli peer lifecycle chaincode package %CC_PKG% --path %CC_IN_CLI% --lang node --label %CC_LABEL% >>"%LOG%" 2>&1
if errorlevel 1 (
  call :err "package fallo"
  exit /b 1
)

call :log "  Instalando en peer..."
docker exec fabric-cli peer lifecycle chaincode install %CC_PKG% >>"%LOG%" 2>&1
if errorlevel 1 (
  call :err "install fallo (revisa docker.sock del peer)"
  docker logs peer0.org1.example.com --tail 40
  exit /b 1
)

call :get_pkg_id
if not defined PKG_ID (
  call :err "No se obtuvo Package ID"
  docker exec fabric-cli peer lifecycle chaincode queryinstalled
  exit /b 1
)
call :log "  Package ID: !PKG_ID!"

:do_approve
set /a _a=0
:approve_loop
set /a _a+=1
call :log "  approveformyorg intento !_a!/5..."
docker exec fabric-cli peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --channelID %CHANNEL% --name %CC_NAME% --version %CC_VER% --package-id !PKG_ID! --sequence %CC_SEQ% --tls --cafile %ORDERER_CA% --signature-policy OR('Org1MSP.peer') >"%TEMP%\mr-approve.txt" 2>&1
type "%TEMP%\mr-approve.txt" >>"%LOG%"
findstr /i /c:"malformed" /c:"creator org unknown" "%TEMP%\mr-approve.txt" >nul
if not errorlevel 1 (
  call :err "approve rechazo identidad Admin: creator malformed (MSP/canal inconsistente)"
  type "%TEMP%\mr-approve.txt"
  exit /b 1
)
timeout /t 6 /nobreak >nul
docker exec fabric-cli peer lifecycle chaincode checkcommitreadiness --channelID %CHANNEL% --name %CC_NAME% --version %CC_VER% --sequence %CC_SEQ% --tls --cafile %ORDERER_CA% --signature-policy OR('Org1MSP.peer') --output json >"%TEMP%\mr-ready.json" 2>&1
findstr /i "true" "%TEMP%\mr-ready.json" >nul
if not errorlevel 1 goto approve_ok
if !_a! GEQ 5 (
  call :err "approveformyorg no alcanzo readiness"
  type "%TEMP%\mr-ready.json"
  docker logs orderer.example.com --tail 25
  docker logs peer0.org1.example.com --tail 25
  exit /b 1
)
timeout /t 10 /nobreak >nul
goto approve_loop
:approve_ok
call :log "[OK] commit readiness OK"

call :log "  commit..."
docker exec fabric-cli peer lifecycle chaincode commit -o orderer.example.com:7050 --channelID %CHANNEL% --name %CC_NAME% --version %CC_VER% --sequence %CC_SEQ% --tls --cafile %ORDERER_CA% --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles %PEER_TLS% --signature-policy OR('Org1MSP.peer') >>"%LOG%" 2>&1
if errorlevel 1 (
  timeout /t 8 /nobreak >nul
  docker exec fabric-cli peer lifecycle chaincode commit -o orderer.example.com:7050 --channelID %CHANNEL% --name %CC_NAME% --version %CC_VER% --sequence %CC_SEQ% --tls --cafile %ORDERER_CA% --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles %PEER_TLS% --signature-policy OR('Org1MSP.peer') --waitForEvent --waitForEventTimeout 180s >>"%LOG%" 2>&1
  if errorlevel 1 (
    call :err "commit fallo"
    exit /b 1
  )
)

timeout /t 5 /nobreak >nul
docker exec fabric-cli peer lifecycle chaincode querycommitted --channelID %CHANNEL% --name %CC_NAME% >>"%LOG%" 2>&1

call :log "  InitLedger..."
docker exec fabric-cli sh -lc "peer chaincode invoke -o orderer.example.com:7050 --tls --cafile %ORDERER_CA% -C %CHANNEL% -n %CC_NAME% --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles %PEER_TLS% -c '{\"function\":\"InitLedger\",\"Args\":[]}'" >>"%LOG%" 2>&1
call :log "[OK] Chaincode desplegado"
exit /b 0

:get_pkg_id
set "PKG_ID="
docker exec fabric-cli peer lifecycle chaincode queryinstalled >"%TEMP%\mr-installed.txt" 2>&1
for /f "delims=" %%P in ('powershell -NoProfile -Command "$l=Get-Content -Raw $env:TEMP\mr-installed.txt; if($l -match ('Package ID: ([^,]+), Label: {0}' -f [regex]::Escape('%CC_LABEL%'))){$Matches[1].Trim()}"') do set "PKG_ID=%%P"
exit /b 0

:log
echo %~1
>>"%LOG%" echo %date% %time% %~1
exit /b 0

:err
echo [ERROR] %~1
>>"%LOG%" echo %date% %time% [ERROR] %~1
exit /b 1
