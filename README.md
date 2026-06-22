# Sistema de Regalías Musicales con Blockchain

Sistema descentralizado para la gestión de regalías musicales utilizando Hyperledger Fabric, siguiendo principios DDD y SOLID.

## 🚀 Ejecución Rápida - Opciones Disponibles

### Opción 1: Docker (Recomendado - Sin instalar dependencias) ⭐

Esta es la forma más fácil y portable. Solo necesitas Docker instalado.

#### Paso 1: Verificar que Docker está instalado
```bash
docker --version
docker compose version
```

Si no tienes Docker instalado:
- **Windows/Mac**: Descarga Docker Desktop desde https://www.docker.com/products/docker-desktop/
- **Linux**: `curl -fsSL https://get.docker.com | sh`

#### Paso 2: Clonar o descargar el repositorio
```bash
git clone https://github.com/Mianjoy/Blockchain-Musical-.git
cd Blockchain-Musical-
```

#### Paso 3: Ejecutar el sistema completo
```bash
docker compose up --build
```

#### Paso 4: Acceder al sistema
- **Frontend (Interfaz Gráfica)**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

#### Detener el sistema
```bash
docker compose down
```

---

### Opción 2: Script Portable Automático (Windows, Mac, Linux)

Se ha incluido un script que automatiza todo el proceso:

#### Windows:
```bash
run-system.bat
```

#### Mac/Linux:
```bash
chmod +x run-system.sh
./run-system.sh
```

El script:
1. Verifica si Docker está instalado
2. Si no está Docker, te guía para instalarlo
3. Construye y ejecuta el sistema automáticamente
4. Abre el navegador en la interfaz gráfica

---

### Opción 3: Instalación Manual (Solo Desarrollo)

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


## Arquitectura del Sistema

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
├── index.js                     # Punto de entrada
└── package.json
```

## Principios de Diseño Aplicados

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

## Características Principales

### 1. Creación de Canciones con Contrato Inteligente
- Cada canción incluye un contrato con participantes y porcentajes
- Validación automática de que los porcentajes sumen 100%
- Generación de clave de acceso única y segura

### 2. Distribución Automática de Regalías
- Al registrar una compra, se distribuyen automáticamente las regalías
- Registro inmutable en blockchain de cada transacción
- Trazabilidad completa de pagos

### 3. Sistema de Descargas Seguras
- Claves de acceso generadas criptográficamente
- Validación de claves antes de permitir descarga
- Claves de un solo uso

### 4. Blockchain Hyperledger Fabric
- Chaincode (smart contract) personalizado
- Eventos de blockchain para notificaciones
- Ledger inmutable para todas las transacciones

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar Hyperledger Fabric (requiere red Fabric configurada)
# Ver documentación de Hyperledger Fabric para configuración

# Iniciar aplicación
npm start
```

## Uso de la API

### Crear una nueva canción

```bash
POST /api/canciones
Content-Type: application/json

{
  "titulo": "Mi Canción",
  "artista": "Artista Principal",
  "linkArchivo": "https://storage.example.com/cancion.mp3",
  "participantes": [
    { "rol": "artista", "nombre": "Artista Principal", "porcentaje": 50 },
    { "rol": "productor", "nombre": "Productor X", "porcentaje": 30 },
    { "rol": "compositor", "nombre": "Compositor Y", "porcentaje": 20 }
  ],
  "usuarioId": "user123"
}
```

### Registrar una compra

```bash
POST /api/compras
Content-Type: application/json

{
  "cancionId": "cancion_1234567890_abc",
  "monto": 9.99,
  "compradorId": "comprador456"
}
```

### Obtener clave de descarga

```bash
GET /api/descargar/{cancionId}
```

### Listar canciones

```bash
GET /api/canciones
```

## Flujo de Trabajo

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

## Smart Contract (Chaincode)

El chaincode de Hyperledger Fabric incluye las siguientes funciones:

- `crearCancion`: Registra una nueva canción
- `crearContrato`: Crea contrato de regalías
- `registrarTransaccion`: Registra compra y distribuye regalías
- `generarClaveAcceso`: Genera clave de descarga
- `validarClaveAcceso`: Valida clave de descarga
- `consultarTodasLasCanciones`: Query de todas las canciones

## Consideraciones de Seguridad

1. **Claves Criptográficas**: SHA-256 para generación de claves
2. **Inmutabilidad**: Todas las transacciones son inmutables en blockchain
3. **Validación**: Múltiples capas de validación de datos
4. **Eventos**: Auditoría completa mediante eventos de blockchain

## Modo Desarrollo

El sistema incluye un modo de simulación que permite operar sin una red Hyperledger Fabric real, ideal para desarrollo y testing.

## Próximas Mejoras

- Integración con sistemas de pago reales
- Autenticación de usuarios con certificados digitales
- Interfaz web para usuarios finales
- Soporte para múltiples redes blockchain
- Analytics y reportes de regalías

## Licencia

MIT
