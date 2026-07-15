@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
title Music Royalty - Fabric real (Windows)
cd /d "%~dp0"

set "ROOT=%CD%"
set "LOG=%ROOT%\arranque.log"
echo.>"%LOG%"

echo.
echo ==============================================================
echo  MUSIC ROYALTY - HYPERLEDGER FABRIC REAL ^(Windows nativo^)
echo ==============================================================
echo.
echo  Requiere: Node.js LTS + Docker Desktop ^(en verde^)
echo  NO requiere Git Bash.
echo  Log Fabric: fabric-network.log
echo.

call "%ROOT%\scripts\windows\refresh-path.bat"
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Instala Node.js LTS desde https://nodejs.org
  pause
  exit /b 1
)

where docker >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Instala Docker Desktop y reinicia.
  start "" "https://www.docker.com/products/docker-desktop/"
  pause
  exit /b 1
)

docker info >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
  echo [INFO] Esperando Docker Desktop...
  set /a _i=0
  :wait_d
  set /a _i+=1
  docker info >nul 2>nul
  if not errorlevel 1 goto docker_ok
  if !_i! GEQ 30 (
    echo [ERROR] Docker no respondio.
    pause
    exit /b 1
  )
  timeout /t 5 /nobreak >nul
  goto wait_d
)
:docker_ok

if not exist "%ROOT%\node_modules\" (
  echo [..] npm install backend...
  pushd "%ROOT%" & call npm install & set "E=!ERRORLEVEL!" & popd
  if not "!E!"=="0" (
    echo [ERROR] npm install backend fallo
    pause
    exit /b 1
  )
)
if not exist "%ROOT%\frontend\node_modules\" (
  echo [..] npm install frontend...
  pushd "%ROOT%\frontend" & call npm install & set "E=!ERRORLEVEL!" & popd
  if not "!E!"=="0" (
    echo [ERROR] npm install frontend fallo
    pause
    exit /b 1
  )
)

echo.
echo [FABRIC] Levantando red con fabric-up.bat ^(CMD + Docker^)...
echo.
call "%ROOT%\scripts\windows\fabric-up.bat" up
if errorlevel 1 (
  echo.
  echo ==============================================================
  echo  Fabric no completo. Revisa fabric-network.log
  echo.
  echo  Checklist rapido:
  echo   1^) Docker Desktop en verde
  echo   2^) Settings ^> Resources ^> File sharing: marca C: o D:
  echo   3^) Ejecuta FIX-DOCKER-API.bat si ves "API version too old"
  echo   4^) Ejecuta REPARAR-FABRIC.bat y vuelve a probar
  echo   5^) Mientras tanto: ARRANCAR-DEMO.bat
  echo ==============================================================
  pause
  exit /b 1
)

echo.
echo [OK] Fabric listo. Arrancando API en modo Fabric...
call "%ROOT%\scripts\windows\start-app.bat" fabric
if errorlevel 1 (
  echo [ERROR] API/Frontend no arranco
  pause
  exit /b 1
)

echo.
echo Sistema con FABRIC REAL listo: http://localhost:3001
echo Health: http://localhost:3000/health
echo Detener: DETENER.bat
echo.
pause
exit /b 0
