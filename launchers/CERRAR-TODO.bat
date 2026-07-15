@echo off
:: =============================================================================
:: CERRAR-TODO.bat — Apaga el sistema completo aunque algo NO haya arrancado
:: No falla si API, UI o Fabric ya estan detenidos.
:: =============================================================================
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
title Music Royalty - Cerrar TODO
cd /d "%~dp0.."
set "ROOT=%CD%"
set "NET=%ROOT%\network"

echo.
echo ==============================================================
echo  CERRAR SISTEMA COMPLETO - Music Royalty
echo ==============================================================
echo.
echo  Cierra: ventanas API/UI, puertos, contenedores Fabric
echo  Seguro ejecutar aunque no haya nada corriendo.
echo.

call "%ROOT%\scripts\windows\refresh-path.bat" 2>nul
if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" (
  set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"
)

:: ---- 1) Ventanas de consola ----
echo [1/4] Cerrando ventanas MusicRoyalty-API / MusicRoyalty-UI...
taskkill /FI "WINDOWTITLE eq MusicRoyalty-API*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq MusicRoyalty-UI*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq Music Royalty*" /T /F >nul 2>nul

:: ---- 2) Procesos en puertos de la app / Fabric ----
echo [2/4] Liberando puertos 3000, 3001, 7050, 7051, 7053, 7054...
call :kill_port 3000
call :kill_port 3001
call :kill_port 7050
call :kill_port 7051
call :kill_port 7053
call :kill_port 7054

:: ---- 3) Procesos node de este proyecto (por si quedaron huerfanos) ----
echo [3/4] Terminando procesos node de este proyecto ^(si hay^)...
for /f "tokens=2 delims=," %%P in ('tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH 2^>nul') do (
  set "PID=%%~P"
  if defined PID (
    wmic process where "ProcessId=!PID!" get CommandLine 2>nul | findstr /I /C:"Blockchain-Musical" /C:"MusicRoyalty" /C:"%ROOT%" >nul
    if not errorlevel 1 (
      taskkill /F /PID !PID! >nul 2>nul
    )
  )
)

:: ---- 4) Docker / Fabric ----
echo [4/4] Deteniendo contenedores Fabric ^(si Docker esta disponible^)...
where docker >nul 2>nul
if errorlevel 1 (
  echo       [AVISO] docker no esta en PATH — se omiten contenedores.
  goto fin
)

docker info >nul 2>nul
if errorlevel 1 (
  echo       [AVISO] Docker Desktop no responde — se omiten contenedores.
  goto fin
)

if exist "%NET%\docker-compose-net.yaml" (
  pushd "%NET%"
  set "IMAGE_TAG=2.5.16"
  set "CA_IMAGE_TAG=1.5.21"
  set "COMPOSE_PROJECT_NAME=musicroyalty"
  docker compose -f docker-compose-net.yaml down --volumes --remove-orphans >nul 2>&1
  popd
)

:: Contenedores sueltos de Fabric / chaincode
for %%N in (
  fabric-cli
  peer0.org1.example.com
  orderer.example.com
  ca_org1
) do (
  docker rm -f %%N >nul 2>&1
)

for /f "tokens=*" %%i in ('docker ps -aq --filter "name=dev-peer" 2^>nul') do (
  docker rm -f %%i >nul 2>&1
)

:: compose de API en Docker, si existe
if exist "%ROOT%\docker\docker-compose.app.yml" (
  pushd "%ROOT%"
  docker compose -f docker\docker-compose.app.yml down --remove-orphans >nul 2>&1
  popd
)
if exist "%ROOT%\docker-compose.app.yml" (
  pushd "%ROOT%"
  docker compose -f docker-compose.app.yml down --remove-orphans >nul 2>&1
  popd
)

:fin
echo.
echo ==============================================================
echo  SISTEMA CERRADO
echo ==============================================================
echo  API / Frontend / Fabric detenidos ^(o ya estaban apagados^).
echo.
echo  Para volver a arrancar:
echo    Blockchain MUSIC - Fabric.exe   ^(Fabric^)
echo    Blockchain MUSIC.exe            ^(API + UI^)
echo    launchers\ARRANCAR.bat          ^(completo / menu^)
echo    launchers\ARRANCAR.bat /demo    ^(solo simulacion^)
echo.
pause
exit /b 0

:kill_port
set "PORT=%~1"
for /f "tokens=5" %%P in ('netstat -ano 2^>nul ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
  if not "%%P"=="0" (
    taskkill /F /PID %%P >nul 2>nul
  )
)
exit /b 0
