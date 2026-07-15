@echo off
:: Solo apaga contenedores Fabric (deja API/UI si siguen abiertas)
setlocal
chcp 65001 >nul 2>nul
title Music Royalty - FABRIC DOWN
cd /d "%~dp0"

echo.
echo Deteniendo solo Hyperledger Fabric...
call "%~dp0scripts\windows\refresh-path.bat" 2>nul
if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"

where docker >nul 2>nul
if errorlevel 1 (
  echo [AVISO] Docker no disponible.
  pause
  exit /b 0
)

call "%~dp0scripts\windows\fabric-up.bat" down
echo.
echo Fabric detenido. La API/UI pueden seguir corriendo.
echo Para cerrar TODO: CERRAR-TODO.bat
echo.
pause
exit /b 0
