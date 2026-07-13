const MusicRoyaltyAPI = require('./api/MusicRoyaltyAPI');

async function main() {
  try {
    console.log('=== Sistema de Regalías Musicales con Blockchain ===\n');

    const allowSimulation =
      process.env.ALLOW_SIMULATION === 'true' || process.env.MODO_SIMULACION === 'true';

    const api = new MusicRoyaltyAPI();
    await api.inicializar({
      channelName: process.env.CHANNEL_NAME || 'mychannel',
      chaincodeName: process.env.CHAINCODE_NAME || 'music-royalty',
      allowSimulation
    });

    await api.iniciar();

    console.log('\nSistema listo para recibir peticiones');
    console.log('Endpoints disponibles:');
    console.log('  POST   /api/canciones        - Crear nueva canción');
    console.log('  GET    /api/canciones        - Listar canciones');
    console.log('  GET    /api/canciones/:id    - Obtener canción');
    console.log('  POST   /api/compras          - Registrar compra');
    console.log('  GET    /api/descargar/:id    - Obtener clave de descarga');
    console.log('  GET    /health               - Verificar estado\n');

    if (allowSimulation) {
      console.log('ALLOW_SIMULATION=true (fallback a simulación permitido)\n');
    } else {
      console.log('Modo Fabric estricto (sin simulación silenciosa)\n');
    }

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
    console.error('Error fatal:', error.message || error);
    process.exit(1);
  }
}

main();
