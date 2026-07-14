@echo off
:: Refresca PATH desde el registro + rutas tipicas (Node, Git, Docker)
:: Uso: call "%~dp0refresh-path.bat"

set "MR_SYS_PATH="
set "MR_USR_PATH="
for /f "tokens=2*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set "MR_SYS_PATH=%%B"
for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "MR_USR_PATH=%%B"

if defined MR_SYS_PATH set "PATH=%MR_SYS_PATH%;%PATH%"
if defined MR_USR_PATH set "PATH=%MR_USR_PATH%;%PATH%"

if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
if exist "%LocalAppData%\Programs\node\node.exe" set "PATH=%LocalAppData%\Programs\node;%PATH%"
if exist "%ProgramFiles%\Git\bin\bash.exe" set "PATH=%ProgramFiles%\Git\bin;%ProgramFiles%\Git\cmd;%PATH%"
if exist "%ProgramFiles(x86)%\Git\bin\bash.exe" set "PATH=%ProgramFiles(x86)%\Git\bin;%ProgramFiles(x86)%\Git\cmd;%PATH%"
if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"

exit /b 0
