@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
title Music Royalty - Arrancar
cd /d "%~dp0"

echo.
echo ==============================================================
echo  MUSIC ROYALTY — ARRANQUE SEPARADO
echo ==============================================================
echo.
echo  Fabric y la App son independientes:
echo.
echo    [1] Solo APP / DEMO^(sin Docker^)     — recomendado para UI
echo    [2] Solo FABRIC ^(contenedores^)     — red blockchain
echo    [3] FABRIC + APP conectados
echo    [4] Salir
echo.
choice /C 1234 /N /M "Elige opcion [1-4]: "
set "OPT=!ERRORLEVEL!"

if "!OPT!"=="1" (
  call "%~dp0ARRANCAR-DEMO.bat"
  exit /b !ERRORLEVEL!
)
if "!OPT!"=="2" (
  call "%~dp0FABRIC-UP.bat"
  exit /b !ERRORLEVEL!
)
if "!OPT!"=="3" (
  call "%~dp0FABRIC-UP.bat"
  if errorlevel 1 (
    echo.
    echo Fabric fallo — puedes seguir con APP en simulacion:
    call "%~dp0APP-UP.bat"
    exit /b !ERRORLEVEL!
  )
  call "%~dp0APP-UP.bat"
  exit /b !ERRORLEVEL!
)
exit /b 0
