@echo off
:: Ejecuta network/scripts/*.sh con Git Bash (espacios + CRLF + Docker en Windows).
:: Uso: call scripts\windows\run-bash.bat network/scripts/network.sh up

setlocal EnableDelayedExpansion

if not defined MR_BASH call "%~dp0find-bash.bat"
if not defined MR_BASH (
  echo [ERROR] Git Bash no encontrado. Instala Git for Windows.
  endlocal & exit /b 1
)

if "%~1"=="" (
  echo [ERROR] Falta la ruta del script .sh
  endlocal & exit /b 1
)

set "SH_REL=%~1"
set "SH_ARG=%~2"

set "WIN_ROOT=%CD%"
set "DRIVE=!WIN_ROOT:~0,1!"
set "REST=!WIN_ROOT:~2!"
set "REST=!REST:\=/!"
set "BASH_ROOT=/!DRIVE!/!REST!"

echo [INFO] Git Bash: !MR_BASH!
echo [INFO] Proyecto: !BASH_ROOT!
echo [INFO] Comando:  bash ./!SH_REL! !SH_ARG!

:: MSYS_NO_PATHCONV evita que Git Bash rompa los -v de Docker (error 125)
"%MR_BASH%" -lc "export MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*' COMPOSE_CONVERT_WINDOWS_PATHS=1; set -e; cd '!BASH_ROOT!'; for f in ./network/scripts/*.sh; do sed -i 's/\r$//' \"$f\" 2>/dev/null || true; done; chmod +x ./network/scripts/*.sh 2>/dev/null || true; bash ./!SH_REL! !SH_ARG!"
set "RC=!ERRORLEVEL!"

if not "!RC!"=="0" (
  echo [ERROR] Script bash termino con codigo !RC!
  if "!RC!"=="125" (
    echo.
    echo  Codigo 125 = fallo de Docker al crear contenedor.
    echo  Soluciones tipicas:
    echo   1. Docker Desktop en verde
    echo   2. Settings - Resources - File sharing: marca la unidad del proyecto
    echo   3. Apply ^& Restart en Docker Desktop
    echo   4. Vuelve a ejecutar ARRANCAR.bat
    echo  Detalle: fabric-network.log
    echo.
  )
)

endlocal & exit /b %RC%
