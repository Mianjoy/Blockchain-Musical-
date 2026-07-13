@echo off
setlocal
chcp 65001 >nul
title Detener Music Royalty + Fabric
cd /d "%~dp0"

echo.
echo Deteniendo ventanas de API/Frontend...
taskkill /FI "WINDOWTITLE eq MusicRoyalty-API*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq MusicRoyalty-UI*" /F >nul 2>nul

echo Deteniendo red Hyperledger Fabric...
where bash >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  bash network/scripts/network.sh down
) else if exist "C:\Program Files\Git\bin\bash.exe" (
  "C:\Program Files\Git\bin\bash.exe" network/scripts/network.sh down
) else (
  docker compose -f network/docker-compose-net.yaml down --volumes --remove-orphans
)

echo.
echo Sistema detenido.
pause
endlocal
