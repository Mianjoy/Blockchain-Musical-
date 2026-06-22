/**
 * Punto de entrada principal de la aplicación
 */
const MusicRoyaltyAPI = require('./api/MusicRoyaltyAPI');

async function main() {
  try {
    console.log('=== Sistema de Regalías Musicales con Blockchain ===\n');

    // Crear y inicializar API
    const api = new MusicRoyaltyAPI();
    await api.inicializar({
      channelName: 'mychannel',
      chaincodeName: 'music-royalty'
    });

    // Iniciar servidor
    await api.iniciar();

    console.log('\nSistema listo para recibir peticiones');
    console.log('Endpoints disponibles:');
    console.log('  POST   /api/canciones        - Crear nueva canción');
    console.log('  GET    /api/canciones        - Listar canciones');
    console.log('  GET    /api/canciones/:id    - Obtener canción');
    console.log('  POST   /api/compras          - Registrar compra');
    console.log('  GET    /api/descargar/:id    - Obtener clave de descarga');
    console.log('  GET    /health               - Verificar estado\n');

    // Manejar cierre graceful
    process.on('SIGINT', async () => {
      console.log('\nCerrando sistema...');
      await api.cerrar();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\nCerrando sistema...');
      await api.cerrar();
      process.exit(0);
    });

  } catch (error) {
    console.error('Error fatal:', error);
    process.exit(1);
  }
}

// Ejecutar aplicación
main();
