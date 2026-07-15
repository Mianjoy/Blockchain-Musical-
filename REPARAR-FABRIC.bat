@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
title Reparar red Fabric
cd /d "%~dp0"

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
echo     1^) FIX-DOCKER-API.bat
echo     2^) Apply ^& Restart en Docker Desktop
echo     3^) Este script de nuevo
echo.

call "%~dp0scripts\windows\refresh-path.bat"
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
docker pull hyperledger/fabric-orderer:2.5.16
docker pull hyperledger/fabric-tools:2.5.16
docker pull hyperledger/fabric-ca:1.5.21
docker pull node:18-alpine

echo [1/3] Limpiando red, volumenes Docker y certificados viejos...
call "%~dp0scripts\windows\fabric-up.bat" clean
if errorlevel 1 (
  echo [ERROR] Limpieza fallo
  pause
  exit /b 1
)

echo.
echo [2/3] Regenerando crypto + config.yaml NodeOUs...
call "%~dp0scripts\windows\generate-crypto-native.bat"
if errorlevel 1 (
  echo [ERROR] Crypto fallo. Activa File sharing de la unidad en Docker Desktop.
  pause
  exit /b 1
)

echo.
echo [3/3] Levantando red Fabric limpia...
call "%~dp0scripts\windows\fabric-up.bat" up
if errorlevel 1 (
  echo.
  echo [ERROR] Sigue fallando. Revisa fabric-network.log
  echo.
  echo En Docker Desktop:
  echo  - Settings ^> Resources ^> File sharing
  echo  - Marca la unidad del proyecto ^(C: o D:^)
  echo  - Apply ^& Restart
  echo.
  echo Si el error era "creator malformed", la limpieza de arriba
  echo borra canal/volumenes viejos incompatibles con certificados nuevos.
  echo.
  echo Si el error era "client version too old":
  echo  - Ejecuta FIX-DOCKER-API.bat y Apply ^& Restart
  echo.
  echo Mientras tanto: ARRANCAR-DEMO.bat
  echo.
  pause
  exit /b 1
)

echo.
echo [OK] Red Fabric 2.5.16 reparada desde cero.
echo      Ahora: ARRANCAR-FABRIC.bat
echo.
pause
endlocal
