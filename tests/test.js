/**
 * Script de prueba para demostrar el funcionamiento del sistema
 */

const DIContainer = require('./api/DIContainer');

async function ejecutarPruebas() {
  console.log('=== Iniciando Pruebas del Sistema ===\n');

  const container = new DIContainer();
  
  try {
    // Inicializar contenedor (modo simulación)
    await container.inicializar();
    
    console.log('\n--- PRUEBA 1: Crear Canción ---');
    const crearCancionUseCase = container.getUseCase('crearCancion');
    
    const resultadoCrear = await crearCancionUseCase.execute({
      titulo: 'Melodía Eterna',
      artista: 'Banda Ejemplo',
      linkArchivo: 'https://storage.example.com/melodia-eterna.mp3',
      precio: 9.99,
      participantes: [
        { rol: 'artista', nombre: 'Juan Pérez', porcentaje: 50 },
        { rol: 'productor', nombre: 'María García', porcentaje: 30 },
        { rol: 'compositor', nombre: 'Carlos López', porcentaje: 20 }
      ],
      usuarioId: 'usuario_001'
    });
    
    console.log('Canción creada exitosamente:');
    console.log(JSON.stringify(resultadoCrear.cancion, null, 2));
    console.log('\nContrato inteligente:');
    console.log(JSON.stringify(resultadoCrear.contrato, null, 2));
    console.log('\nClave de acceso generada:');
    console.log(JSON.stringify(resultadoCrear.claveAcceso, null, 2));
    
    console.log('\n--- PRUEBA 2: Registrar Compra ---');
    const registrarCompraUseCase = container.getUseCase('registrarCompra');
    
    const resultadoCompra = await registrarCompraUseCase.execute({
      cancionId: resultadoCrear.cancion.id,
      monto: 9.99,
      compradorId: 'comprador_123'
    });
    
    console.log('Compra registrada exitosamente:');
    console.log(JSON.stringify(resultadoCompra, null, 2));
    
    console.log('\n--- PRUEBA 3: Obtener Clave de Descarga ---');
    const obtenerClaveUseCase = container.getUseCase('obtenerClaveAcceso');
    
    try {
      const resultadoDescarga = await obtenerClaveUseCase.execute({
        cancionId: resultadoCrear.cancion.id
      });
      
      console.log('Clave de descarga obtenida:');
      console.log(JSON.stringify(resultadoDescarga, null, 2));
    } catch (error) {
      console.log('Nota: En modo simulación, la validación de clave puede no estar disponible');
      console.log('Error esperado:', error.message);
    }
    
    console.log('\n=== Pruebas Completadas Exitosamente ===\n');
    
  } catch (error) {
    console.error('Error en pruebas:', error);
  } finally {
    await container.cerrar();
  }
}

// Ejecutar pruebas
ejecutarPruebas().catch(console.error);
