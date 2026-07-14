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
call "%ROOT%\scripts\windows\find-bash.bat"

if defined MR_BASH (
  call "%ROOT%\scripts\windows\run-bash.bat" network/scripts/network.sh down
) else (
  where docker >nul 2>nul
  if not errorlevel 1 (
    docker compose -f "%ROOT%\network\docker-compose-net.yaml" down --volumes --remove-orphans
  ) else (
    echo [AVISO] Ni Git Bash ni Docker disponibles para apagar la red.
  )
)

echo.
echo Sistema detenido.
pause
endlocal
