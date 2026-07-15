@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
title Detener Music Royalty + Fabric
cd /d "%~dp0"
set "ROOT=%CD%"

echo.
echo Deteniendo ventanas API / Frontend...
taskkill /FI "WINDOWTITLE eq MusicRoyalty-API*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq MusicRoyalty-UI*" /T /F >nul 2>nul

:: Matar por puerto por si el titulo no coincide
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%P >nul 2>nul
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /F /PID %%P >nul 2>nul

echo Deteniendo red Hyperledger Fabric...
call "%ROOT%\scripts\windows\refresh-path.bat"
if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"

where docker >nul 2>nul
if not errorlevel 1 (
  call "%ROOT%\scripts\windows\fabric-up.bat" down
) else (
  echo [AVISO] Docker no disponible para apagar la red Fabric.
)

echo.
echo Sistema detenido.
pause
endlocal
