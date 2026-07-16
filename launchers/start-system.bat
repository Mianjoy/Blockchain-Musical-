@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
title Music Royalty - Hyperledger Fabric
cd /d "%~dp0.."
set "ROOT=%CD%"
set "FROM_ARRANCAR=0"
set "FORCE_SIM=0"
if /i "%~1"=="/from-arrancar" set "FROM_ARRANCAR=1"
if /i "%~1"=="/simulation" set "FORCE_SIM=1"
if /i "%~2"=="/simulation" set "FORCE_SIM=1"

if "!FORCE_SIM!"=="1" (
  call "%ROOT%\scripts\windows\start-app.bat" simulation
  if "!FROM_ARRANCAR!"=="0" pause
  exit /b %ERRORLEVEL%
)

echo.
echo ==============================================
echo   SISTEMA + HYPERLEDGER FABRIC
echo ==============================================
echo.

call "%ROOT%\scripts\windows\refresh-path.bat"
call "%ROOT%\scripts\windows\find-bash.bat"

where docker >nul 2>nul
if errorlevel 1 (
  echo [AVISO] Docker no disponible. Arrancando DEMO/simulacion...
  call "%ROOT%\scripts\windows\start-app.bat" simulation
  if "!FROM_ARRANCAR!"=="0" pause
  exit /b %ERRORLEVEL%
)

docker info >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
  echo Esperando Docker...
  set /a _i=0
  :dw
  set /a _i+=1
  docker info >nul 2>nul
  if not errorlevel 1 goto dok
  if !_i! GEQ 24 (
    echo [AVISO] Docker no activo. Arrancando DEMO/simulacion...
    call "%ROOT%\scripts\windows\start-app.bat" simulation
    if "!FROM_ARRANCAR!"=="0" pause
    exit /b %ERRORLEVEL%
  )
  timeout /t 5 /nobreak >nul
  goto dw
)
:dok

if not defined MR_BASH (
  echo [AVISO] Sin Git Bash. Arrancando DEMO/simulacion...
  call "%ROOT%\scripts\windows\start-app.bat" simulation
  if "!FROM_ARRANCAR!"=="0" pause
  exit /b %ERRORLEVEL%
)

echo [INFO] Levantando Fabric...
call "%ROOT%\scripts\windows\run-bash.bat" network/scripts/network.sh up
if errorlevel 1 (
  echo.
  echo [AVISO] Fabric fallo ^(p.ej. timeout approveformyorg^).
  echo         Arrancando DEMO/simulacion para que puedas probar la app.
  echo.
  call "%ROOT%\scripts\windows\start-app.bat" simulation
  if "!FROM_ARRANCAR!"=="0" pause
  exit /b %ERRORLEVEL%
)

call "%ROOT%\scripts\windows\start-app.bat" fabric
if "!FROM_ARRANCAR!"=="0" pause
exit /b %ERRORLEVEL%
