@echo off
:: =============================================================================
:: FABRIC-UP.bat — Solo Hyperledger Fabric (contenedores Docker)
:: Independiente del frontend/API. Genera crypto, canal, chaincode y wallet.
:: La API se conecta despues con APP-UP.bat
:: =============================================================================
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
title Music Royalty - FABRIC UP
cd /d "%~dp0"

echo.
echo ==============================================================
echo  FABRIC UP — Stack blockchain separado ^(Fabric 3.1.5^)
echo ==============================================================
echo  Contenedores: CA / Orderer / Peer / CLI
echo  Red Docker:   music-royalty-fabric
echo  Luego arranca la app con: APP-UP.bat
echo.

call "%~dp0scripts\windows\refresh-path.bat"
if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"

where docker >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Docker Desktop no encontrado.
  pause
  exit /b 1
)

docker info >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
  echo [INFO] Esperando Docker Desktop...
  set /a _i=0
  :wait_d
  set /a _i+=1
  docker info >nul 2>nul
  if not errorlevel 1 goto docker_ok
  if !_i! GEQ 30 (
    echo [ERROR] Docker no respondio.
    pause
    exit /b 1
  )
  timeout /t 5 /nobreak >nul
  goto wait_d
)
:docker_ok

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js necesario para generar wallet ^(enrollAppUser.js^).
  pause
  exit /b 1
)

echo [FABRIC] Levantando contenedores + canal + chaincode...
call "%~dp0scripts\windows\fabric-up.bat" up
if errorlevel 1 (
  echo.
  echo [ERROR] Fabric no completo. Revisa fabric-network.log
  echo         Prueba: REPARAR-FABRIC.bat
  pause
  exit /b 1
)

echo.
echo ==============================================================
echo  FABRIC LISTO
echo ==============================================================
echo  Peer:     localhost:7051
echo  Orderer:  localhost:7050
echo  CA:       localhost:7054
echo  Perfiles: connection.json + connection-docker.json
echo  Wallet:   wallet\appUser
echo.
echo  Siguiente paso — arrancar la aplicacion conectada:
echo    APP-UP.bat
echo.
echo  Detener solo Fabric:
echo    FABRIC-DOWN.bat
echo.
pause
exit /b 0
