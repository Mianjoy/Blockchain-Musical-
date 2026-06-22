const HyperledgerFabricService = require('../infrastructure/blockchain/HyperledgerFabricService');
const BlockchainCancionRepository = require('../infrastructure/repositories/BlockchainCancionRepository');
const BlockchainContratoRepository = require('../infrastructure/repositories/BlockchainContratoRepository');
const CrearCancionUseCase = require('../application/use-cases/CrearCancionUseCase');
const RegistrarCompraUseCase = require('../application/use-cases/RegistrarCompraUseCase');
const ObtenerClaveAccesoUseCase = require('../application/use-cases/ObtenerClaveAccesoUseCase');

/**
 * Contenedor de Dependencias (Dependency Injection Container)
 * Implementa el patrón Factory para crear las dependencias del sistema
 */
class DIContainer {
  constructor() {
    this._services = new Map();
    this._blockchainService = null;
    this._cancionRepository = null;
    this._contratoRepository = null;
  }

  /**
   * Inicializa todos los servicios del sistema
   */
  async inicializar(config = {}) {
    console.log('Inicializando contenedor de dependencias...');

    // Crear servicio de blockchain
    this._blockchainService = new HyperledgerFabricService(config);
    await this._blockchainService.inicializar();

    // Crear repositorios
    this._cancionRepository = new BlockchainCancionRepository(this._blockchainService);
    this._contratoRepository = new BlockchainContratoRepository(this._blockchainService);

    // Registrar casos de uso
    this._services.set('crearCancion', new CrearCancionUseCase(
      this._cancionRepository,
      this._contratoRepository,
      this._blockchainService
    ));

    this._services.set('registrarCompra', new RegistrarCompraUseCase(
      this._contratoRepository,
      this._blockchainService
    ));

    this._services.set('obtenerClaveAcceso', new ObtenerClaveAccesoUseCase(
      this._cancionRepository,
      this._blockchainService
    ));

    console.log('Contenedor de dependencias inicializado correctamente');
    return this;
  }

  /**
   * Obtiene un caso de uso por nombre
   */
  getUseCase(nombre) {
    const useCase = this._services.get(nombre);
    if (!useCase) {
      throw new Error(`Caso de uso '${nombre}' no encontrado`);
    }
    return useCase;
  }

  /**
   * Obtiene el servicio de blockchain
   */
  getBlockchainService() {
    return this._blockchainService;
  }

  /**
   * Obtiene el repositorio de canciones
   */
  getCancionRepository() {
    return this._cancionRepository;
  }

  /**
   * Obtiene el repositorio de contratos
   */
  getContratoRepository() {
    return this._contratoRepository;
  }

  /**
   * Cierra todas las conexiones
   */
  async cerrar() {
    if (this._blockchainService) {
      await this._blockchainService.desconectar();
    }
    this._services.clear();
  }
}

module.exports = DIContainer;
