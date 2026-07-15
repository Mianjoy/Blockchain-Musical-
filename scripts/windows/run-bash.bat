@echo off
:: Ejecuta network/scripts/*.sh y guarda TODA la salida en fabric-network.log
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

:: Ejecutar y volcar a log + consola
"%MR_BASH%" -lc "export MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*' COMPOSE_CONVERT_WINDOWS_PATHS=1; set -e; cd '!BASH_ROOT!'; for f in ./network/scripts/*.sh; do sed -i 's/\r$//' \"$f\" 2>/dev/null || true; done; chmod +x ./network/scripts/*.sh 2>/dev/null || true; bash ./!SH_REL! !SH_ARG!" 1>>"!LOG_FILE!" 2>&1
set "RC=!ERRORLEVEL!"

:: Mostrar finales del log en consola
echo.
echo ---------- Ultimas lineas de fabric-network.log ----------
powershell -NoProfile -Command "if (Test-Path -LiteralPath '%LOG_FILE%') { Get-Content -LiteralPath '%LOG_FILE%' -Tail 40 } else { 'Log no encontrado' }"
echo ----------------------------------------------------------
echo.

if not "!RC!"=="0" (
  echo [ERROR] Fallo Fabric/script. Codigo: !RC!
  echo.
  if "!RC!"=="125" (
    echo  Codigo 125 = Docker no pudo crear un contenedor.
    echo  1^) Docker Desktop debe estar en VERDE
    echo  2^) Settings ^> Resources ^> File sharing ^> marca unidad D: o C:
    echo  3^) Apply ^& Restart
    echo  4^) Ejecuta REPARAR-FABRIC.bat
    echo.
  )
  echo  Abre el archivo completo: fabric-network.log
  echo.
)

endlocal & exit /b %RC%
