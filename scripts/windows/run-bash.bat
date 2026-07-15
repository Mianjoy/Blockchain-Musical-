@echo off
:: Ejecuta network/scripts/*.sh y guarda la salida en fabric-network.log
:: (el .sh NO debe abrir ese mismo archivo o Windows da "Device or resource busy")
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
set "LOG_FILE=%WIN_ROOT%\fabric-network.log"
set "TMP_OUT=%TEMP%\fabric-run-%RANDOM%.log"

set "DRIVE=!WIN_ROOT:~0,1!"
set "REST=!WIN_ROOT:~2!"
set "REST=!REST:\=/!"
set "BASH_ROOT=/!DRIVE!/!REST!"

echo [INFO] Git Bash: !MR_BASH!
echo [INFO] Proyecto: !BASH_ROOT!
echo [INFO] Comando:  bash ./!SH_REL! !SH_ARG!
echo [INFO] Log:      !LOG_FILE!
echo.

echo ===== %date% %time% =====> "!LOG_FILE!"
echo Proyecto: !WIN_ROOT!>> "!LOG_FILE!"
echo Comando: bash ./!SH_REL! !SH_ARG!>> "!LOG_FILE!"
echo.>> "!LOG_FILE!"

:: 1) Ejecutar a archivo temporal (evita conflicto de bloqueo)
:: 2) Copiar al log final y mostrar en pantalla
"%MR_BASH%" -lc "export MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*' COMPOSE_CONVERT_WINDOWS_PATHS=1; set -e; cd '!BASH_ROOT!'; for f in ./network/scripts/*.sh; do sed -i 's/\r$//' \"$f\" 2>/dev/null || true; done; chmod +x ./network/scripts/*.sh 2>/dev/null || true; bash ./!SH_REL! !SH_ARG!" >"!TMP_OUT!" 2>&1
set "RC=!ERRORLEVEL!"

:: Volcar a log y consola
type "!TMP_OUT!" >> "!LOG_FILE!"
echo.
echo ---------- Salida del arranque Fabric ----------
type "!TMP_OUT!"
echo ------------------------------------------------
echo.

del /q "!TMP_OUT!" >nul 2>nul

if not "!RC!"=="0" (
  echo [ERROR] Fallo Fabric/script. Codigo: !RC!
  echo.
  if "!RC!"=="125" (
    echo  Codigo 125 = Docker no pudo crear un contenedor.
    echo  1^) Docker Desktop en VERDE
    echo  2^) Settings ^> Resources ^> File sharing ^> marca unidad del proyecto
    echo  3^) Apply ^& Restart
    echo  4^) REPARAR-FABRIC.bat y luego ARRANCAR.bat
    echo.
  )
  echo  Log completo: fabric-network.log
  echo.
)

endlocal & exit /b %RC%
