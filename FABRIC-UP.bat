@echo off
:: =============================================================================
:: FABRIC-UP.bat — Solo Hyperledger Fabric (contenedores Docker)
:: =============================================================================
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
title Music Royalty - FABRIC UP
cd /d "%~dp0"
set "ROOT=%CD%"

echo.
echo ==============================================================
echo  FABRIC UP — Stack blockchain separado ^(Fabric 3.1.5^)
echo ==============================================================
echo  Contenedores: CA / Orderer / Peer / CLI
echo  Red Docker:   music-royalty-fabric
echo  Luego:        APP-UP.bat
echo.

call "%ROOT%\scripts\windows\refresh-path.bat"
call "%ROOT%\scripts\windows\find-docker.bat"
if errorlevel 1 (
  echo [AVISO] docker.exe no esta en PATH. Buscando Docker Desktop...
  if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
    start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
    echo [INFO] Se abrio Docker Desktop. Esperando CLI...
    set /a _w=0
    :wait_cli
    set /a _w+=1
    call "%ROOT%\scripts\windows\find-docker.bat"
    if not errorlevel 1 goto cli_ok
    if !_w! GEQ 36 (
      echo.
      echo [ERROR] No aparece docker.exe tras esperar Docker Desktop.
      echo.
      echo Comprueba:
      echo  1^) Docker Desktop instalado y abierto ^(icono en verde^)
      echo  2^) Settings ^> General ^> "Use the WSL 2 based engine" o Hyper-V
      echo  3^) Cierra y abre una NUEVA ventana CMD y vuelve a FABRIC-UP.bat
      echo  4^) O ejecuta: install-dependencies.bat
      echo.
      pause
      exit /b 1
    )
    timeout /t 5 /nobreak >nul
    goto wait_cli
  ) else (
    echo.
    echo [ERROR] Docker Desktop no esta instalado.
    echo         Ejecuta install-dependencies.bat o instala desde:
    echo         https://www.docker.com/products/docker-desktop/
    echo.
    start "" "https://www.docker.com/products/docker-desktop/"
    pause
    exit /b 1
  )
)
:cli_ok

echo [OK] Docker CLI: %MR_DOCKER%
if defined MR_COMPOSE echo [OK] Compose:   %MR_COMPOSE%

"%MR_DOCKER%" info >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
  echo [INFO] Esperando motor Docker ^(icono verde^)...
  set /a _i=0
  :wait_d
  set /a _i+=1
  "%MR_DOCKER%" info >nul 2>nul
  if not errorlevel 1 goto docker_ok
  if !_i! GEQ 36 (
    echo [ERROR] Docker Desktop no respondio. Deja el icono en verde y reintenta.
    pause
    exit /b 1
  )
  timeout /t 5 /nobreak >nul
  goto wait_d
)
:docker_ok

where node >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
)
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js necesario para wallet ^(enrollAppUser.js^).
  pause
  exit /b 1
)

echo [FABRIC] Levantando contenedores + canal + chaincode...
call "%ROOT%\scripts\windows\fabric-up.bat" up
if errorlevel 1 (
  echo.
  echo [ERROR] Fabric no completo. Revisa fabric-network.log
  echo         Si el error es de volumenes/compose, prueba REPARAR-FABRIC.bat
  pause
  exit /b 1
)

echo.
echo ==============================================================
echo  FABRIC LISTO
echo ==============================================================
echo  Peer:     localhost:7051
echo  Orderer:  localhost:7050
echo  CA:       localhost:7054
echo.
echo  Siguiente: APP-UP.bat
echo  Detener:   FABRIC-DOWN.bat
echo.
pause
exit /b 0
