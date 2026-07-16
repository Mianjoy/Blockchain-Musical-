@echo off
setlocal EnableExtensions
cd /d "%~dp0.."

set "ROOT=%CD%"
set "DESKTOP=%USERPROFILE%\Desktop"
if not exist "%DESKTOP%" set "DESKTOP=%USERPROFILE%\OneDrive\Desktop"
if not exist "%DESKTOP%" (
  echo ERROR: No se encontro la carpeta Escritorio.
  exit /b 1
)

set "APP_EXE=%ROOT%\Blockchain MUSIC.exe"
set "FABRIC_EXE=%ROOT%\Blockchain MUSIC - Fabric.exe"
set "APP_ICO=%ROOT%\packaging\icons\app-music.ico"
set "FABRIC_ICO=%ROOT%\packaging\icons\fabric-hl.ico"

if not exist "%APP_EXE%" if not exist "%FABRIC_EXE%" (
  echo Compilando ejecutables...
  call "%ROOT%\packaging\build-exes.bat"
  if errorlevel 1 exit /b 1
)

if not exist "%APP_EXE%" (
  echo ERROR: Falta "%APP_EXE%"
  exit /b 1
)
if not exist "%FABRIC_EXE%" (
  echo ERROR: Falta "%FABRIC_EXE%"
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$desk='%DESKTOP%'; $appExe='%APP_EXE%'; $fabExe='%FABRIC_EXE%'; $appIco='%APP_ICO%'; $fabIco='%FABRIC_ICO%'; $repo='%ROOT%';" ^
  "$ws = New-Object -ComObject WScript.Shell;" ^
  "$s1 = $ws.CreateShortcut((Join-Path $desk 'Blockchain MUSIC.lnk')); $s1.TargetPath=$appExe; $s1.WorkingDirectory=$repo; $s1.IconLocation=$appIco+',0'; $s1.Description='Blockchain MUSIC'; $s1.Save();" ^
  "$s2 = $ws.CreateShortcut((Join-Path $desk 'Blockchain MUSIC - Fabric.lnk')); $s2.TargetPath=$fabExe; $s2.WorkingDirectory=$repo; $s2.IconLocation=$fabIco+',0'; $s2.Description='Blockchain MUSIC - Fabric'; $s2.Save();" ^
  "Write-Host ('Accesos creados en: ' + $desk)"

if errorlevel 1 (
  echo ERROR al crear accesos directos.
  exit /b 1
)

echo Listo: Blockchain MUSIC.lnk y Blockchain MUSIC - Fabric.lnk en el Escritorio.
endlocal
