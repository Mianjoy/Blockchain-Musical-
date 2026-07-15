@echo off
:: Prueba Docker + montaje de volumen (detecta error 125 / File sharing)
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
title Diagnostico Music Royalty
cd /d "%~dp0"

set "ROOT=%CD%"
set "OUT=%ROOT%\diagnostico.txt"
echo.>"%OUT%"

echo ============================================================
echo  DIAGNOSTICO - Music Royalty / Fabric
echo ============================================================
echo.
echo Escribiendo resultados en diagnostico.txt ...
echo.

call "%ROOT%\scripts\windows\refresh-path.bat"

call :line "Carpeta: %ROOT%"
call :line "Fecha: %date% %time%"

where node >nul 2>nul && (for /f %%v in ('node -v') do call :line "Node: %%v") || call :line "Node: NO"
where npm >nul 2>nul && call :line "npm: OK" || call :line "npm: NO"

call "%ROOT%\scripts\windows\find-bash.bat"
if defined MR_BASH (call :line "Git Bash: %MR_BASH%") else (call :line "Git Bash: NO")

where docker >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" (
    set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"
  )
)
where docker >nul 2>nul
if errorlevel 1 (
  call :line "Docker CLI: NO ENCONTRADO"
  call :line "Instala/abre Docker Desktop y reinicia la PC"
  goto finish
) else (
  for /f "tokens=*" %%v in ('docker --version') do call :line "Docker CLI: %%v"
)

docker info >nul 2>nul
if errorlevel 1 (
  call :line "Docker daemon: NO RESPONDE (abre Docker Desktop, icono verde)"
  goto finish
) else (
  call :line "Docker daemon: OK"
)

call :line "--- Prueba docker run hello-world ---"
docker run --rm hello-world >>"%OUT%" 2>&1
if errorlevel 1 (call :line "hello-world: FALLO") else (call :line "hello-world: OK")

call :line "--- Prueba montaje de volumen (causa tipica error 125) ---"
set "TESTDIR=%ROOT%\network\.dockertest"
if not exist "%TESTDIR%" mkdir "%TESTDIR%" >nul 2>nul
echo ok>"%TESTDIR%\ping.txt"

docker run --rm -v "%TESTDIR%:/work" -w /work alpine:3.19 cat /work/ping.txt >>"%OUT%" 2>&1
set "MRC=!ERRORLEVEL!"
if "!MRC!"=="0" (
  call :line "Volumen network\: OK"
) else (
  call :line "Volumen network\: FALLO codigo !MRC!"
  call :line "SOLUCION: Docker Desktop > Settings > Resources > File sharing"
  call :line "Marca la unidad de esta carpeta y Apply & Restart"
)

call :line "--- Imagenes Fabric ---"
docker images --format "{{.Repository}}:{{.Tag}}" | findstr /i "hyperledger fabric-ca node alpine" >>"%OUT%" 2>&1

:finish
echo.
echo ---------- diagnostico.txt ----------
type "%OUT%"
echo -------------------------------------
echo.
echo Si el montaje de volumen FALLO, hay que habilitar File sharing.
echo Luego ejecuta REPARAR-FABRIC.bat y ARRANCAR.bat
echo.
pause
endlocal
exit /b 0

:line
echo %~1
>>"%OUT%" echo %~1
exit /b 0
