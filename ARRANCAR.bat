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
call :log "Log:     %LOG%"
echo.
echo  Este asistente prepara dependencias y arranca Fabric + API + UI.
echo  Puede tardar varios minutos la primera vez.
echo.
echo  Registro en: arranque.log
echo.

call :log "[1/6] Refrescando PATH..."
call "%ROOT%\scripts\windows\refresh-path.bat"

call :log "[2/6] Comprobando Node.js..."
call "%ROOT%\scripts\windows\refresh-path.bat"
where node >nul 2>nul
if errorlevel 1 goto install_node
goto node_ready

:install_node
call :log "  Node no encontrado. Intentando winget..."
where winget >nul 2>nul
if errorlevel 1 (
  start "" "https://nodejs.org/en/download"
  set "ERRMSG=Instala Node.js LTS, cierra esta ventana y vuelve a ejecutar ARRANCAR.bat"
  goto fatal
)
winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
call "%ROOT%\scripts\windows\refresh-path.bat"
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 (
  set "ERRMSG=Node.js no esta en PATH. Reinicia el PC y reintenta ARRANCAR.bat"
  goto fatal
)

:node_ready
for /f "tokens=*" %%v in ('node -v 2^>nul') do call :log "  [OK] Node %%v"
where npm >nul 2>nul
if errorlevel 1 (
  set "ERRMSG=npm no encontrado. Reinstala Node.js LTS marcando Add to PATH."
  goto fatal
)

call :log "[3/6] Comprobando Git Bash..."
call "%ROOT%\scripts\windows\find-bash.bat"
if defined MR_BASH goto bash_ready
call :log "  Git Bash no encontrado. Intentando winget..."
where winget >nul 2>nul
if errorlevel 1 (
  start "" "https://git-scm.com/download/win"
  set "ERRMSG=Instala Git for Windows (con Git Bash) y reintenta ARRANCAR.bat"
  goto fatal
)
winget install -e --id Git.Git --accept-package-agreements --accept-source-agreements
call "%ROOT%\scripts\windows\refresh-path.bat"
call "%ROOT%\scripts\windows\find-bash.bat"
if not defined MR_BASH (
  set "ERRMSG=Git Bash sigue sin encontrarse. Instala Git for Windows y reintenta."
  goto fatal
)

:bash_ready
call :log "  [OK] %MR_BASH%"

call :log "[4/6] Comprobando Docker Desktop..."
call "%ROOT%\scripts\windows\refresh-path.bat"
where docker >nul 2>nul
if errorlevel 1 goto install_docker
goto docker_cli_ok

:install_docker
call :log "  Docker no encontrado. Intentando winget..."
where winget >nul 2>nul
if errorlevel 1 (
  start "" "https://www.docker.com/products/docker-desktop/"
  set "ERRMSG=Instala Docker Desktop, reinicia si te lo pide, abrilo (icono verde) y reintenta."
  goto fatal
)
winget install -e --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
set "ERRMSG=Docker Desktop se esta instalando. Reinicia el PC si lo pide, abre Docker (verde) y vuelve a ejecutar ARRANCAR.bat"
goto fatal

:docker_cli_ok
docker info >nul 2>nul
if not errorlevel 1 goto docker_ready
call :log "  Docker CLI OK pero el motor no responde. Abriendo Docker Desktop..."
if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
call :wait_docker
if errorlevel 1 (
  set "ERRMSG=Docker Desktop no esta activo. Abrelo, espera el icono verde y reintenta ARRANCAR.bat"
  goto fatal
)

:docker_ready
for /f "tokens=*" %%v in ('docker --version 2^>nul') do call :log "  [OK] %%v"

call :log "[5/6] Instalando dependencias npm si hacen falta..."
if exist "%ROOT%\node_modules\" goto skip_npm_root
call :log "  npm install (backend)..."
pushd "%ROOT%"
call npm install
set "NPM_ERR=!ERRORLEVEL!"
popd
if not "!NPM_ERR!"=="0" (
  set "ERRMSG=npm install fallo en la raiz. Revisa la salida y arranque.log"
  goto fatal
)
:skip_npm_root
call :log "  [OK] backend"

if exist "%ROOT%\frontend\node_modules\" goto skip_npm_fe
call :log "  npm install (frontend)..."
pushd "%ROOT%\frontend"
call npm install
set "FE_ERR=!ERRORLEVEL!"
popd
if not "!FE_ERR!"=="0" (
  set "ERRMSG=npm install fallo en frontend."
  goto fatal
)
:skip_npm_fe
call :log "  [OK] frontend"

if not exist "%ROOT%\chaincode\music-royalty\package.json" goto skip_npm_cc
if exist "%ROOT%\chaincode\music-royalty\node_modules\" goto skip_npm_cc
call :log "  npm install (chaincode)..."
pushd "%ROOT%\chaincode\music-royalty"
call npm install --omit=dev
popd
:skip_npm_cc

call :log "[6/6] Levantando Fabric + API + Frontend..."
call "%ROOT%\start-system.bat" /from-arrancar
set "SRC=!ERRORLEVEL!"
if not "!SRC!"=="0" (
  call :log "[ERROR] start-system.bat fallo con codigo !SRC!"
  echo.
  echo  Revisa arranque.log y las ventanas de error.
  echo  Logs Fabric: docker compose -f network\docker-compose-net.yaml logs
  pause
  exit /b 1
)
exit /b 0

:wait_docker
set /a _tries=0
:wait_docker_loop
set /a _tries+=1
docker info >nul 2>nul
if not errorlevel 1 (
  call :log "  [OK] Docker listo"
  exit /b 0
)
if !_tries! GEQ 36 exit /b 1
call :log "  Esperando Docker... intento !_tries!/36"
timeout /t 5 /nobreak >nul
goto wait_docker_loop

:log
echo %~1
>>"%LOG%" echo %date% %time% %~1
exit /b 0

:fatal
echo.
echo ==============================================================
echo  [ERROR] !ERRMSG!
echo ==============================================================
echo.
>>"%LOG%" echo %date% %time% [ERROR] !ERRMSG!
echo  Guarda/envia arranque.log si necesitas ayuda.
echo.
pause
exit /b 1
