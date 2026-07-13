# Sistema de Regalías Musicales con Blockchain

Sistema descentralizado para la gestión de regalías musicales utilizando Hyperledger Fabric, siguiendo principios DDD y SOLID.

## 🌟 Características Principales

- ✅ **Interfaz Gráfica Intuitiva**: Diseño moderno y responsive
- ✅ **Multi-idioma**: Español e Inglés
- ✅ **Autenticación**: Login y registro de usuarios
- ✅ **Catálogo de Canciones**: Búsqueda y filtros por género
- ✅ **Contratos Inteligentes**: Distribución automática de regalías
- ✅ **Blockchain**: Registro inmutable de transacciones
- ✅ **Red Local**: Acceso desde múltiples dispositivos en la misma red
- ✅ **Portable**: Ejecución con un solo clic sin instalar dependencias

---

## 🚀 Ejecución Rápida — con Hyperledger Fabric real

Requisitos: **Docker Desktop**, **Node.js 18+**, y en Windows **Git Bash** (o WSL).

### ⭐ Windows (recomendado)

**1. Instalar dependencias** (asistente interactivo):

```bat
install-dependencies.bat
```

Comprueba e intenta instalar Node.js, Git Bash y Docker (vía `winget` si está disponible), luego ejecuta `npm install` en backend, frontend y chaincode.

**2. Arrancar el sistema:**

```bat
start-system.bat
```

Esto levanta:
- Red Fabric (CA Org1, peer, orderer)
- Canal `mychannel` + chaincode `music-royalty`
- `connection.json` + wallet `appUser`
- API en http://localhost:3000 y UI en http://localhost:3001

Detener:

```bat
stop-system.bat
```

Detalle de la red: [network/README.md](network/README.md)

### Mac / Linux

```bash
chmod +x start-system.sh stop-system.sh network/scripts/*.sh
./start-system.sh
```

### Solo la red Fabric

```bash
bash network/scripts/network.sh up      # crypto + canal + chaincode + wallet
bash network/scripts/network.sh down    # apagar
bash network/scripts/network.sh clean   # borrar artefactos
```

### Acceso

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **Health** (incluye estado Fabric): http://localhost:3000/health
- **Peer / Orderer / CA**: `7051` / `7050` / `7054`

> Sin `ALLOW_SIMULATION=true`, la API **exige** Fabric conectado (ya no cae en simulación en silencio).

---

### 🛠️ Instalación manual (desarrollo)

