@echo off
:: Ejecuta network/scripts/*.sh con Git Bash (espacios + CRLF).
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

"%MR_BASH%" -lc "set -e; cd '!BASH_ROOT!'; find ./network/scripts -name '*.sh' -print0 2>/dev/null | xargs -0 -r sed -i 's/\r$//' 2>/dev/null || true; sed -i 's/\r$//' ./!SH_REL! 2>/dev/null || true; chmod +x ./network/scripts/*.sh 2>/dev/null || true; exec bash ./!SH_REL! !SH_ARG!"
set "RC=!ERRORLEVEL!"

if not "!RC!"=="0" echo [ERROR] Script bash termino con codigo !RC!
endlocal & exit /b %RC%
