@echo off
:: =============================================================================
:: APP-UP.bat — Solo API + Frontend
:: Si Fabric ya esta arriba (puerto 7051 + connection.json), se conecta.
:: Si no, arranca en simulacion para que la UI siempre sea usable.
:: =============================================================================
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
title Music Royalty - APP UP
cd /d "%~dp0"
set "ROOT=%CD%"

echo.
echo ==============================================================
echo  APP UP — API + Frontend ^(separado de Fabric^)
echo ==============================================================
echo.

call "%ROOT%\scripts\windows\refresh-path.bat"
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js no encontrado.
  pause
  exit /b 1
)

:: Detectar si Fabric contenedor esta escuchando
set "FABRIC_READY=0"
if exist "%ROOT%\connection.json" if exist "%ROOT%\wallet" (
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "try { $c=New-Object Net.Sockets.TcpClient; $c.ReceiveTimeout=800; $c.SendTimeout=800; $iar=$c.BeginConnect('127.0.0.1',7051,$null,$null); if(-not $iar.AsyncWaitHandle.WaitOne(800,$false)){ $c.Close(); exit 1 }; $c.EndConnect($iar); $c.Close(); exit 0 } catch { exit 1 }" >nul 2>nul
  if not errorlevel 1 set "FABRIC_READY=1"
)

if "!FABRIC_READY!"=="1" (
  echo [OK] Fabric detectado en localhost:7051 — API en modo FABRIC
  call "%ROOT%\scripts\windows\start-app.bat" fabric
) else (
  echo [AVISO] Fabric NO esta arriba ^(o falta connection.json/wallet^).
  echo         Arrancando APP en SIMULACION.
  echo         Para blockchain real: ejecuta antes FABRIC-UP.bat
  echo.
  call "%ROOT%\scripts\windows\start-app.bat" simulation
)

set "RC=!ERRORLEVEL!"
echo.
if "!FABRIC_READY!"=="1" (
  echo Modo activo: FABRIC conectado a contenedores
) else (
  echo Modo activo: SIMULACION
)
echo Health: http://localhost:3000/health
echo UI:     http://localhost:3001
echo.
pause
exit /b !RC!