#### Requisitos previos:
- Node.js 18+ (https://nodejs.org/)
- npm o yarn
- Hyperledger Fabric (opcional, el sistema incluye modo simulación)

#### Paso 1: Instalar dependencias del backend
```bash
npm install
```

#### Paso 2: Instalar dependencias del frontend
```bash
cd frontend
npm install
cd ..
```

#### Paso 3: Configurar variables de entorno (opcional)
Crear archivo `.env`:
```
PORT=3000
NODE_ENV=development
VITE_API_URL=http://localhost:3000/api
HOST=0.0.0.0
```

#### Paso 4: Iniciar el backend
```bash
npm start
```

#### Paso 5: En otra terminal, iniciar el frontend
```bash
cd frontend
npm run dev
```

#### Paso 6: Acceder
- Frontend: http://localhost:5173 (o el puerto que indique Vite)
- Backend: http://localhost:3000

---

## 📖 Guía de Uso del Sistema

### 1. Primeros Pasos

1. **Registrar Usuario**: 
   - Ve a la página de registro
   - Completa tus datos (nombre, email, contraseña)
   - Inicia sesión con tus credenciales

2. **Explorar Canciones**:
   - Navega por el catálogo
   - Usa filtros por género musical
   - Busca canciones específicas

### 2. Crear una Canción con Contrato

1. Ve a "Crear Canción"
2. Completa la información:
   - Título de la canción
   - Artista principal
   - Género musical
   - Link al archivo de audio
   - Precio de venta

3. **Configurar Contrato de Regalías**:
   - Agrega participantes (artista, compositor, productor, etc.)
   - Define porcentajes de regalías (deben sumar 100%)
   - El sistema valida automáticamente la distribución

4. Guarda la canción
   - Se genera un contrato inteligente en blockchain
   - Se crea una clave de acceso única

### 3. Comprar una Canción

1. Selecciona una canción del catálogo
2. Haz clic en "Comprar"
3. Confirma la compra
4. El sistema:
   - Registra la transacción en blockchain
   - Distribuye regalías automáticamente según el contrato
   - Genera una clave de descarga única

### 4. Descargar Canciones Compradas

1. Ve a "Mis Compras"
2. Encuentra la canción comprada
3. Copia la clave de acceso generada
4. Usa el link de descarga con la clave

### 5. Simulación Multi-Usuario en Red

Para probar el sistema con 2 o más usuarios en diferentes máquinas:

**Máquina 1 (Creador):**
1. Ejecuta el sistema con Docker
2. Registra un usuario (ej: "artista1")
3. Crea una canción con su contrato
4. Comparte la IP de tu máquina con otros usuarios

**Máquina 2 (Comprador):**
1. Abre el navegador y ve a `http://<IP_MAQUINA_1>:3001`
2. Registra otro usuario (ej: "fan1")
3. Explora el catálogo y verá las canciones creadas
4. Compra una canción
5. La transacción se registra en blockchain y las regalías se distribuyen

> 💡 **Importante**: Ambos usuarios comparten la misma blockchain porque están conectados al mismo backend Docker.

---

## 🏗️ Arquitectura del Sistema

El sistema sigue una arquitectura en capas basada en Domain-Driven Design (DDD):

```
music-royalty-blockchain/
├── domain/                      # Capa de Dominio
│   ├── entities/                # Entidades del dominio
│   │   ├── Cancion.js           # Entidad Canción
│   │   ├── Usuario.js           # Entidad Usuario
│   │   └── Contrato.js          # Entidad Contrato
│   ├── value-objects/           # Objetos de valor
│   │   ├── Transaccion.js       # Transacción de pago
│   │   └── ClaveAcceso.js       # Clave de acceso criptográfica
│   └── interfaces/              # Interfaces (puertos)
│       ├── ICancionRepository.js
│       ├── IContratoRepository.js
│       └── IBlockchainService.js
├── application/                 # Capa de Aplicación
│   ├── use-cases/               # Casos de uso
│   │   ├── CrearCancionUseCase.js
│   │   ├── RegistrarCompraUseCase.js
│   │   └── ObtenerClaveAccesoUseCase.js
│   └── dto/                     # Data Transfer Objects
├── infrastructure/              # Capa de Infraestructura
│   ├── blockchain/              # Implementación de blockchain
│   │   ├── HyperledgerFabricService.js
│   │   └── chaincode.js         # Smart Contract (Chaincode)
│   └── repositories/            # Implementación de repositorios
│       ├── BlockchainCancionRepository.js
│       └── BlockchainContratoRepository.js
├── api/                         # Capa de API
│   ├── MusicRoyaltyAPI.js       # API REST
│   └── DIContainer.js           # Inyección de dependencias
├── frontend/                    # Interfaz Gráfica React
│   ├── src/
│   │   ├── components/          # Componentes reutilizables
│   │   ├── pages/               # Páginas principales
│   │   ├── contexts/            # Contextos (idioma, auth)
│   │   ├── services/            # Servicios API
│   │   ├── locales/             # Traducciones ES/EN
│   │   └── styles/              # Estilos CSS
│   └── package.json
├── index.js                     # Punto de entrada
└── package.json
```

---

## 📐 Principios de Diseño Aplicados

### SOLID

1. **Single Responsibility Principle (SRP)**: Cada clase tiene una única responsabilidad
   - `Cancion`: Gestiona datos y lógica de una canción
   - `Contrato`: Gestiona distribución de regalías
   - `HyperledgerFabricService`: Solo maneja comunicación con blockchain

2. **Open/Closed Principle (OCP)**: Las clases están abiertas a extensión pero cerradas a modificación
   - Los casos de uso pueden extenderse sin modificar las entidades

3. **Liskov Substitution Principle (LSP)**: Las implementaciones pueden sustituir a sus interfaces
   - `BlockchainCancionRepository` implementa `ICancionRepository`

4. **Interface Segregation Principle (ISP)**: Interfaces específicas y cohesionadas
   - Repositorios separados para canciones y contratos

5. **Dependency Inversion Principle (DIP)**: Dependencia de abstracciones
   - Los casos de uso dependen de interfaces, no de implementaciones concretas

### Patrones de Diseño

1. **Repository Pattern**: Abstrae el acceso a datos
2. **Dependency Injection**: Inversión de control mediante contenedor
3. **Use Case Pattern**: Casos de uso como comandos
4. **Factory Pattern**: Creación de objetos en el contenedor DI
5. **Strategy Pattern**: Diferentes estrategias de persistencia

---

## 🔧 Configuración de Red Local

Para acceder desde múltiples dispositivos:

### 1. Configurar Firewall

**Windows:**
```powershell
# Permitir puertos en firewall
netsh advfirewall firewall add rule name="Music Royalty Backend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Music Royalty Frontend" dir=in action=allow protocol=TCP localport=3001
```

**Linux (UFW):**
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
```

**Mac:**
- Preferencias del Sistema → Seguridad y Privacidad → Firewall
- Agrega Docker o permite los puertos 3000 y 3001

### 2. Verificar Conexión

Desde otra máquina en la red:
```bash
ping <IP_MAQUINA_SERVIDOR>
curl http://<IP_MAQUINA_SERVIDOR>:3000/health
```

---

## 📊 Flujo de Trabajo

1. **Crear Canción**: 
   - Artista crea canción con participantes
   - Se genera contrato inteligente automáticamente
   - Se genera clave de acceso única

2. **Comprar Canción**:
   - Comprador realiza pago
   - Sistema distribuye regalías según contrato
   - Transacción se registra en blockchain

3. **Descargar Canción**:
   - Comprador solicita clave de descarga
   - Sistema valida clave
   - Se proporciona link con clave de acceso

---

## 🔐 Smart Contract (Chaincode)

El chaincode de Hyperledger Fabric incluye las siguientes funciones:

- `crearCancion`: Registra una nueva canción
- `crearContrato`: Crea contrato de regalías
- `registrarTransaccion`: Registra compra y distribuye regalías
- `generarClaveAcceso`: Genera clave de descarga
- `validarClaveAcceso`: Valida clave de descarga
- `consultarTodasLasCanciones`: Query de todas las canciones

---

## 🛡️ Consideraciones de Seguridad

1. **Claves Criptográficas**: SHA-256 para generación de claves
2. **Inmutabilidad**: Todas las transacciones son inmutables en blockchain
3. **Validación**: Múltiples capas de validación de datos
4. **Eventos**: Auditoría completa mediante eventos de blockchain
5. **Persistencia**: Los datos de blockchain se guardan en volúmenes Docker

---

## 🧑‍💻 Modo Desarrollo / Simulación

Por defecto el sistema usa **Fabric real**. Para permitir fallback a simulación en memoria:

```bash
ALLOW_SIMULATION=true npm start
```

La red local de prueba está en `network/` (ver `network/README.md`). El chaincode empaquetable está en `chaincode/music-royalty/`.

---

## ❓ Solución de Problemas

### El sistema no arranca
```bash
# Verificar logs
docker compose logs

# Reiniciar servicios
docker compose down
docker compose up --build
```

### No puedo acceder desde otra máquina
1. Verifica que Docker esté escuchando en 0.0.0.0
2. Revisa el firewall de tu máquina
3. Asegúrate de usar la IP correcta (no localhost)
4. Verifica que ambos dispositivos estén en la misma red

### Error de puertos ya en uso
```bash
# Liberar puertos
docker compose down
# O cambiar puertos en docker-compose.yml
```

### Datos persistentes
Los datos de blockchain se guardan en un volumen Docker. Para limpiar:
```bash
docker compose down -v
```

---

## 🎯 Próximas Mejoras

- Integración con sistemas de pago reales (Stripe, PayPal)
- Autenticación de usuarios con certificados digitales
- Soporte para múltiples redes blockchain
- Analytics y reportes de regalías
- Notificaciones push para nuevos lanzamientos
- Integración con plataformas de streaming

---

## 📄 Licencia

MIT
