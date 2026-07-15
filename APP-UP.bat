@echo off
:: =============================================================================
:: APP-UP.bat — Solo API + Frontend
:: Si Fabric ya esta arriba (puerto 7051), genera connection/wallet si faltan
:: y conecta. Si no hay Fabric, arranca en simulacion.
:: =============================================================================
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
title Music Royalty - APP UP
cd /d "%~dp0"
set "ROOT=%CD%"
set "NOPAUSE=0"
if /i "%~1"=="/nopause" set "NOPAUSE=1"
if /i "%~1"=="/from-arrancar" set "NOPAUSE=1"

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
  if "!NOPAUSE!"=="0" pause
  exit /b 1
)

:: Detectar peer Fabric en 7051
set "PEER_UP=0"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { $c=New-Object Net.Sockets.TcpClient; $c.ReceiveTimeout=800; $c.SendTimeout=800; $iar=$c.BeginConnect('127.0.0.1',7051,$null,$null); if(-not $iar.AsyncWaitHandle.WaitOne(800,$false)){ $c.Close(); exit 1 }; $c.EndConnect($iar); $c.Close(); exit 0 } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 set "PEER_UP=1"

:: Si hay peer, regenerar connection/wallet desde crypto actual (evita MSP viejo)
if "!PEER_UP!"=="1" (
  if exist "%ROOT%\network\organizations\peerOrganizations\org1.example.com\peers\peer0.org1.example.com\tls\ca.crt" (
    echo [INFO] Regenerando connection.json + wallet desde crypto actual...
    pushd "%ROOT%"
    set "FORCE_REENROLL=1"
    node scripts\enrollAppUser.js
    set "ENROLL_RC=!ERRORLEVEL!"
    popd
    if not "!ENROLL_RC!"=="0" (
      echo [AVISO] No se pudo regenerar wallet. Revisar FABRIC-UP / REPARAR-FABRIC.
      set "PEER_UP=0"
    )
  ) else (
    echo [AVISO] Falta crypto MSP en network\organizations. Ejecuta FABRIC-UP.bat
    set "PEER_UP=0"
  )
)

set "FABRIC_READY=0"
if "!PEER_UP!"=="1" if exist "%ROOT%\connection.json" set "FABRIC_READY=1"

if "!FABRIC_READY!"=="1" (
  echo [OK] Fabric detectado — API en modo FABRIC
  echo      connection: %ROOT%\connection.json
  call "%ROOT%\scripts\windows\start-app.bat" fabric
) else (
  echo [AVISO] Fabric NO esta listo ^(peer o connection.json^).
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
if "!NOPAUSE!"=="0" pause
exit /b !RC!
