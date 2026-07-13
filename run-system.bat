@echo off
REM Compatibilidad: el arranque completo con Fabric esta en start-system.bat
echo Redirigiendo a start-system.bat (Hyperledger Fabric + App)...
call "%~dp0start-system.bat"
