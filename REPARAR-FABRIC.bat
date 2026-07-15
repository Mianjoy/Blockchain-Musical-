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
echo  Fabric 2.5.15 / CA 1.5.15
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

echo [1/2] Limpiando red y artefactos...
call "%~dp0scripts\windows\fabric-up.bat" clean
echo.
echo [2/2] Regenerando crypto + levantando red...
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
  echo Mientras tanto puedes probar la app con ARRANCAR-DEMO.bat
  echo.
  pause
  exit /b 1
)

echo.
echo [OK] Red Fabric reparada.
echo      Ahora: ARRANCAR-FABRIC.bat  ^(solo app en modo Fabric^)
echo      o:     ARRANCAR.bat
echo.
pause
endlocal
