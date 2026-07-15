@echo off
setlocal
cd /d "%~dp0.."
echo === Blockchain MUSIC - rebuild launchers ===

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0png-to-ico.ps1"
if errorlevel 1 (
  echo WARNING: ICO rebuild failed; using existing .ico files.
)

set CSC=%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe
if not exist "%CSC%" set CSC=%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe
if not exist "%CSC%" (
  echo ERROR: csc.exe not found under Microsoft.NET Framework.
  exit /b 1
)
echo Using: %CSC%

if not exist packaging\dist mkdir packaging\dist

echo Compiling "Blockchain MUSIC.exe" ...
"%CSC%" /nologo /target:winexe /optimize+ /reference:System.Windows.Forms.dll /win32icon:packaging\icons\app-music.ico /out:"Blockchain MUSIC.exe" packaging\src\AppLauncher.cs
if errorlevel 1 exit /b 1
copy /Y "Blockchain MUSIC.exe" "packaging\dist\Blockchain MUSIC.exe" >nul

echo Compiling Blockchain-MUSIC-Fabric.exe ...
"%CSC%" /nologo /target:winexe /optimize+ /reference:System.Windows.Forms.dll /win32icon:packaging\icons\fabric-hl.ico /out:"Blockchain-MUSIC-Fabric.exe" packaging\src\FabricLauncher.cs
if errorlevel 1 exit /b 1
copy /Y "Blockchain-MUSIC-Fabric.exe" "packaging\dist\Blockchain-MUSIC-Fabric.exe" >nul

echo.
echo Done:
dir "Blockchain MUSIC.exe" "Blockchain-MUSIC-Fabric.exe"
endlocal
