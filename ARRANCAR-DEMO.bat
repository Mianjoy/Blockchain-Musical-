@echo off
setlocal
chcp 65001 >nul 2>nul
title Music Royalty - DEMO (simulacion)
cd /d "%~dp0"

echo.
echo ==============================================================
echo  MODO DEMO / SIMULACION ^(sin Fabric^)
echo ==============================================================
echo  No requiere Docker. Ideal para probar la UI.
echo  Blockchain: memoria ^(ALLOW_SIMULATION=true^)
echo ==============================================================
echo.

call "%~dp0scripts\windows\refresh-path.bat"
where node >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
)
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Necesitas Node.js.
  pause
  exit /b 1
)

call "%~dp0scripts\windows\start-app.bat" simulation
echo.
pause
endlocal
