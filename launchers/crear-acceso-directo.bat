@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0.."
set "ROOT=%CD%"

set "APP_EXE=%ROOT%\Blockchain MUSIC.exe"
set "FABRIC_EXE=%ROOT%\Blockchain MUSIC - Fabric.exe"
set "APP_ICO=%ROOT%\packaging\icons\app-music.ico"
set "FABRIC_ICO=%ROOT%\packaging\icons\fabric-hl.ico"
set "DESKTOP=%USERPROFILE%\Desktop"
if not exist "%DESKTOP%" set "DESKTOP=%USERPROFILE%\OneDrive\Desktop"

if not exist "%APP_EXE%" (
  echo [INFO] Compilando ejecutables...
  call "%ROOT%\packaging\build-exes.bat"
)

if not exist "%APP_EXE%" (
  echo [AVISO] No hay Blockchain MUSIC.exe. Creando acceso a APP-UP.bat
  set "APP_TARGET=%~dp0APP-UP.bat"
) else (
  set "APP_TARGET=%APP_EXE%"
)

if not exist "%FABRIC_EXE%" (
  set "FABRIC_TARGET=%~dp0FABRIC-UP.bat"
) else (
  set "FABRIC_TARGET=%FABRIC_EXE%"
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$desk='%DESKTOP%'; $ws = New-Object -ComObject WScript.Shell;" ^
  "$s1 = $ws.CreateShortcut((Join-Path $desk 'Blockchain MUSIC.lnk')); $s1.TargetPath='%APP_TARGET%'; $s1.WorkingDirectory='%ROOT%'; if (Test-Path '%APP_ICO%') { $s1.IconLocation='%APP_ICO%,0' }; $s1.Description='Blockchain MUSIC - App'; $s1.Save();" ^
  "$s2 = $ws.CreateShortcut((Join-Path $desk 'Blockchain MUSIC - Fabric.lnk')); $s2.TargetPath='%FABRIC_TARGET%'; $s2.WorkingDirectory='%ROOT%'; if (Test-Path '%FABRIC_ICO%') { $s2.IconLocation='%FABRIC_ICO%,0' }; $s2.Description='Blockchain MUSIC - Fabric'; $s2.Save();" ^
  "Write-Host ('Accesos creados en: ' + $desk)"

if errorlevel 1 (
  echo [AVISO] No se pudieron crear los accesos directos.
) else (
  echo [OK] Accesos en el Escritorio:
  echo     Blockchain MUSIC.lnk
  echo     Blockchain MUSIC - Fabric.lnk
)
echo.
pause
endlocal
