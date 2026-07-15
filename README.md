# Sistema de Regalías Musicales con Blockchain

Plataforma descentralizada para gestionar **canciones, contratos de regalías y ventas** sobre **Hyperledger Fabric 2.5**, con arquitectura DDD/SOLID, API REST y frontend React (ES/EN).

---

## Windows — arranque con un solo clic

Objetivo: **descargar el proyecto y arrancar todo** (dependencias + Fabric + API + frontend) con un archivo `.bat`.

### Paso 1 — Descargar

1. Entra al repositorio: [Blockchain-Musical-](https://github.com/Mianjoy/Blockchain-Musical-)
2. Pulsa **Code → Download ZIP**
3. Extrae el ZIP en una carpeta, por ejemplo:
   - `C:\MusicRoyalty\`
   - o `D:\Usuarios\Documentos\GitHub\Blockchain-Musical-\`

> También puedes clonar:  
> `git clone https://github.com/Mianjoy/Blockchain-Musical-.git`

### Paso 2 — Arrancar (único archivo)

Abre la carpeta del proyecto y haz **doble clic** en:

```text
ARRANCAR.bat
```

| Archivo | Qué hace |
|---------|----------|
| **`ARRANCAR.bat`** | Intenta Fabric real (Windows nativo); si falla → **DEMO/simulación** |
| **`ARRANCAR-FABRIC.bat`** | Solo Fabric real (falla con diagnóstico si no puede; sin fallback) |
| **`ARRANCAR-DEMO.bat`** | Solo simulación (Node.js; no necesita Docker) |
| **`REPARAR-FABRIC.bat`** | Limpia y regenera la red Fabric 2.5.15 |
| `run-system.bat` | Alias de `ARRANCAR.bat` |
| `crear-acceso-directo.bat` | Acceso directo en el Escritorio |

### Fabric real en Windows (recomendado)

El stack soportado es **Hyperledger Fabric 2.5.15 + CA 1.5.15**, orquestado con **CMD + Docker** (`scripts\windows\fabric-up.bat`). **No requiere Git Bash.**

```text
ARRANCAR-FABRIC.bat
```

O, si falló un intento anterior:

```text
REPARAR-FABRIC.bat
ARRANCAR-FABRIC.bat
```

`ARRANCAR.bat` / `ARRANCAR-FABRIC.bat` hacen:

1. Refresca el PATH (Node / Docker)
2. `npm install` backend y frontend
3. Levanta Fabric con **`fabric-up.bat`** (crypto nativo, compose, canal, chaincode, wallet)
4. Arranca API en modo Fabric + frontend
5. Abre http://localhost:3001
6. Logs: **`arranque.log`** y **`fabric-network.log`**

Si solo quieres **probar la app ya** (sin Docker/Fabric):

```text
ARRANCAR-DEMO.bat
```

### Paso 3 — Usar el sistema

La primera vez puede tardar varios minutos (imágenes Docker). Cuando termine:

| Qué | Dirección |
|-----|-----------|
| **Interfaz** | http://localhost:3001 |
| **API** | http://localhost:3000/api |
| **Health / Fabric** | http://localhost:3000/health |

### Paso 4 — Detener

Doble clic en:

```text
DETENER.bat
```

### Primera vez: Docker Desktop

Hyperledger Fabric **necesita Docker Desktop**:

1. Si el instalador automático lo instaló, **reinicia el PC** si Docker lo pide
2. Abre **Docker Desktop** y espera el icono **en verde**
3. Vuelve a hacer doble clic en **`ARRANCAR.bat`**

Si no hay `winget`, el script abrirá las descargas oficiales:

- [Node.js LTS](https://nodejs.org/en/download)
- [Git for Windows](https://git-scm.com/download/win) (incluye Git Bash)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

Instálalos, reinicia si hace falta, y ejecuta otra vez `ARRANCAR.bat`.

### Acceso directo en el Escritorio (opcional)

```text
crear-acceso-directo.bat
```

Crea **Music Royalty - Arrancar.lnk** en el Escritorio.

### ¿Y un .exe?

El arranque oficial es **`ARRANCAR.bat`** (doble clic, igual que un ejecutable).  
No es práctico meter Fabric + Docker en un único `.exe` autónomo: Fabric requiere Docker. El `.bat` es el launcher soportado.

Puedes crear un `.exe` “cara” con herramientas tipo *Bat to Exe* apuntando a `ARRANCAR.bat`; el comportamiento sigue siendo el mismo.

### Checklist

- [ ] ZIP descargado y descomprimido  
- [ ] Doble clic en `ARRANCAR.bat`  
- [ ] Docker Desktop en verde (primera vez)  
- [ ] Navegador en http://localhost:3001  
- [ ] Apagar con `DETENER.bat`  

---

## Características

- **Hyperledger Fabric real** — CA Org1, peer, orderer, canal `mychannel`, chaincode `music-royalty`
- **Contratos inteligentes** — distribución automática de regalías (porcentajes = 100%)
- **Catálogo profesional** — lista/cuadrícula, búsqueda, filtros y ordenación
- **Analytics y reportes** — KPIs, ventas, regalías por canción y beneficiario
- **Notificaciones** — campana + push del navegador (lanzamientos y ventas)
- **Multi-idioma** — Español e Inglés
- **Arranque Windows con un clic** — `ARRANCAR.bat`
- **Modo simulación opcional** — solo con `ALLOW_SIMULATION=true`

---

## Requisitos (el launcher intenta instalarlos)

| Herramienta | Uso |
|-------------|-----|
| **Docker Desktop** | Red Fabric 2.5.15 (obligatorio para Fabric real) |
| **Node.js 18+** | API, frontend y wallet |
| Git Bash | Opcional (solo scripts `.sh` legacy / Mac-Linux) |

---

## Otros scripts (Windows)

| Archivo | Uso |
|---------|-----|
| `ARRANCAR.bat` | Fabric nativo + fallback DEMO |
| `ARRANCAR-FABRIC.bat` | Solo Fabric real (Windows nativo) |
| `ARRANCAR-DEMO.bat` | Solo simulación |
| `REPARAR-FABRIC.bat` | Reset limpio de la red Fabric |
| `DETENER.bat` | Apagar API, frontend y Fabric |
| `FIX-DOCKER-API.bat` | Ajuste Docker Desktop API antigua |
| `install-dependencies.bat` | Solo deps (con preguntas) |
| `crear-acceso-directo.bat` | Acceso directo en el Escritorio |

Red Fabric: [network/README.md](network/README.md)

### Mac / Linux

```bash
chmod +x start-system.sh stop-system.sh network/scripts/*.sh
./start-system.sh
```

### Solo la red Fabric

```bash
bash network/scripts/network.sh up
bash network/scripts/network.sh down
bash network/scripts/network.sh clean
bash network/scripts/network.sh enroll
```

### URLs y puertos

| Servicio | URL / puerto |
|----------|----------------|
| Frontend | http://localhost:3001 |
| API | http://localhost:3000/api |
| Health | http://localhost:3000/health |
| Peer / Orderer / CA | `7051` / `7050` / `7054` |

> Sin `ALLOW_SIMULATION=true`, la API exige Fabric conectado.

---

## Guía de uso

### 1. Explorar el catálogo

1. Abre **Canciones**
2. Usa búsqueda, filtro por artista y ordenación
3. Alterna vista **lista** o **cuadrícula**
4. Abre **Ver detalles**

### 2. Crear una canción con contrato

1. **Crear Canción** → título, artista, URL, precio
2. Participantes con porcentajes que **sumen 100%**
3. Se registra en blockchain + clave de acceso
4. Notificación de **nuevo lanzamiento**

### 3. Comprar y repartir regalías

1. **Realizar Compra** en el detalle
2. Transacción en Fabric + distribución
3. Clave de descarga + notificación de venta

### 4. Analytics

Menú **Analytics**: KPIs, tablas por canción / beneficiario y actividad reciente.

### 5. Notificaciones

Campana en la navbar → **Activar push** → marcar leídas.

---

## API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Estado y Fabric |
| `POST` | `/api/canciones` | Crear canción + contrato |
| `GET` | `/api/canciones` | Listar |
| `GET` | `/api/canciones/:id` | Detalle |
| `POST` | `/api/compras` | Compra / regalías |
| `GET` | `/api/descargar/:cancionId` | Clave de acceso |
| `GET` | `/api/analytics/regalias` | Reportes |
| `GET` | `/api/notificaciones` | Listar (`?unread=true`) |
| `POST` | `/api/notificaciones/:id/leer` | Marcar leída |
| `POST` | `/api/notificaciones/leer-todas` | Marcar todas |

---

## Arquitectura

```
Blockchain-Musical-/
├── ARRANCAR.bat                    # ← Doble clic en Windows
├── DETENER.bat
├── install-dependencies-auto.bat
├── crear-acceso-directo.bat
├── domain/
├── application/use-cases/
├── infrastructure/
│   ├── blockchain/
│   ├── repositories/
│   └── services/                   # Analytics + notificaciones
├── api/
├── chaincode/music-royalty/
├── network/                        # Fabric 2.5 test-network
├── frontend/
├── scripts/enrollAppUser.js
├── start-system.bat / .sh
├── stop-system.bat / .sh
└── index.js
```

Patrones: **SOLID**, Repository, DI, Use Case, Factory.

---

## Chaincode (`music-royalty`)

| Función | Descripción |
|---------|-------------|
| `InitLedger` | Inicialización |
| `crearCancion` / `actualizarCancion` | Canciones |
| `crearContrato` / `actualizarContrato` | Contratos |
| `obtenerContratoPorCancion` | Índice canción → contrato |
| `registrarTransaccion` | Compra + eventos |
| `generarClaveAcceso` / `validarClaveAcceso` | Claves |
| `consultarTodasLasCanciones` | Listado on-chain |

---

## Instalación manual (desarrollo)

```bash
npm install
cd frontend && npm install && cd ..
bash network/scripts/network.sh up
npm start
cd frontend && npm run dev -- --host 0.0.0.0 --port 3001
```

```env
PORT=3000
HOST=0.0.0.0
CHANNEL_NAME=mychannel
CHAINCODE_NAME=music-royalty
ALLOW_SIMULATION=false
VITE_API_URL=http://localhost:3000/api
```

Simulación sin Fabric:

```bash
ALLOW_SIMULATION=true npm start
```

---

## Acceso en red local

1. Arranca con `ARRANCAR.bat` (`HOST=0.0.0.0`)
2. Obtén tu IP (`ipconfig`)
3. Abre `http://<TU_IP>:3001`

```powershell
netsh advfirewall firewall add rule name="Music Royalty Backend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Music Royalty Frontend" dir=in action=allow protocol=TCP localport=3001
```

---

## Flujo de negocio

```
Crear canción (+ %) → Contrato en Fabric → Notificación de lanzamiento
        ↓
     Compra → Regalías on-chain → Notificación de venta
        ↓
   Clave de descarga + Analytics
```

---

## Seguridad

1. Claves **SHA-256**
2. Ledger Fabric **inmutable**
3. Porcentajes validados (= 100%)
4. Wallet X.509 `appUser`
5. TLS en peer / orderer / CA

---

## Solución de problemas

### En Windows no arranca

1. Ejecuta de nuevo **`ARRANCAR.bat`**
2. Revisa **`arranque.log`** y **`fabric-network.log`**
3. Confirma **Docker Desktop en verde**
4. Si acabas de instalar Node/Git/Docker, reinicia y vuelve a ejecutar `ARRANCAR.bat`
5. Asistente manual: `install-dependencies.bat`

### Error Fabric código **125**

Docker no pudo montar carpetas del proyecto (File sharing / rutas).

El arranque Windows ya usa **`fabric-up.bat`** (CMD + Docker, sin Git Bash). Si aún falla:

1. Docker Desktop → **Settings → Resources → File sharing**
2. Marca la unidad del proyecto (`C:` o `D:`) → **Apply & Restart**
3. Ejecuta **`REPARAR-FABRIC.bat`**
4. Luego **`ARRANCAR-FABRIC.bat`**

Detalle: `fabric-network.log`

### Error: `timed out waiting for txid on all peers`

El approve/commit ya trabaja **sin `waitForEvent`** y sondea `checkcommitreadiness` (más estable en Docker Desktop). Si aún falla:

1. **`REPARAR-FABRIC.bat`** → **`ARRANCAR-FABRIC.bat`**
2. O **`ARRANCAR-DEMO.bat`** (app usable en simulación)

### Error: `client version 1.25 is too old` / `Minimum supported API version is 1.40`

Al **instalar el chaincode**, el peer intenta hacer `docker build`. Docker Desktop reciente exige API ≥ 1.40, y Fabric **2.5.4** usaba cliente 1.25.

El proyecto ya usa **Fabric 2.5.15**. Para aplicar el cambio:

1. (Opcional pero recomendado) Ejecuta **`FIX-DOCKER-API.bat`** → en Docker Desktop **Apply & Restart**
2. Ejecuta **`REPARAR-FABRIC.bat`** (obliga a bajar imágenes nuevas y regenerar red)
3. Ejecuta **`ARRANCAR.bat`**

### Red Fabric

```bash
bash network/scripts/network.sh down
bash network/scripts/network.sh clean
bash network/scripts/network.sh up
docker compose -f network/docker-compose-net.yaml logs
```

### `/health` → `"connected": false`

1. `docker ps` (peer, orderer, ca)
2. `node scripts/enrollAppUser.js`
3. Reinicia la API sin `ALLOW_SIMULATION=true`

### Puertos ocupados

`DETENER.bat` o libera `3000`, `3001`, `7050`, `7051`, `7054`.

### Limpiar todo

```bash
bash network/scripts/network.sh clean
```

---

## Roadmap

- Pagos reales (Stripe, PayPal)
- Autenticación con certificados / identidad de usuario
- Multi-organización Fabric (Org2+)
- Integración con streaming

---

## Licencia

MIT
