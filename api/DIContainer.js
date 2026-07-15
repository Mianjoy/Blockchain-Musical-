const HyperledgerFabricService = require('../infrastructure/blockchain/HyperledgerFabricService');
const BlockchainCancionRepository = require('../infrastructure/repositories/BlockchainCancionRepository');
const BlockchainContratoRepository = require('../infrastructure/repositories/BlockchainContratoRepository');
const CrearCancionUseCase = require('../application/use-cases/CrearCancionUseCase');
const RegistrarCompraUseCase = require('../application/use-cases/RegistrarCompraUseCase');
const ObtenerClaveAccesoUseCase = require('../application/use-cases/ObtenerClaveAccesoUseCase');
const AnalyticsService = require('../infrastructure/services/AnalyticsService');
const notificationStore = require('../infrastructure/services/NotificationStore');

/**
 * Contenedor de Dependencias (Dependency Injection Container)
 */
class DIContainer {
  constructor() {
    this._services = new Map();
    this._blockchainService = null;
    this._cancionRepository = null;
    this._contratoRepository = null;
    this._analyticsService = null;
  }

  async inicializar(config = {}) {
    console.log('Inicializando contenedor de dependencias...');

    this._blockchainService = new HyperledgerFabricService(config);
    await this._blockchainService.inicializar();

    this._cancionRepository = new BlockchainCancionRepository(this._blockchainService);
    this._contratoRepository = new BlockchainContratoRepository(this._blockchainService);
    this._analyticsService = new AnalyticsService(
      this._cancionRepository,
      this._contratoRepository
    );

    this._services.set(
      'crearCancion',
      new CrearCancionUseCase(
        this._cancionRepository,
        this._contratoRepository,
        this._blockchainService
      )
    );

    this._services.set(
      'registrarCompra',
      new RegistrarCompraUseCase(
        this._contratoRepository,
        this._blockchainService,
        this._cancionRepository
      )
    );

    this._services.set(
      'obtenerClaveAcceso',
      new ObtenerClaveAccesoUseCase(this._cancionRepository, this._blockchainService)
    );

    console.log('Contenedor de dependencias inicializado correctamente');
    return this;
  }

  getUseCase(nombre) {
    const useCase = this._services.get(nombre);
    if (!useCase) {
      throw new Error(`Caso de uso '${nombre}' no encontrado`);
    }
    return useCase;
  }

  getBlockchainService() {
    return this._blockchainService;
  }

  getCancionRepository() {
    return this._cancionRepository;
  }

  getContratoRepository() {
    return this._contratoRepository;
  }

  getAnalyticsService() {
    return this._analyticsService;
  }

  getNotificationStore() {
    return notificationStore;
  }

  async cerrar() {
    if (this._blockchainService) {
      await this._blockchainService.desconectar();
    }
    this._services.clear();
  }
}

module.exports = DIContainer;
