@echo off
setlocal enabledelayedexpansion

:: Configuración de colores y mensajes
color 0A
title Instalador y Ejecutor - Sistema de Regalías Musicales Blockchain

echo.
echo ==========================================
echo   SISTEMA DE REGALIAS MUSICALES BLOCKCHAIN
echo   Iniciando entorno portable...
echo ==========================================
echo.

:: 1. Verificar si Docker está instalado
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker no esta instalado en este equipo.
    echo.
    echo Este sistema requiere Docker Desktop para funcionar de manera portable.
    echo Deseas descargar Docker Desktop ahora? (S/N)
    set /p choice="Respuesta: "
    if /i "!choice!"=="S" (
        start https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe
        echo.
        echo Se ha abierto la pagina de descarga.
        echo Por favor instala Docker, reinicia la sesiion si es necesario y vuelve a ejecutar este archivo.
        pause
        exit /b
    ) else (
        echo.
        echo No se puede continuar sin Docker.
        pause
        exit /b
    )
)

echo [OK] Docker detectado correctamente.
echo.

:: 2. Verificar si Docker Desktop está corriendo (Intento básico)
docker info >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ADVERTENCIA] Docker no parece estar ejecutandose.
    echo Intentando iniciar Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo.
    echo Esperando a que Docker inicie (30 segundos)...
    timeout /t 30 /nobreak >nul
    
    docker info >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] No se pudo iniciar Docker automaticamente.
        echo Por favor abre Docker Desktop manualmente, espera a que el icono se ponga verde,
        echo y luego vuelve a ejecutar este script.
        pause
        exit /b
    )
)

echo [OK] Docker Engine activo.
echo.

:: 3. Detener instancias anteriores si existen
echo Limpiando contenedores anteriores...
docker compose down >nul 2>nul

:: 4. Construir y Levantar el sistema
echo.
echo ==========================================
echo   CONSTRUYENDO E INICIANDO EL SISTEMA
echo ==========================================
echo.
echo Esto puede tomar unos minutos la primera vez...
echo.

docker compose up --build -d

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Ocurrio un error al levantar los contenedores.
    echo Revisa la consola para mas detalles.
    pause
    exit /b
)

echo.
echo ==========================================
echo   SISTEMA INICIADO EXITOSAMENTE
echo ==========================================
echo.
echo Accede a la aplicacion en tu navegador:
echo   -> FRONTEND: http://localhost:3001
echo   -> BACKEND:  http://localhost:3000
echo.
echo Servicios activos:
docker compose ps
echo.
echo Abriendo el navegador...
start http://localhost:3001

echo.
echo Para detener el sistema, cierra esta ventana o ejecuta: docker compose down
echo.
pause
