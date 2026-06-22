# Music Royalty Blockchain - Frontend

Interfaz gráfica para el sistema de regalías musicales con blockchain.

## Características

- **Multi-idioma**: Soporte para Español e Inglés
- **Diseño Responsivo**: Funciona en dispositivos móviles y escritorio
- **Interfaz Moderna**: UI limpia y atractiva con gradientes y animaciones
- **Gestión de Canciones**: Crear, ver y comprar canciones
- **Claves de Acceso**: Generación y gestión de claves de descarga
- **Historial de Compras**: Visualización de todas las compras realizadas

## Instalación

```bash
cd frontend
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación se ejecutará en `http://localhost:3000`

## Construcción para Producción

```bash
npm run build
```

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   └── Navbar.jsx
│   ├── pages/           # Páginas principales
│   │   ├── HomePage.jsx
│   │   ├── SongsPage.jsx
│   │   ├── CreateSongPage.jsx
│   │   ├── SongDetailPage.jsx
│   │   └── PurchasesPage.jsx
│   ├── contexts/        # Contextos de React
│   │   └── LanguageContext.js
│   ├── hooks/           # Custom hooks
│   ├── services/        # Servicios API
│   │   └── api.js
│   ├── locales/         # Traducciones
│   │   ├── es.js
│   │   └── en.js
│   ├── styles/          # Estilos CSS
│   │   ├── App.css
│   │   ├── Navbar.css
│   │   ├── Home.css
│   │   ├── SongsPage.css
│   │   ├── CreateSongPage.css
│   │   ├── SongDetailPage.css
│   │   └── PurchasesPage.css
│   ├── i18n.js          # Configuración de internacionalización
│   ├── App.jsx          # Componente principal
│   └── main.jsx         # Punto de entrada
├── index.html
├── package.json
└── vite.config.js
```

## Tecnologías

- **React 18**: Biblioteca de UI
- **Vite**: Build tool moderno
- **react-i18next**: Internacionalización
- **Axios**: Cliente HTTP
- **CSS3**: Estilos personalizados

## Funcionalidades

### Página de Inicio
- Bienvenida al sistema
- Características principales
- Navegación rápida

### Catálogo de Canciones
- Lista de canciones disponibles
- Información de cada canción
- Navegación a detalles

### Crear Canción
- Formulario completo de registro
- Gestión de participantes y regalías
- Validación de datos
- Registro en blockchain

### Detalles de Canción
- Información completa de la canción
- Distribución de regalías
- Proceso de compra
- Generación de clave de acceso
- Descarga de archivo

### Mis Compras
- Historial de compras
- Visualización de claves
- Descarga de canciones compradas

## Idiomas Soportados

- 🇪🇸 Español
- 🇬🇧 English

El cambio de idioma se realiza desde la barra de navegación y afecta toda la interfaz inmediatamente.
