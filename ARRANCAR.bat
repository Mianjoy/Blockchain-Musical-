@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Music Royalty - Arranque con un clic
cd /d "%~dp0"

echo.
echo ================================================================
echo   MUSIC ROYALTY BLOCKCHAIN
echo   Arranque automatico para Windows
echo ================================================================
echo.
echo Este asistente:
echo   1. Revisa e instala dependencias (Node, Git Bash, Docker, npm)
echo   2. Levanta Hyperledger Fabric
echo   3. Inicia la API y el frontend
echo   4. Abre el navegador
echo.
echo ----------------------------------------------------------------

:: ------------------------------------------------------------------
:: Paso 1 — Dependencias (modo automatico)
:: ------------------------------------------------------------------
echo.
echo [PASO 1/2] Preparando dependencias...
echo.
call "%~dp0install-dependencies-auto.bat"
set "DEP_ERR=!ERRORLEVEL!"

if not "!DEP_ERR!"=="0" (
  echo.
  echo ================================================================
  echo   FALTAN DEPENDENCIAS
  echo ================================================================
  echo.
  echo Completa lo pendiente, reinicia el PC si Docker lo pidio,
  echo y vuelve a hacer doble clic en:
  echo.
  echo     ARRANCAR.bat
  echo.
  echo Guia detallada: lee la seccion "Windows - un solo clic" del README.md
  echo.
  pause
  exit /b 1
)

:: ------------------------------------------------------------------
:: Paso 2 — Arranque del sistema
:: ------------------------------------------------------------------
echo.
echo [PASO 2/2] Arrancando Fabric + API + Frontend...
echo.
call "%~dp0start-system.bat"
exit /b %ERRORLEVEL%
