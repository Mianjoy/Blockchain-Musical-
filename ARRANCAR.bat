@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
title Music Royalty - Arrancar (Fabric + App)
cd /d "%~dp0"
set "ROOT=%CD%"

:: Uso:
::   ARRANCAR.bat          -> Fabric + API + UI (sin simulacion)
::   ARRANCAR.bat /demo    -> solo simulacion (sin Docker)
::   ARRANCAR.bat /fabric  -> solo Fabric
::   ARRANCAR.bat /app     -> solo App
::   ARRANCAR.bat /menu    -> menu

if /i "%~1"=="/demo" (
  call "%ROOT%\ARRANCAR-DEMO.bat"
  exit /b !ERRORLEVEL!
)
if /i "%~1"=="/fabric" (
  call "%ROOT%\FABRIC-UP.bat"
  exit /b !ERRORLEVEL!
)
if /i "%~1"=="/app" (
  call "%ROOT%\APP-UP.bat"
  exit /b !ERRORLEVEL!
)
if /i "%~1"=="/menu" goto menu

echo.
echo ==============================================================
echo  MUSIC ROYALTY — ARRANQUE COMPLETO ^(FABRIC REAL^)
echo ==============================================================
echo  1^) Hyperledger Fabric ^(Docker, reset si MSP roto^)
echo  2^) API + Frontend en modo FABRIC ^(sin simulacion^)
echo  Puede tardar varios minutos la primera vez.
echo ==============================================================
echo.

call "%ROOT%\scripts\windows\refresh-path.bat"
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js no encontrado. Ejecuta install-dependencies.bat
  pause
  exit /b 1
)

echo.
echo [1/2] Levantando Hyperledger Fabric...
echo.
call "%ROOT%\FABRIC-UP.bat" /nopause
if errorlevel 1 (
  echo.
  echo [AVISO] Fabric fallo. Reparando desde cero ^(volumenes + crypto^)...
  echo.
  call "%ROOT%\scripts\windows\fabric-up.bat" clean
  call "%ROOT%\FABRIC-UP.bat" /nopause
  if errorlevel 1 (
    echo.
    echo [ERROR] No se pudo levantar Fabric real.
    echo         1^) Docker Desktop en verde
    echo         2^) FIX-DOCKER-API.bat si aparece error 1.25
    echo         3^) REPARAR-FABRIC.bat
    echo         Revisa: fabric-network.log
    echo.
    echo Para UI sin blockchain: ARRANCAR.bat /demo
    echo.
    pause
    exit /b 1
  )
)

echo.
echo [2/2] Levantando API + Frontend en modo FABRIC...
echo.
:: Forzar modo fabric estricto (APP-UP detecta peer + connection.json)
call "%ROOT%\APP-UP.bat" /nopause
set "RC=!ERRORLEVEL!"

echo.
echo ==============================================================
echo  SISTEMA LISTO ^(modo Fabric^)
echo ==============================================================
echo  UI:      http://localhost:3001
echo  API:     http://localhost:3000/api
echo  Health:  http://localhost:3000/health
echo           ^(debe decir fabric.connected / simulation:false^)
echo.
echo  Detener: DETENER.bat  /  CERRAR-TODO.bat
echo ==============================================================
echo.
pause
exit /b !RC!

:menu
echo.
echo ==============================================================
echo  MUSIC ROYALTY — MENU
echo ==============================================================
echo.
echo    [1] Fabric + App ^(completo, sin simulacion^)
echo    [2] Solo APP / DEMO ^(simulacion^)
echo    [3] Solo FABRIC
echo    [4] Solo APP
echo    [5] Salir
echo.
choice /C 12345 /N /M "Elige opcion [1-5]: "
set "OPT=!ERRORLEVEL!"

if "!OPT!"=="1" (
  call "%~f0"
  exit /b !ERRORLEVEL!
)
if "!OPT!"=="2" (
  call "%ROOT%\ARRANCAR-DEMO.bat"
  exit /b !ERRORLEVEL!
)
if "!OPT!"=="3" (
  call "%ROOT%\FABRIC-UP.bat"
  exit /b !ERRORLEVEL!
)
if "!OPT!"=="4" (
  call "%ROOT%\APP-UP.bat"
  exit /b !ERRORLEVEL!
)
exit /b 0
