@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Music Royalty - Hyperledger Fabric

echo.
echo ==============================================
echo   SISTEMA DE REGALIAS MUSICALES + FABRIC
echo ==============================================
echo.

:: Ir al directorio del script
cd /d "%~dp0"

:: 1. Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Docker no esta instalado.
  echo Instala Docker Desktop: https://www.docker.com/products/docker-desktop/
  pause
  exit /b 1
)

docker info >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo [AVISO] Docker no responde. Intentando abrir Docker Desktop...
  if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
  )
  echo Esperando 40 segundos a que Docker inicie...
  timeout /t 40 /nobreak >nul
  docker info >nul 2>nul
  if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker Desktop no esta activo. Abrelo manualmente y reintenta.
    pause
    exit /b 1
  )
)
echo [OK] Docker activo.

:: 2. Buscar bash (Git Bash o WSL) para scripts de red
set "BASH_CMD="
where bash >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  set "BASH_CMD=bash"
) else if exist "C:\Program Files\Git\bin\bash.exe" (
  set "BASH_CMD=C:\Program Files\Git\bin\bash.exe"
) else (
  where wsl >nul 2>nul
  if %ERRORLEVEL% EQU 0 set "BASH_CMD=wsl"
)

if "%BASH_CMD%"=="" (
  echo [ERROR] Se necesita Git Bash o WSL para orquestar Hyperledger Fabric.
  echo Instala Git for Windows: https://git-scm.com/download/win
  pause
  exit /b 1
)
echo [OK] Shell: %BASH_CMD%

:: 3. Node.js (app en host: connection.json con localhost)
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Node.js no esta instalado (se usa para API/frontend y wallet).
  echo Descarga LTS: https://nodejs.org/
  pause
  exit /b 1
)
echo [OK] Node.js encontrado.

:: 4. Dependencias npm
if not exist "node_modules\" (
  echo [INFO] Instalando dependencias del backend...
  call npm install
  if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install fallo
    pause
    exit /b 1
  )
)
if not exist "frontend\node_modules\" (
  echo [INFO] Instalando dependencias del frontend...
  pushd frontend
  call npm install
  popd
  if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install frontend fallo
    pause
    exit /b 1
  )
)

:: 5. Levantamiento de red Fabric (peer, orderer, CA, canal, chaincode, wallet)
echo.
echo [INFO] Levantando Hyperledger Fabric (puede tardar varios minutos la primera vez)...
"%BASH_CMD%" "network/scripts/network.sh" up
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Fallo al levantar la red Fabric.
  echo Revisa logs: docker compose -f network/docker-compose-net.yaml logs
  pause
  exit /b 1
)

:: 6. Verificar health de peer
echo [INFO] Verificando peer...
docker exec peer0.org1.example.com peer channel list >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] El peer no responde.
  pause
  exit /b 1
)
echo [OK] Red Fabric lista.

:: 7. Arrancar API y Frontend (sin simulación)
set ALLOW_SIMULATION=false
set CHANNEL_NAME=mychannel
set CHAINCODE_NAME=music-royalty
set PORT=3000
set HOST=0.0.0.0

echo.
echo [INFO] Iniciando backend (API)...
start "MusicRoyalty-API" cmd /k "cd /d "%~dp0" && set ALLOW_SIMULATION=false && set CHANNEL_NAME=mychannel && set CHAINCODE_NAME=music-royalty && node index.js"

timeout /t 5 /nobreak >nul

echo [INFO] Iniciando frontend...
start "MusicRoyalty-UI" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 0.0.0.0 --port 3001"

:: 8. Healthcheck API
echo [INFO] Esperando API...
set READY=0
for /L %%i in (1,1,30) do (
  powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing http://localhost:3000/health -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>nul
  if !ERRORLEVEL! EQU 0 (
    set READY=1
    goto :api_ok
  )
  timeout /t 2 /nobreak >nul
)

:api_ok
if "!READY!"=="0" (
  echo [AVISO] La API no respondio a tiempo. Revisa la ventana MusicRoyalty-API.
) else (
  echo [OK] API saludable en http://localhost:3000/health
)

echo.
echo ==============================================
echo   SISTEMA LISTO
echo ==============================================
echo   Frontend:  http://localhost:3001
echo   API:       http://localhost:3000/api
echo   Health:    http://localhost:3000/health
echo   Peer:      localhost:7051
echo   Orderer:   localhost:7050
echo   CA:        localhost:7054
echo.
echo   Para detener: stop-system.bat
echo ==============================================
echo.

start http://localhost:3001
pause
endlocal
