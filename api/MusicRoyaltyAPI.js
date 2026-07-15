const express = require('express');
const cors = require('cors');
const DIContainer = require('./DIContainer');
const UserAuthStore = require('../infrastructure/auth/UserAuthStore');
const { validateNickname } = require('../domain/utils/nickname');
const { seedDemoCatalog, DEMO_PASSWORD, DEMO_USERS } = require('../infrastructure/seed/seedDemoCatalog');
const fabricLog = require('../infrastructure/services/FabricWorkflowLog');

/**
 * API REST para el sistema de regalías musicales
 * Implementa patrón Controller y sigue principios SOLID
 */
class MusicRoyaltyAPI {
  constructor() {
    this.app = express();
    this.container = null;
    this.authStore = new UserAuthStore();
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

    // Auth: nickname @ + password
    this.app.post('/api/auth/register', this.registrarUsuario.bind(this));
    this.app.post('/api/auth/login', this.loginUsuario.bind(this));
    this.app.get('/api/auth/check/:nickname', this.verificarNickname.bind(this));

    // Rutas de canciones
    this.app.post('/api/canciones', this.crearCancion.bind(this));
    this.app.get('/api/canciones', this.obtenerCanciones.bind(this));
    this.app.get('/api/canciones/:id', this.obtenerCancion.bind(this));

    // Rutas de compra
    this.app.post('/api/compras', this.registrarCompra.bind(this));
    this.app.get('/api/compras', this.obtenerComprasUsuario.bind(this));

    // Rutas de descarga
    this.app.get('/api/descargar/:cancionId', this.obtenerDescarga.bind(this));

    // Analytics y notificaciones
    this.app.get('/api/analytics/regalias', this.obtenerAnalytics.bind(this));
    this.app.get('/api/notificaciones', this.listarNotificaciones.bind(this));
    this.app.post('/api/notificaciones/:id/leer', this.marcarNotificacionLeida.bind(this));
    this.app.post('/api/notificaciones/leer-todas', this.marcarTodasNotificaciones.bind(this));

    // Catálogo demo (usuarios @ + canciones)
    this.app.post('/api/admin/seed-demo', this.seedDemo.bind(this));
    this.app.get('/api/demo/info', this.demoInfo.bind(this));
    this.app.get('/api/logs/fabric-workflow', this.obtenerLogFabric.bind(this));
  }

