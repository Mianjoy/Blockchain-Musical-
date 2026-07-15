@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
title Music Royalty - Hyperledger Fabric
cd /d "%~dp0"

set "ROOT=%CD%"
set "FROM_ARRANCAR=0"
if /i "%~1"=="/from-arrancar" set "FROM_ARRANCAR=1"

echo.
echo ==============================================
echo   SISTEMA DE REGALIAS MUSICALES + FABRIC
echo ==============================================
echo.

call "%ROOT%\scripts\windows\refresh-path.bat"

where docker >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Docker no esta instalado o no esta en PATH.
  if "!FROM_ARRANCAR!"=="0" pause
  exit /b 1
)

docker info >nul 2>nul
if not errorlevel 1 goto docker_ok

echo [AVISO] Docker no responde. Intentando abrir Docker Desktop...
if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
  start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
)
set /a _i=0
:docker_wait
set /a _i+=1
docker info >nul 2>nul
if not errorlevel 1 goto docker_ok
if !_i! GEQ 36 (
  echo [ERROR] Docker Desktop no esta activo ^(icono verde^).
  if "!FROM_ARRANCAR!"=="0" pause
  exit /b 1
)
echo   Esperando Docker... !_i!/36
timeout /t 5 /nobreak >nul
goto docker_wait

:docker_ok
echo [OK] Docker activo.

call "%ROOT%\scripts\windows\find-bash.bat"
if not defined MR_BASH (
  echo [ERROR] Git Bash no encontrado.
  echo Instala Git for Windows: https://git-scm.com/download/win
  if "!FROM_ARRANCAR!"=="0" pause
  exit /b 1
)
echo [OK] Git Bash: %MR_BASH%

where node >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
)
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js no encontrado.
  if "!FROM_ARRANCAR!"=="0" pause
  exit /b 1
)
echo [OK] Node.js encontrado.

if exist "%ROOT%\node_modules\" goto npm_fe
echo [INFO] Instalando dependencias del backend...
call npm install
if errorlevel 1 (
  echo [ERROR] npm install fallo
  if "!FROM_ARRANCAR!"=="0" pause
  exit /b 1
)

:npm_fe
if exist "%ROOT%\frontend\node_modules\" goto fabric_up
echo [INFO] Instalando dependencias del frontend...
pushd "%ROOT%\frontend"
call npm install
set "FE_ERR=!ERRORLEVEL!"
popd
if not "!FE_ERR!"=="0" (
  echo [ERROR] npm install frontend fallo
  if "!FROM_ARRANCAR!"=="0" pause
  exit /b 1
)

:fabric_up
echo.
echo [INFO] Levantando Hyperledger Fabric ^(puede tardar varios minutos^)...
call "%ROOT%\scripts\windows\run-bash.bat" network/scripts/network.sh up
if errorlevel 1 (
  echo.
  echo ==============================================================
  echo  [ERROR] No se pudo levantar Hyperledger Fabric
  echo ==============================================================
  echo.
  echo  El sistema se detuvo ANTES de abrir la web.
  echo  El detalle real esta en:  fabric-network.log
  echo.
  echo  Pasos recomendados:
  echo   1. Ejecuta DIAGNOSTICO.bat  ^(prueba Docker y montaje^)
  echo   2. Docker Desktop en VERDE
  echo   3. Settings ^> Resources ^> File sharing ^> marca D: o C:
  echo   4. Apply ^& Restart
  echo   5. Ejecuta REPARAR-FABRIC.bat
  echo   6. Ejecuta ARRANCAR.bat otra vez
  echo.
  if exist "%ROOT%\fabric-network.log" (
    echo  --- Ultimas lineas de fabric-network.log ---
    powershell -NoProfile -Command "Get-Content -LiteralPath '%ROOT%\fabric-network.log' -Tail 25"
    echo  --------------------------------------------
  )
  if "!FROM_ARRANCAR!"=="0" pause
  exit /b 1
)

echo [INFO] Verificando peer...
docker exec peer0.org1.example.com peer channel list >nul 2>nul
if errorlevel 1 (
  echo [ERROR] El peer no responde.
  if "!FROM_ARRANCAR!"=="0" pause
  exit /b 1
)
echo [OK] Red Fabric lista.

echo [INFO] Liberando puertos 3000/3001 si estaban ocupados...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%P >nul 2>nul
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /F /PID %%P >nul 2>nul

echo.
echo [INFO] Iniciando backend ^(API^)...
start "MusicRoyalty-API" /D "%ROOT%" cmd /k "set ALLOW_SIMULATION=false&& set CHANNEL_NAME=mychannel&& set CHAINCODE_NAME=music-royalty&& set PORT=3000&& set HOST=0.0.0.0&& node index.js"

timeout /t 6 /nobreak >nul

echo [INFO] Iniciando frontend...
start "MusicRoyalty-UI" /D "%ROOT%\frontend" cmd /k "npm run dev -- --host 0.0.0.0 --port 3001"

echo [INFO] Esperando API en http://127.0.0.1:3000/health ...
set "READY=0"
for /L %%i in (1,1,45) do (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r=Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/health -TimeoutSec 2; if($r.StatusCode -eq 200){exit 0}else{exit 1} } catch { exit 1 }" >nul 2>nul
  if !ERRORLEVEL! EQU 0 (
    set "READY=1"
    goto api_ok
  )
  timeout /t 2 /nobreak >nul
)

:api_ok
if "!READY!"=="0" (
  echo [AVISO] La API no respondio a tiempo.
  echo         Revisa la ventana "MusicRoyalty-API".
) else (
  echo [OK] API saludable.
)

echo.
echo ==============================================
echo   SISTEMA LISTO
echo ==============================================
echo   Frontend:  http://localhost:3001
echo   API:       http://localhost:3000/api
echo   Health:    http://localhost:3000/health
echo.
echo   Para detener: DETENER.bat
echo ==============================================
echo.

start "" "http://localhost:3001"
echo.
pause
endlocal
exit /b 0
