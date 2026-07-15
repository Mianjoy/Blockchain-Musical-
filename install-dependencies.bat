@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Instalador de dependencias - Music Royalty Blockchain
cd /d "%~dp0"

echo.
echo ============================================================
echo   INSTALADOR DE DEPENDENCIAS
echo   Sistema de Regalias Musicales + Hyperledger Fabric
echo ============================================================
echo.
echo Este asistente revisa e instala lo necesario para ejecutar
echo el sistema en Windows:
echo   1^) Node.js 18+
echo   2^) Git for Windows (Git Bash^)
echo   3^) Docker Desktop
echo   4^) Dependencias npm (backend + frontend^)
echo   5^) Imagenes Docker de Hyperledger Fabric (opcional^)
echo.

set "MISSING=0"
set "NODE_OK=0"
set "GIT_OK=0"
set "DOCKER_OK=0"
set "NPM_OK=0"
set "HAS_WINGET=0"

where winget >nul 2>nul
if %ERRORLEVEL% EQU 0 set "HAS_WINGET=1"

:: ------------------------------------------------------------
:: 1. Node.js
:: ------------------------------------------------------------
echo ------------------------------------------------------------
echo [1/5] Node.js
echo ------------------------------------------------------------
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  for /f "tokens=*" %%v in ('node --version 2^>nul') do set "NODE_VER=%%v"
  echo [OK] Node.js detectado: !NODE_VER!
  set "NODE_OK=1"
) else (
  echo [FALTA] Node.js no esta instalado.
  set "MISSING=1"
  echo.
  echo Node.js es obligatorio para la API, el frontend y la wallet.
  if "!HAS_WINGET!"=="1" (
    echo.
    set /p INSTALL_NODE="Instalar Node.js LTS con winget ahora? (S/N): "
    if /i "!INSTALL_NODE!"=="S" (
      echo Instalando OpenJS.NodeJS.LTS...
      winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
      if !ERRORLEVEL! EQU 0 (
        echo [OK] Node.js instalado. Si "node" no se reconoce, cierra y vuelve a abrir esta ventana.
        set "NODE_OK=1"
      ) else (
        echo [AVISO] winget no pudo instalar Node.js. Abriendo pagina de descarga...
        start https://nodejs.org/en/download
      )
    ) else (
      echo Abriendo pagina de descarga de Node.js...
      start https://nodejs.org/en/download
      echo Instala Node.js LTS, reinicia esta ventana y vuelve a ejecutar este script.
    )
  ) else (
    echo Abriendo pagina de descarga de Node.js...
    start https://nodejs.org/en/download
    echo Instala Node.js LTS, reinicia esta ventana y vuelve a ejecutar este script.
  )
)
echo.

:: Refrescar PATH de Node tras instalacion en la misma sesion
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
if exist "%LocalAppData%\Programs\node\node.exe" set "PATH=%LocalAppData%\Programs\node;%PATH%"
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 set "NODE_OK=1"

:: ------------------------------------------------------------
:: 2. Git / Git Bash
:: ------------------------------------------------------------
echo ------------------------------------------------------------
echo [2/5] Git for Windows (Git Bash^)
echo ------------------------------------------------------------
set "BASH_FOUND="
where bash >nul 2>nul
if %ERRORLEVEL% EQU 0 set "BASH_FOUND=bash"
if "!BASH_FOUND!"=="" if exist "C:\Program Files\Git\bin\bash.exe" set "BASH_FOUND=C:\Program Files\Git\bin\bash.exe"
if "!BASH_FOUND!"=="" if exist "C:\Program Files (x86)\Git\bin\bash.exe" set "BASH_FOUND=C:\Program Files (x86)\Git\bin\bash.exe"

