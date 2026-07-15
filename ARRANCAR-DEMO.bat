@echo off
setlocal
chcp 65001 >nul 2>nul
title Music Royalty - DEMO (simulacion)
cd /d "%~dp0"

echo.
echo ==============================================================
echo  MODO DEMO / SIMULACION
echo ==============================================================
echo  No requiere Hyperledger Fabric ni Docker.
echo  Ideal para probar catalogo, compras, analytics y notificaciones.
echo.
echo  La blockchain se simula en memoria ^(no es Fabric real^).
echo ==============================================================
echo.

call "%~dp0scripts\windows\refresh-path.bat"

where node >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
)
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Necesitas Node.js. Ejecuta install-dependencies.bat o instala desde nodejs.org
  pause
  exit /b 1
)

call "%~dp0scripts\windows\start-app.bat" simulation
echo.
pause
endlocal
