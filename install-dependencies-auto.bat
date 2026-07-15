@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
cd /d "%~dp0"
title Instalador automatico - Music Royalty

:: Instalador automatico (sin preguntas). Usado por flujos legacy.
:: Preferir ARRANCAR.bat como entrada principal.

call "%~dp0scripts\windows\refresh-path.bat"

set "MISSING=0"
set "NODE_OK=0"
set "GIT_OK=0"
set "DOCKER_OK=0"
set "NPM_OK=0"

echo ------------------------------------------------------------
echo  Dependencias automaticas
echo ------------------------------------------------------------

where node >nul 2>nul
if errorlevel 1 (
  where winget >nul 2>nul
  if not errorlevel 1 (
    echo [..] Instalando Node.js LTS...
    winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    call "%~dp0scripts\windows\refresh-path.bat"
  ) else (
    start "" "https://nodejs.org/en/download"
    set "MISSING=1"
  )
)
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 (set "MISSING=1") else (set "NODE_OK=1" & for /f "tokens=*" %%v in ('node -v') do echo [OK] Node %%v)

call "%~dp0scripts\windows\find-bash.bat"
if defined MR_BASH (
  echo [OK] Git Bash
  set "GIT_OK=1"
) else (
  where winget >nul 2>nul
  if not errorlevel 1 (
    echo [..] Instalando Git...
    winget install -e --id Git.Git --accept-package-agreements --accept-source-agreements
    call "%~dp0scripts\windows\refresh-path.bat"
    call "%~dp0scripts\windows\find-bash.bat"
  )
  if defined MR_BASH (set "GIT_OK=1") else (set "MISSING=1" & start "" "https://git-scm.com/download/win")
)

where docker >nul 2>nul
if errorlevel 1 (
  where winget >nul 2>nul
  if not errorlevel 1 (
    echo [..] Instalando Docker Desktop...
    winget install -e --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
  ) else (
    start "" "https://www.docker.com/products/docker-desktop/"
  )
  set "MISSING=1"
) else (
  docker info >nul 2>nul
  if errorlevel 1 (
    if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
    timeout /t 40 /nobreak >nul
    docker info >nul 2>nul
    if errorlevel 1 (set "MISSING=1") else (set "DOCKER_OK=1")
  ) else (
    set "DOCKER_OK=1"
  )
)
if "!DOCKER_OK!"=="1" for /f "tokens=*" %%v in ('docker --version') do echo [OK] %%v

if "!NODE_OK!"=="1" (
  if not exist "node_modules\" call npm install
  if not exist "frontend\node_modules\" (
    pushd frontend & call npm install & popd
  )
  if exist "node_modules\" if exist "frontend\node_modules\" set "NPM_OK=1"
)

echo.
echo Node=!NODE_OK! Git=!GIT_OK! Docker=!DOCKER_OK! npm=!NPM_OK!
if "!MISSING!"=="1" exit /b 1
if not "!NODE_OK!!GIT_OK!!DOCKER_OK!!NPM_OK!"=="1111" exit /b 1
echo [OK] Dependencias listas
exit /b 0
