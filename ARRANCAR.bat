@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
title Music Royalty - Arrancar
cd /d "%~dp0"

set "ROOT=%CD%"
set "LOG=%ROOT%\arranque.log"
echo.>"%LOG%"

call :log "=============================================================="
call :log " MUSIC ROYALTY - ARRANQUE WINDOWS"
call :log "=============================================================="
call :log "Carpeta: %ROOT%"
echo.
echo  1^) Prepara Node / Docker
echo  2^) Intenta Hyperledger Fabric ^(ruta Windows nativa, sin Git Bash^)
echo  3^) Si Fabric falla, arranca DEMO en simulacion ^(siempre usable^)
echo.
echo  Logs: arranque.log / fabric-network.log
echo.
echo  Solo Fabric real:  ARRANCAR-FABRIC.bat
echo  Solo simulacion:   ARRANCAR-DEMO.bat
echo.

call "%ROOT%\scripts\windows\refresh-path.bat"

:: ---- Node ----
where node >nul 2>nul
if errorlevel 1 (
  where winget >nul 2>nul
  if not errorlevel 1 (
    call :log "[..] Instalando Node.js LTS..."
    winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    call "%ROOT%\scripts\windows\refresh-path.bat"
  )
)
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 (
  start "" "https://nodejs.org/en/download"
  call :fatal "Instala Node.js LTS y vuelve a ejecutar ARRANCAR.bat"
)

:: ---- npm deps ----
if not exist "%ROOT%\node_modules\" (
  call :log "[..] npm install backend..."
  pushd "%ROOT%" & call npm install & set "E=!ERRORLEVEL!" & popd
  if not "!E!"=="0" call :fatal "npm install backend fallo"
)
if not exist "%ROOT%\frontend\node_modules\" (
  call :log "[..] npm install frontend..."
  pushd "%ROOT%\frontend" & call npm install & set "E=!ERRORLEVEL!" & popd
  if not "!E!"=="0" call :fatal "npm install frontend fallo"
)

:: ---- Docker ----
set "TRY_FABRIC=1"
where docker >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"
)
where docker >nul 2>nul
if errorlevel 1 (
  call :log "[AVISO] Sin Docker: se usara modo DEMO/simulacion"
  set "TRY_FABRIC=0"
) else (
  docker info >nul 2>nul
  if errorlevel 1 (
    if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
    call :log "[..] Esperando Docker Desktop..."
    set /a _i=0
    :wait_d
    set /a _i+=1
    docker info >nul 2>nul
    if not errorlevel 1 goto docker_ready
    if !_i! GEQ 24 (
      call :log "[AVISO] Docker no respondio: se usara modo DEMO/simulacion"
      set "TRY_FABRIC=0"
      goto after_docker
    )
    timeout /t 5 /nobreak >nul
    goto wait_d
  )
)
:docker_ready
:after_docker

if "!TRY_FABRIC!"=="1" (
  call :log "[FABRIC] Levantando Hyperledger Fabric 2.5.15 ^(Windows nativo^)..."
  call "%ROOT%\scripts\windows\fabric-up.bat" up
  if errorlevel 1 (
    call :log "[AVISO] Fabric fallo. Arrancando DEMO en simulacion."
    echo.
    echo ==============================================================
    echo  Fabric no completo el despliegue.
    echo  Se inicia MODO DEMO / SIMULACION para que puedas probar la app.
    echo  Para insistir en Fabric real: REPARAR-FABRIC.bat + ARRANCAR-FABRIC.bat
    echo ==============================================================
    echo.
    call "%ROOT%\scripts\windows\start-app.bat" simulation
    set "APP_RC=!ERRORLEVEL!"
    goto end_app
  )
  call :log "[FABRIC] Red OK. Arrancando API en modo Fabric..."
  call "%ROOT%\scripts\windows\start-app.bat" fabric
  set "APP_RC=!ERRORLEVEL!"
  goto end_app
)

call :log "[DEMO] Arrancando sin Fabric ^(simulacion^)..."
call "%ROOT%\scripts\windows\start-app.bat" simulation
set "APP_RC=!ERRORLEVEL!"

:end_app
if not "!APP_RC!"=="0" (
  call :fatal "No se pudo iniciar la API/Frontend"
)
echo.
echo Sistema listo. Abre http://localhost:3001
echo Health: http://localhost:3000/health
echo Para detener: DETENER.bat
echo.
pause
exit /b 0

:log
echo %~1
>>"%LOG%" echo %date% %time% %~1
exit /b 0

:fatal
echo.
echo [ERROR] %~1
>>"%LOG%" echo %date% %time% [ERROR] %~1
echo.
pause
exit /b 1
