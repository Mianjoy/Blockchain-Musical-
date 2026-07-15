@echo off
:: =============================================================================
:: find-docker.bat — Localiza docker.exe / docker compose en Windows
:: Uso: call "%~dp0find-docker.bat"
:: Sale con ERRORLEVEL 0 si OK. Define:
::   MR_DOCKER      = ruta completa a docker.exe
::   MR_COMPOSE     = "docker compose" o ruta a docker-compose.exe
:: =============================================================================
set "MR_DOCKER="
set "MR_COMPOSE="

:: Ya en PATH?
where docker >nul 2>nul
if not errorlevel 1 (
  for /f "delims=" %%D in ('where docker 2^>nul') do (
    if not defined MR_DOCKER set "MR_DOCKER=%%D"
  )
)

:: Rutas tipicas Docker Desktop (varias versiones / instalaciones)
if not defined MR_DOCKER if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" (
  set "MR_DOCKER=%ProgramFiles%\Docker\Docker\resources\bin\docker.exe"
  set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"
)
if not defined MR_DOCKER if exist "%ProgramFiles(x86)%\Docker\Docker\resources\bin\docker.exe" (
  set "MR_DOCKER=%ProgramFiles(x86)%\Docker\Docker\resources\bin\docker.exe"
  set "PATH=%ProgramFiles(x86)%\Docker\Docker\resources\bin;%PATH%"
)
if not defined MR_DOCKER if exist "C:\ProgramData\DockerDesktop\version-bin\docker.exe" (
  set "MR_DOCKER=C:\ProgramData\DockerDesktop\version-bin\docker.exe"
  set "PATH=C:\ProgramData\DockerDesktop\version-bin;%PATH%"
)
if not defined MR_DOCKER if exist "%LOCALAPPDATA%\Programs\Docker\Docker\resources\bin\docker.exe" (
  set "MR_DOCKER=%LOCALAPPDATA%\Programs\Docker\Docker\resources\bin\docker.exe"
  set "PATH=%LOCALAPPDATA%\Programs\Docker\Docker\resources\bin;%PATH%"
)

:: Compose plugin / binario legacy
if defined MR_DOCKER (
  "%MR_DOCKER%" compose version >nul 2>&1
  if not errorlevel 1 set "MR_COMPOSE=docker compose"
)
if not defined MR_COMPOSE (
  where docker-compose >nul 2>nul
  if not errorlevel 1 set "MR_COMPOSE=docker-compose"
)
if not defined MR_COMPOSE if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker-compose.exe" (
  set "MR_COMPOSE=%ProgramFiles%\Docker\Docker\resources\bin\docker-compose.exe"
)
if not defined MR_COMPOSE if defined MR_DOCKER (
  set "MR_COMPOSE=docker compose"
)

if not defined MR_DOCKER (
  exit /b 1
)
exit /b 0
