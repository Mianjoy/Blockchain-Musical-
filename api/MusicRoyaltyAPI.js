const express = require('express');
const cors = require('cors');
const DIContainer = require('./DIContainer');

/**
 * API REST para el sistema de regalías musicales
 * Implementa patrón Controller y sigue principios SOLID
 */
class MusicRoyaltyAPI {
  constructor() {
    this.app = express();
    this.container = null;
    this.port = process.env.PORT || 3000;
    this.host = process.env.HOST || '0.0.0.0';

    // Middleware
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Configurar rutas
    this.configurarRutas();

    // Manejo de errores global
    this.app.use(this.manejarErrores.bind(this));
  }

  /**
   * Configura las rutas de la API
   */
  configurarRutas() {
    // Ruta de salud
    this.app.get('/health', (req, res) => {
      const blockchain = this.container ? this.container.getBlockchainService() : null;
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        fabric: {
          connected: !!(blockchain && !blockchain.enSimulacion),
          simulation: !!(blockchain && blockchain.enSimulacion),
          channel: process.env.CHANNEL_NAME || 'mychannel',
          chaincode: process.env.CHAINCODE_NAME || 'music-royalty'
        }
      });
    });

    // Rutas de canciones
    this.app.post('/api/canciones', this.crearCancion.bind(this));
    this.app.get('/api/canciones', this.obtenerCanciones.bind(this));
    this.app.get('/api/canciones/:id', this.obtenerCancion.bind(this));

    // Rutas de compra
    this.app.post('/api/compras', this.registrarCompra.bind(this));

    // Rutas de descarga
    this.app.get('/api/descargar/:cancionId', this.obtenerDescarga.bind(this));
  }

  /**
   * Inicializa la API y el contenedor de dependencias
   */
  async inicializar(config = {}) {
    console.log('Inicializando API...');
    this.container = new DIContainer();
    await this.container.inicializar(config);
    console.log('API inicializada correctamente');
    return this;
  }

  /**
   * Inicia el servidor HTTP
   */
  iniciar() {
    return new Promise((resolve, reject) => {
      const server = this.app.listen(this.port, this.host, () => {
        console.log(`Servidor corriendo en http://${this.host}:${this.port}`);
        resolve(server);
      });

      server.on('error', reject);
    });
  }

  /**
   * POST /api/canciones
   * Crea una nueva canción con su contrato inteligente
   */
  async crearCancion(req, res, next) {
    try {
      const { titulo, artista, linkArchivo, participantes, usuarioId } = req.body;

      if (!titulo || !artista || !linkArchivo || !participantes) {
        return res.status(400).json({
          error: 'Datos incompletos',
          requeridos: ['titulo', 'artista', 'linkArchivo', 'participantes']
        });
      }

      const useCase = this.container.getUseCase('crearCancion');
      const resultado = await useCase.execute({
        titulo,
        artista,
        linkArchivo,
        participantes,
        usuarioId: usuarioId || 'usuario_anonimo'
      });

      res.status(201).json({
        mensaje: 'Canción creada exitosamente',
        datos: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/canciones
   * Obtiene todas las canciones
   */
  async obtenerCanciones(req, res, next) {
    try {
      const repository = this.container.getCancionRepository();
      const canciones = await repository.obtenerTodas();

      res.json({
        total: canciones.length,
        datos: canciones
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/canciones/:id
   * Obtiene una canción por ID
   */
  async obtenerCancion(req, res, next) {
    try {
      const { id } = req.params;
      const repository = this.container.getCancionRepository();
      const cancion = await repository.obtenerPorId(id);

      if (!cancion) {
        return res.status(404).json({ error: 'Canción no encontrada' });
      }

      res.json({ datos: cancion.toPlainObject() });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/compras
   * Registra una compra y distribuye regalías
   */
  async registrarCompra(req, res, next) {
    try {
      const { cancionId, monto, compradorId } = req.body;

      if (!cancionId || !monto || !compradorId) {
        return res.status(400).json({
          error: 'Datos incompletos',
          requeridos: ['cancionId', 'monto', 'compradorId']
        });
      }

      const useCase = this.container.getUseCase('registrarCompra');
      const resultado = await useCase.execute({
        cancionId,
        monto: parseFloat(monto),
        compradorId
      });

      res.status(201).json({
        mensaje: 'Compra registrada exitosamente',
        datos: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/descargar/:cancionId
   * Obtiene la clave de acceso para descargar una canción
   */
  async obtenerDescarga(req, res, next) {
    try {
      const { cancionId } = req.params;
      const useCase = this.container.getUseCase('obtenerClaveAcceso');
      const resultado = await useCase.execute({ cancionId });

      res.json({
        mensaje: 'Clave de acceso generada',
        datos: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manejador global de errores
   */
  manejarErrores(error, req, res, next) {
    console.error('Error:', error.message);

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message || 'Error interno del servidor',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Cierra la API y libera recursos
   */
  async cerrar() {
    if (this.container) {
      await this.container.cerrar();
    }
  }
}

module.exports = MusicRoyaltyAPI;
