@echo off
echo ========================================
echo   Sistema de Regalias Musicales
echo   con Blockchain - Iniciando...
echo ========================================
echo.

REM Verificar si Docker esta instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker no esta instalado.
    echo.
    echo Por favor, instala Docker Desktop desde:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo [OK] Docker detectado correctamente
echo.

REM Verificar si Docker Compose esta disponible
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose no esta disponible.
    echo Asegurate de tener Docker Desktop instalado.
    pause
    exit /b 1
)

echo [OK] Docker Compose detectado correctamente
echo.

REM Construir y ejecutar el sistema
echo ========================================
echo   Construyendo contenedores...
echo ========================================
echo.

docker compose up --build -d

if %errorlevel% neq 0 (
    echo [ERROR] Error al construir los contenedores.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Sistema iniciado exitosamente!
echo ========================================
echo.
echo   Frontend: http://localhost:3001
echo   Backend:  http://localhost:3000/api
echo   Health:   http://localhost:3000/health
echo.
echo   Para detener el sistema ejecuta:
echo   docker compose down
echo.
echo   Abriendo navegador...
echo.

REM Abrir navegador automaticamente
start http://localhost:3001

echo.
echo Presiona cualquier tecla para salir...
pause >nul