  /**
   * Inicializa la API y el contenedor de dependencias
   */
  async inicializar(config = {}) {
    console.log('Inicializando API...');
    this.container = new DIContainer();
    await this.container.inicializar(config);

    try {
      await seedDemoCatalog({
        authStore: this.authStore,
        crearCancionUseCase: this.container.getUseCase('crearCancion'),
        cancionRepository: this.container.getCancionRepository(),
        notificationStore: this.container.getNotificationStore(),
        force: process.env.SEED_DEMO_FORCE === 'true'
      });
    } catch (err) {
      console.warn('[SEED] No se pudo cargar catálogo demo:', err.message);
    }

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
   * POST /api/auth/register
   */
  async registrarUsuario(req, res, next) {
    try {
      const { nickname, password } = req.body || {};
      const user = await this.authStore.register(nickname, password);
      res.status(201).json({
        mensaje: 'Usuario registrado',
        datos: user
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  async loginUsuario(req, res, next) {
    try {
      const { nickname, password } = req.body || {};
      const user = await this.authStore.login(nickname, password);
      res.json({
        mensaje: 'Login correcto',
        datos: user
      });
    } catch (error) {
      error.statusCode = 401;
      next(error);
    }
  }

  /**
   * GET /api/auth/check/:nickname
   */
  async verificarNickname(req, res, next) {
    try {
      const v = validateNickname(req.params.nickname);
      if (!v.ok) {
        return res.status(400).json({ error: v.error, disponible: false });
      }
      const existe = this.authStore.exists(v.nickname);
      res.json({
        nickname: v.nickname,
        existe,
        disponible: !existe
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/canciones
   * Crea una nueva canción con su contrato inteligente
   */
  async crearCancion(req, res, next) {
    try {
      const { titulo, artista, linkArchivo, participantes, usuarioId, precio, price } = req.body;
      const precioFinal = Number(precio ?? price);

      if (!titulo || !artista || !linkArchivo || !participantes || !usuarioId) {
        return res.status(400).json({
          error: 'Datos incompletos',
          requeridos: ['titulo', 'artista', 'linkArchivo', 'participantes', 'precio', 'usuarioId']
        });
      }

      if (!Number.isFinite(precioFinal) || precioFinal <= 0) {
        return res.status(400).json({
          error: 'El precio debe ser un número mayor que 0'
        });
      }

      const useCase = this.container.getUseCase('crearCancion');
      const resultado = await useCase.execute({
        titulo,
        artista,
        linkArchivo,
        participantes,
        usuarioId,
        precio: precioFinal
      });

      this.container.getNotificationStore().publicar({
        tipo: 'lanzamiento',
        titulo: 'Nuevo lanzamiento',
        mensaje: `"${titulo}" de ${artista} ya está disponible en el catálogo`,
        payload: {
          cancionId: resultado.cancion?.id,
          titulo,
          artista,
          precio: precioFinal
        }
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
      const { cancionId, compradorId } = req.body;

      if (!cancionId || !compradorId) {
        return res.status(400).json({
          error: 'Datos incompletos',
          requeridos: ['cancionId', 'compradorId']
        });
      }

      const nick = validateNickname(compradorId);
      if (!nick.ok) {
        return res.status(400).json({
          error: `compradorId inválido: ${nick.error}`
        });
      }

      const useCase = this.container.getUseCase('registrarCompra');
      const resultado = await useCase.execute({
        cancionId,
        compradorId: nick.nickname,
        monto: req.body.monto
      });

      const cancion = await this.container.getCancionRepository().obtenerPorId(cancionId);
      this.container.getNotificationStore().publicar({
        tipo: 'venta',
        titulo: 'Nueva venta registrada',
        mensaje: cancion
          ? `Se distribuyeron regalías por la compra de "${cancion.titulo}"`
          : `Se distribuyeron regalías por la compra de ${cancionId}`,
        payload: {
          cancionId,
          titulo: cancion?.titulo || cancionId,
          artista: cancion?.artista || '',
          monto: resultado.monto,
          distribucion: resultado.distribucion
        }
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
   * GET /api/compras?compradorId=@usuario
   * Lista las compras del nickname autenticado en el cliente
   */
  async obtenerComprasUsuario(req, res, next) {
    try {
      const compradorId = req.query.compradorId;
      if (!compradorId) {
        return res.status(400).json({
          error: 'Falta compradorId',
          requeridos: ['compradorId']
        });
      }

      const useCase = this.container.getUseCase('obtenerComprasUsuario');
      const compras = await useCase.execute({ compradorId });
      res.json({
        total: compras.length,
        datos: compras
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
   * GET /api/analytics/regalias
   */
  async obtenerAnalytics(req, res, next) {
    try {
      const reporte = await this.container.getAnalyticsService().generarReporte();
      res.json({ datos: reporte });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notificaciones
   */
  async listarNotificaciones(req, res, next) {
    try {
      const soloNoLeidas = req.query.unread === 'true';
      const store = this.container.getNotificationStore();
      res.json({
        total: store.listar().length,
        noLeidas: store.contarNoLeidas(),
        datos: store.listar({ soloNoLeidas })
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notificaciones/:id/leer
   */
  async marcarNotificacionLeida(req, res, next) {
    try {
      const item = this.container.getNotificationStore().marcarLeida(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Notificación no encontrada' });
      }
      res.json({ datos: item });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notificaciones/leer-todas
   */
  async marcarTodasNotificaciones(req, res, next) {
    try {
      const total = this.container.getNotificationStore().marcarTodasLeidas();
      res.json({ mensaje: 'Notificaciones marcadas como leídas', total });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/logs/fabric-workflow?lines=200
   * Últimas líneas del registro de flujos Fabric (para demos / proyector)
   */
  async obtenerLogFabric(req, res, next) {
    try {
      const lines = Math.min(Number(req.query.lines) || 200, 2000);
      const contenido = fabricLog.tail(lines);
      res.type('text/plain').send(contenido);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/demo/info
   * Usuarios ficticios del catálogo demo
   */
  async demoInfo(req, res) {
    res.json({
      password: DEMO_PASSWORD,
      usuarios: DEMO_USERS,
      nota: 'Son identidades @ de la misma red. Puedes comprar el catálogo con tu cuenta o entrar como ellos.'
    });
  }

  /**
   * POST /api/admin/seed-demo
   * Regenera catálogo demo (force)
   */
  async seedDemo(req, res, next) {
    try {
      const result = await seedDemoCatalog({
        authStore: this.authStore,
        crearCancionUseCase: this.container.getUseCase('crearCancion'),
        cancionRepository: this.container.getCancionRepository(),
        notificationStore: this.container.getNotificationStore(),
        force: true
      });
      res.json({ mensaje: 'Catálogo demo procesado', datos: result });
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
