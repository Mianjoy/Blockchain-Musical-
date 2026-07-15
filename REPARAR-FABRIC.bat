@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
title Reparar red Fabric
cd /d "%~dp0"

echo.
echo ==============================================================
echo  REPARAR RED HYPERLEDGER FABRIC
echo ==============================================================
echo.
echo  Esto limpia la red y artefactos y vuelve a generarlos.
echo  Usa esto si viste error 125 o fallo al levantar Fabric.
echo.

call "%~dp0scripts\windows\refresh-path.bat"
call "%~dp0scripts\windows\find-bash.bat"
if not defined MR_BASH (
  echo [ERROR] Git Bash no encontrado.
  pause
  exit /b 1
)

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

echo [1/2] Limpiando red y artefactos...
call "%~dp0scripts\windows\run-bash.bat" network/scripts/network.sh clean
echo.
echo [2/2] Regenerando crypto + levantando red...
call "%~dp0scripts\windows\run-bash.bat" network/scripts/network.sh up
if errorlevel 1 (
  echo.
  echo [ERROR] Sigue fallando. Revisa fabric-network.log
  echo.
  echo En Docker Desktop:
  echo  - Settings ^> Resources ^> File sharing
  echo  - Marca la unidad del proyecto ^(C: o D:^)
  echo  - Apply ^& Restart
  echo.
  pause
  exit /b 1
)

echo.
echo [OK] Red Fabric reparada. Ahora puedes ejecutar start-system.bat
echo      o ARRANCAR.bat otra vez.
echo.
pause
endlocal