if not "!BASH_FOUND!"=="" (
  echo [OK] Git Bash detectado: !BASH_FOUND!
  set "GIT_OK=1"
) else (
  where git >nul 2>nul
  if %ERRORLEVEL% EQU 0 (
    echo [AVISO] Git esta instalado pero no se encontro Git Bash.
  ) else (
    echo [FALTA] Git for Windows / Git Bash no esta instalado.
  )
  set "MISSING=1"
  echo.
  echo Git Bash es necesario para los scripts de la red Hyperledger Fabric.
  if "!HAS_WINGET!"=="1" (
    set /p INSTALL_GIT="Instalar Git for Windows con winget ahora? (S/N): "
    if /i "!INSTALL_GIT!"=="S" (
      echo Instalando Git.Git...
      winget install -e --id Git.Git --accept-package-agreements --accept-source-agreements
      if !ERRORLEVEL! EQU 0 (
        echo [OK] Git instalado. Reinicia esta ventana si bash no aparece en PATH.
        if exist "C:\Program Files\Git\bin\bash.exe" (
          set "BASH_FOUND=C:\Program Files\Git\bin\bash.exe"
          set "GIT_OK=1"
        )
      ) else (
        echo [AVISO] winget no pudo instalar Git. Abriendo descarga...
        start https://git-scm.com/download/win
      )
    ) else (
      start https://git-scm.com/download/win
      echo Instala Git for Windows (con opcion Git Bash^) y vuelve a ejecutar este script.
    )
  ) else (
    start https://git-scm.com/download/win
    echo Instala Git for Windows (con opcion Git Bash^) y vuelve a ejecutar este script.
  )
)
echo.

:: ------------------------------------------------------------
:: 3. Docker Desktop
:: ------------------------------------------------------------
echo ------------------------------------------------------------
echo [3/5] Docker Desktop
echo ------------------------------------------------------------
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  docker info >nul 2>nul
  if !ERRORLEVEL! EQU 0 (
    for /f "tokens=*" %%v in ('docker --version 2^>nul') do set "DOCKER_VER=%%v"
    echo [OK] Docker activo: !DOCKER_VER!
    set "DOCKER_OK=1"
  ) else (
    echo [AVISO] Docker CLI encontrado pero el motor no responde.
    if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
      echo Intentando iniciar Docker Desktop...
      start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
      echo Esperando 45 segundos a que Docker inicie...
      timeout /t 45 /nobreak >nul
      docker info >nul 2>nul
      if !ERRORLEVEL! EQU 0 (
        echo [OK] Docker Desktop iniciado correctamente.
        set "DOCKER_OK=1"
      ) else (
        echo [FALTA] Docker Desktop sigue sin responder. Abrilo manualmente y espera el icono verde.
        set "MISSING=1"
      )
    ) else (
      echo [FALTA] Docker Desktop no parece instalado correctamente.
      set "MISSING=1"
    )
  )
) else (
  echo [FALTA] Docker no esta instalado.
  set "MISSING=1"
  echo.
  echo Docker Desktop es obligatorio para Hyperledger Fabric (peer, orderer, CA^).
  if "!HAS_WINGET!"=="1" (
    set /p INSTALL_DOCKER="Instalar Docker Desktop con winget ahora? (S/N): "
    if /i "!INSTALL_DOCKER!"=="S" (
      echo Instalando Docker.DockerDesktop...
      winget install -e --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
      echo.
      echo [IMPORTANTE] Tras instalar Docker Desktop:
      echo   - Reinicia el PC si el instalador lo pide
      echo   - Abre Docker Desktop y espera a que quede en verde
      echo   - Activa WSL 2 si te lo solicita
      echo Luego vuelve a ejecutar este script.
    ) else (
      start https://www.docker.com/products/docker-desktop/
      echo Descarga e instala Docker Desktop, reinicia si es necesario y vuelve a ejecutar este script.
    )
  ) else (
    start https://www.docker.com/products/docker-desktop/
    echo Descarga e instala Docker Desktop, reinicia si es necesario y vuelve a ejecutar este script.
  )
)
echo.

