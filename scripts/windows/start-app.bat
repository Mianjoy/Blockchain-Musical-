@echo off
:: Arranca solo API + Frontend (con o sin Fabric).
:: Uso:
::   call scripts\windows\start-app.bat simulation
::   call scripts\windows\start-app.bat fabric
setlocal EnableDelayedExpansion
cd /d "%~dp0\..\.."
set "ROOT=%CD%"
set "MODE=%~1"
if "%MODE%"=="" set "MODE=fabric"

call "%ROOT%\scripts\windows\refresh-path.bat"

where node >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
)
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js no encontrado
  exit /b 1
)

if not exist "%ROOT%\node_modules\" (
  echo [INFO] npm install backend...
  pushd "%ROOT%"
  call npm install
  if errorlevel 1 (popd & exit /b 1)
  popd
)
if not exist "%ROOT%\frontend\node_modules\" (
  echo [INFO] npm install frontend...
  pushd "%ROOT%\frontend"
  call npm install
  if errorlevel 1 (popd & exit /b 1)
  popd
)

for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%P >nul 2>nul
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /F /PID %%P >nul 2>nul

if /i "%MODE%"=="simulation" (
  echo [INFO] Modo SIMULACION ^(sin Fabric real^)
  set "ALLOW_SIMULATION=true"
  set "FABRIC_AS_LOCALHOST=true"
) else (
  echo [INFO] Modo FABRIC ^(API host → peer localhost:7051^)
  set "ALLOW_SIMULATION=false"
  set "FABRIC_AS_LOCALHOST=true"
)

echo [INFO] Iniciando API...
start "MusicRoyalty-API" /D "%ROOT%" cmd /k "set ALLOW_SIMULATION=%ALLOW_SIMULATION%&& set FABRIC_AS_LOCALHOST=%FABRIC_AS_LOCALHOST%&& set CHANNEL_NAME=mychannel&& set CHAINCODE_NAME=music-royalty&& set PORT=3000&& set HOST=0.0.0.0&& node index.js"

timeout /t 5 /nobreak >nul

echo [INFO] Iniciando Frontend...
start "MusicRoyalty-UI" /D "%ROOT%\frontend" cmd /k "npm run dev -- --host 0.0.0.0 --port 3001"

echo [INFO] Esperando API...
set "READY=0"
for /L %%i in (1,1,40) do (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r=Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/health -TimeoutSec 2; if($r.StatusCode -eq 200){exit 0}else{exit 1} } catch { exit 1 }" >nul 2>nul
  if !ERRORLEVEL! EQU 0 (
    set "READY=1"
    goto app_ok
  )
  timeout /t 2 /nobreak >nul
)

:app_ok
if "!READY!"=="0" (
  echo [AVISO] La API no respondio a tiempo. Revisa ventana MusicRoyalty-API.
) else (
  echo [OK] API en http://localhost:3000/health
)

start "" "http://localhost:3001"
echo.
echo Frontend: http://localhost:3001
echo API:      http://localhost:3000/api
if /i "%MODE%"=="simulation" (
  echo Modo:     SIMULACION
) else (
  echo Modo:     FABRIC
)
echo Detener app+fabric: CERRAR-TODO.bat
echo Solo Fabric:        FABRIC-DOWN.bat
echo.
exit /b 0
