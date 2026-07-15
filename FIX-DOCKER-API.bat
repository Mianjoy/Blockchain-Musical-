@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>nul
title Fix Docker API para Hyperledger Fabric
cd /d "%~dp0"

echo ============================================================
echo  FIX Docker API ^(Fabric chaincode / error client 1.25^)
echo ============================================================
echo.
echo Docker Desktop moderno rechaza clientes Docker antiguos.
echo Fabric 2.5.4 usaba API 1.25; el proyecto ahora usa Fabric 3.1.5.
echo.
echo Ademas, este script configura Docker Engine para aceptar
echo APIs antiguas ^(min-api-version 1.24^) por si hace falta.
echo.

set "DAEMON=%USERPROFILE%\.docker\daemon.json"
if not exist "%USERPROFILE%\.docker" mkdir "%USERPROFILE%\.docker" >nul 2>nul

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$path = $env:USERPROFILE + '\.docker\daemon.json';" ^
  "$cfg = @{};" ^
  "if (Test-Path -LiteralPath $path) {" ^
  "  try { $cfg = Get-Content -LiteralPath $path -Raw | ConvertFrom-Json } catch { $cfg = @{} }" ^
  "}" ^
  "if ($cfg -isnot [hashtable]) { $h = @{}; foreach ($p in $cfg.PSObject.Properties) { $h[$p.Name] = $p.Value }; $cfg = $h }" ^
  "$cfg['min-api-version'] = '1.24';" ^
  "$json = $cfg | ConvertTo-Json -Depth 20;" ^
  "Set-Content -LiteralPath $path -Value $json -Encoding UTF8;" ^
  "Write-Output ('Escrito: ' + $path);" ^
  "Write-Output $json"

if errorlevel 1 (
  echo [ERROR] No se pudo actualizar daemon.json
  echo Configuralo manualmente en Docker Desktop ^> Settings ^> Docker Engine:
  echo   "min-api-version": "1.24"
  pause
  exit /b 1
)

echo.
echo [OK] daemon.json actualizado.
echo.
echo SIGUIENTE:
echo  1. Abre Docker Desktop
echo  2. Settings ^> Docker Engine ^> Apply ^& Restart
echo     ^(si no reinicia solo, haz Apply ^& Restart^)
echo  3. Ejecuta REPARAR-FABRIC.bat
echo  4. Ejecuta ARRANCAR.bat
echo.
pause
endlocal
