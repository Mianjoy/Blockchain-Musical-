@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
title Reparar red Fabric
cd /d "%~dp0.."
set "ROOT=%CD%"

echo.
echo ==============================================================
echo  REPARAR RED HYPERLEDGER FABRIC ^(Windows nativo^)
echo ==============================================================
echo.
echo  Limpia red + artefactos y vuelve a generarlos con fabric-up.bat
echo  ^(CMD + Docker, sin Git Bash^).
echo.
echo  Fabric 2.5.16 / CA 1.5.21
echo  Si el error fue "client version 1.25 is too old":
echo     1^) launchers\FIX-DOCKER-API.bat
echo     2^) Apply ^& Restart en Docker Desktop
echo     3^) Este script de nuevo
echo.

call "%ROOT%\scripts\windows\refresh-path.bat"
if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"

where docker >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Docker no encontrado.
  pause
  exit /b 1
)

docker info >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Docker Desktop no esta activo.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js no encontrado.
  pause
  exit /b 1
)

echo.
echo [0/3] Descargando imagenes Fabric 2.5.16 / CA 1.5.21...
docker pull hyperledger/fabric-peer:2.5.16
if errorlevel 1 goto pull_fail
docker pull hyperledger/fabric-orderer:2.5.16
if errorlevel 1 goto pull_fail
docker pull hyperledger/fabric-tools:2.5.16
if errorlevel 1 goto pull_fail
docker pull hyperledger/fabric-ca:1.5.21
if errorlevel 1 goto pull_fail
docker pull node:18-alpine
if errorlevel 1 goto pull_fail
goto pull_ok

:pull_fail
echo [ERROR] Fallo al descargar imagenes. Revisa internet / Docker Hub.
pause
exit /b 1

:pull_ok
echo [1/3] Limpiando red, volumenes Docker y certificados viejos...
call "%ROOT%\scripts\windows\fabric-up.bat" clean
if errorlevel 1 (
  echo [ERROR] Limpieza fallo
  pause
  exit /b 1
)

echo [2/3] Regenerando crypto + canal + chaincode...
call "%ROOT%\scripts\windows\fabric-up.bat" up
if errorlevel 1 (
  echo [ERROR] Fabric no completo. Revisa logs\fabric-network.log
  echo         Si es Docker API 1.25: ejecuta launchers\FIX-DOCKER-API.bat
  pause
  exit /b 1
)

echo.
echo [OK] Red Fabric 2.5.16 reparada desde cero.
echo      Siguiente: Blockchain MUSIC.exe  o  launchers\APP-UP.bat / ARRANCAR.bat
echo.
pause
exit /b 0
