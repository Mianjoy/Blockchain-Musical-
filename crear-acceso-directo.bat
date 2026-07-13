@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

set "TARGET=%~dp0ARRANCAR.bat"
set "LINK=%USERPROFILE%\Desktop\Music Royalty - Arrancar.lnk"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%LINK%'); $s.TargetPath = '%TARGET%'; $s.WorkingDirectory = '%~dp0'; $s.WindowStyle = 1; $s.Description = 'Arranca Music Royalty + Hyperledger Fabric'; $s.Save()"

if exist "%LINK%" (
  echo [OK] Acceso directo creado en el Escritorio:
  echo     Music Royalty - Arrancar.lnk
) else (
  echo [AVISO] No se pudo crear el acceso directo. Usa ARRANCAR.bat directamente.
)
echo.
pause
endlocal