:: ------------------------------------------------------------
:: 4. Dependencias npm
:: ------------------------------------------------------------
echo ------------------------------------------------------------
echo [4/5] Dependencias npm del proyecto
echo ------------------------------------------------------------
if "!NODE_OK!"=="0" (
  echo [SALTADO] No se pueden instalar paquetes npm sin Node.js.
  set "MISSING=1"
) else (
  where npm >nul 2>nul
  if !ERRORLEVEL! NEQ 0 (
    echo [ERROR] npm no esta en el PATH. Reinstala Node.js LTS e incluyelo en PATH.
    set "MISSING=1"
  ) else (
    echo [INFO] Instalando dependencias del backend...
    call npm install
    if !ERRORLEVEL! NEQ 0 (
      echo [ERROR] Fallo npm install en la raiz del proyecto.
      set "MISSING=1"
    ) else (
      echo [OK] Backend listo.
    )

    echo [INFO] Instalando dependencias del frontend...
    pushd frontend
    call npm install
    set "FE_ERR=!ERRORLEVEL!"
    popd
    if not "!FE_ERR!"=="0" (
      echo [ERROR] Fallo npm install en frontend.
      set "MISSING=1"
    ) else (
      echo [OK] Frontend listo.
      set "NPM_OK=1"
    )

    if exist "chaincode\music-royalty\package.json" (
      echo [INFO] Instalando dependencias del chaincode...
      pushd chaincode\music-royalty
      call npm install --omit=dev
      set "CC_ERR=!ERRORLEVEL!"
      popd
      if not "!CC_ERR!"=="0" (
        echo [AVISO] No se pudieron instalar deps del chaincode (se reintentaran al desplegar).
      ) else (
        echo [OK] Chaincode listo.
      )
    )
  )
)
echo.

:: ------------------------------------------------------------
:: 5. Imagenes Fabric (opcional)
:: ------------------------------------------------------------
echo ------------------------------------------------------------
echo [5/5] Imagenes Docker de Hyperledger Fabric (opcional^)
echo ------------------------------------------------------------
if "!DOCKER_OK!"=="1" (
  set /p PULL_IMAGES="Descargar ahora las imagenes Fabric (peer/orderer/ca/tools)? (S/N): "
  if /i "!PULL_IMAGES!"=="S" (
    echo Descargando imagenes (puede tardar varios minutos^)...
    docker pull hyperledger/fabric-peer:2.5.16
    docker pull hyperledger/fabric-orderer:2.5.16
    docker pull hyperledger/fabric-tools:2.5.16
    docker pull hyperledger/fabric-ca:1.5.21
    docker pull node:18-alpine
    echo [OK] Imagenes descargadas (o ya estaban en cache^).
  ) else (
    echo [INFO] Se descargaran automaticamente la primera vez que ejecutes start-system.bat
  )
) else (
  echo [SALTADO] Docker no esta listo; no se descargan imagenes.
)
echo.

:: ------------------------------------------------------------
:: Resumen
:: ------------------------------------------------------------
echo ============================================================
echo   RESUMEN
echo ============================================================
if "!NODE_OK!"=="1" (echo   Node.js .......... OK) else (echo   Node.js .......... FALTA)
if "!GIT_OK!"=="1" (echo   Git Bash ......... OK) else (echo   Git Bash ......... FALTA)
if "!DOCKER_OK!"=="1" (echo   Docker ........... OK) else (echo   Docker ........... FALTA)
if "!NPM_OK!"=="1" (echo   npm proyectos .... OK) else (echo   npm proyectos .... INCOMPLETO)
echo ============================================================
echo.

if "!NODE_OK!"=="1" if "!GIT_OK!"=="1" if "!DOCKER_OK!"=="1" if "!NPM_OK!"=="1" (
  echo Todas las dependencias principales estan listas.
  echo.
  set /p START_NOW="Deseas iniciar el sistema ahora con start-system.bat? (S/N): "
  if /i "!START_NOW!"=="S" (
    call "%~dp0start-system.bat"
    exit /b 0
  )
  echo.
  echo Cuando quieras arrancar, ejecuta: start-system.bat
  pause
  exit /b 0
)

echo Aun faltan dependencias. Completa las marcadas como FALTA,
echo cierra y vuelve a abrir esta ventana, y ejecuta de nuevo:
echo   install-dependencies.bat
echo.
pause
exit /b 1
