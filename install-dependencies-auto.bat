@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"

:: Instalador automatico (sin preguntas S/N). Usado por ARRANCAR.bat
:: Codigo salida: 0 = listo para arrancar | 1 = faltan programas que el usuario debe instalar

set "MISSING=0"
set "NODE_OK=0"
set "GIT_OK=0"
set "DOCKER_OK=0"
set "NPM_OK=0"
set "HAS_WINGET=0"
set "NEED_RESTART_HINT=0"

where winget >nul 2>nul
if %ERRORLEVEL% EQU 0 set "HAS_WINGET=1"

echo ------------------------------------------------------------
echo  Dependencias automaticas
echo ------------------------------------------------------------

:: ---- Node.js ----
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  for /f "tokens=*" %%v in ('node --version 2^>nul') do echo [OK] Node.js %%v
  set "NODE_OK=1"
) else (
  echo [..] Instalando Node.js LTS...
  if "!HAS_WINGET!"=="1" (
    winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements --silent
  ) else (
    echo [!] Abriendo descarga de Node.js (instala LTS y reinicia esta ventana)...
    start https://nodejs.org/en/download
    set "MISSING=1"
  )
)

if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
if exist "%LocalAppData%\Programs\node\node.exe" set "PATH=%LocalAppData%\Programs\node;%PATH%"
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  set "NODE_OK=1"
) else if "!MISSING!"=="0" (
  echo [!] Node.js instalado pero no esta en PATH. Cierra esta ventana y vuelve a ejecutar ARRANCAR.bat
  set "MISSING=1"
  set "NEED_RESTART_HINT=1"
)

:: ---- Git Bash ----
set "BASH_FOUND="
where bash >nul 2>nul
if %ERRORLEVEL% EQU 0 set "BASH_FOUND=bash"
if "!BASH_FOUND!"=="" if exist "C:\Program Files\Git\bin\bash.exe" set "BASH_FOUND=C:\Program Files\Git\bin\bash.exe"
if "!BASH_FOUND!"=="" if exist "C:\Program Files (x86)\Git\bin\bash.exe" set "BASH_FOUND=C:\Program Files (x86)\Git\bin\bash.exe"

if not "!BASH_FOUND!"=="" (
  echo [OK] Git Bash: !BASH_FOUND!
  set "GIT_OK=1"
) else (
  echo [..] Instalando Git for Windows...
  if "!HAS_WINGET!"=="1" (
    winget install -e --id Git.Git --accept-package-agreements --accept-source-agreements --silent
    if exist "C:\Program Files\Git\bin\bash.exe" (
      set "BASH_FOUND=C:\Program Files\Git\bin\bash.exe"
      set "GIT_OK=1"
      echo [OK] Git Bash instalado
    ) else (
      echo [!] Git instalado. Cierra esta ventana y vuelve a ejecutar ARRANCAR.bat
      set "MISSING=1"
      set "NEED_RESTART_HINT=1"
    )
  ) else (
    echo [!] Abriendo descarga de Git for Windows...
    start https://git-scm.com/download/win
    set "MISSING=1"
  )
)

:: ---- Docker ----
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  docker info >nul 2>nul
  if !ERRORLEVEL! EQU 0 (
    for /f "tokens=*" %%v in ('docker --version 2^>nul') do echo [OK] %%v
    set "DOCKER_OK=1"
  ) else (
    echo [..] Iniciando Docker Desktop...
    if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
      start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
      echo     Esperando 50 segundos...
      timeout /t 50 /nobreak >nul
      docker info >nul 2>nul
      if !ERRORLEVEL! EQU 0 (
        echo [OK] Docker Desktop activo
        set "DOCKER_OK=1"
      ) else (
        echo [!] Docker Desktop aun no responde. Abrelo, espera el icono verde y reintenta ARRANCAR.bat
        set "MISSING=1"
      )
    ) else (
      echo [!] Docker CLI presente pero Docker Desktop no encontrado
      set "MISSING=1"
    )
  )
) else (
  echo [..] Instalando Docker Desktop...
  if "!HAS_WINGET!"=="1" (
    winget install -e --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements --silent
    set "NEED_RESTART_HINT=1"
    echo [!] Docker Desktop se instaló. Reinicia el PC si el instalador lo pide,
    echo     abre Docker Desktop (icono verde) y vuelve a ejecutar ARRANCAR.bat
    set "MISSING=1"
  ) else (
    echo [!] Abriendo descarga de Docker Desktop...
    start https://www.docker.com/products/docker-desktop/
    set "MISSING=1"
  )
)

:: ---- npm install ----
if "!NODE_OK!"=="1" (
  where npm >nul 2>nul
  if !ERRORLEVEL! NEQ 0 (
    echo [!] npm no esta en PATH
    set "MISSING=1"
  ) else (
    if not exist "node_modules\" (
      echo [..] npm install (backend)...
      call npm install
      if !ERRORLEVEL! NEQ 0 set "MISSING=1"
    ) else (
      echo [OK] Backend node_modules
    )

    if not exist "frontend\node_modules\" (
      echo [..] npm install (frontend)...
      pushd frontend
      call npm install
      set "FE_ERR=!ERRORLEVEL!"
      popd
      if not "!FE_ERR!"=="0" set "MISSING=1"
    ) else (
      echo [OK] Frontend node_modules
    )

    if exist "chaincode\music-royalty\package.json" if not exist "chaincode\music-royalty\node_modules\" (
      echo [..] npm install (chaincode)...
      pushd chaincode\music-royalty
      call npm install --omit=dev
      popd
    )

    if "!MISSING!"=="0" set "NPM_OK=1"
  )
) else (
  set "MISSING=1"
)

echo.
echo --- Resumen ---
if "!NODE_OK!"=="1" (echo   Node.js ..... OK) else (echo   Node.js ..... FALTA)
if "!GIT_OK!"=="1" (echo   Git Bash .... OK) else (echo   Git Bash .... FALTA)
if "!DOCKER_OK!"=="1" (echo   Docker ...... OK) else (echo   Docker ...... FALTA)
if "!NPM_OK!"=="1" (echo   npm ......... OK) else (echo   npm ......... PENDIENTE)
echo.

if "!MISSING!"=="1" (
  if "!NEED_RESTART_HINT!"=="1" (
    echo Reinicia la ventana o el PC si acabas de instalar algo, y vuelve a ejecutar ARRANCAR.bat
  )
  exit /b 1
)

echo [OK] Dependencias listas
exit /b 0
