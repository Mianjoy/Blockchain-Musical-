@echo off
:: Solo apaga contenedores Fabric (deja API/UI si siguen abiertas)
setlocal
chcp 65001 >nul 2>nul
title Music Royalty - FABRIC DOWN
cd /d "%~dp0.."
set "ROOT=%CD%"

echo.
echo Deteniendo solo Hyperledger Fabric...
call "%ROOT%\scripts\windows\refresh-path.bat" 2>nul
call "%ROOT%\scripts\windows\find-docker.bat" 2>nul
if errorlevel 1 (
  echo [AVISO] Docker no disponible — nada que detener via CLI.
  pause
  exit /b 0
)

call "%ROOT%\scripts\windows\fabric-up.bat" down
echo.
echo Fabric detenido. La API/UI pueden seguir corriendo.
echo Para cerrar TODO: launchers\CERRAR-TODO.bat
echo.
pause
exit /b 0
