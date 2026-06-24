import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      // Auth
      "login": "Iniciar Sesión",
      "logout": "Cerrar Sesión",
      "register": "Registrarse",
      "email": "Correo Electrónico",
      "password": "Contraseña",
      "fullName": "Nombre Completo",
      "welcome": "Bienvenido",
      "loginSuccess": "Inicio de sesión exitoso",
      "loginError": "Credenciales inválidas",
      "registerSuccess": "Registro exitoso",
      "registerError": "Error en el registro",
      "noAccount": "¿No tienes cuenta?",
      "hasAccount": "¿Ya tienes cuenta?",
      
      // Navigation
      "home": "Inicio",
      "songs": "Canciones",
      "createSong": "Crear Canción",
      "myPurchases": "Mis Compras",
      "mySongs": "Mis Canciones",
      
      // Home
      "welcomeTitle": "Sistema de Regalías Musicales con Blockchain",
      "welcomeSubtitle": "Gestiona derechos de autor y distribuye regalías de forma transparente",
      "features": "Características",
      "feature1": "Contratos inteligentes automáticos",
      "feature2": "Distribución transparente de regalías",
      "feature3": "Claves de descarga seguras",
      "feature4": "Historial inmutable en blockchain",
      "getStarted": "Comenzar",
      
      // Songs List
      "searchPlaceholder": "Buscar por título o artista...",
      "filterByGenre": "Filtrar por género",
      "allGenres": "Todos los géneros",
      "noSongsFound": "No se encontraron canciones",
      "price": "Precio",
      "buy": "Comprar",
      "details": "Ver Detalles",
      
      // Genres
      "genre.pop": "Pop",
      "genre.rock": "Rock",
      "genre.jazz": "Jazz",
      "genre.classical": "Clásica",
      "genre.electronic": "Electrónica",
      "genre.reggaeton": "Reggaetón",
      "genre.salsa": "Salsa",
      "genre.hip-hop": "Hip-Hop",
      "genre.country": "Country",
      "genre.rnb": "R&B",
      "genre.other": "Otro",
      
      // Create Song
      "songTitle": "Título de la Canción",
      "artistName": "Nombre del Artista",
      "genre": "Género",
      "description": "Descripción",
      "downloadLink": "Enlace de Descarga",
      "priceUSD": "Precio (USD)",
      "addParticipant": "Agregar Participante",
      "participantName": "Nombre del Participante",
      "participantRole": "Rol",
      "role.artist": "Artista",
      "role.composer": "Compositor",
      "role.producer": "Productor",
      "role.lyricist": "Letrista",
      "role.label": "Sello Discográfico",
      "percentage": "Porcentaje (%)",
      "totalPercentage": "Porcentaje Total",
      "percentageError": "La suma de porcentajes debe ser 100%",
      "createContract": "Crear Contrato y Publicar",
      "contractCreated": "Contrato creado exitosamente",
      "contractError": "Error al crear contrato",
      "removeParticipant": "Eliminar",
      "blockchainProcessing": "Procesando en blockchain...",
      
      // Song Detail
      "albumCover": "Portada del Álbum",
      "releaseDate": "Fecha de Lanzamiento",
      "duration": "Duración",
      "participants": "Participantes y Regalías",
      "royaltyDistribution": "Distribución de Regalías",
      "purchaseInfo": "Información de Compra",
      "confirmPurchase": "Confirmar Compra",
      "purchaseSuccess": "Compra realizada exitosamente",
      "purchaseError": "Error en la compra",
      "generatingKey": "Generando clave de acceso...",
      "accessKey": "Clave de Acceso",
      "copyKey": "Copiar Clave",
      "downloadNow": "Descargar Ahora",
      "keyCopied": "Clave copiada al portapapeles",
      "alreadyPurchased": "Ya compraste esta canción",
      
      // Purchases
      "purchaseDate": "Fecha de Compra",
      "songName": "Canción",
      "accessKeys": "Claves de Acceso",
      "noPurchases": "No tienes compras aún",
      "totalSpent": "Total Gastado",
      
      // My Songs
      "myCreatedSongs": "Canciones que Creaste",
      "totalSales": "Ventas Totales",
      "totalRoyalties": "Regalías Recibidas",
      "salesHistory": "Historial de Ventas",
      "noSongsCreated": "No has creado canciones aún",
      
      // Common
      "loading": "Cargando...",
      "error": "Error",
      "success": "Éxito",
      "cancel": "Cancelar",
      "confirm": "Confirmar",
      "save": "Guardar",
      "delete": "Eliminar",
      "edit": "Editar",
      "close": "Cerrar",
      "back": "Volver",
      "next": "Siguiente",
      "previous": "Anterior",
      "required": "Requerido",
      "invalidEmail": "Correo inválido",
      "minLength": "Mínimo {{length}} caracteres",
      "selectOption": "Selecciona una opción"
    }
  },
  en: {
    translation: {
      // Auth
      "login": "Login",
      "logout": "Logout",
      "register": "Register",
      "email": "Email",
      "password": "Password",
      "fullName": "Full Name",
      "welcome": "Welcome",
      "loginSuccess": "Login successful",
      "loginError": "Invalid credentials",
      "registerSuccess": "Registration successful",
      "registerError": "Registration error",
      "noAccount": "Don't have an account?",
      "hasAccount": "Already have an account?",
      
      // Navigation
      "home": "Home",
      "songs": "Songs",
      "createSong": "Create Song",
      "myPurchases": "My Purchases",
      "mySongs": "My Songs",
      
      // Home
      "welcomeTitle": "Music Royalty Blockchain System",
      "welcomeSubtitle": "Manage copyrights and distribute royalties transparently",
      "features": "Features",
      "feature1": "Automatic smart contracts",
      "feature2": "Transparent royalty distribution",
      "feature3": "Secure download keys",
      "feature4": "Immutable blockchain history",
      "getStarted": "Get Started",
      
      // Songs List
      "searchPlaceholder": "Search by title or artist...",
      "filterByGenre": "Filter by genre",
      "allGenres": "All genres",
      "noSongsFound": "No songs found",
      "price": "Price",
      "buy": "Buy",
      "details": "View Details",
      
      // Genres
      "genre.pop": "Pop",
      "genre.rock": "Rock",
      "genre.jazz": "Jazz",
      "genre.classical": "Classical",
      "genre.electronic": "Electronic",
      "genre.reggaeton": "Reggaeton",
      "genre.salsa": "Salsa",
      "genre.hip-hop": "Hip-Hop",
      "genre.country": "Country",
      "genre.rnb": "R&B",
      "genre.other": "Other",
      
      // Create Song
      "songTitle": "Song Title",
      "artistName": "Artist Name",
      "genre": "Genre",
      "description": "Description",
      "downloadLink": "Download Link",
      "priceUSD": "Price (USD)",
      "addParticipant": "Add Participant",
      "participantName": "Participant Name",
      "participantRole": "Role",
      "role.artist": "Artist",
      "role.composer": "Composer",
      "role.producer": "Producer",
      "role.lyricist": "Lyricist",
      "role.label": "Record Label",
      "percentage": "Percentage (%)",
      "totalPercentage": "Total Percentage",
      "percentageError": "Percentages must sum to 100%",
      "createContract": "Create Contract & Publish",
      "contractCreated": "Contract created successfully",
      "contractError": "Error creating contract",
      "removeParticipant": "Remove",
      "blockchainProcessing": "Processing on blockchain...",
      
      // Song Detail
      "albumCover": "Album Cover",
      "releaseDate": "Release Date",
      "duration": "Duration",
      "participants": "Participants & Royalties",
      "royaltyDistribution": "Royalty Distribution",
      "purchaseInfo": "Purchase Information",
      "confirmPurchase": "Confirm Purchase",
      "purchaseSuccess": "Purchase completed successfully",
      "purchaseError": "Purchase error",
      "generatingKey": "Generating access key...",
      "accessKey": "Access Key",
      "copyKey": "Copy Key",
      "downloadNow": "Download Now",
      "keyCopied": "Key copied to clipboard",
      "alreadyPurchased": "You already bought this song",
      
      // Purchases
      "purchaseDate": "Purchase Date",
      "songName": "Song",
      "accessKeys": "Access Keys",
      "noPurchases": "No purchases yet",
      "totalSpent": "Total Spent",
      
      // My Songs
      "myCreatedSongs": "Songs You Created",
      "totalSales": "Total Sales",
      "totalRoyalties": "Royalties Received",
      "salesHistory": "Sales History",
      "noSongsCreated": "You haven't created any songs yet",
      
      // Common
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      "cancel": "Cancel",
      "confirm": "Confirm",
      "save": "Save",
      "delete": "Delete",
      "edit": "Edit",
      "close": "Close",
      "back": "Back",
      "next": "Next",
      "previous": "Previous",
      "required": "Required",
      "invalidEmail": "Invalid email",
      "minLength": "Minimum {{length}} characters",
      "selectOption": "Select an option"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
