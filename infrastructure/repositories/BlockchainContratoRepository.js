const Contrato = require('../../domain/entities/Contrato');
const IContratoRepository = require('../../domain/interfaces/IContratoRepository');

/**
 * Repositorio de contratos respaldado por Hyperledger Fabric (+ cache local)
 */
class BlockchainContratoRepository extends IContratoRepository {
  constructor(blockchainService) {
    super();
    this.blockchainService = blockchainService;
    this._cache = new Map();
  }

  async guardar(contrato) {
    if (!(contrato instanceof Contrato)) {
      throw new Error('El objeto debe ser una instancia de Contrato');
    }

    this._cache.set(contrato.id, contrato);
    return contrato;
  }

  async obtenerPorId(id) {
    if (this._cache.has(id)) {
      return this._cache.get(id);
    }

    try {
      const contratoData = await this.blockchainService.obtenerContrato(id);
      if (contratoData) {
        const contrato = Contrato.fromPlainObject(contratoData);
        this._cache.set(id, contrato);
        return contrato;
      }
    } catch (error) {
      console.error(`Error obteniendo contrato ${id}:`, error.message);
    }

    return null;
  }

  async obtenerPorCancionId(cancionId) {
    for (const value of this._cache.values()) {
      if (value.cancionId === cancionId) {
        return value;
      }
    }

    try {
      if (typeof this.blockchainService.obtenerContratoPorCancion === 'function') {
        const contratoData = await this.blockchainService.obtenerContratoPorCancion(cancionId);
        if (contratoData) {
          const contrato = Contrato.fromPlainObject(contratoData);
          this._cache.set(contrato.id, contrato);
          return contrato;
        }
      }
    } catch (error) {
      console.error(`Error obteniendo contrato por canción ${cancionId}:`, error.message);
    }

    return null;
  }

  async obtenerTodos() {
    return Array.from(this._cache.values()).map((c) => c.toPlainObject());
  }

  async actualizar(contrato) {
    if (!(contrato instanceof Contrato)) {
      throw new Error('El objeto debe ser una instancia de Contrato');
    }

    // Cache local; la escritura en ledger de transacciones se hace vía registrarTransaccion
    this._cache.set(contrato.id, contrato);
    return contrato;
  }
}

module.exports = BlockchainContratoRepository;
