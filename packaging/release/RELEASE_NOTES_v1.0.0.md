# Blockchain MUSIC v1.0.0

Primera release estable del sistema de royalties musicales sobre Hyperledger Fabric.

## Requisitos previos

- **Windows 10/11** (recomendado)
- **Node.js 18+** ([nodejs.org](https://nodejs.org/))
- **Docker Desktop** instalado y en ejecución (necesario para la red Fabric)
- Espacio en disco suficiente para imágenes Docker de Hyperledger Fabric

## Contenido de esta release

- `Blockchain MUSIC - Fabric.exe` — levanta la red Hyperledger Fabric
- `Blockchain MUSIC.exe` — arranca la API y el frontend
- ZIP portable con código fuente, launchers, scripts y configuración de ejemplo

## Instalación rápida

1. Descarga el ZIP portable (o clona el repositorio) y descomprímelo.
2. Abre una terminal en la carpeta del proyecto y ejecuta:

   `launchers\install-dependencies.bat`

   Esto instalará las dependencias de Node (raíz y frontend).

3. Asegúrate de que **Docker Desktop** esté iniciado.

## Orden de arranque

1. Ejecuta primero **`Blockchain MUSIC - Fabric.exe`** (o `launchers\FABRIC-UP.bat`) y espera a que la red esté lista.
2. Después ejecuta **`Blockchain MUSIC.exe`** (o `launchers\ARRANCAR.bat` / `APP-UP.bat`).

Consulta también `EMPEZAR.txt` en la raíz del proyecto.

## URLs por defecto

- Frontend (UI): http://localhost:3001
- API: http://localhost:3000/api
- Health: http://localhost:3000/health

## Cerrar el sistema

Usa `launchers\CERRAR-TODO.bat` (o el flujo equivalente) para detener la aplicación y la red Fabric de forma ordenada.

## Notas

- No se incluyen `node_modules`, wallets ni perfiles de conexión generados; se crean al instalar y al levantar Fabric.
- `config\connection.json.example` sirve de plantilla; el perfil real se genera con la red.
- Los ejecutables `.exe` son lanzadores Windows; el runtime sigue siendo Node + Docker.

## Soporte

Issues: https://github.com/Mianjoy/Blockchain-Musical-/issues
