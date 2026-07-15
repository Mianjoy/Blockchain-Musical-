@echo off
:: Localiza Git Bash (prioridad sobre WSL). Define MR_BASH
:: Uso: call "%~dp0find-bash.bat"

set "MR_BASH="

if exist "%ProgramFiles%\Git\bin\bash.exe" (
  set "MR_BASH=%ProgramFiles%\Git\bin\bash.exe"
  exit /b 0
)
if exist "%ProgramFiles(x86)%\Git\bin\bash.exe" (
  set "MR_BASH=%ProgramFiles(x86)%\Git\bin\bash.exe"
  exit /b 0
)
if exist "%LocalAppData%\Programs\Git\bin\bash.exe" (
  set "MR_BASH=%LocalAppData%\Programs\Git\bin\bash.exe"
  exit /b 0
)

:: Evitar "where bash" si apunta a WSL; solo aceptar si esta junto a git.exe de Git for Windows
where git >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  for /f "delims=" %%G in ('where git 2^>nul') do (
    if exist "%%~dpG..\bin\bash.exe" (
      set "MR_BASH=%%~dpG..\bin\bash.exe"
      exit /b 0
    )
    if exist "%%~dpGbash.exe" (
      set "MR_BASH=%%~dpGbash.exe"
      exit /b 0
    )
  )
)

exit /b 1
